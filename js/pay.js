document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('pay-input');
    const payButton = document.getElementById('pay-now');
    const amountGroup = document.querySelector('.pay-amount');

    if (!input || !payButton) {
        return;
    }

    function syncButton() {
        const hasValue = input.value.trim().length > 0;
        payButton.hidden = !hasValue;
    }

    function syncSymbol() {
        if (!amountGroup) {
            return;
        }
        const length = Math.max(input.value.length, 0);
        amountGroup.style.setProperty('--pay-digits', String(length));
    }

    /*
    function syncInputWidth() {
        const length = Math.max(input.value.length, 1);
        input.style.width = `${length}ch`;
    }
    */

    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 4);
        syncButton();
        syncSymbol();
        /* syncInputWidth(); */
    });

    input.addEventListener('keydown', (event) => {
        if (event.ctrlKey || event.metaKey || event.key.length > 1) {
            return;
        }
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
    });

    payButton.addEventListener('click', async () => {
        const isOnline = await window.checkGatewayStatus();
        if (!isOnline) return;

        const amount = input.value.trim();
        if (!amount) {
            return;
        }
        localStorage.setItem('chaosphere-amount', amount);
        // if (window.CHAOSPHERE_STATE) {
        //     window.CHAOSPHERE_STATE.amount = amount;
        // }
        window.location.href = 'confirm.html';
    });

    syncButton();
    syncSymbol();
    /* syncInputWidth(); */

    setTimeout(() => {
        input.focus();
    }, 200);
});
