document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('leaderboard-list');
    const statusEl = document.getElementById('leaderboard-status');
    const updatedEl = document.getElementById('leaderboard-updated');

    if (!listEl) {
        return;
    }

    const cacheKey = 'chaosphere-leaderboard-cache';
    const formatter = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
    });

    function formatBalance(value) {
        const numberValue = Number(value) || 0;
        return formatter.format(numberValue);
    }

    function setStatus(message, tone) {
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.dataset.tone = tone || 'neutral';
        }
    }

    function setUpdated(timestamp) {
        if (!updatedEl) {
            return;
        }
        if (!timestamp) {
            updatedEl.textContent = '--';
            return;
        }
        const date = new Date(timestamp);
        updatedEl.textContent = `Updated ${date.toLocaleString()}`;
    }

    function renderItems(items, source) {
        listEl.innerHTML = '';

        if (!Array.isArray(items) || items.length === 0) {
            const emptyRow = document.createElement('div');
            emptyRow.className = 'leaderboard-row';
            emptyRow.innerHTML = `
				<div class="leaderboard-cell">--</div>
				<div class="leaderboard-cell">No teams yet</div>
				<div class="leaderboard-cell leaderboard-cell--balance">--</div>
			`;
            listEl.appendChild(emptyRow);
            setStatus('No data available yet.', 'muted');
            return;
        }

        const sortedItems = [...items].sort((a, b) => (b.balance || 0) - (a.balance || 0));
        const balances = sortedItems.map((item) => Number(item.balance) || 0);
        const minBalance = Math.min(...balances);
        const maxBalance = Math.max(...balances);
        const range = maxBalance - minBalance || 1;

        sortedItems.forEach((item, index) => {
            const rank = index + 1;
            const balance = Number(item.balance) || 0;
            const normalized = (balance - minBalance) / range;
            const lift = Math.round((0.5 - normalized) * 38);

            const row = document.createElement('div');
            row.className = 'leaderboard-row';
            row.dataset.rank = String(rank);
            row.style.setProperty('--lift', String(lift));
            row.style.setProperty('--float-delay', `${index * 0.15}s`);
            row.innerHTML = `
				<div class="leaderboard-cell">${rank}</div>
				<div class="leaderboard-cell">${item.team_name || 'Team'}</div>
				<div class="leaderboard-cell leaderboard-cell--balance">${formatBalance(balance)}</div>
			`;

            listEl.appendChild(row);
        });

        if (source === 'cache') {
            setStatus('Offline mode: showing last saved data.', 'offline');
        } else {
            setStatus('Live leaderboard running.', 'live');
        }
    }

    function loadFromCache() {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) {
            return null;
        }
        try {
            const cached = JSON.parse(raw);
            if (cached && Array.isArray(cached.items)) {
                renderItems(cached.items, 'cache');
                setUpdated(cached.updated_at);
                return cached.items;
            }
        } catch (error) {
            // Ignore invalid cache.
        }
        return null;
    }

    // async function fetchLeaderboard() {
    //     try {
    //         const response = await fetch(`${window.CHAOSPHERE_API}/leaderboard`);
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         const data = await response.json();
    //         if (!data || !Array.isArray(data.items)) {
    //             throw new Error('Invalid leaderboard payload');
    //         }
    //         renderItems(data.items, 'live');
    //         setUpdated(data.updated_at || new Date().toISOString());
    //         localStorage.setItem(cacheKey, JSON.stringify({
    //             items: data.items,
    //             updated_at: data.updated_at || new Date().toISOString()
    //         }));
    //     } catch (error) {
    //         const cached = loadFromCache();
    //         if (!cached) {
    //             setStatus('Unable to load leaderboard right now.', 'offline');
    //         }
    //     }
    // }

    function buildEndpoint(baseUrl) {
        const cleanedBase = (baseUrl || '').trim().replace(/\/$/, '');
        if (!cleanedBase) {
            return '/api/leaderboard';
        }
        return `${cleanedBase}/leaderboard`;
    }

    // async function fetchFromEndpoint(endpoint) {
    //     const response = await fetch(endpoint);
    //     if (!response.ok) {
    //         throw new Error('Network response was not ok');
    //     }
    //     const data = await response.json();
    //     if (!data || !Array.isArray(data.items)) {
    //         throw new Error('Invalid leaderboard payload');
    //     }
    //     return data;
    // }
    //
    // async function fetchLeaderboard() {
    //     const endpoints = [
    //         buildEndpoint(window.CHAOSPHERE_API),
    //         '/api/leaderboard'
    //     ];
    //
    //     for (const endpoint of endpoints) {
    //         try {
    //             const data = await fetchFromEndpoint(endpoint);
    //             renderItems(data.items, 'live');
    //             setUpdated(data.updated_at || new Date().toISOString());
    //             localStorage.setItem(cacheKey, JSON.stringify({
    //                 items: data.items,
    //                 updated_at: data.updated_at || new Date().toISOString()
    //             }));
    //             return;
    //         } catch (error) {
    //             // Try the next endpoint.
    //         }
    //     }
    //
    //     const cached = loadFromCache();
    //     if (!cached) {
    //         setStatus('Unable to load leaderboard right now.', 'offline');
    //     }
    // }

    async function fetchFromEndpoint(endpoint) {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.items)) {
            throw new Error('Invalid leaderboard payload');
        }
        return data;
    }

    async function fetchLeaderboard() {
        const endpoints = [
            buildEndpoint(window.CHAOSPHERE_API),
            '/api/leaderboard'
        ];

        for (const endpoint of endpoints) {
            try {
                const data = await fetchFromEndpoint(endpoint);
                renderItems(data.items, 'live');
                setUpdated(data.updated_at || new Date().toISOString());
                localStorage.setItem(cacheKey, JSON.stringify({
                    items: data.items,
                    updated_at: data.updated_at || new Date().toISOString()
                }));
                return;
            } catch (error) {
                // Try the next endpoint.
            }
        }

        const cached = loadFromCache();
        if (!cached) {
            setStatus('Unable to load leaderboard right now.', 'offline');
        }
    }

    loadFromCache();
    fetchLeaderboard();
    setInterval(fetchLeaderboard, 12000);
});
