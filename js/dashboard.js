document.addEventListener('DOMContentLoaded', () => {
    const balanceToggle = document.getElementById('balance-toggle');
    const balancePanel = document.getElementById('balance-panel');
    const teamNameEl = document.getElementById('team-name');
    const teamBalanceEl = document.getElementById('team-balance');

    if (!balanceToggle || !balancePanel) {
        return;
    }

    const storedTeam = localStorage.getItem('chaosphere-team') || 'Team';
    // const storedTeam = (window.CHAOSPHERE_STATE && window.CHAOSPHERE_STATE.teamName) || 'Team';
    if (teamNameEl) {
        teamNameEl.textContent = storedTeam;
    }

    // async function refreshBalance() {
    //     if (!storedTeam) {
    //         return;
    //     }
    //     try {
    //         const response = await fetch(`${window.CHAOSPHERE_API}/balance`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'text/plain'
    //             },
    //             body: JSON.stringify({ teamName: storedTeam })
    //         });
    //         if (!response.ok) {
    //             return;
    //         }
    //         const data = await response.json();
    //         localStorage.setItem('chaosphere-balance', String(data.balance));
    //         if (teamBalanceEl) {
    //             teamBalanceEl.textContent = data.balance;
    //         }
    //     } catch (error) {
    //         // Keep silent for now to match UI style.
    //     }
    // }

    async function refreshBalance() {
        if (!storedTeam) {
            return;
        }
        const isOnline = await window.checkGatewayStatus();
        if (!isOnline) return;
        
        try {
            const response = await fetch(`${window.CHAOSPHERE_API}/balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ teamName: storedTeam })
            });
            if (!response.ok) {
                return;
            }
            const data = await response.json();
            localStorage.setItem('chaosphere-balance', String(data.balance));
            if (teamBalanceEl) {
                teamBalanceEl.textContent = data.balance;
            }
        } catch (error) {
            // Keep silent for now to match UI style.
        }
    }

    balanceToggle.addEventListener('click', () => {
        const isExpanded = balanceToggle.getAttribute('aria-expanded') === 'true';
        balanceToggle.setAttribute('aria-expanded', String(!isExpanded));
        balancePanel.hidden = isExpanded;
        if (!isExpanded) {
            refreshBalance();
        }
    });

    const cachedBalance = localStorage.getItem('chaosphere-balance');
    if (teamBalanceEl && cachedBalance) {
        teamBalanceEl.textContent = cachedBalance;
    }

    // Navigate to pay page when Pay button is clicked
    const payButton = document.querySelector('.action-button--solid');
    if (payButton) {
        payButton.addEventListener('click', () => {
            window.location.href = 'pay.html';
        });
    }

    refreshBalance();
});
