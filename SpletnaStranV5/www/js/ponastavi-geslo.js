document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const tokenInput = document.getElementById('resetTokenInput');
    const messageDiv = document.getElementById('message');

    // Preberi žeton iz URL-ja in ga vstavi v skrito polje
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        tokenInput.value = token;
    } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">Povezava za ponastavitev ni veljavna ali je potekla.</div>`;
        form.style.display = 'none';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword !== confirmPassword) {
            messageDiv.innerHTML = `<div class="alert alert-warning">Gesli se ne ujemata.</div>`;
            return;
        }

        // Validacija gesla (enaka kot pri registraciji)
        const gesloRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!gesloRegex.test(newPassword)) {
            messageDiv.innerHTML = `<div class="alert alert-warning">Geslo mora vsebovati vsaj 6 znakov, eno veliko črko in eno številko.</div>`;
            return;
        }

        messageDiv.innerHTML = `<div class="alert alert-info">Shranjujem novo geslo...</div>`;

        try {
            const response = await fetch('/api/ponastavi-geslo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: tokenInput.value,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                setTimeout(() => {
                    window.location.href = 'prijava.html';
                }, 3000);
            } else {
                messageDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        } catch (error) {
            console.error('Napaka:', error);
            messageDiv.innerHTML = `<div class="alert alert-danger">Prišlo je do napake. Poskusite znova kasneje.</div>`;
        }
    });
});