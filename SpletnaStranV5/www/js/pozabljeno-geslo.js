document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('emailInput');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        messageDiv.innerHTML = `<div class="alert alert-info">Obdelujem zahtevo...</div>`;

        try {
            const response = await fetch('/api/pozabljeno-geslo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            } else {
                // Tudi v primeru napake prikažemo podobno sporočilo, da ne razkrivamo, kateri emaili obstajajo
                messageDiv.innerHTML = `<div class="alert alert-success">Če je e-poštni naslov v naši bazi, smo vam poslali navodila za ponastavitev.</div>`;
            }
        } catch (error) {
            console.error('Napaka:', error);
            messageDiv.innerHTML = `<div class="alert alert-danger">Prišlo je do napake. Poskusite znova kasneje.</div>`;
        }
    });
});