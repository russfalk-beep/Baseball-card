// ===== BASEBALL CARD MAKER PRO =====
(function () {
    'use strict';

    const state = { playerPhoto: null, teamLogo: null, brandLogo: null, leagueLogo: null, showFront: true, isPitcher: false };
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    document.addEventListener('DOMContentLoaded', () => {
        setupTabs();
        setupUploads();
        setupLivePreview();
        setupControls();
        setupPrint();
        setup3DTilt();
        setupFieldFormatting();
        setupAutoCalcStats();
        drawFieldBackground();
        updateCard();
    });

    // ===== TABS =====
    function setupTabs() {
        $$('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
            $$('.tab-btn').forEach(b => b.classList.remove('active'));
            $$('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            $(`#tab-${btn.dataset.tab}`).classList.add('active');
        }));
        $$('.stat-toggle-btn').forEach(btn => btn.addEventListener('click', () => {
            $$('.stat-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.isPitcher = btn.dataset.type === 'pitching';
            $('#battingStats').style.display = state.isPitcher ? 'none' : 'block';
            $('#pitchingStats').style.display = state.isPitcher ? 'block' : 'none';
            updateCard();
        }));
    }

    // ===== UPLOADS =====
    function setupUploads() {
        setupUpload('playerPhoto', 'playerPhotoUpload', 'playerPhotoPreview', 'playerPhotoPlaceholder', 'playerPhotoControls', img => { state.playerPhoto = img; updateCard(); });
        setupUpload('teamLogo', 'teamLogoUpload', 'teamLogoPreview', 'teamLogoPlaceholder', 'teamLogoControls', img => { state.teamLogo = img; updateCard(); });
        setupUpload('brandLogo', 'brandLogoUpload', 'brandLogoPreview', 'brandLogoPlaceholder', 'brandLogoControls', img => { state.brandLogo = img; updateCard(); });
        setupUpload('leagueLogo', 'leagueLogoUpload', 'leagueLogoPreview', 'leagueLogoPlaceholder', 'leagueLogoControls', img => { state.leagueLogo = img; updateCard(); });

        const removeButtons = {
            playerPhoto: 'removePlayerPhoto',
            teamLogo: 'removeTeamLogo',
            brandLogo: 'removeBrandLogo',
            leagueLogo: 'removeLeagueLogo'
        };
        const removeHandler = (key, previewId, placeholderId, controlsId, boxId, inputId) => {
            $(`#${removeButtons[key]}`).addEventListener('click', () => {
                state[key] = null;
                $(`#${previewId}`).style.display = 'none';
                $(`#${placeholderId}`).style.display = 'flex';
                $(`#${controlsId}`).style.display = 'none';
                $(`#${boxId}`).classList.remove('has-image');
                $(`#${inputId}`).value = '';
                updateCard();
            });
        };
        removeHandler('playerPhoto', 'playerPhotoPreview', 'playerPhotoPlaceholder', 'playerPhotoControls', 'playerPhotoUpload', 'playerPhoto');
        removeHandler('teamLogo', 'teamLogoPreview', 'teamLogoPlaceholder', 'teamLogoControls', 'teamLogoUpload', 'teamLogo');
        removeHandler('brandLogo', 'brandLogoPreview', 'brandLogoPlaceholder', 'brandLogoControls', 'brandLogoUpload', 'brandLogo');
        removeHandler('leagueLogo', 'leagueLogoPreview', 'leagueLogoPlaceholder', 'leagueLogoControls', 'leagueLogoUpload', 'leagueLogo');
    }

    function setupUpload(inputId, boxId, previewId, placeholderId, controlsId, callback) {
        const input = $(`#${inputId}`), box = $(`#${boxId}`), preview = $(`#${previewId}`), placeholder = $(`#${placeholderId}`), controls = $(`#${controlsId}`);
        box.addEventListener('click', () => input.click());
        box.addEventListener('dragover', e => { e.preventDefault(); box.style.borderColor = 'var(--accent)'; });
        box.addEventListener('dragleave', () => { box.style.borderColor = ''; });
        box.addEventListener('drop', e => { e.preventDefault(); box.style.borderColor = ''; if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });
        input.addEventListener('change', e => { if (e.target.files.length) handleFile(e.target.files[0]); });
        function handleFile(file) {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = e => {
                preview.src = e.target.result;
                preview.style.display = 'block';
                placeholder.style.display = 'none';
                if (controls) controls.style.display = 'block';
                box.classList.add('has-image');
                const img = new Image();
                img.onload = () => callback(img);
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // ===== LIVE PREVIEW =====
    function setupLivePreview() {
        const allInputs = [
            'playerName','teamName','position','jerseyNumber','cardYear','bats','throws','height','weight','birthdate','hometown',
            'seriesName','cardNumber','bio','statsYear','league',
            'stat_G','stat_AB','stat_R','stat_H','stat_2B','stat_3B','stat_HR','stat_RBI','stat_BB','stat_SO','stat_SB','stat_AVG','stat_OBP','stat_SLG','stat_OPS',
            'stat_W','stat_L','stat_ERA','stat_GP','stat_GS','stat_SV','stat_IP','stat_HA','stat_ER','stat_PBB','stat_K','stat_WHIP',
            'cardStyle','primaryColor','secondaryColor','accentColor','nameColor',
            'showGloss','showFoil','showRookieBadge','showAllStar','show3DTilt',
            'borderThickness','vignetteStrength','showOnField',
            'playerPhotoZoom','playerPhotoX','playerPhotoY','playerBrightness','playerContrast','playerSaturation',
            'teamLogoSize','brandLogoSize','leagueLogoSize'
        ];
        allInputs.forEach(id => {
            const el = $(`#${id}`);
            if (el) { el.addEventListener('input', updateCard); el.addEventListener('change', updateCard); }
        });
        ['primary','secondary','accent','name'].forEach(c => {
            const input = $(`#${c}Color`), label = $(`#${c}ColorLabel`);
            if (input && label) input.addEventListener('input', () => { label.textContent = input.value.toUpperCase(); });
        });
        $$('.team-preset').forEach(btn => btn.addEventListener('click', () => {
            $('#primaryColor').value = btn.dataset.primary;
            $('#secondaryColor').value = btn.dataset.secondary;
            $('#accentColor').value = btn.dataset.accent;
            $('#primaryColorLabel').textContent = btn.dataset.primary.toUpperCase();
            $('#secondaryColorLabel').textContent = btn.dataset.secondary.toUpperCase();
            $('#accentColorLabel').textContent = btn.dataset.accent.toUpperCase();
            updateCard();
        }));
    }

    // ===== SMART FIELD FORMATTING =====
    function setupFieldFormatting() {
        // Height: auto-format on blur — "510" → 5'10", "61" → 6'1"
        const heightEl = $('#height');
        heightEl.addEventListener('blur', () => {
            let v = heightEl.value.trim();
            if (!v) return;
            // Already formatted
            if (v.includes("'") || v.includes('"')) return;
            // Strip non-digits
            const digits = v.replace(/\D/g, '');
            if (!digits) return;
            if (digits.length === 2) {
                // "61" → 6'1"
                heightEl.value = `${digits[0]}'${digits[1]}"`;
            } else if (digits.length === 3) {
                // "510" → 5'10"
                heightEl.value = `${digits[0]}'${digits.slice(1)}"`;
            } else if (digits.length === 1) {
                // "6" → 6'0"
                heightEl.value = `${digits[0]}'0"`;
            }
            updateCard();
        });

        // Weight: auto-append "lbs" on blur
        const weightEl = $('#weight');
        weightEl.addEventListener('blur', () => {
            let v = weightEl.value.trim();
            if (!v) return;
            if (v.toLowerCase().includes('lb')) return;
            const num = v.replace(/\D/g, '');
            if (num) {
                weightEl.value = `${num} lbs`;
                updateCard();
            }
        });

        // Birthdate: format the date nicely for display on card
        const bdEl = $('#birthdate');
        bdEl.addEventListener('change', () => updateCard());
    }

    // ===== AUTO-CALCULATE STATS =====
    // Track which auto-calc fields the user has manually typed into
    const userOverride = {};

    function setupAutoCalcStats() {
        const autoFields = ['stat_AVG', 'stat_OBP', 'stat_SLG', 'stat_OPS', 'stat_ERA', 'stat_WHIP'];
        autoFields.forEach(id => {
            const el = $(`#${id}`);
            // Detect manual user input (keyboard typing only)
            el.addEventListener('keydown', () => {
                userOverride[id] = true;
                el.classList.add('user-override');
            });
            // Clearing the field resets override
            el.addEventListener('input', () => {
                if (!el.value.trim()) {
                    userOverride[id] = false;
                    el.classList.remove('user-override');
                }
            });
        });
    }

    // Called from within updateCard so it always runs
    function recalcStats() {
        // Batting
        const ab = parseFloat($('#stat_AB').value) || 0;
        const h = parseFloat($('#stat_H').value) || 0;
        const bb = parseFloat($('#stat_BB').value) || 0;
        const d = parseFloat($('#stat_2B').value) || 0;
        const t = parseFloat($('#stat_3B').value) || 0;
        const hr = parseFloat($('#stat_HR').value) || 0;

        if (ab > 0) {
            const avg = h / ab;
            const singles = Math.max(0, h - d - t - hr);
            const tb = singles + 2 * d + 3 * t + 4 * hr;
            const slg = tb / ab;
            const obp = (ab + bb) > 0 ? (h + bb) / (ab + bb) : 0;
            const ops = obp + slg;

            if (!userOverride['stat_AVG']) $('#stat_AVG').value = avg >= 1 ? avg.toFixed(3) : '.' + avg.toFixed(3).split('.')[1];
            if (!userOverride['stat_OBP']) $('#stat_OBP').value = obp >= 1 ? obp.toFixed(3) : '.' + obp.toFixed(3).split('.')[1];
            if (!userOverride['stat_SLG']) $('#stat_SLG').value = slg >= 1 ? slg.toFixed(3) : '.' + slg.toFixed(3).split('.')[1];
            if (!userOverride['stat_OPS']) $('#stat_OPS').value = ops >= 1 ? ops.toFixed(3) : '.' + ops.toFixed(3).split('.')[1];
        }

        // Pitching
        const ip = parseFloat($('#stat_IP').value) || 0;
        const er = parseFloat($('#stat_ER').value) || 0;
        const ha = parseFloat($('#stat_HA').value) || 0;
        const pbb = parseFloat($('#stat_PBB').value) || 0;

        if (ip > 0) {
            const era = (er / ip) * 9;
            const whip = (ha + pbb) / ip;
            if (!userOverride['stat_ERA']) $('#stat_ERA').value = era.toFixed(2);
            if (!userOverride['stat_WHIP']) $('#stat_WHIP').value = whip.toFixed(2);
        }
    }

    // ===== CONTROLS =====
    function setupControls() {
        $('#showFront').addEventListener('click', () => {
            state.showFront = true;
            $('#showFront').classList.add('active'); $('#showBack').classList.remove('active');
            $('#cardFront').style.display = 'block'; $('#cardBack').style.display = 'none';
        });
        $('#showBack').addEventListener('click', () => {
            state.showFront = false;
            $('#showBack').classList.add('active'); $('#showFront').classList.remove('active');
            $('#cardFront').style.display = 'none'; $('#cardBack').style.display = 'block';
        });
    }

    // ===== 3D TILT =====
    function setup3DTilt() {
        const container = $('#cardFront');
        container.addEventListener('mousemove', e => {
            if (!$('#show3DTilt').checked) return;
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            container.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
        });
        container.addEventListener('mouseleave', () => { container.style.transform = ''; });

        const backContainer = $('#cardBack');
        backContainer.addEventListener('mousemove', e => {
            if (!$('#show3DTilt').checked) return;
            const rect = backContainer.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            backContainer.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
        });
        backContainer.addEventListener('mouseleave', () => { backContainer.style.transform = ''; });
    }

    // ===== FIELD BACKGROUND =====
    function drawFieldBackground() {
        const canvas = $('#fieldCanvas'), ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;

        // Sky
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.45);
        sky.addColorStop(0, '#0c3547'); sky.addColorStop(0.3, '#1a6b8a'); sky.addColorStop(0.7, '#4da6c9'); sky.addColorStop(1, '#87ceeb');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h * 0.45);

        // Stadium light glows
        for (let i = 0; i < 6; i++) {
            const lx = w * 0.1 + i * w * 0.16;
            const grad = ctx.createRadialGradient(lx, h * 0.03, 0, lx, h * 0.03, 50);
            grad.addColorStop(0, 'rgba(255,255,220,0.15)'); grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad; ctx.fillRect(lx - 50, 0, 100, 80);
            // Light pole
            ctx.strokeStyle = 'rgba(100,100,100,0.2)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(lx, h * 0.02); ctx.lineTo(lx, h * 0.12); ctx.stroke();
        }

        // Crowd/stands hint
        const crowd = ctx.createLinearGradient(0, h * 0.08, 0, h * 0.2);
        crowd.addColorStop(0, 'rgba(40,40,60,0.4)'); crowd.addColorStop(1, 'rgba(40,40,60,0.1)');
        ctx.fillStyle = crowd; ctx.fillRect(0, h * 0.08, w, h * 0.12);
        // Crowd dots
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = `rgba(${150+Math.random()*105},${100+Math.random()*100},${80+Math.random()*100},0.15)`;
            ctx.fillRect(Math.random() * w, h * 0.09 + Math.random() * h * 0.1, 3, 2);
        }

        // Outfield grass
        const grass = ctx.createLinearGradient(0, h * 0.35, 0, h);
        grass.addColorStop(0, '#1a6b2a'); grass.addColorStop(0.3, '#22882e'); grass.addColorStop(0.6, '#2a9d3a'); grass.addColorStop(1, '#1e7a2e');
        ctx.fillStyle = grass; ctx.fillRect(0, h * 0.35, w, h * 0.65);

        // Mowing stripes (diagonal)
        for (let i = -w; i < w * 2; i += 30) {
            ctx.fillStyle = i % 60 === 0 ? 'rgba(0,20,0,0.04)' : 'rgba(30,255,30,0.02)';
            ctx.save(); ctx.beginPath();
            ctx.moveTo(i, h * 0.35); ctx.lineTo(i + 15, h * 0.35); ctx.lineTo(i + 15 + h * 0.3, h); ctx.lineTo(i + h * 0.3, h);
            ctx.closePath(); ctx.fill(); ctx.restore();
        }

        // Infield dirt
        ctx.fillStyle = '#b8855a';
        ctx.beginPath(); ctx.ellipse(w / 2, h * 0.95, w * 0.45, h * 0.35, 0, Math.PI, 0); ctx.fill();
        // Dirt detail
        const dirtGrad = ctx.createRadialGradient(w/2, h*0.75, 10, w/2, h*0.85, w*0.4);
        dirtGrad.addColorStop(0, 'rgba(160,110,60,0.3)'); dirtGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = dirtGrad; ctx.beginPath(); ctx.ellipse(w/2, h*0.95, w*0.44, h*0.34, 0, Math.PI, 0); ctx.fill();

        // Infield grass
        ctx.fillStyle = '#259a3a';
        ctx.beginPath(); ctx.ellipse(w / 2, h * 0.95, w * 0.3, h * 0.22, 0, Math.PI, 0); ctx.fill();

        // Diamond
        const d = { home: {x:w/2,y:h*0.88}, first: {x:w*0.7,y:h*0.72}, second: {x:w/2,y:h*0.58}, third: {x:w*0.3,y:h*0.72} };

        // Base paths (dirt)
        ctx.strokeStyle = '#b8855a'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(d.home.x, d.home.y); ctx.lineTo(d.first.x, d.first.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(d.home.x, d.home.y); ctx.lineTo(d.third.x, d.third.y); ctx.stroke();

        // Base path lines (white chalk)
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(d.home.x, d.home.y); ctx.lineTo(d.first.x, d.first.y); ctx.lineTo(d.second.x, d.second.y); ctx.lineTo(d.third.x, d.third.y); ctx.closePath(); ctx.stroke();

        // Bases
        ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 4;
        [d.first, d.second, d.third].forEach(b => { ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.PI/4); ctx.fillRect(-5,-5,10,10); ctx.restore(); });
        ctx.shadowBlur = 0;

        // Home plate
        ctx.fillStyle = '#fff';
        ctx.beginPath(); const hx = d.home.x, hy = d.home.y;
        ctx.moveTo(hx-6,hy); ctx.lineTo(hx-6,hy+4); ctx.lineTo(hx,hy+9); ctx.lineTo(hx+6,hy+4); ctx.lineTo(hx+6,hy); ctx.closePath(); ctx.fill();

        // Batter's boxes
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        ctx.strokeRect(hx - 22, hy - 8, 14, 22); ctx.strokeRect(hx + 8, hy - 8, 14, 22);

        // Pitcher's mound
        ctx.fillStyle = '#b8855a';
        ctx.beginPath(); ctx.ellipse(w/2, h*0.67, 20, 14, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#d4a574';
        ctx.beginPath(); ctx.ellipse(w/2, h*0.67, 14, 8, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(w/2-7, h*0.67-2, 14, 4);

        // Foul lines
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(d.home.x, d.home.y); ctx.lineTo(0, h*0.2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(d.home.x, d.home.y); ctx.lineTo(w, h*0.2); ctx.stroke();

        // Warning track
        ctx.strokeStyle = '#a0744a'; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(w/2, h*1.2, w*0.75, Math.PI*1.12, Math.PI*1.88); ctx.stroke();

        // Outfield wall
        ctx.strokeStyle = '#0a4020'; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(w/2, h*1.2, w*0.79, Math.PI*1.12, Math.PI*1.88); ctx.stroke();
        // Wall padding (green)
        ctx.strokeStyle = '#0d5a2a'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(w/2, h*1.2, w*0.79, Math.PI*1.12, Math.PI*1.88); ctx.stroke();

        // Atmospheric depth
        const fog = ctx.createLinearGradient(0, 0, 0, h * 0.35);
        fog.addColorStop(0, 'rgba(10,30,50,0.35)'); fog.addColorStop(1, 'transparent');
        ctx.fillStyle = fog; ctx.fillRect(0, 0, w, h * 0.35);

        // Subtle light rays
        ctx.save(); ctx.globalAlpha = 0.03;
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.moveTo(w * 0.5, 0); ctx.lineTo(w * 0.1 * i, h); ctx.lineTo(w * 0.1 * i + 30, h); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }

    // ===== UPDATE CARD =====
    function updateCard() { recalcStats(); updateFront(); updateBack(); }

    function updateFront() {
        const name = $('#playerName').value || 'PLAYER NAME';
        const team = $('#teamName').value || 'TEAM NAME';
        const pos = $('#position').value;
        const number = $('#jerseyNumber').value;
        const year = $('#cardYear').value || new Date().getFullYear();
        const series = $('#seriesName').value;
        const cardNum = $('#cardNumber').value;
        const style = $('#cardStyle').value;
        const primary = $('#primaryColor').value;
        const secondary = $('#secondaryColor').value;
        const accent = $('#accentColor').value;
        const nameColor = $('#nameColor').value;
        const borderThickness = $('#borderThickness').value;
        const vignetteStrength = $('#vignetteStrength').value;

        const bgLayer = $('#cardBgLayer');
        const nameplate = $('#cardNameplate');

        // Card styles — bold borders, vivid gradients
        switch (style) {
            case 'classic':
                bgLayer.style.background = `linear-gradient(180deg, ${primary} 0%, ${primary} 15%, ${secondary} 85%, ${secondary} 100%)`;
                bgLayer.style.border = `${borderThickness}px solid ${primary}`;
                bgLayer.style.borderImage = 'none';
                nameplate.style.background = `linear-gradient(90deg, ${primary}ee, ${secondary}ee)`;
                break;
            case 'modern':
                bgLayer.style.background = `linear-gradient(160deg, ${secondary} 0%, #050510 35%, #050510 65%, ${secondary} 100%)`;
                bgLayer.style.border = `${borderThickness}px solid ${accent}`;
                nameplate.style.background = `linear-gradient(90deg, rgba(0,0,0,0.92), ${secondary}dd)`;
                break;
            case 'vintage':
                bgLayer.style.background = `linear-gradient(180deg, #f5e6c8 0%, #eddcb0 20%, #e8d5a8 80%, #d4c090 100%)`;
                bgLayer.style.border = `${borderThickness}px solid #8b7355`;
                nameplate.style.background = `linear-gradient(90deg, #4a3228, #6d4c41, #4a3228)`;
                break;
            case 'elite':
                bgLayer.style.background = `linear-gradient(150deg, #0a0a1a 0%, ${secondary}88 25%, #0a0a1a 50%, ${primary}88 75%, #0a0a1a 100%)`;
                bgLayer.style.border = `${borderThickness}px solid ${accent}`;
                nameplate.style.background = `linear-gradient(90deg, rgba(0,0,0,0.95), ${primary}55, rgba(0,0,0,0.95))`;
                break;
            case 'rookie':
                bgLayer.style.background = `linear-gradient(180deg, ${primary} 0%, ${primary}88 20%, #0a0a0a 50%, ${secondary}88 80%, ${secondary} 100%)`;
                bgLayer.style.border = `${borderThickness}px solid #FFD700`;
                nameplate.style.background = `linear-gradient(90deg, ${primary}dd, #111, ${secondary}dd)`;
                break;
        }
        bgLayer.style.borderRadius = '5px';

        // Top bar
        $('#cardTopBar').style.background = `linear-gradient(90deg, ${secondary}dd, ${secondary}44, transparent)`;

        // Name — auto-size with bolder feel
        const nameDisplay = $('#playerNameDisplay');
        nameDisplay.textContent = name;
        nameDisplay.style.color = nameColor;
        nameDisplay.style.fontSize = name.length > 20 ? '1.05rem' : name.length > 15 ? '1.25rem' : '1.6rem';

        const teamDisplay = $('#teamNameDisplay');
        teamDisplay.textContent = team;
        teamDisplay.style.color = nameColor;

        // Inner photo frame accent
        const photoBorder = $('#cardPhotoBorder');
        photoBorder.style.borderColor = `${accent}55`;
        photoBorder.style.boxShadow = `0 0 0 1px rgba(0,0,0,0.4), inset 0 0 0 1px ${accent}22, inset 0 1px 3px rgba(0,0,0,0.2)`;

        // Nameplate accent line
        $('#nameplateAccent').style.background = `linear-gradient(90deg, ${accent}, ${primary}, transparent)`;

        // Photo fade into nameplate — smoother, more dramatic
        $('#cardPhotoFade').style.background = `linear-gradient(to bottom, transparent 0%, ${secondary}33 40%, ${secondary}aa 70%, ${secondary}ee 100%)`;

        // Position badge
        const posBadge = $('#positionBadge');
        posBadge.textContent = pos;
        posBadge.style.borderColor = accent;

        // Jersey number watermark
        $('#jerseyNumberDisplay').textContent = number ? `#${number}` : '';

        // Year & series
        $('#cardYearDisplay').textContent = year;
        $('#cardSeriesDisplay').textContent = series;
        if (cardNum) $('#cardNumberFront').textContent = `#${cardNum}`;

        // Player photo
        const photoDisplay = $('#playerPhotoDisplay');
        const photoPlaceholder = $('#photoPlaceholderCard');
        if (state.playerPhoto) {
            const zoom = parseFloat($('#playerPhotoZoom').value);
            const px = parseInt($('#playerPhotoX').value);
            const py = parseInt($('#playerPhotoY').value);
            photoDisplay.src = state.playerPhoto.src;
            photoDisplay.style.display = 'block';
            photoDisplay.style.width = `${zoom * 100}%`;
            photoDisplay.style.transform = `translate(${px}px, ${py}px)`;
            photoDisplay.style.filter = `brightness(${$('#playerBrightness').value}%) contrast(${$('#playerContrast').value}%) saturate(${$('#playerSaturation').value}%)`;
            photoPlaceholder.style.display = 'none';
        } else {
            photoDisplay.style.display = 'none';
            photoPlaceholder.style.display = 'block';
        }

        // Field bg
        $('#fieldBg').style.display = $('#showOnField').checked ? 'block' : 'none';

        // Vignette
        const vig = parseInt(vignetteStrength);
        $('#photoVignette').style.boxShadow = `inset 0 0 ${vig}px ${vig / 2}px rgba(0,0,0,0.6)`;

        // Team logo
        if (state.teamLogo) {
            const logoSize = parseInt($('#teamLogoSize').value);
            $('#teamLogoDisplay').src = state.teamLogo.src;
            $('#teamLogoDisplay').style.display = 'block';
            $('#cardTeamLogo').style.width = `${logoSize}px`;
            $('#cardTeamLogo').style.height = `${logoSize}px`;
        } else {
            $('#teamLogoDisplay').style.display = 'none';
        }

        // Brand logo
        if (state.brandLogo) {
            $('#brandLogoDisplay').src = state.brandLogo.src;
            $('#brandLogoDisplay').style.display = 'block';
            $('#brandLogoDisplay').style.height = `${parseInt($('#brandLogoSize').value) * 0.5}px`;
        } else {
            $('#brandLogoDisplay').style.display = 'none';
        }

        // Effects
        $('#cardGloss').style.display = $('#showGloss').checked ? 'block' : 'none';
        $('#cardFoilLayer').style.opacity = $('#showFoil').checked ? '1' : '0';
        $('#cardRainbowLayer').style.opacity = $('#showFoil').checked ? '0.3' : '0';
        $('#rookieBadge').style.display = $('#showRookieBadge').checked ? 'flex' : 'none';
        $('#allstarBadge').style.display = $('#showAllStar').checked ? 'block' : 'none';
    }

    function updateBack() {
        const name = $('#playerName').value || 'PLAYER NAME';
        const team = $('#teamName').value || 'TEAM NAME';
        const number = $('#jerseyNumber').value || '00';
        const year = $('#cardYear').value || new Date().getFullYear();
        const cardNum = $('#cardNumber').value;
        const primary = $('#primaryColor').value;
        const secondary = $('#secondaryColor').value;
        const accent = $('#accentColor').value;

        $('#cardBackBg').style.background = `linear-gradient(180deg, ${secondary} 0%, #0a0a0a 40%, ${secondary}99 100%)`;
        $('#backNumber').textContent = `#${number}`;
        $('#backName').textContent = name;
        $('#backTeam').textContent = team;
        $('#backHeader').style.background = `linear-gradient(90deg, ${primary}cc, ${secondary}cc)`;
        $('#backAccentLine').style.background = `linear-gradient(90deg, ${accent}, ${primary}, transparent)`;

        // Headshot on back
        const headshot = $('#backHeadshot');
        if (state.playerPhoto) {
            headshot.src = state.playerPhoto.src;
            headshot.style.display = 'block';
        } else {
            headshot.style.display = 'none';
        }

        // Info
        $('#backPosition').textContent = $('#position').value;
        $('#backBatThrow').textContent = `${$('#bats').value}/${$('#throws').value}`;
        const ht = $('#height').value, wt = $('#weight').value;
        $('#backHtWt').textContent = (ht || wt) ? `${ht || '-'} / ${wt || '-'}` : '-';
        const bdRaw = $('#birthdate').value;
        let bdDisplay = '-';
        if (bdRaw) {
            const [y, m, d] = bdRaw.split('-');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            bdDisplay = `${months[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
        }
        $('#backBorn').textContent = bdDisplay;
        $('#backHometown').textContent = $('#hometown').value || '-';

        // Stats
        const statsYear = $('#statsYear').value || year;
        const league = $('#league').value || '';
        $('#backStatsTable').innerHTML = state.isPitcher ? buildPitchingStats(statsYear, league) : buildBattingStats(statsYear, league);

        // Bio
        const bio = $('#bio').value;
        $('#backBio').style.display = bio ? 'block' : 'none';
        $('#backBioText').textContent = bio;

        // League logo
        const leagueLogoArea = $('#backLeagueLogo');
        if (state.leagueLogo) {
            const logoSize = parseInt($('#leagueLogoSize').value);
            $('#leagueLogoDisplay').src = state.leagueLogo.src;
            $('#leagueLogoDisplay').style.height = `${logoSize}px`;
            leagueLogoArea.style.display = 'flex';
        } else {
            leagueLogoArea.style.display = 'none';
        }

        // Footer
        $('#backCardNumber').textContent = cardNum ? `No. ${cardNum}` : '';
        $('#backYear').textContent = year;
    }

    function buildBattingStats(year, league) {
        const vals = {};
        ['G','AB','R','H','2B','3B','HR','RBI','BB','SO','SB','AVG','OBP','SLG','OPS'].forEach(s => {
            const el = $(`#stat_${s}`); vals[s] = el ? (el.value || '-') : '-';
        });
        const r1 = ['G','AB','R','H','HR','RBI','BB','SB'], r2 = ['2B','3B','SO','AVG','OBP','SLG','OPS'];
        let h = year || league ? `<div style="font-size:0.55rem;color:rgba(255,255,255,0.45);text-align:center;margin-bottom:3px;letter-spacing:1px;text-transform:uppercase">${year} ${league?'- '+league:''} SEASON STATS</div>` : '';
        h += `<table class="stats-table"><tr>${r1.map(s=>`<th>${s}</th>`).join('')}</tr><tr>${r1.map(s=>`<td>${vals[s]}</td>`).join('')}</tr></table>`;
        h += `<table class="stats-table" style="margin-top:3px"><tr>${r2.map(s=>`<th>${s}</th>`).join('')}</tr><tr>${r2.map(s=>`<td>${vals[s]}</td>`).join('')}</tr></table>`;
        return h;
    }

    function buildPitchingStats(year, league) {
        const ids = [['W','stat_W'],['L','stat_L'],['ERA','stat_ERA'],['GP','stat_GP'],['GS','stat_GS'],['SV','stat_SV'],['IP','stat_IP'],['H','stat_HA'],['ER','stat_ER'],['BB','stat_PBB'],['K','stat_K'],['WHIP','stat_WHIP']];
        const r1 = ids.slice(0,6), r2 = ids.slice(6);
        let h = year || league ? `<div style="font-size:0.55rem;color:rgba(255,255,255,0.45);text-align:center;margin-bottom:3px;letter-spacing:1px;text-transform:uppercase">${year} ${league?'- '+league:''} SEASON STATS</div>` : '';
        h += `<table class="stats-table"><tr>${r1.map(([l])=>`<th>${l}</th>`).join('')}</tr><tr>${r1.map(([,id])=>`<td>${$(`#${id}`).value||'-'}</td>`).join('')}</tr></table>`;
        h += `<table class="stats-table" style="margin-top:3px"><tr>${r2.map(([l])=>`<th>${l}</th>`).join('')}</tr><tr>${r2.map(([,id])=>`<td>${$(`#${id}`).value||'-'}</td>`).join('')}</tr></table>`;
        return h;
    }

    // ===== PRINT MODAL & PRINT =====
    function setupPrint() {
        const overlay = $('#printModalOverlay');
        const closeModal = () => overlay.classList.remove('open');
        const openModal = () => overlay.classList.add('open');

        $('#printCard').addEventListener('click', openModal);
        $('#printModalClose').addEventListener('click', closeModal);
        $('#printCancel').addEventListener('click', closeModal);
        overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

        $('#printGo').addEventListener('click', () => {
            const layout = document.querySelector('input[name="printLayout"]:checked').value;
            const count = parseInt(layout);
            const doubleSided = $('#printDoubleSided').checked;
            const showCropMarks = $('#printCutLines').checked;

            buildPrintPages(count, doubleSided, showCropMarks);
            closeModal();
            // Small delay so modal closes before print dialog
            setTimeout(() => window.print(), 150);
        });

        // Save as image (keeps old approach but improved)
        $('#saveCard').addEventListener('click', () => {
            // Use print dialog with "Save as PDF" instruction
            const doubleSided = true;
            buildPrintPages(1, doubleSided, true);
            setTimeout(() => {
                window.print();
            }, 150);
        });
    }

    function buildPrintPages(cardCount, doubleSided, showCropMarks) {
        const printArea = $('#printArea');
        printArea.innerHTML = '';

        const cropClass = showCropMarks ? '' : 'no-crop';

        // Clone front and back card
        const frontClone = () => {
            const el = $('#cardFrontInner').cloneNode(true);
            el.removeAttribute('id');
            // Remove interactive effects for print
            const gloss = el.querySelector('.card-gloss');
            const foil = el.querySelector('.card-foil-layer');
            const rainbow = el.querySelector('.card-rainbow-layer');
            if (gloss) gloss.style.display = 'none';
            if (foil) foil.style.opacity = '0';
            if (rainbow) rainbow.style.opacity = '0';
            return el;
        };
        const backClone = () => {
            const el = $('#cardBackInner').cloneNode(true);
            el.removeAttribute('id');
            return el;
        };

        function makeCropMarks() {
            return `
                <div class="crop-mark top-left-h"></div>
                <div class="crop-mark top-left-v"></div>
                <div class="crop-mark top-right-h"></div>
                <div class="crop-mark top-right-v"></div>
                <div class="crop-mark bottom-left-h"></div>
                <div class="crop-mark bottom-left-v"></div>
                <div class="crop-mark bottom-right-h"></div>
                <div class="crop-mark bottom-right-v"></div>
            `;
        }

        function wrapCard(cardEl) {
            const wrapper = document.createElement('div');
            wrapper.className = `print-card-wrapper ${cropClass}`;
            wrapper.innerHTML = makeCropMarks();
            const cardDiv = document.createElement('div');
            cardDiv.className = 'print-card';
            cardDiv.appendChild(cardEl);
            wrapper.appendChild(cardDiv);
            return wrapper;
        }

        // === PAGE 1: FRONTS ===
        const frontPage = document.createElement('div');
        frontPage.className = 'print-page';
        const frontLabel = document.createElement('div');
        frontLabel.className = 'print-page-label';
        frontLabel.textContent = doubleSided ? 'FRONT SIDE' : 'FRONT';
        frontPage.appendChild(frontLabel);

        for (let i = 0; i < cardCount; i++) {
            frontPage.appendChild(wrapCard(frontClone()));
        }
        printArea.appendChild(frontPage);

        // === PAGE 2: BACKS (if double-sided) ===
        if (doubleSided) {
            const backPage = document.createElement('div');
            backPage.className = 'print-page';
            const backLabel = document.createElement('div');
            backLabel.className = 'print-page-label';
            backLabel.textContent = 'BACK SIDE';
            backPage.appendChild(backLabel);

            if (cardCount === 1) {
                // Single card — just center the back
                backPage.appendChild(wrapCard(backClone()));
            } else {
                // 4-card layout: mirror order for double-sided alignment
                // When flipping on long edge, the rows stay the same but
                // columns reverse. So for a 2x2 grid:
                // Front: [1][2]  ->  Back: [2][1]
                //        [3][4]             [4][3]
                const backs = [];
                for (let i = 0; i < cardCount; i++) {
                    backs.push(wrapCard(backClone()));
                }
                // Swap columns: [0,1,2,3] -> [1,0,3,2]
                const mirrored = [backs[1], backs[0], backs[3], backs[2]];
                mirrored.forEach(b => backPage.appendChild(b));
            }

            const flipNote = document.createElement('div');
            flipNote.className = 'print-flip-note';
            flipNote.textContent = 'Feed this page back through your printer — select "Flip on Long Edge"';
            backPage.appendChild(flipNote);
            printArea.appendChild(backPage);
        }
    }

    // ===== FOIL + GLOSS MOUSE EFFECTS =====
    document.addEventListener('mousemove', e => {
        const card = $('#cardFrontInner');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const foil = $('#cardFoilLayer');
        if (foil && parseFloat(foil.style.opacity) > 0) {
            foil.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,215,0,0.3) 0%, transparent 50%),
                linear-gradient(${135+(x-50)*0.5}deg, transparent 0%, rgba(255,215,0,0.1) 20%, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%, rgba(255,215,0,0.1) 80%, transparent 100%)`;
        }

        const rainbow = $('#cardRainbowLayer');
        if (rainbow && parseFloat(rainbow.style.opacity) > 0) {
            rainbow.style.background = `linear-gradient(${(x+y)*1.5}deg,
                rgba(255,0,0,0.08), rgba(255,165,0,0.08), rgba(255,255,0,0.08),
                rgba(0,255,0,0.08), rgba(0,0,255,0.08), rgba(128,0,255,0.08))`;
        }

        const gloss = $('#cardGloss');
        if (gloss && gloss.style.display !== 'none') {
            gloss.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.25) 0%, transparent 55%),
                linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 45%)`;
        }
    });
})();
