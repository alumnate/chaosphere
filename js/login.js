document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const teamInput = document.querySelector('input[name="teamName"]');
    const passcodeInput = document.querySelector('input[name="passcode"]');

    if (!form || !teamInput || !passcodeInput) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const teamName = teamInput.value.trim();
        const passcode = passcodeInput.value.trim();

        if (!teamName || !passcode) {
            return;
        }

        try {
            const response = await fetch(`${window.CHAOSPHERE_API}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ teamName, passcode })
            });

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            localStorage.setItem('chaosphere-team', data.teamName);
            localStorage.setItem('chaosphere-balance', String(data.balance));
            window.location.href = 'dashboard.html';
        } catch (error) {
            // Keep silent for now to match UI style.
        }
    });
});
