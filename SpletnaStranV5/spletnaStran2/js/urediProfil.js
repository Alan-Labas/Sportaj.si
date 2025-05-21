document.addEventListener('DOMContentLoaded', async () => {
    // Pridobi reference na obrazce in elemente za predogled
    const profilePictureForm = document.getElementById('profilePictureForm');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const userInfoForm = document.getElementById('userInfoForm');
    const usernameInput = document.getElementById('usernameInput');
    const emailInputProfile = document.getElementById('emailInputProfile');
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    const currentPasswordInput = document.getElementById('currentPasswordInput');
    const newPasswordInput = document.getElementById('newPasswordInput');
    const confirmNewPasswordInput = document.getElementById('confirmNewPasswordInput');

    // Funkcija za nalaganje podatkov o profilu (iz PrijavaInRegistracija.js)
    // Predpostavljamo, da fetchZAvtentikacijo že obstaja in deluje.
    // Če ne, jo morate kopirati ali uvoziti iz PrijavaInRegistracija.js

    async function loadProfileData() {
        const response = await fetchZAvtentikacijo('/api/profil'); // Predpostavljamo, da imate fetchZAvtentikacijo
        if (response.ok) {
            const data = await response.json();
            usernameInput.value = data.username;
            emailInputProfile.value = data.email;
            if (data.slika_profila_url) {
                profileImagePreview.src = data.slika_profila_url;
            } else {
                profileImagePreview.src = '../slike/default-profile.png'; // Privzeta slika
            }
        } else {
            console.error('Napaka pri nalaganju podatkov profila:', response.status);
            alert('Napaka pri nalaganju podatkov profila. Poskusite osvežiti stran.');
            // Možna odjava ali preusmeritev, če žeton ni več veljaven
            if(response.status === 401 || response.status === 403) {
                //await odjava(true, 'Vaša seja je potekla, prijavite se ponovno.'); // Če želite avtomatsko odjavo
                //window.location.href = '/'; // Preusmeri na domačo stran
            }
        }
    }

    // Naloži podatke ob nalaganju strani
    if (sessionStorage.getItem('accessToken')) { // Preveri, če je uporabnik sploh prijavljen
        await loadProfileData();
    } else {
        // Če uporabnik ni prijavljen, ga lahko preusmerite ali prikažete sporočilo
        alert('Za dostop do te strani morate biti prijavljeni.');
        window.location.href = '/'; // Preusmeri na domačo stran
        return; // Ustavi izvajanje nadaljnje kode na tej strani
    }


    // Predogled slike ob izbiri
    profilePictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImagePreview.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // Pošiljanje obrazca za profilno sliko
    profilePictureForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData();
        if (profilePictureInput.files.length > 0) {
            formData.append('profilePicture', profilePictureInput.files[0]);

            const response = await fetchZAvtentikacijo('/api/profil/slika', {
                method: 'POST',
                body: formData // FormData sam nastavi Content-Type na multipart/form-data
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message || 'Profilna slika uspešno posodobljena!');
                if (data.slika_profila_url) {
                    profileImagePreview.src = data.slika_profila_url;
                    // Posodobi sliko v navigaciji, če obstaja tam (zahteva dodatno logiko)
                    const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
                    if (uporabnikInfoString) {
                        const uporabnikInfo = JSON.parse(uporabnikInfoString);
                        uporabnikInfo.slika_profila_url = data.slika_profila_url;
                        sessionStorage.setItem('uporabnikInfo', JSON.stringify(uporabnikInfo));
                        // Klic funkcije, ki osveži prikaz v navigaciji, če je potrebno
                        // updateNavUserProfileImage(data.slika_profila_url);
                    }
                }
            } else {
                alert(`Napaka: ${data.message || 'Slike ni bilo mogoče naložiti.'}`);
            }
        } else {
            alert('Prosimo, izberite sliko za nalaganje.');
        }
    });

    // Pošiljanje obrazca za osnovne podatke
    userInfoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = usernameInput.value.trim();
        const email = emailInputProfile.value.trim();

        const response = await fetchZAvtentikacijo('/api/profil/info', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message || 'Podatki uspešno posodobljeni!');
            // Posodobi shranjene podatke o uporabniku v sessionStorage, če je nov žeton
            if (data.accessToken && data.uporabnik) {
                sessionStorage.setItem('accessToken', data.accessToken);
                const uporabnikInfo = { // Zgradi nov objekt
                    userId: JSON.parse(sessionStorage.getItem('uporabnikInfo')).userId, // Ohrani userId
                    username: data.uporabnik.username,
                    email: data.uporabnik.email,
                    slika_profila_url: JSON.parse(sessionStorage.getItem('uporabnikInfo')).slika_profila_url // Ohrani sliko
                };
                sessionStorage.setItem('uporabnikInfo', JSON.stringify(uporabnikInfo));
                // Osveži pozdrav v navigaciji
                const pozdravElement = document.getElementById('pozdrav');
                if (pozdravElement) pozdravElement.textContent = `Pozdravljeni nazaj, ${data.uporabnik.username}!`;
            }
        } else {
            alert(`Napaka: ${data.message || 'Podatkov ni bilo mogoče posodobiti.'}`);
        }
    });

    // Pošiljanje obrazca za spremembo gesla
    passwordChangeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        if (newPassword !== confirmNewPassword) {
            alert('Novi gesli se ne ujemata!');
            return;
        }

        const gesloRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!gesloRegex.test(newPassword)) {
            alert('Novo geslo mora vsebovati vsaj 6 znakov, eno veliko črko in eno številko!');
            return;
        }

        const response = await fetchZAvtentikacijo('/api/profil/geslo', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message || 'Geslo uspešno spremenjeno!');
            passwordChangeForm.reset(); // Počisti obrazec
        } else {
            alert(`Napaka: ${data.message || 'Gesla ni bilo mogoče spremeniti.'}`);
        }
    });
});