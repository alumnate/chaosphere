/* ==========================================================================
   CHAOSPHERE LEADERBOARD — Premium Financial Dashboard Engine
   Pure Vanilla JS • OpenSheet data source • No backend
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM References ---
    const listEl = document.getElementById('leaderboard-list');
    const statusEl = document.getElementById('leaderboard-status');
    const updatedEl = document.getElementById('leaderboard-updated');
    const statTotalEl = document.getElementById('stat-total-economy');
    const statCountEl = document.getElementById('stat-team-count');
    const statAvgEl = document.getElementById('stat-avg-balance');
    const statTopEl = document.getElementById('stat-top-balance');

    if (!listEl) return;

    // --- Constants ---
    const OPENSHEET_URL = 'https://opensheet.elk.sh/1DNQUc0NbUju5EQA6lG7P3tTeTSBwm74TcCElG37-IVs/Sheet1';
    const CACHE_KEY = 'chaosphere-leaderboard-cache';
    const RANKS_KEY = 'chaosphere-leaderboard-ranks';
    const BALANCES_KEY = 'chaosphere-leaderboard-balances';
    const REFRESH_INTERVAL = 10000; // 10 seconds
    const ALUMONEY = '₳';

    // --- Formatters ---
    const numberFormatter = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
    });

    function formatBalance(value) {
        return numberFormatter.format(Number(value) || 0);
    }

    function formatAlumoney(value) {
        return `${ALUMONEY}\u00A0${formatBalance(value)}`;
    }

    // --- State ---
    let previousRanks = loadStoredMap(RANKS_KEY);   // { teamName: rank }
    let previousBalances = loadStoredMap(BALANCES_KEY); // { teamName: balance }
    let currentRowElements = {}; // { teamName: DOM element }
    let isFirstRender = true;

    // --- Status Helpers ---
    function setStatus(message, tone) {
        if (!statusEl) return;
        const textEl = statusEl.querySelector('.status-text');
        if (textEl) textEl.textContent = message;
        statusEl.dataset.tone = tone || 'muted';
    }

    function setUpdated(timestamp) {
        if (!updatedEl) return;
        if (!timestamp) {
            updatedEl.textContent = '--';
            return;
        }
        const date = new Date(timestamp);
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        updatedEl.textContent = `Updated ${timeStr}`;
    }

    // --- localStorage Helpers ---
    function loadStoredMap(key) {
        try {
            const raw = localStorage.getItem(key);
            if (raw) return JSON.parse(raw);
        } catch (_) { /* ignore */ }
        return {};
    }

    function storeMap(key, map) {
        try {
            localStorage.setItem(key, JSON.stringify(map));
        } catch (_) { /* ignore */ }
    }

    // --- Economy Stats ---
    function updateEconomyStats(items) {
        if (!items || items.length === 0) return;

        const balances = items.map(i => Number(i.balance) || 0);
        const total = balances.reduce((sum, b) => sum + b, 0);
        const avg = Math.round(total / balances.length);
        const top = Math.max(...balances);

        if (statTotalEl) statTotalEl.textContent = formatAlumoney(total);
        if (statCountEl) statCountEl.textContent = String(items.length);
        if (statAvgEl)   statAvgEl.textContent = formatAlumoney(avg);
        if (statTopEl)   statTopEl.textContent = formatAlumoney(top);
    }

    // --- Movement Calculation ---
    function getMovement(teamName, currentRank) {
        if (!previousRanks || !previousRanks[teamName]) return null;
        const prevRank = previousRanks[teamName];
        const diff = prevRank - currentRank; // positive = moved up
        if (diff === 0) return 0;
        return diff;
    }

    function getBalanceChange(teamName, currentBalance) {
        if (!previousBalances || previousBalances[teamName] === undefined) return null;
        const prevBalance = previousBalances[teamName];
        return currentBalance - prevBalance;
    }

    // --- Row Building ---
    function buildRankBadge(rank) {
        const badge = document.createElement('span');
        badge.className = 'rank-badge';

        if (rank <= 3) {
            badge.classList.add(`rank-badge--${rank}`);
        } else {
            badge.classList.add('rank-badge--default');
        }

        badge.textContent = String(rank);
        return badge;
    }

    function buildMovementCell(movement) {
        const span = document.createElement('span');

        if (movement === null || movement === undefined) {
            span.className = 'movement-neutral';
            span.textContent = '—';
        } else if (movement > 0) {
            span.className = 'movement-up';
            span.textContent = `▲ ${movement}`;
        } else if (movement < 0) {
            span.className = 'movement-down';
            span.textContent = `▼ ${Math.abs(movement)}`;
        } else {
            span.className = 'movement-neutral';
            span.textContent = '—';
        }

        return span;
    }

    function buildBalanceCell(balance, balanceChange) {
        const wrapper = document.createElement('div');
        wrapper.className = 'balance-wrapper';

        const main = document.createElement('span');
        main.className = 'balance-main';

        const symbol = document.createElement('span');
        symbol.className = 'balance-symbol';
        symbol.textContent = ALUMONEY + '\u00A0';

        const value = document.createElement('span');
        value.textContent = formatBalance(balance);

        main.appendChild(symbol);
        main.appendChild(value);
        wrapper.appendChild(main);

        // Balance change indicator
        if (balanceChange !== null && balanceChange !== 0) {
            const delta = document.createElement('span');
            delta.className = 'balance-delta';

            if (balanceChange > 0) {
                delta.classList.add('balance-delta--up');
                delta.textContent = `+${ALUMONEY}${formatBalance(balanceChange)}`;
            } else {
                delta.classList.add('balance-delta--down');
                delta.textContent = `-${ALUMONEY}${formatBalance(Math.abs(balanceChange))}`;
            }

            // Trigger animation after append
            requestAnimationFrame(() => {
                delta.classList.add('delta-show');
            });

            wrapper.appendChild(delta);
        }

        return wrapper;
    }

    function createRow(item, rank, movement, balanceChange, delay) {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        row.setAttribute('role', 'row');
        row.dataset.rank = String(rank);
        row.dataset.team = item.team_name;
        row.style.setProperty('--row-delay', `${delay}s`);

        // Rank cell
        const rankCell = document.createElement('div');
        rankCell.className = 'leaderboard-cell cell-rank';
        rankCell.setAttribute('role', 'cell');
        rankCell.appendChild(buildRankBadge(rank));

        // Team cell
        const teamCell = document.createElement('div');
        teamCell.className = 'leaderboard-cell cell-team';
        teamCell.setAttribute('role', 'cell');
        teamCell.textContent = item.team_name || 'Unknown Team';

        // Movement cell
        const moveCell = document.createElement('div');
        moveCell.className = 'leaderboard-cell cell-movement';
        moveCell.setAttribute('role', 'cell');
        moveCell.appendChild(buildMovementCell(movement));

        // Balance cell
        const balCell = document.createElement('div');
        balCell.className = 'leaderboard-cell cell-balance';
        balCell.setAttribute('role', 'cell');
        balCell.appendChild(buildBalanceCell(Number(item.balance) || 0, balanceChange));

        row.appendChild(rankCell);
        row.appendChild(teamCell);
        row.appendChild(moveCell);
        row.appendChild(balCell);

        return row;
    }

    // --- Render ---
    function renderItems(items, source) {
        if (!Array.isArray(items) || items.length === 0) {
            listEl.innerHTML = '';
            const emptyRow = document.createElement('div');
            emptyRow.className = 'leaderboard-row leaderboard-row--empty';
            emptyRow.setAttribute('role', 'row');
            emptyRow.innerHTML = '<div class="leaderboard-cell" role="cell" style="grid-column:1/-1;text-align:center;">No teams yet</div>';
            listEl.appendChild(emptyRow);
            setStatus('No data available yet.', 'muted');
            return;
        }

        // Sort descending by balance
        const sorted = [...items].sort((a, b) => {
            const balA = Number(a.balance) || 0;
            const balB = Number(b.balance) || 0;
            return balB - balA;
        });

        // Calculate movements and balance changes
        const newRanks = {};
        const newBalances = {};
        const movements = {};
        const balanceChanges = {};

        sorted.forEach((item, index) => {
            const rank = index + 1;
            const teamName = item.team_name;
            const balance = Number(item.balance) || 0;

            newRanks[teamName] = rank;
            newBalances[teamName] = balance;

            if (!isFirstRender) {
                movements[teamName] = getMovement(teamName, rank);
                balanceChanges[teamName] = getBalanceChange(teamName, balance);
            } else {
                movements[teamName] = null;
                balanceChanges[teamName] = null;
            }
        });

        // Build new DOM
        const fragment = document.createDocumentFragment();

        sorted.forEach((item, index) => {
            const rank = index + 1;
            const teamName = item.team_name;
            const delay = isFirstRender ? index * 0.04 : 0;

            const row = createRow(
                item,
                rank,
                movements[teamName],
                balanceChanges[teamName],
                delay
            );

            // Animate rank changes (not first render)
            if (!isFirstRender && movements[teamName] && movements[teamName] !== 0) {
                const badge = row.querySelector('.rank-badge');
                if (badge) {
                    badge.style.animation = 'rankChange 0.6s ease-out';
                }
            }

            // Animate balance changes
            if (!isFirstRender && balanceChanges[teamName] && balanceChanges[teamName] !== 0) {
                const balMain = row.querySelector('.balance-main');
                if (balMain) {
                    balMain.style.animation = 'balancePop 0.5s ease-out';
                }
            }

            fragment.appendChild(row);
        });

        // Swap content
        listEl.innerHTML = '';
        listEl.appendChild(fragment);

        // Update economy stats
        updateEconomyStats(sorted);

        // Save current state for next comparison
        previousRanks = newRanks;
        previousBalances = newBalances;
        storeMap(RANKS_KEY, newRanks);
        storeMap(BALANCES_KEY, newBalances);
        isFirstRender = false;

        // Update status
        if (source === 'cache') {
            setStatus('Offline Mode', 'offline');
        } else {
            setStatus('● LIVE', 'live');
        }
    }

    // --- Cache ---
    function saveToCache(items) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                items: items,
                updated_at: new Date().toISOString()
            }));
        } catch (_) { /* ignore */ }
    }

    function loadFromCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const cached = JSON.parse(raw);
            if (cached && Array.isArray(cached.items)) {
                renderItems(cached.items, 'cache');
                setUpdated(cached.updated_at);
                return cached.items;
            }
        } catch (_) { /* ignore */ }
        return null;
    }

    // --- Data Fetching ---
    function normalizeOpenSheetData(rawData) {
        if (!Array.isArray(rawData)) return [];

        return rawData
            .filter(row => {
                // Must have a team name
                const name = row['Team Name'] || row['team_name'] || '';
                return name.trim().length > 0;
            })
            .map(row => {
                const name = (row['Team Name'] || row['team_name'] || 'Unknown').trim();
                const balanceRaw = row['Team Balance'] || row['team_balance'] || row['Balance'] || '0';
                // Strip non-numeric characters except digits, dots, and minus
                const balanceClean = String(balanceRaw).replace(/[^0-9.\-]/g, '');
                const balance = parseFloat(balanceClean) || 0;

                return {
                    team_name: name,
                    balance: balance
                };
            });
    }

    async function fetchLeaderboard() {
        try {
            setStatus('Fetching latest standings...', 'muted');

            const response = await fetch(OPENSHEET_URL);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const rawData = await response.json();
            const items = normalizeOpenSheetData(rawData);

            if (items.length === 0) {
                throw new Error('No valid team data received');
            }

            renderItems(items, 'live');
            setUpdated(new Date().toISOString());
            saveToCache(items);

        } catch (error) {
            // Network failure — fallback to cache
            const cached = loadFromCache();
            if (!cached) {
                setStatus('Unable to load leaderboard.', 'offline');
            }
        }
    }

    // --- Initialization ---
    // 1. Show cached data immediately (instant paint)
    loadFromCache();

    // 2. Fetch fresh data
    fetchLeaderboard();

    // 3. Auto-refresh every 10 seconds
    setInterval(fetchLeaderboard, REFRESH_INTERVAL);
});
