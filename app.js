// ===== BASEBALL CARD MAKER PRO =====
(function () {
    'use strict';

    const state = { playerPhoto: null, teamLogo: null, brandLogo: null, leagueLogo: null, fieldBg: null, showFront: true, isPitcher: false };
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
        setupFieldSelect();
        setupSaveLoad();
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
        setupUpload('fieldBgInput', 'fieldBgUpload', 'fieldBgPreview', 'fieldBgPlaceholder', 'fieldBgControls', img => { state.fieldBg = img; updateCard(); });

        const removeButtons = {
            playerPhoto: 'removePlayerPhoto',
            teamLogo: 'removeTeamLogo',
            brandLogo: 'removeBrandLogo',
            leagueLogo: 'removeLeagueLogo',
            fieldBg: 'removeFieldBg'
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
        removeHandler('fieldBg', 'fieldBgPreview', 'fieldBgPlaceholder', 'fieldBgControls', 'fieldBgUpload', 'fieldBgInput');
    }

    function setupUpload(inputId, boxId, previewId, placeholderId, controlsId, callback) {
        const input = $(`#${inputId}`), box = $(`#${boxId}`), preview = $(`#${previewId}`), placeholder = $(`#${placeholderId}`), controls = $(`#${controlsId}`);
        input.addEventListener('click', e => e.stopPropagation());
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
            'borderThickness','vignetteStrength','fieldBgSelect',
            'playerPhotoZoom','playerPhotoX','playerPhotoY','playerBrightness','playerContrast','playerSaturation',
            'teamLogoSize','brandLogoSize','leagueLogoSize',
            'headshotZoom','headshotX','headshotY'
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

    // ===== FIELD BACKGROUND SELECT =====
    const builtInFields = {
        'photo-daytime': 'images/field-daytime.jpg',
        'photo-diamond': 'images/field-sunset.jpg',
        'photo-night': 'images/field-night.jpg'
    };
    const builtInFieldCache = {};

    function setupFieldSelect() {
        const sel = $('#fieldBgSelect');
        const uploadBox = $('#fieldBgUpload');
        sel.addEventListener('change', () => {
            uploadBox.style.display = sel.value === 'custom' ? 'block' : 'none';
            updateCard();
        });

        // Preload built-in field images
        for (const [key, path] of Object.entries(builtInFields)) {
            const img = new Image();
            img.onload = () => { builtInFieldCache[key] = img; updateCard(); };
            img.onerror = () => { console.warn('Failed to load field:', path); };
            img.src = path;
        }
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

        // Card styles — team-colored border frame & nameplate
        switch (style) {
            case 'classic':
                bgLayer.style.background = primary;
                bgLayer.style.border = `none`;
                bgLayer.style.borderImage = 'none';
                nameplate.style.background = primary;
                break;
            case 'modern':
                bgLayer.style.background = `linear-gradient(135deg, ${primary}, ${secondary})`;
                bgLayer.style.border = `none`;
                nameplate.style.background = `linear-gradient(90deg, ${primary}, ${secondary})`;
                break;
            case 'vintage':
                bgLayer.style.background = `#5c3d2e`;
                bgLayer.style.border = `none`;
                nameplate.style.background = `#5c3d2e`;
                break;
            case 'elite':
                bgLayer.style.background = `linear-gradient(135deg, ${primary}, ${accent}, ${secondary})`;
                bgLayer.style.border = `none`;
                nameplate.style.background = `linear-gradient(90deg, ${primary}, ${accent}, ${secondary})`;
                break;
            case 'rookie':
                bgLayer.style.background = primary;
                bgLayer.style.border = `none`;
                nameplate.style.background = primary;
                break;
        }
        bgLayer.style.borderRadius = '4px';

        // Top bar — team colored
        $('#cardTopBar').style.background = primary;

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

        // Field background — CSS background-image on photo area
        const fieldSel = $('#fieldBgSelect').value;
        const photoArea = $('#cardPhotoArea');

        if (fieldSel === 'none') {
            photoArea.style.backgroundImage = 'none';
            photoArea.style.backgroundColor = '#e8e8e8';
        } else if (fieldSel === 'custom' && state.fieldBg) {
            photoArea.style.backgroundImage = `url(${state.fieldBg.src})`;
            photoArea.style.backgroundSize = 'cover';
            photoArea.style.backgroundPosition = 'center';
        } else if (builtInFields[fieldSel]) {
            photoArea.style.backgroundImage = `url(${builtInFields[fieldSel]})`;
            photoArea.style.backgroundSize = 'cover';
            photoArea.style.backgroundPosition = 'center';
        } else {
            photoArea.style.backgroundImage = 'none';
            photoArea.style.backgroundColor = '#e8e8e8';
        }

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
        $('#cardBackBg').style.border = `6px solid ${primary}`;
        $('#cardBackBg').style.borderRadius = '4px';
        $('#backNumber').textContent = `#${number}`;
        $('#backName').textContent = name;
        $('#backTeam').textContent = team;
        $('#backHeader').style.background = primary;
        $('#backAccentLine').style.background = accent;

        // Stats table header uses team color — bold and visible
        document.querySelectorAll('.stats-table th').forEach(th => {
            th.style.background = primary;
            th.style.color = 'white';
            th.style.borderBottomColor = primary;
        });

        // Headshot on back — with zoom/position controls
        const headshot = $('#backHeadshot');
        const headshotControls = $('#headshotControls');
        if (state.playerPhoto) {
            headshot.src = state.playerPhoto.src;
            headshot.style.display = 'block';
            headshotControls.style.display = 'block';
            const hZoom = parseFloat($('#headshotZoom').value);
            const hX = parseInt($('#headshotX').value);
            const hY = parseInt($('#headshotY').value);
            headshot.style.width = `${hZoom * 100}%`;
            headshot.style.height = 'auto';
            headshot.style.transform = `translate(calc(-50% + ${hX}px), calc(-50% + ${hY}px))`;
        } else {
            headshot.style.display = 'none';
            headshotControls.style.display = 'none';
        }

        // Info box uses team color border
        $('#backInfoBox').style.borderColor = `${primary}30`;

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
            const leagueImg = $('#leagueLogoDisplay');
            leagueImg.src = state.leagueLogo.src;
            leagueImg.style.height = `${logoSize}px`;
            leagueImg.style.width = 'auto';
            leagueImg.style.display = 'block';
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

        // Clone front and back card — strip screen-only effects for clean print
        const frontClone = () => {
            const el = $('#cardFrontInner').cloneNode(true);
            el.removeAttribute('id');
            ['.card-gloss', '.card-foil-layer', '.card-rainbow-layer', '.card-photo-fade', '.photo-vignette', '.card-texture', '.card-edge'].forEach(sel => {
                const node = el.querySelector(sel);
                if (node) node.remove();
            });
            // Force exact screen dimensions on the card
            el.style.cssText += 'width:350px !important;height:490px !important;';
            return el;
        };
        const backClone = () => {
            const el = $('#cardBackInner').cloneNode(true);
            el.removeAttribute('id');
            ['.card-back-texture', '.card-back-edge'].forEach(sel => {
                const node = el.querySelector(sel);
                if (node) node.remove();
            });
            el.style.cssText += 'width:350px !important;height:490px !important;';
            return el;
        };

        function makeCropMarks(show) {
            if (!show) return '';
            const markStyle = 'position:absolute;background:#999;-webkit-print-color-adjust:exact;print-color-adjust:exact;';
            return `
                <div style="${markStyle}top:0;left:0.125in;width:0.1in;height:0.5pt;"></div>
                <div style="${markStyle}top:0.125in;left:0;width:0.5pt;height:0.1in;"></div>
                <div style="${markStyle}top:0;right:0.125in;width:0.1in;height:0.5pt;"></div>
                <div style="${markStyle}top:0.125in;right:0;width:0.5pt;height:0.1in;"></div>
                <div style="${markStyle}bottom:0;left:0.125in;width:0.1in;height:0.5pt;"></div>
                <div style="${markStyle}bottom:0.125in;left:0;width:0.5pt;height:0.1in;"></div>
                <div style="${markStyle}bottom:0;right:0.125in;width:0.1in;height:0.5pt;"></div>
                <div style="${markStyle}bottom:0.125in;right:0;width:0.5pt;height:0.1in;"></div>
            `;
        }

        function wrapCard(cardEl) {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'width:2.75in;height:3.75in;position:relative;display:flex;align-items:center;justify-content:center;';
            wrapper.innerHTML = makeCropMarks(showCropMarks);

            // Card container — holds the scaled-down card
            const cardDiv = document.createElement('div');
            cardDiv.style.cssText = 'width:2.5in;height:3.5in;overflow:hidden;border-radius:3px;position:relative;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact;';

            // Inner container at screen size, scaled down
            const scaleWrap = document.createElement('div');
            scaleWrap.style.cssText = 'width:350px;height:490px;transform:scale(0.6857);transform-origin:top left;filter:none;';
            scaleWrap.appendChild(cardEl);

            cardDiv.appendChild(scaleWrap);
            wrapper.appendChild(cardDiv);
            return wrapper;
        }

        const pageStyle = 'width:8.5in;height:11in;position:relative;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:0;background:white;page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact;box-sizing:border-box;padding:0;';
        const labelStyle = 'position:absolute;top:0.15in;left:50%;transform:translateX(-50%);font-size:8pt;color:#999;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:3px;';

        // === PAGE 1: FRONTS ===
        const frontPage = document.createElement('div');
        frontPage.style.cssText = pageStyle;
        const frontLabel = document.createElement('div');
        frontLabel.style.cssText = labelStyle;
        frontLabel.textContent = doubleSided ? 'FRONT SIDE' : 'FRONT';
        frontPage.appendChild(frontLabel);

        for (let i = 0; i < cardCount; i++) {
            frontPage.appendChild(wrapCard(frontClone()));
        }
        printArea.appendChild(frontPage);

        // === PAGE 2: BACKS (if double-sided) ===
        if (doubleSided) {
            const backPage = document.createElement('div');
            backPage.style.cssText = pageStyle + 'page-break-after:auto;';
            const backLabel = document.createElement('div');
            backLabel.style.cssText = labelStyle;
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

    // ===== SAVE / LOAD DESIGNS =====
    function setupSaveLoad() {
        const STORAGE_KEY = 'baseballCardDesigns';

        function getDesigns() {
            try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
        }

        function saveDesigns(designs) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
        }

        const formFields = [
            'playerName','teamName','position','jerseyNumber','cardYear','bats','throws','height','weight','birthdate','hometown',
            'seriesName','cardNumber','bio','statsYear','league',
            'stat_G','stat_AB','stat_R','stat_H','stat_2B','stat_3B','stat_HR','stat_RBI','stat_BB','stat_SO','stat_SB','stat_AVG','stat_OBP','stat_SLG','stat_OPS',
            'stat_W','stat_L','stat_ERA','stat_GP','stat_GS','stat_SV','stat_IP','stat_HA','stat_ER','stat_PBB','stat_K','stat_WHIP',
            'cardStyle','primaryColor','secondaryColor','accentColor','nameColor',
            'showGloss','showFoil','showRookieBadge','showAllStar','show3DTilt',
            'borderThickness','vignetteStrength','fieldBgSelect',
            'playerPhotoZoom','playerPhotoX','playerPhotoY','playerBrightness','playerContrast','playerSaturation',
            'teamLogoSize','brandLogoSize','leagueLogoSize',
            'headshotZoom','headshotX','headshotY'
        ];

        function collectFormData() {
            const data = {};
            formFields.forEach(id => {
                const el = $(`#${id}`);
                if (!el) return;
                if (el.type === 'checkbox') data[id] = el.checked;
                else data[id] = el.value;
            });
            if (state.playerPhoto) data._playerPhoto = state.playerPhoto.src;
            if (state.teamLogo) data._teamLogo = state.teamLogo.src;
            if (state.brandLogo) data._brandLogo = state.brandLogo.src;
            if (state.leagueLogo) data._leagueLogo = state.leagueLogo.src;
            if (state.fieldBg) data._fieldBg = state.fieldBg.src;
            data._isPitcher = state.isPitcher;
            return data;
        }

        function restoreImage(dataUrl, stateKey, previewId, placeholderId, controlsId, boxId) {
            if (!dataUrl) return;
            const img = new Image();
            img.onload = () => {
                state[stateKey] = img;
                const preview = $(`#${previewId}`);
                const placeholder = $(`#${placeholderId}`);
                const controls = $(`#${controlsId}`);
                const box = $(`#${boxId}`);
                if (preview) { preview.src = dataUrl; preview.style.display = 'block'; }
                if (placeholder) placeholder.style.display = 'none';
                if (controls) controls.style.display = 'block';
                if (box) box.classList.add('has-image');
                updateCard();
            };
            img.src = dataUrl;
        }

        function loadFormData(data) {
            formFields.forEach(id => {
                const el = $(`#${id}`);
                if (!el || data[id] === undefined) return;
                if (el.type === 'checkbox') el.checked = data[id];
                else el.value = data[id];
            });
            ['primary','secondary','accent','name'].forEach(c => {
                const picker = $(`#${c}Color`);
                const text = $(`#${c}ColorText`);
                if (picker && text) text.value = picker.value;
            });
            if (data._isPitcher !== undefined) {
                state.isPitcher = data._isPitcher;
                $$('.stat-toggle-btn').forEach(btn => {
                    btn.classList.toggle('active', (btn.dataset.type === 'pitching') === state.isPitcher);
                });
                $('#battingStats').style.display = state.isPitcher ? 'none' : 'block';
                $('#pitchingStats').style.display = state.isPitcher ? 'block' : 'none';
            }
            restoreImage(data._playerPhoto, 'playerPhoto', 'playerPhotoPreview', 'playerPhotoPlaceholder', 'playerPhotoControls', 'playerPhotoUpload');
            restoreImage(data._teamLogo, 'teamLogo', 'teamLogoPreview', 'teamLogoPlaceholder', 'teamLogoControls', 'teamLogoUpload');
            restoreImage(data._brandLogo, 'brandLogo', 'brandLogoPreview', 'brandLogoPlaceholder', 'brandLogoControls', 'brandLogoUpload');
            restoreImage(data._leagueLogo, 'leagueLogo', 'leagueLogoPreview', 'leagueLogoPlaceholder', 'leagueLogoControls', 'leagueLogoUpload');
            restoreImage(data._fieldBg, 'fieldBg', 'fieldBgPreview', 'fieldBgPlaceholder', 'fieldBgControls', 'fieldBgUpload');
            updateCard();
        }

        function refreshDropdown() {
            const select = $('#loadDesign');
            const designs = getDesigns();
            select.innerHTML = '<option value="">Load Saved Design...</option>';
            Object.keys(designs).sort().forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
            });
        }

        $('#saveDesign').addEventListener('click', () => {
            const playerName = $('#playerName').value.trim();
            const defaultName = playerName || 'My Card';
            const name = prompt('Design name:', defaultName);
            if (!name) return;
            const designs = getDesigns();
            designs[name] = collectFormData();
            saveDesigns(designs);
            refreshDropdown();
            alert(`Design "${name}" saved!`);
        });

        $('#loadDesign').addEventListener('change', () => {
            const name = $('#loadDesign').value;
            if (!name) return;
            const designs = getDesigns();
            if (designs[name]) loadFormData(designs[name]);
            $('#loadDesign').value = '';
        });

        $('#deleteDesign').addEventListener('click', () => {
            const select = $('#loadDesign');
            const name = select.value;
            if (!name) {
                alert('Select a design from the dropdown first, then click Delete.');
                return;
            }
            if (!confirm(`Delete design "${name}"?`)) return;
            const designs = getDesigns();
            delete designs[name];
            saveDesigns(designs);
            refreshDropdown();
        });

        refreshDropdown();
    }

})();
