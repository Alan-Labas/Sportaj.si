const API_URL = 'http://localhost:3000/api';

function showLoginModal() {
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        const registrationOverlay = document.getElementById('registrationOverlay');
        if (registrationOverlay) {
            registrationOverlay.style.display = 'none';
        }
        loginOverlay.style.display = 'flex';
    }
}

function showRegistrationModal() {
    const registrationOverlay = document.getElementById('registrationOverlay');
    if (registrationOverlay) {
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) {
            loginOverlay.style.display = 'none';
        }
        registrationOverlay.style.display = 'flex';
    }
}

async function prijavaUporabnika() {
    const email = document.getElementById('emailInput').value.trim();
    const geslo = document.getElementById('passwordInput').value.trim();

    if (!email) {
        alert('Prosimo, vnesite e-poštni naslov!');
        return;
    }

    if (!geslo) {
        alert('Prosimo, vnesite geslo!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/prijava`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, geslo: geslo })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('accessToken', data.token);
            alert(data.message || 'Prijava uspešna!');
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('navRight').classList.remove('d-none');
            document.getElementById('loginSignUpButtons').classList.add('d-none');
            window.location.href = 'index.html';
        } else {
            alert(`Napaka pri prijavi: ${data.message || 'Neznana napaka.'}`);
        }
    } catch (error) {
        alert('Prišlo je do napake pri komunikaciji s strežnikom. Poskusite znova kasneje.');
    }
}

async function registracijaUporabnika() {
    const ime = document.getElementById('ime_reg_input').value.trim();
    const priimek = document.getElementById('priimek_reg_input').value.trim();
    const email = document.getElementById('email_reg_input').value.trim();
    const geslo = document.getElementById('geslo_reg_input').value.trim();
    const potrdiGeslo = document.getElementById('potrdiGeslo_reg_input').value.trim();

    if (!ime || !priimek || !email || !geslo || !potrdiGeslo) {
        alert('Prosim, izpolnite vsa obvezna polja!');
        return;
    }
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        alert('Vnesli ste nepravilen e-mail!');
        return;
    }

    const gesloRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!gesloRegex.test(geslo)) {
        alert('Geslo mora vsebovati vsaj 6 znakov, eno veliko črko in eno številko!');
        return;
    }

    if (geslo !== potrdiGeslo) {
        alert('Gesli se ne ujemata!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/registracija`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ime, priimek, email, geslo })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || 'Registracija uspešna! Lahko se prijavite.');
            const registrationOverlay = document.getElementById('registrationOverlay');
            if (registrationOverlay) registrationOverlay.style.display = 'none';
            showLoginModal();
        } else {
            let errorMessage = data.message || 'Registracija neuspešna.';
            if (response.status === 400) {
                errorMessage = data.message || 'Zahteva je bila nepravilna. Preverite vnesene podatke.';
            } else if (response.status === 409) {
                errorMessage = data.message || 'Uporabnik s tem e-poštnim naslovom že obstaja.';
            }
            alert(`Napaka pri registraciji: ${errorMessage}`);
        }

    } catch (error) {
        alert('Prišlo je do napake pri komunikaciji s strežnikom. Poskusite znova kasneje.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const overlays = ['loginOverlay', 'registrationOverlay'];

    overlays.forEach(overlayId => {
        const overlayElement = document.getElementById(overlayId);
        if (overlayElement) {
            overlayElement.addEventListener('click', (e) => {
                if (e.target.id === overlayId) {
                    overlayElement.style.display = 'none';
                }
            });
        }
    });
});