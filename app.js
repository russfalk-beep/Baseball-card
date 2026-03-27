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

        // Clear blue daytime sky
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.45);
        sky.addColorStop(0, '#4a90d9');
        sky.addColorStop(0.5, '#6ab0f0');
        sky.addColorStop(1, '#a8d4f5');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h * 0.45);

        // A few simple clouds
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath(); ctx.ellipse(w * 0.2, h * 0.12, 50, 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w * 0.25, h * 0.11, 35, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w * 0.7, h * 0.18, 45, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w * 0.74, h * 0.17, 30, 12, 0, 0, Math.PI * 2); ctx.fill();

        // Tree line / fence in distance
        ctx.fillStyle = '#2d7a3a';
        ctx.fillRect(0, h * 0.32, w, h * 0.1);
        // Slight variation in tree line
        for (let i = 0; i < w; i += 12) {
            const th = 8 + Math.random() * 14;
            ctx.fillStyle = `rgb(${35 + Math.random()*20}, ${100 + Math.random()*40}, ${45 + Math.random()*20})`;
            ctx.beginPath();
            ctx.ellipse(i + 6, h * 0.33, 8, th, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Outfield fence
        ctx.fillStyle = '#2a5a2a';
        ctx.fillRect(0, h * 0.38, w, 6);

        // Outfield grass
        const grass = ctx.createLinearGradient(0, h * 0.38, 0, h);
        grass.addColorStop(0, '#3aaa45');
        grass.addColorStop(0.3, '#35a040');
        grass.addColorStop(0.6, '#309838');
        grass.addColorStop(1, '#2c8e34');
        ctx.fillStyle = grass;
        ctx.fillRect(0, h * 0.38, w, h * 0.62);

        // Mowing stripes
        for (let i = -w; i < w * 2; i += 28) {
            ctx.fillStyle = i % 56 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(i, h * 0.38);
            ctx.lineTo(i + 14, h * 0.38);
            ctx.lineTo(i + 14 + h * 0.3, h);
            ctx.lineTo(i + h * 0.3, h);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Infield dirt
        ctx.fillStyle = '#c49464';
        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.95, w * 0.44, h * 0.34, 0, Math.PI, 0);
        ctx.fill();

        // Infield grass (darker green circle)
        ctx.fillStyle = '#2da83c';
        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.95, w * 0.3, h * 0.22, 0, Math.PI, 0);
        ctx.fill();

        // Diamond bases
        const d = {
            home:   { x: w / 2,     y: h * 0.88 },
            first:  { x: w * 0.7,   y: h * 0.72 },
            second: { x: w / 2,     y: h * 0.58 },
            third:  { x: w * 0.3,   y: h * 0.72 }
        };

        // Base path dirt
        ctx.strokeStyle = '#c49464';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(d.home.x, d.home.y);
        ctx.lineTo(d.first.x, d.first.y);
        ctx.lineTo(d.second.x, d.second.y);
        ctx.lineTo(d.third.x, d.third.y);
        ctx.closePath();
        ctx.stroke();

        // Foul lines (white chalk)
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(d.home.x, d.home.y); ctx.lineTo(0, h * 0.15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(d.home.x, d.home.y); ctx.lineTo(w, h * 0.15); ctx.stroke();

        // Bases (white squares)
        ctx.fillStyle = '#fff';
        [d.first, d.second, d.third].forEach(b => {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-5, -5, 10, 10);
            ctx.restore();
        });

        // Home plate
        ctx.fillStyle = '#fff';
        const hx = d.home.x, hy = d.home.y;
        ctx.beginPath();
        ctx.moveTo(hx - 6, hy);
        ctx.lineTo(hx - 6, hy + 4);
        ctx.lineTo(hx, hy + 8);
        ctx.lineTo(hx + 6, hy + 4);
        ctx.lineTo(hx + 6, hy);
        ctx.closePath();
        ctx.fill();

        // Pitcher's mound
        ctx.fillStyle = '#c49464';
        ctx.beginPath(); ctx.ellipse(w / 2, h * 0.67, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d4aa78';
        ctx.beginPath(); ctx.ellipse(w / 2, h * 0.67, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
        // Rubber
        ctx.fillStyle = '#fff';
        ctx.fillRect(w / 2 - 6, h * 0.67 - 1.5, 12, 3);
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

        // Card styles — real printed card: white border, team-colored inner frame & nameplate
        switch (style) {
            case 'classic':
                bgLayer.style.background = `white`;
                bgLayer.style.border = `none`;
                bgLayer.style.borderImage = 'none';
                nameplate.style.background = primary;
                break;
            case 'modern':
                bgLayer.style.background = `white`;
                bgLayer.style.border = `none`;
                nameplate.style.background = `linear-gradient(90deg, ${primary}, ${secondary})`;
                break;
            case 'vintage':
                bgLayer.style.background = `#faf6ee`;
                bgLayer.style.border = `none`;
                nameplate.style.background = `#5c3d2e`;
                break;
            case 'elite':
                bgLayer.style.background = `white`;
                bgLayer.style.border = `none`;
                nameplate.style.background = `linear-gradient(90deg, ${primary}, ${accent}, ${secondary})`;
                break;
            case 'rookie':
                bgLayer.style.background = `white`;
                bgLayer.style.border = `none`;
                nameplate.style.background = primary;
                break;
        }
        bgLayer.style.borderRadius = '4px';

        // Top bar — clean, sits in white border
        $('#cardTopBar').style.background = `transparent`;

        // Name — auto-size with bolder feel
        const nameDisplay = $('#playerNameDisplay');
        nameDisplay.textContent = name;
        nameDisplay.style.color = nameColor;
        nameDisplay.style.fontSize = name.length > 20 ? '1.05rem' : name.length > 15 ? '1.25rem' : '1.6rem';

        const teamDisplay = $('#teamNameDisplay');
        teamDisplay.textContent = team;
        teamDisplay.style.color = nameColor;

        // Inner photo frame — team-colored solid border
        const photoBorder = $('#cardPhotoBorder');
        photoBorder.style.borderColor = primary;
        photoBorder.style.boxShadow = `0 0 0 1px rgba(0,0,0,0.1)`;

        // Nameplate accent line — team accent color
        $('#nameplateAccent').style.background = accent;

        // Photo fade — gentle blend into nameplate
        const nameplateColor = style === 'vintage' ? '#5c3d2e' : primary;
        $('#cardPhotoFade').style.background = `linear-gradient(to bottom, transparent 50%, ${nameplateColor}cc 85%, ${nameplateColor} 100%)`;

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

        $('#cardBackBg').style.background = `#f0efe8`;
        $('#cardBackBg').style.border = `5px solid ${primary}`;
        $('#cardBackBg').style.borderRadius = '4px';
        $('#backNumber').textContent = `#${number}`;
        $('#backName').textContent = name;
        $('#backTeam').textContent = team;
        $('#backHeader').style.background = primary;
        $('#backAccentLine').style.background = accent;

        // Stats table header uses team color
        document.querySelectorAll('.stats-table th').forEach(th => {
            th.style.background = `${primary}18`;
            th.style.color = primary;
            th.style.borderBottomColor = primary;
        });

        // Headshot on back
        const headshot = $('#backHeadshot');
        if (state.playerPhoto) {
            headshot.src = state.playerPhoto.src;
            headshot.style.display = 'block';
        } else {
            headshot.style.display = 'none';
        }

        // Info box uses team color border
        $('.back-info-box').style.borderColor = `${primary}30`;

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
        $('#backBio').style.borderLeftColor = accent;

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
        let h = year || league ? `<div style="font-size:0.55rem;color:rgba(0,0,0,0.45);text-align:center;margin-bottom:3px;letter-spacing:1px;text-transform:uppercase">${year} ${league?'- '+league:''} SEASON STATS</div>` : '';
        h += `<table class="stats-table"><tr>${r1.map(s=>`<th>${s}</th>`).join('')}</tr><tr>${r1.map(s=>`<td>${vals[s]}</td>`).join('')}</tr></table>`;
        h += `<table class="stats-table" style="margin-top:3px"><tr>${r2.map(s=>`<th>${s}</th>`).join('')}</tr><tr>${r2.map(s=>`<td>${vals[s]}</td>`).join('')}</tr></table>`;
        return h;
    }

    function buildPitchingStats(year, league) {
        const ids = [['W','stat_W'],['L','stat_L'],['ERA','stat_ERA'],['GP','stat_GP'],['GS','stat_GS'],['SV','stat_SV'],['IP','stat_IP'],['H','stat_HA'],['ER','stat_ER'],['BB','stat_PBB'],['K','stat_K'],['WHIP','stat_WHIP']];
        const r1 = ids.slice(0,6), r2 = ids.slice(6);
        let h = year || league ? `<div style="font-size:0.55rem;color:rgba(0,0,0,0.45);text-align:center;margin-bottom:3px;letter-spacing:1px;text-transform:uppercase">${year} ${league?'- '+league:''} SEASON STATS</div>` : '';
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

    // ===== PHOTO EDITOR (Background Removal + Touch-up) =====
    (function setupPhotoEditor() {
        const overlay = $('#photoEditorOverlay');
        const canvas = $('#editorCanvas');
        const ctx = canvas.getContext('2d');
        const loading = $('#editorLoading');
        const loadingText = $('#editorLoadingText');

        let originalImage = null;   // original uploaded image (Image element)
        let originalData = null;    // original pixel data (ImageData)
        let currentTool = 'eraser';
        let brushSize = 25;
        let brushSoftness = 0;
        let isDrawing = false;
        let bgRemoved = false;

        // Open editor from "Remove Background" button
        $('#removeBgBtn').addEventListener('click', () => {
            if (!state.playerPhoto) return;
            openEditor(state.playerPhoto, true);
        });

        // Open editor from "Touch Up Cutout" button
        $('#editCutoutBtn').addEventListener('click', () => {
            if (!state.playerPhoto) return;
            openEditor(state.playerPhoto, false);
        });

        function openEditor(img, autoRemove) {
            overlay.classList.add('open');
            originalImage = img;

            // Size canvas to image, but cap for display
            const maxW = Math.min(img.naturalWidth || img.width, 700);
            const scale = maxW / (img.naturalWidth || img.width);
            canvas.width = Math.round((img.naturalWidth || img.width) * scale);
            canvas.height = Math.round((img.naturalHeight || img.height) * scale);

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            if (autoRemove) {
                runAutoRemove();
            }
        }

        function closeEditor() {
            overlay.classList.remove('open');
            bgRemoved = false;
        }

        $('#photoEditorClose').addEventListener('click', closeEditor);
        $('#editorCancel').addEventListener('click', closeEditor);
        overlay.addEventListener('click', e => { if (e.target === overlay) closeEditor(); });

        // Tool selection
        $$('.editor-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.editor-tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTool = btn.dataset.tool;
            });
        });

        // Brush size
        $('#brushSize').addEventListener('input', e => {
            brushSize = parseInt(e.target.value);
            $('#brushSizeLabel').textContent = brushSize;
        });

        // Brush softness
        $('#brushSoftness').addEventListener('input', e => {
            brushSoftness = parseInt(e.target.value);
        });

        // Reset
        $('#editorReset').addEventListener('click', () => {
            if (!originalData) return;
            ctx.putImageData(originalData, 0, 0);
            bgRemoved = false;
        });

        // Auto remove button inside editor
        $('#editorAutoRemove').addEventListener('click', () => runAutoRemove());

        // Apply cutout
        $('#editorApply').addEventListener('click', () => {
            // Convert canvas to image and update state
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => {
                    state.playerPhoto = img;
                    // Update preview
                    const preview = $('#playerPhotoPreview');
                    preview.src = url;
                    preview.style.display = 'block';
                    // Show touch-up button
                    $('#editCutoutBtn').style.display = 'block';
                    updateCard();
                    closeEditor();
                };
                img.src = url;
            }, 'image/png');
        });

        // ===== AUTO BACKGROUND REMOVAL (MediaPipe Selfie Segmentation) =====
        let segmenter = null;

        async function initSegmenter() {
            if (segmenter) return segmenter;
            segmenter = new SelfieSegmentation({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
            });
            segmenter.setOptions({ modelSelection: 1 }); // 1 = landscape (better for full-body)
            return new Promise((resolve, reject) => {
                segmenter.onResults((results) => {
                    resolve(results);
                });
                // Warm up with a tiny canvas to trigger model load
                const tiny = document.createElement('canvas');
                tiny.width = 2; tiny.height = 2;
                segmenter.send({ image: tiny }).catch(reject);
            }).then(() => segmenter);
        }

        async function runAutoRemove() {
            loading.style.display = 'flex';
            loadingText.textContent = 'Loading AI model...';

            try {
                // Prepare source image at full resolution for segmentation
                const srcCanvas = document.createElement('canvas');
                srcCanvas.width = canvas.width;
                srcCanvas.height = canvas.height;
                const srcCtx = srcCanvas.getContext('2d');
                srcCtx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

                // Init segmenter
                const seg = new SelfieSegmentation({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
                });
                seg.setOptions({ modelSelection: 1 });

                loadingText.textContent = 'Analyzing image...';

                const maskPromise = new Promise((resolve, reject) => {
                    seg.onResults((results) => {
                        resolve(results.segmentationMask);
                    });
                    // Small timeout for safety
                    setTimeout(() => reject(new Error('Segmentation timed out')), 30000);
                });

                await seg.send({ image: srcCanvas });
                const mask = await maskPromise;

                loadingText.textContent = 'Removing background...';

                // Apply mask: draw original image, then erase background using mask
                // The mask is a canvas/image where white = person, black = background
                const maskCanvas = document.createElement('canvas');
                maskCanvas.width = canvas.width;
                maskCanvas.height = canvas.height;
                const maskCtx = maskCanvas.getContext('2d');
                maskCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);

                const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
                const imgData = srcCtx.getImageData(0, 0, canvas.width, canvas.height);

                // Apply mask to alpha channel — mask R channel > threshold = keep
                for (let i = 0; i < imgData.data.length; i += 4) {
                    const confidence = maskData.data[i]; // R channel = person confidence
                    if (confidence < 128) {
                        // Background — make transparent
                        imgData.data[i + 3] = 0;
                    } else if (confidence < 200) {
                        // Edge — partial transparency for smooth edges
                        imgData.data[i + 3] = Math.round((confidence - 128) / 72 * 255);
                    }
                    // else: fully opaque (person)
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.putImageData(imgData, 0, 0);
                bgRemoved = true;
                loading.style.display = 'none';

                seg.close();

            } catch (err) {
                console.error('Auto background removal failed:', err);
                loadingText.textContent = 'Auto-removal failed. Use the eraser tool to remove background manually.';
                setTimeout(() => { loading.style.display = 'none'; }, 2500);
            }
        }

        // ===== MANUAL BRUSH TOOLS =====
        function getCanvasPos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        function brushAt(x, y) {
            const r = brushSize;
            const softEdge = brushSoftness / 100;

            if (currentTool === 'eraser') {
                if (softEdge > 0) {
                    // Soft eraser — use radial gradient for feathered edge
                    const imgData = ctx.getImageData(
                        Math.max(0, Math.floor(x - r)),
                        Math.max(0, Math.floor(y - r)),
                        Math.min(r * 2, canvas.width),
                        Math.min(r * 2, canvas.height)
                    );
                    const cx = x - Math.max(0, Math.floor(x - r));
                    const cy = y - Math.max(0, Math.floor(y - r));
                    for (let py = 0; py < imgData.height; py++) {
                        for (let px = 0; px < imgData.width; px++) {
                            const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
                            if (dist < r) {
                                const idx = (py * imgData.width + px) * 4;
                                const falloff = dist / r;
                                const hardRadius = r * (1 - softEdge);
                                if (dist < hardRadius) {
                                    imgData.data[idx + 3] = 0;
                                } else {
                                    const blend = (dist - hardRadius) / (r - hardRadius);
                                    imgData.data[idx + 3] = Math.round(imgData.data[idx + 3] * blend);
                                }
                            }
                        }
                    }
                    ctx.putImageData(imgData, Math.max(0, Math.floor(x - r)), Math.max(0, Math.floor(y - r)));
                } else {
                    // Hard eraser — clear circle
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            } else if (currentTool === 'restore') {
                // Restore from original data
                if (!originalData) return;
                const sx = Math.max(0, Math.floor(x - r));
                const sy = Math.max(0, Math.floor(y - r));
                const sw = Math.min(r * 2, canvas.width - sx);
                const sh = Math.min(r * 2, canvas.height - sy);

                const current = ctx.getImageData(sx, sy, sw, sh);
                const cx = x - sx;
                const cy = y - sy;

                for (let py = 0; py < sh; py++) {
                    for (let px = 0; px < sw; px++) {
                        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
                        if (dist < r) {
                            const idx = (py * sw + px) * 4;
                            const origIdx = ((sy + py) * originalData.width + (sx + px)) * 4;
                            current.data[idx] = originalData.data[origIdx];
                            current.data[idx + 1] = originalData.data[origIdx + 1];
                            current.data[idx + 2] = originalData.data[origIdx + 2];
                            current.data[idx + 3] = originalData.data[origIdx + 3];
                        }
                    }
                }
                ctx.putImageData(current, sx, sy);
            }
        }

        // Drawing events — mouse
        canvas.addEventListener('mousedown', e => {
            isDrawing = true;
            const pos = getCanvasPos(e);
            brushAt(pos.x, pos.y);
        });
        canvas.addEventListener('mousemove', e => {
            if (!isDrawing) return;
            const pos = getCanvasPos(e);
            brushAt(pos.x, pos.y);
        });
        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('mouseleave', () => { isDrawing = false; });

        // Drawing events — touch
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            isDrawing = true;
            const pos = getCanvasPos(e);
            brushAt(pos.x, pos.y);
        }, { passive: false });
        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!isDrawing) return;
            const pos = getCanvasPos(e);
            brushAt(pos.x, pos.y);
        }, { passive: false });
        canvas.addEventListener('touchend', () => { isDrawing = false; });
    })();

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
