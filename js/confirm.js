document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('pin-input');
    const display = document.getElementById('pin-display');
    const dots = Array.from(document.querySelectorAll('.pin-dot'));
    const confirmButton = document.getElementById('confirm-button');
    const status = document.getElementById('confirm-status');
    const returnButton = document.getElementById('return-button');

    if (!input || !display || dots.length === 0 || !confirmButton || !status || !returnButton) {
        return;
    }

    /* const correctPin = '1234'; */

    function syncDots() {
        const value = input.value;
        dots.forEach((dot, index) => {
            if (index < value.length) {
                dot.classList.add('is-filled');
            } else {
                dot.classList.remove('is-filled');
            }
        });
    }

    function setStatus(message, isSuccess) {
        status.textContent = message;
        status.classList.toggle('is-success', Boolean(isSuccess));
        status.classList.toggle('is-error', !isSuccess);
    }

    async function handleConfirm() {
        if (input.value.length < 4) {
            setStatus('Pin isnt correct. Try again.', false);
            return;
        }

        const teamName = localStorage.getItem('chaosphere-team');
        const amount = localStorage.getItem('chaosphere-amount');

        if (!teamName || !amount) {
            setStatus('Pin isnt correct. Try again.', false);
            return;
        }

        try {
            const response = await fetch(`${window.CHAOSPHERE_API}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({
                    teamName,
                    pin: input.value,
                    amount
                })
            });

            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    setStatus(errorData.error || 'Pin isnt correct. Try again.', false);
                } catch (e) {
                    setStatus('Pin isnt correct. Try again.', false);
                }
                return;
            }

            const data = await response.json();
            localStorage.setItem('chaosphere-balance', String(data.balance));
            setStatus('Payment Done', true);
            returnButton.hidden = false;
        } catch (error) {
            setStatus('Pin isnt correct. Try again.', false);
        }
    }

    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 4);
        syncDots();
    });

    input.addEventListener('keydown', (event) => {
        if (event.ctrlKey || event.metaKey || event.key.length > 1) {
            return;
        }
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
    });

    display.addEventListener('click', () => {
        input.focus();
    });

    confirmButton.addEventListener('click', handleConfirm);

    returnButton.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    setTimeout(() => {
        input.focus();
    }, 200);

    syncDots();
    setStatus('', false);
});
