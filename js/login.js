document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const teamInput = document.querySelector('input[name="teamName"]');
    const passcodeInput = document.querySelector('input[name="passcode"]');
    const existingMessage = document.querySelector('.login-message');
    const messageEl = existingMessage || (() => {
        const el = document.createElement('p');
        el.className = 'login-message';
        el.setAttribute('role', 'status');
        el.style.marginTop = '12px';
        el.style.color = '#ff8c8c';
        form && form.appendChild(el);
        return el;
    })();

    if (!form || !teamInput || !passcodeInput) {
        return;
    }

    function setMessage(text, tone) {
        if (!messageEl) return;
        messageEl.textContent = text || '';
        messageEl.style.color = tone === 'success' ? '#84f1b5' : '#ff8c8c';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const teamName = teamInput.value.trim();
        const passcode = passcodeInput.value.trim();

        // if (!teamName || !passcode) {
        //     return;
        // }
        if (!teamName || !passcode) {
            setMessage('Please enter both team name and passcode.');
            return;
        }

        if (!window.CHAOSPHERE_API) {
            setMessage('API endpoint is missing. Set localStorage "chaosphere-api" or update script.js.');
            return;
        }

        setMessage('Checking credentials...', 'success');

        try {
            const response = await fetch(`${window.CHAOSPHERE_API}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ teamName, passcode })
            });

            // if (!response.ok) {
            //     return;
            // }
            if (!response.ok) {
                const detail = await response.text().catch(() => '');
                setMessage(detail || 'Login failed. Check your team name and passcode.');
                return;
            }

            const data = await response.json();
            localStorage.setItem('chaosphere-team', data.teamName);
            localStorage.setItem('chaosphere-balance', String(data.balance));
            window.location.href = 'dashboard.html';
        } catch (error) {
            // Keep silent for now to match UI style.
            setMessage('Network error contacting the API. Check the API URL or CORS settings.');
        }
    });
});
