// ===== BASEBALL CARD MAKER PRO =====

(function () {
    'use strict';

    // --- State ---
    const state = {
        playerPhoto: null,
        teamLogo: null,
        brandLogo: null,
        showFront: true,
        isPitcher: false,
    };

    // --- DOM References ---
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // --- Init ---
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        setupTabs();
        setupUploads();
        setupLivePreview();
        setupControls();
        setupPrint();
        drawFieldBackground();
        updateCard();
    }

    // ===== TABS =====
    function setupTabs() {
        $$('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.tab-btn').forEach(b => b.classList.remove('active'));
                $$('.tab-content').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                $(`#tab-${btn.dataset.tab}`).classList.add('active');
            });
        });

        // Stats type toggle
        $$('.stat-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.stat-toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.isPitcher = btn.dataset.type === 'pitching';
                $('#battingStats').style.display = state.isPitcher ? 'none' : 'block';
                $('#pitchingStats').style.display = state.isPitcher ? 'block' : 'none';
                updateCard();
            });
        });
    }

    // ===== FILE UPLOADS =====
    function setupUploads() {
        setupUpload('playerPhoto', 'playerPhotoUpload', 'playerPhotoPreview', 'playerPhotoPlaceholder', 'playerPhotoControls', (img) => {
            state.playerPhoto = img;
            updateCard();
        });
        setupUpload('teamLogo', 'teamLogoUpload', 'teamLogoPreview', 'teamLogoPlaceholder', 'teamLogoControls', (img) => {
            state.teamLogo = img;
            updateCard();
        });
        setupUpload('brandLogo', 'brandLogoUpload', 'brandLogoPreview', 'brandLogoPlaceholder', 'brandLogoControls', (img) => {
            state.brandLogo = img;
            updateCard();
        });

        // Remove buttons
        $('#removePlayerPhoto').addEventListener('click', () => {
            state.playerPhoto = null;
            $('#playerPhotoPreview').style.display = 'none';
            $('#playerPhotoPlaceholder').style.display = 'flex';
            $('#playerPhotoControls').style.display = 'none';
            $('#playerPhotoUpload').classList.remove('has-image');
            $('#playerPhoto').value = '';
            updateCard();
        });
        $('#removeTeamLogo').addEventListener('click', () => {
            state.teamLogo = null;
            $('#teamLogoPreview').style.display = 'none';
            $('#teamLogoPlaceholder').style.display = 'flex';
            $('#teamLogoControls').style.display = 'none';
            $('#teamLogoUpload').classList.remove('has-image');
            $('#teamLogo').value = '';
            updateCard();
        });
        $('#removeBrandLogo').addEventListener('click', () => {
            state.brandLogo = null;
            $('#brandLogoPreview').style.display = 'none';
            $('#brandLogoPlaceholder').style.display = 'flex';
            $('#brandLogoControls').style.display = 'none';
            $('#brandLogoUpload').classList.remove('has-image');
            $('#brandLogo').value = '';
            updateCard();
        });
    }

    function setupUpload(inputId, boxId, previewId, placeholderId, controlsId, callback) {
        const input = $(`#${inputId}`);
        const box = $(`#${boxId}`);
        const preview = $(`#${previewId}`);
        const placeholder = $(`#${placeholderId}`);
        const controls = $(`#${controlsId}`);

        box.addEventListener('click', () => input.click());
        box.addEventListener('dragover', (e) => { e.preventDefault(); box.style.borderColor = 'var(--accent)'; });
        box.addEventListener('dragleave', () => { box.style.borderColor = ''; });
        box.addEventListener('drop', (e) => {
            e.preventDefault();
            box.style.borderColor = '';
            if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        input.addEventListener('change', (e) => {
            if (e.target.files.length) handleFile(e.target.files[0]);
        });

        function handleFile(file) {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
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
        // All text inputs and selects trigger update
        const inputs = [
            'playerName', 'teamName', 'position', 'jerseyNumber', 'cardYear',
            'bats', 'throws', 'height', 'weight', 'birthdate', 'hometown',
            'seriesName', 'cardNumber', 'bio', 'statsYear', 'league',
            'stat_G', 'stat_AB', 'stat_R', 'stat_H', 'stat_2B', 'stat_3B',
            'stat_HR', 'stat_RBI', 'stat_BB', 'stat_SO', 'stat_SB',
            'stat_AVG', 'stat_OBP', 'stat_SLG', 'stat_OPS',
            'stat_W', 'stat_L', 'stat_ERA', 'stat_GP', 'stat_GS',
            'stat_SV', 'stat_IP', 'stat_HA', 'stat_ER', 'stat_PBB',
            'stat_K', 'stat_WHIP'
        ];
        inputs.forEach(id => {
            const el = $(`#${id}`);
            if (el) {
                el.addEventListener('input', updateCard);
                el.addEventListener('change', updateCard);
            }
        });

        // Design controls
        const designInputs = [
            'cardStyle', 'primaryColor', 'secondaryColor', 'accentColor', 'nameColor',
            'showGloss', 'showFoil', 'showRookieBadge', 'showAllStar',
            'borderThickness', 'vignetteStrength', 'showOnField',
            'playerPhotoZoom', 'playerPhotoX', 'playerPhotoY',
            'playerBrightness', 'playerContrast', 'playerSaturation',
            'teamLogoSize', 'brandLogoSize'
        ];
        designInputs.forEach(id => {
            const el = $(`#${id}`);
            if (el) {
                el.addEventListener('input', updateCard);
                el.addEventListener('change', updateCard);
            }
        });

        // Color labels
        ['primary', 'secondary', 'accent', 'name'].forEach(c => {
            const input = $(`#${c}Color`);
            const label = $(`#${c}ColorLabel`);
            if (input && label) {
                input.addEventListener('input', () => {
                    label.textContent = input.value.toUpperCase();
                });
            }
        });

        // Team presets
        $$('.team-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                $('#primaryColor').value = btn.dataset.primary;
                $('#secondaryColor').value = btn.dataset.secondary;
                $('#accentColor').value = btn.dataset.accent;
                $('#primaryColorLabel').textContent = btn.dataset.primary.toUpperCase();
                $('#secondaryColorLabel').textContent = btn.dataset.secondary.toUpperCase();
                $('#accentColorLabel').textContent = btn.dataset.accent.toUpperCase();
                updateCard();
            });
        });
    }

    // ===== CONTROLS =====
    function setupControls() {
        // Front/Back toggle
        $('#showFront').addEventListener('click', () => {
            state.showFront = true;
            $('#showFront').classList.add('active');
            $('#showBack').classList.remove('active');
            $('#cardFront').style.display = 'block';
            $('#cardBack').style.display = 'none';
        });
        $('#showBack').addEventListener('click', () => {
            state.showFront = false;
            $('#showBack').classList.add('active');
            $('#showFront').classList.remove('active');
            $('#cardFront').style.display = 'none';
            $('#cardBack').style.display = 'block';
        });
    }

    // ===== DRAW FIELD BACKGROUND =====
    function drawFieldBackground() {
        const canvas = $('#fieldCanvas');
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
        skyGrad.addColorStop(0, '#1a5276');
        skyGrad.addColorStop(0.5, '#2e86c1');
        skyGrad.addColorStop(1, '#85c1e9');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.45);

        // Stadium lights glow
        ctx.fillStyle = 'rgba(255,255,200,0.03)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(w * 0.2 + i * w * 0.15, h * 0.05, 40, 0, Math.PI * 2);
            ctx.fill();
        }

        // Outfield grass
        const grassGrad = ctx.createLinearGradient(0, h * 0.35, 0, h);
        grassGrad.addColorStop(0, '#1e7a34');
        grassGrad.addColorStop(0.3, '#28a745');
        grassGrad.addColorStop(0.7, '#2d8f45');
        grassGrad.addColorStop(1, '#1e6b2e');
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, h * 0.35, w, h * 0.65);

        // Mowing lines pattern
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 8;
        for (let y = h * 0.4; y < h; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Alternate mowing stripes
        for (let x = 0; x < w; x += 50) {
            ctx.fillStyle = x % 100 === 0 ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.02)';
            ctx.fillRect(x, h * 0.35, 50, h * 0.65);
        }

        // Infield dirt arc
        ctx.fillStyle = '#c4956a';
        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.95, w * 0.45, h * 0.35, 0, Math.PI, 0);
        ctx.fill();

        // Dirt texture
        ctx.fillStyle = 'rgba(139,90,43,0.3)';
        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.95, w * 0.43, h * 0.33, 0, Math.PI, 0);
        ctx.fill();

        // Infield grass
        ctx.fillStyle = '#2d9e4a';
        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.95, w * 0.3, h * 0.22, 0, Math.PI, 0);
        ctx.fill();

        // Base paths
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        // Diamond shape
        const diamond = {
            home: { x: w / 2, y: h * 0.88 },
            first: { x: w * 0.7, y: h * 0.72 },
            second: { x: w / 2, y: h * 0.58 },
            third: { x: w * 0.3, y: h * 0.72 }
        };

        ctx.beginPath();
        ctx.moveTo(diamond.home.x, diamond.home.y);
        ctx.lineTo(diamond.first.x, diamond.first.y);
        ctx.lineTo(diamond.second.x, diamond.second.y);
        ctx.lineTo(diamond.third.x, diamond.third.y);
        ctx.closePath();
        ctx.stroke();

        // Bases (white squares)
        ctx.fillStyle = '#ffffff';
        const baseSize = 6;
        [diamond.first, diamond.second, diamond.third].forEach(base => {
            ctx.save();
            ctx.translate(base.x, base.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-baseSize, -baseSize, baseSize * 2, baseSize * 2);
            ctx.restore();
        });

        // Home plate
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const hx = diamond.home.x, hy = diamond.home.y;
        ctx.moveTo(hx - 5, hy);
        ctx.lineTo(hx - 5, hy + 4);
        ctx.lineTo(hx, hy + 8);
        ctx.lineTo(hx + 5, hy + 4);
        ctx.lineTo(hx + 5, hy);
        ctx.closePath();
        ctx.fill();

        // Pitcher's mound
        ctx.fillStyle = '#c4956a';
        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.67, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Rubber
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(w / 2 - 6, h * 0.67 - 1.5, 12, 3);

        // Foul lines extending outward
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(diamond.home.x, diamond.home.y);
        ctx.lineTo(0, h * 0.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(diamond.home.x, diamond.home.y);
        ctx.lineTo(w, h * 0.35);
        ctx.stroke();

        // Warning track
        ctx.strokeStyle = '#b8845a';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(w / 2, h * 1.2, w * 0.75, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Outfield wall
        ctx.strokeStyle = '#0a4a1e';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(w / 2, h * 1.2, w * 0.78, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Atmosphere / depth of field blur at top
        const fogGrad = ctx.createLinearGradient(0, 0, 0, h * 0.3);
        fogGrad.addColorStop(0, 'rgba(20,50,80,0.4)');
        fogGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, w, h * 0.3);
    }

    // ===== UPDATE CARD =====
    function updateCard() {
        updateFront();
        updateBack();
    }

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
        const showGloss = $('#showGloss').checked;
        const showFoil = $('#showFoil').checked;
        const showRookie = $('#showRookieBadge').checked;
        const showAllStar = $('#showAllStar').checked;
        const borderThickness = $('#borderThickness').value;
        const vignetteStrength = $('#vignetteStrength').value;
        const showField = $('#showOnField').checked;

        // Card background by style
        const cardFront = $('#cardFrontInner');
        const bgLayer = $('#cardBgLayer');

        // Remove old style classes
        cardFront.className = 'card baseball-card front';

        switch (style) {
            case 'classic':
                bgLayer.style.background = `linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`;
                bgLayer.style.border = `${borderThickness}px solid ${primary}`;
                bgLayer.style.borderImage = 'none';
                break;
            case 'modern':
                bgLayer.style.background = `linear-gradient(135deg, ${secondary} 0%, #111 40%, ${secondary} 100%)`;
                bgLayer.style.border = `${borderThickness}px solid ${accent}`;
                break;
            case 'vintage':
                bgLayer.style.background = `linear-gradient(180deg, #f5e6c8 0%, #e8d5a8 50%, #d4c090 100%)`;
                bgLayer.style.border = `${borderThickness}px solid #8b7355`;
                break;
            case 'elite':
                bgLayer.style.background = `linear-gradient(135deg, #1a1a2e 0%, ${secondary} 30%, #1a1a2e 60%, ${primary} 100%)`;
                bgLayer.style.border = `${borderThickness}px solid ${accent}`;
                break;
            case 'rookie':
                bgLayer.style.background = `linear-gradient(180deg, ${primary} 0%, #111 50%, ${secondary} 100%)`;
                bgLayer.style.border = `${borderThickness}px solid #FFD700`;
                break;
        }

        // Nameplate background
        const nameplate = $('#cardNameplate');
        switch (style) {
            case 'classic':
                nameplate.style.background = `linear-gradient(90deg, ${primary}, ${secondary})`;
                break;
            case 'modern':
                nameplate.style.background = `linear-gradient(90deg, rgba(0,0,0,0.85), ${secondary}cc)`;
                break;
            case 'vintage':
                nameplate.style.background = `linear-gradient(90deg, #5d4037, #795548)`;
                break;
            case 'elite':
                nameplate.style.background = `linear-gradient(90deg, rgba(0,0,0,0.9), ${primary}99, rgba(0,0,0,0.9))`;
                break;
            case 'rookie':
                nameplate.style.background = `linear-gradient(90deg, ${primary}, #111, ${secondary})`;
                break;
        }

        // Top bar
        const topBar = $('#cardTopBar');
        topBar.style.background = `linear-gradient(90deg, ${secondary}cc, transparent)`;

        // Text
        const nameDisplay = $('#playerNameDisplay');
        nameDisplay.textContent = name;
        nameDisplay.style.color = nameColor;

        // Auto-size name
        const nameLen = name.length;
        if (nameLen > 20) nameDisplay.style.fontSize = '1rem';
        else if (nameLen > 15) nameDisplay.style.fontSize = '1.2rem';
        else nameDisplay.style.fontSize = '1.5rem';

        const teamDisplay = $('#teamNameDisplay');
        teamDisplay.textContent = team;
        teamDisplay.style.color = nameColor;

        // Position badge
        const posBadge = $('#positionBadge');
        posBadge.textContent = pos;
        posBadge.style.borderColor = accent;

        // Year & series
        $('#cardYearDisplay').textContent = year;
        $('#cardSeriesDisplay').textContent = series;

        // Card number
        if (cardNum) {
            $('#cardNumberFront').textContent = `#${cardNum}`;
        }

        // Player photo
        const photoDisplay = $('#playerPhotoDisplay');
        const photoPlaceholder = $('#photoPlaceholderCard');
        if (state.playerPhoto) {
            const zoom = parseFloat($('#playerPhotoZoom').value);
            const px = parseInt($('#playerPhotoX').value);
            const py = parseInt($('#playerPhotoY').value);
            const brightness = $('#playerBrightness').value;
            const contrast = $('#playerContrast').value;
            const saturation = $('#playerSaturation').value;

            photoDisplay.src = state.playerPhoto.src;
            photoDisplay.style.display = 'block';
            photoDisplay.style.width = `${zoom * 100}%`;
            photoDisplay.style.transform = `translate(${px}px, ${py}px)`;
            photoDisplay.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            photoPlaceholder.style.display = 'none';
        } else {
            photoDisplay.style.display = 'none';
            photoPlaceholder.style.display = 'block';
        }

        // Field background
        $('#fieldBg').style.display = showField ? 'block' : 'none';

        // Vignette
        const vig = parseInt(vignetteStrength);
        $('#photoVignette').style.boxShadow = `inset 0 0 ${vig}px ${vig / 2}px rgba(0,0,0,0.6)`;

        // Team logo
        const teamLogoDisplay = $('#teamLogoDisplay');
        const teamLogoContainer = $('#cardTeamLogo');
        if (state.teamLogo) {
            const logoSize = parseInt($('#teamLogoSize').value);
            teamLogoDisplay.src = state.teamLogo.src;
            teamLogoDisplay.style.display = 'block';
            teamLogoContainer.style.width = `${logoSize}px`;
            teamLogoContainer.style.height = `${logoSize}px`;
        } else {
            teamLogoDisplay.style.display = 'none';
        }

        // Brand logo
        const brandLogoDisplay = $('#brandLogoDisplay');
        if (state.brandLogo) {
            const bSize = parseInt($('#brandLogoSize').value);
            brandLogoDisplay.src = state.brandLogo.src;
            brandLogoDisplay.style.display = 'block';
            brandLogoDisplay.style.height = `${bSize * 0.5}px`;
        } else {
            brandLogoDisplay.style.display = 'none';
        }

        // Effects
        $('#cardGloss').style.display = showGloss ? 'block' : 'none';
        $('#cardFoilLayer').style.opacity = showFoil ? '1' : '0';
        $('#rookieBadge').style.display = showRookie ? 'flex' : 'none';
        $('#allstarBadge').style.display = showAllStar ? 'block' : 'none';
    }

    function updateBack() {
        const name = $('#playerName').value || 'PLAYER NAME';
        const team = $('#teamName').value || 'TEAM NAME';
        const pos = $('#position').value;
        const number = $('#jerseyNumber').value || '00';
        const year = $('#cardYear').value || new Date().getFullYear();
        const cardNum = $('#cardNumber').value;
        const primary = $('#primaryColor').value;
        const secondary = $('#secondaryColor').value;

        // Back background
        const backBg = $('#cardBackBg');
        backBg.style.background = `linear-gradient(180deg, ${secondary} 0%, #111 40%, ${secondary}99 100%)`;

        // Header
        $('#backNumber').textContent = `#${number}`;
        $('#backName').textContent = name;
        $('#backTeam').textContent = team;
        const backHeader = $('#backHeader');
        backHeader.style.background = `linear-gradient(90deg, ${primary}cc, ${secondary}cc)`;

        // Info
        $('#backPosition').textContent = pos;
        $('#backBatThrow').textContent = `${$('#bats').value}/${$('#throws').value}`;
        const ht = $('#height').value;
        const wt = $('#weight').value;
        $('#backHtWt').textContent = (ht || wt) ? `${ht || '-'} / ${wt || '-'}` : '-';
        $('#backBorn').textContent = $('#birthdate').value || '-';
        $('#backHometown').textContent = $('#hometown').value || '-';

        // Stats table
        const statsContainer = $('#backStatsTable');
        const statsYear = $('#statsYear').value || year;
        const league = $('#league').value || '';

        if (state.isPitcher) {
            statsContainer.innerHTML = buildPitchingStatsTable(statsYear, league);
        } else {
            statsContainer.innerHTML = buildBattingStatsTable(statsYear, league);
        }

        // Bio
        const bio = $('#bio').value;
        const bioContainer = $('#backBio');
        if (bio) {
            bioContainer.style.display = 'block';
            $('#backBioText').textContent = bio;
        } else {
            bioContainer.style.display = 'none';
        }

        // Footer
        $('#backCardNumber').textContent = cardNum ? `No. ${cardNum}` : '';
        $('#backYear').textContent = year;
    }

    function buildBattingStatsTable(year, league) {
        const stats = ['G', 'AB', 'R', 'H', '2B', '3B', 'HR', 'RBI', 'BB', 'SO', 'SB', 'AVG', 'OBP', 'SLG', 'OPS'];
        const values = {};
        stats.forEach(s => {
            const el = $(`#stat_${s}`);
            values[s] = el ? (el.value || '-') : '-';
        });

        // Split stats into two rows for better fit
        const row1Stats = ['G', 'AB', 'R', 'H', 'HR', 'RBI', 'BB', 'SB'];
        const row2Stats = ['2B', '3B', 'SO', 'AVG', 'OBP', 'SLG', 'OPS'];

        let html = `<table class="stats-table">`;
        // First stats block
        html += `<tr>${row1Stats.map(s => `<th>${s}</th>`).join('')}</tr>`;
        html += `<tr>${row1Stats.map(s => `<td>${values[s]}</td>`).join('')}</tr>`;
        html += `</table>`;
        html += `<table class="stats-table" style="margin-top:4px">`;
        html += `<tr>${row2Stats.map(s => `<th>${s}</th>`).join('')}</tr>`;
        html += `<tr>${row2Stats.map(s => `<td>${values[s]}</td>`).join('')}</tr>`;
        html += `</table>`;

        if (year || league) {
            html = `<div style="font-size:0.6rem;color:rgba(255,255,255,0.5);text-align:center;margin-bottom:4px;letter-spacing:1px;text-transform:uppercase">${year} ${league ? '- ' + league : ''} SEASON STATS</div>` + html;
        }

        return html;
    }

    function buildPitchingStatsTable(year, league) {
        const pitchIds = [
            ['W', 'stat_W'], ['L', 'stat_L'], ['ERA', 'stat_ERA'],
            ['GP', 'stat_GP'], ['GS', 'stat_GS'], ['SV', 'stat_SV'],
            ['IP', 'stat_IP'], ['H', 'stat_HA'], ['ER', 'stat_ER'],
            ['BB', 'stat_PBB'], ['K', 'stat_K'], ['WHIP', 'stat_WHIP']
        ];

        const row1 = pitchIds.slice(0, 6);
        const row2 = pitchIds.slice(6);

        let html = `<table class="stats-table">`;
        html += `<tr>${row1.map(([label]) => `<th>${label}</th>`).join('')}</tr>`;
        html += `<tr>${row1.map(([, id]) => `<td>${$(`#${id}`).value || '-'}</td>`).join('')}</tr>`;
        html += `</table>`;
        html += `<table class="stats-table" style="margin-top:4px">`;
        html += `<tr>${row2.map(([label]) => `<th>${label}</th>`).join('')}</tr>`;
        html += `<tr>${row2.map(([, id]) => `<td>${$(`#${id}`).value || '-'}</td>`).join('')}</tr>`;
        html += `</table>`;

        if (year || league) {
            html = `<div style="font-size:0.6rem;color:rgba(255,255,255,0.5);text-align:center;margin-bottom:4px;letter-spacing:1px;text-transform:uppercase">${year} ${league ? '- ' + league : ''} SEASON STATS</div>` + html;
        }

        return html;
    }

    // ===== PRINT & SAVE =====
    function setupPrint() {
        $('#printCard').addEventListener('click', printCard);
        $('#saveCard').addEventListener('click', saveCard);
    }

    function printCard() {
        // Clone front and back into print area
        const printFront = $('#printFront');
        const printBack = $('#printBack');
        printFront.innerHTML = '';
        printBack.innerHTML = '';

        const frontClone = $('#cardFrontInner').cloneNode(true);
        const backClone = $('#cardBackInner').cloneNode(true);

        printFront.appendChild(frontClone);
        printBack.appendChild(backClone);

        window.print();
    }

    async function saveCard() {
        // Use html2canvas approach via canvas rendering
        try {
            const front = $('#cardFrontInner');
            const back = $('#cardBackInner');

            // Create a canvas to capture the card
            const canvas = document.createElement('canvas');
            const scale = 3; // High resolution
            canvas.width = 350 * scale;
            canvas.height = 490 * scale * 2 + 40 * scale; // Both sides with gap

            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 350, 490 * 2 + 40);

            // Use native browser rendering
            const frontData = await htmlToImage(front, 350, 490);
            const backData = await htmlToImage(back, 350, 490);

            ctx.drawImage(frontData, 0, 0, 350, 490);
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('- - - CUT HERE - - - FOLD LINE - - -', 175, 490 + 20);
            ctx.drawImage(backData, 0, 490 + 40, 350, 490);

            // Download
            const link = document.createElement('a');
            link.download = `baseball-card-${$('#playerName').value || 'player'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            // Fallback: simple print
            alert('For best results, use the Print button to save as PDF. Browser security may prevent direct image capture.');
            printCard();
        }
    }

    function htmlToImage(element, width, height) {
        return new Promise((resolve, reject) => {
            const svgData = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                    <foreignObject width="100%" height="100%">
                        <div xmlns="http://www.w3.org/1999/xhtml">
                            ${element.outerHTML}
                        </div>
                    </foreignObject>
                </svg>`;

            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
        });
    }

    // ===== Foil hover effect =====
    document.addEventListener('mousemove', (e) => {
        const card = $('#cardFrontInner');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const foil = $('#cardFoilLayer');
        if (foil && parseFloat(foil.style.opacity) > 0) {
            foil.style.background = `
                radial-gradient(circle at ${x}% ${y}%, rgba(255,215,0,0.3) 0%, transparent 50%),
                linear-gradient(${135 + (x - 50) * 0.5}deg,
                    transparent 0%, rgba(255,215,0,0.1) 20%, transparent 40%,
                    rgba(255,255,255,0.15) 50%, transparent 60%,
                    rgba(255,215,0,0.1) 80%, transparent 100%)
            `;
        }

        // Gloss follow
        const gloss = $('#cardGloss');
        if (gloss && gloss.style.display !== 'none') {
            gloss.style.background = `
                radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.3) 0%, transparent 60%),
                linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)
            `;
        }
    });

})();
