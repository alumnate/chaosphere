document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('pin-input');
    const display = document.getElementById('pin-display');
    const dots = Array.from(document.querySelectorAll('.pin-dot'));
    const confirmButton = document.getElementById('confirm-button');
    const status = document.getElementById('confirm-status');
    const returnButton = document.getElementById('return-button');

    /* Overlay elements */
    const confirmContent = document.getElementById('confirm-content');
    const processingOverlay = document.getElementById('processing-overlay');
    const processingSteps = document.getElementById('processing-steps');
    const successOverlay = document.getElementById('success-overlay');
    const successTxnId = document.getElementById('success-txn-id');
    const successBalance = document.getElementById('success-balance');
    const successDashboardBtn = document.getElementById('success-dashboard-btn');
    const successBalanceBtn = document.getElementById('success-balance-btn');

    if (!input || !display || dots.length === 0 || !confirmButton || !status || !returnButton) {
        return;
    }

    /* ========== SUBMISSION LOCK ========== */
    let paymentInProgress = false;
    const ORIGINAL_BUTTON_TEXT = 'Confirm Payment';

    /* ========== PIN DOT SYNC ========== */
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

    /* ========== SCREEN TRANSITIONS ========== */

    function showProcessingState() {
        if (confirmContent) confirmContent.hidden = true;
        if (processingOverlay) processingOverlay.hidden = false;
        if (successOverlay) successOverlay.hidden = true;

        /* Cycle through step messages for a lively feel */
        const steps = [
            'Verifying transaction…',
            'Updating balances…',
            'Recording transaction…'
        ];
        let stepIndex = 0;
        window._processingInterval = setInterval(() => {
            stepIndex = (stepIndex + 1) % steps.length;
            if (processingSteps) processingSteps.textContent = steps[stepIndex];
        }, 1800);
    }

    function hideProcessingState() {
        if (window._processingInterval) {
            clearInterval(window._processingInterval);
            window._processingInterval = null;
        }
    }

    function showConfirmContent() {
        hideProcessingState();
        if (confirmContent) confirmContent.hidden = false;
        if (processingOverlay) processingOverlay.hidden = true;
        if (successOverlay) successOverlay.hidden = true;
    }

    function showSuccessState(data) {
        hideProcessingState();
        if (confirmContent) confirmContent.hidden = true;
        if (processingOverlay) processingOverlay.hidden = true;
        if (successOverlay) successOverlay.hidden = false;

        if (successTxnId) {
            successTxnId.textContent = 'Transaction ID: ' + (data.transactionId || '—');
        }
        if (successBalance) {
            const bal = data.balance != null ? data.balance : '—';
            successBalance.textContent = 'Updated Balance: ₳' + bal;
        }
    }

    /* ========== BUTTON STATE HELPERS ========== */

    function lockButton() {
        confirmButton.disabled = true;
        confirmButton.classList.add('is-processing');
        confirmButton.textContent = '⏳ Processing…';
    }

    function unlockButton() {
        confirmButton.disabled = false;
        confirmButton.classList.remove('is-processing');
        confirmButton.textContent = ORIGINAL_BUTTON_TEXT;
    }

    /* ========== MAIN CONFIRM HANDLER ========== */

    async function handleConfirm() {
        /* --- Guard: already in flight --- */
        if (paymentInProgress) return;

        const isOnline = await window.checkGatewayStatus();
        if (!isOnline) return;

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

        /* --- Lock everything --- */
        paymentInProgress = true;
        lockButton();
        setStatus('', false);

        /* Brief delay so user sees button change before overlay swap */
        await new Promise(r => setTimeout(r, 180));
        showProcessingState();

        try {
            const response = await fetch(`${window.CHAOSPHERE_API}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    teamName,
                    pin: input.value,
                    amount
                })
            });

            if (!response.ok) {
                let errorMsg = 'Pin isnt correct. Try again.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (_) { /* ignore parse errors */ }

                /* Return to PIN entry so the user can retry */
                showConfirmContent();
                setStatus(errorMsg, false);
                unlockButton();
                paymentInProgress = false;
                return;
            }

            const data = await response.json();
            localStorage.setItem('chaosphere-balance', String(data.balance));

            /* Show success screen — lock is intentionally NOT released */
            showSuccessState(data);

        } catch (error) {
            showConfirmContent();
            setStatus('Pin isnt correct. Try again.', false);
            unlockButton();
            paymentInProgress = false;
        }
    }

    /* ========== EVENT LISTENERS ========== */

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

    /* Success-screen navigation */
    if (successDashboardBtn) {
        successDashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
    if (successBalanceBtn) {
        successBalanceBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    setTimeout(() => {
        input.focus();
    }, 200);

    syncDots();
    setStatus('', false);
});
