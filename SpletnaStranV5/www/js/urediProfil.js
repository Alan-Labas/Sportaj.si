document.addEventListener('DOMContentLoaded', async () => {
    const profilePictureForm = document.getElementById('profilePictureForm');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const profilePictureInput = document.getElementById('profilePictureInput');

    const userInfoForm = document.getElementById('userInfoForm');
    const usernameInput = document.getElementById('usernameInput'); // Pravilen ID
    const emailInputProfile = document.getElementById('emailInputProfile'); // Pravilen ID

    const trainerSpecificFieldsDiv = document.getElementById('trainerSpecificFields');
    const trainerImeInput = document.getElementById('trainerImeInput');
    const trainerPriimekInput = document.getElementById('trainerPriimekInput');
    const trainerKontaktEmailInput = document.getElementById('trainerKontaktEmailInput');
    const trainerTelefonInput = document.getElementById('trainerTelefonInput');
    const trainerUrnikTextarea = document.getElementById('trainerUrnikTextarea');
    const trainerOpisProfilaTextarea = document.getElementById('trainerOpisProfilaTextarea');
    const trainerLokacijaInput = document.getElementById('trainerLokacijaInput'); // Predpostavka, da ste dodali ta ID v HTML

    const passwordChangeForm = document.getElementById('passwordChangeForm');
    const currentPasswordInput = document.getElementById('currentPasswordInput');
    const newPasswordInput = document.getElementById('newPasswordInput');
    const confirmNewPasswordInput = document.getElementById('confirmNewPasswordInput');

    const defaultProfilePicPath = '../slike/default-profile.png'; // Zagotovite, da ta slika obstaja

    // Globalna funkcija fetchZAvtentikacijo, če jo uporabljate v PrijavaInRegistracija.js
    // Drugače jo definirajte tukaj ali uporabite standardni fetch z ročnim dodajanjem headerja
    async function fetchZAvtentikacijo(url, options = {}) {
        const token = sessionStorage.getItem('accessToken');
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
        // Če je telo FormData, Content-Type postavi brskalnik sam
        if (!(options.body instanceof FormData) && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }

        let response = await fetch(url, options);

        if (response.status === 401 || response.status === 403) {
            // Poskus osvežitve žetona, če je na voljo osvežilni žeton
            const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
            if (refreshToken && url !== '/api/token/refresh') { // Prepreči zanko pri osveževanju
                console.log('Poskus osvežitve dostopnega žetona...');
                try {
                    const refreshResponse = await fetch('/api/token/refresh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ osvezilniToken: refreshToken })
                    });
                    const refreshData = await refreshResponse.json();
                    if (refreshResponse.ok && refreshData.accessToken) {
                        sessionStorage.setItem('accessToken', refreshData.accessToken);
                        if (refreshData.osvezilniToken) { // Če strežnik vrne nov osvežilni žeton
                            if(localStorage.getItem('refreshToken')) localStorage.setItem('refreshToken', refreshData.osvezilniToken);
                            else if(sessionStorage.getItem('refreshToken')) sessionStorage.setItem('refreshToken', refreshData.osvezilniToken);
                        }
                        sessionStorage.setItem('uporabnikInfo', JSON.stringify(refreshData.uporabnik));

                        // Ponovi prvotni zahtevek z novim žetonom
                        options.headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
                        response = await fetch(url, options);
                    } else {
                        console.error('Osvežitev žetona ni uspela:', refreshData.message);
                        // Odjava uporabnika, če osvežitev ne uspe
                        sessionStorage.removeItem('accessToken');
                        sessionStorage.removeItem('uporabnikInfo');
                        localStorage.removeItem('refreshToken');
                        sessionStorage.removeItem('refreshToken');
                        window.location.href = 'prijava.html?sessionExpired=true';
                        return response; // Vrni originalni neuspešen odgovor
                    }
                } catch (e) {
                    console.error('Napaka pri osveževanju žetona:', e);
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('uporabnikInfo');
                    localStorage.removeItem('refreshToken');
                    sessionStorage.removeItem('refreshToken');
                    window.location.href = 'prijava.html?sessionExpired=true';
                    return response; // Vrni originalni neuspešen odgovor
                }
            } else if (url !== '/api/token/refresh') { // Če ni osvežilnega žetona, preusmeri na prijavo
                console.log('Dostopni žeton je potekel ali ni veljaven. Osvežilni žeton ni na voljo. Preusmerjam na prijavo.');
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('uporabnikInfo');
                window.location.href = 'prijava.html?sessionExpired=true';
                return response;
            }
        }
        return response;
    }


    async function loadProfileData() {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            console.warn("Uporabnik ni prijavljen, preusmerjam na prijavo.");
            window.location.href = 'prijava.html';
            if (profileImagePreview) profileImagePreview.src = defaultProfilePicPath;
            return;
        }

        try {
            const response = await fetchZAvtentikacijo('/api/profil'); // Uporabi fetchZAvtentikacijo

            if (response.ok) {
                const data = await response.json();

                if (usernameInput) usernameInput.value = data.username || '';
                if (emailInputProfile) emailInputProfile.value = data.email || '';
                if (profileImagePreview) profileImagePreview.src = data.slika_base64 || defaultProfilePicPath;

                if (data.jeTrener) {
                    if (trainerSpecificFieldsDiv) trainerSpecificFieldsDiv.classList.remove('d-none');
                    if (trainerImeInput) trainerImeInput.value = data.trenerIme || '';
                    if (trainerPriimekInput) trainerPriimekInput.value = data.trenerPriimek || '';
                    if (trainerKontaktEmailInput) trainerKontaktEmailInput.value = data.trenerKontaktEmail || '';
                    if (trainerTelefonInput) trainerTelefonInput.value = data.trenerTelefon || '';
                    if (trainerUrnikTextarea) trainerUrnikTextarea.value = data.trenerUrnik || '';
                    if (trainerOpisProfilaTextarea) trainerOpisProfilaTextarea.value = data.trenerOpisProfila || '';
                    if (trainerLokacijaInput) trainerLokacijaInput.value = data.trenerLokacija || '';
                } else {
                    if (trainerSpecificFieldsDiv) trainerSpecificFieldsDiv.classList.add('d-none');
                }
            } else {
                console.error('Napaka pri nalaganju profila:', response.status, await response.text());
                if (profileImagePreview) profileImagePreview.src = defaultProfilePicPath;
                // Če je žeton neveljaven in fetchZAvtentikacijo ni preusmeril, lahko preusmerimo tukaj
                if ((response.status === 401 || response.status === 403) && window.location.pathname.includes('uredi-profil.html')) {
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('uporabnikInfo');
                    localStorage.removeItem('refreshToken');
                    sessionStorage.removeItem('refreshToken');
                    // window.location.href = 'prijava.html?sessionExpired=true';
                }
            }
        } catch (error) {
            console.error('Napaka pri komunikaciji s strežnikom (loadProfileData):', error);
            if (profileImagePreview) profileImagePreview.src = defaultProfilePicPath;
        }
    }

    // Preverjanje prijave pred nalaganjem podatkov
    if (!sessionStorage.getItem('accessToken') && !localStorage.getItem('refreshToken')) {
        alert('Za dostop do te strani morate biti prijavljeni.');
        window.location.href = 'prijava.html'; // Preusmeri na prijavo
        return; // Ustavi izvajanje skripte, če ni prijavljen
    }


    profilePictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (profileImagePreview) profileImagePreview.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    if (profilePictureForm) {
        profilePictureForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData();
            if (profilePictureInput && profilePictureInput.files.length > 0) {
                formData.append('profilePicture', profilePictureInput.files[0]);

                const response = await fetchZAvtentikacijo('/api/profil/slika', {
                    method: 'POST',
                    body: formData // Content-Type se samodejno nastavi za FormData
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message || 'Profilna slika uspešno posodobljena!');
                    if (data.slika_base64) { // Strežnik vrne base64 nove slike
                        if (profileImagePreview) profileImagePreview.src = data.slika_base64; // Uporabi base64
                        // Posodobi tudi v sessionStorage in navigaciji
                        const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
                        if (uporabnikInfoString) {
                            const uporabnikInfo = JSON.parse(uporabnikInfoString);
                            uporabnikInfo.slika_base64 = data.slika_base64;
                            sessionStorage.setItem('uporabnikInfo', JSON.stringify(uporabnikInfo));
                            // Osveži navigacijsko sliko, če obstaja funkcija preveriPrijavo
                            if (typeof preveriPrijavo === "function") await preveriPrijavo();
                        }
                    }
                } else {
                    alert(`Napaka: ${data.message || 'Slike ni bilo mogoče naložiti.'}`);
                }
            } else {
                alert('Prosimo, izberite sliko za nalaganje.');
            }
        });
    }


    if (userInfoForm) {
        userInfoForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const uporabnikData = {
                username: usernameInput ? usernameInput.value.trim() : '',
                email: emailInputProfile ? emailInputProfile.value.trim() : ''
            };

            const uporabnikSessionInfo = JSON.parse(sessionStorage.getItem('uporabnikInfo') || '{}');
            let trainerDataPayload = {};

            if (uporabnikSessionInfo && uporabnikSessionInfo.jeTrener) {
                trainerDataPayload = {
                    trainerIme: trainerImeInput ? trainerImeInput.value.trim() : undefined,
                    trainerPriimek: trainerPriimekInput ? trainerPriimekInput.value.trim() : undefined,
                    trainerKontaktEmail: trainerKontaktEmailInput ? trainerKontaktEmailInput.value.trim() : undefined,
                    trainerTelefon: trainerTelefonInput ? trainerTelefonInput.value.trim() : undefined,
                    trainerUrnik: trainerUrnikTextarea ? trainerUrnikTextarea.value.trim() : undefined,
                    trainerOpisProfila: trainerOpisProfilaTextarea ? trainerOpisProfilaTextarea.value.trim() : undefined,
                    trainerLokacija: trainerLokacijaInput ? trainerLokacijaInput.value.trim() : undefined
                };
            }

            const payload = {...uporabnikData, ...trainerDataPayload};

            const response = await fetchZAvtentikacijo('/api/profil/info', {
                method: 'PUT',
                body: JSON.stringify(payload) // fetchZAvtentikacijo bo dodal Content-Type: application/json
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message || 'Podatki uspešno posodobljeni!');
                if (data.accessToken && data.uporabnik) {
                    sessionStorage.setItem('accessToken', data.accessToken);
                    sessionStorage.setItem('uporabnikInfo', JSON.stringify(data.uporabnik));

                    // Ponovno naloži podatke in osveži prikaz v navigaciji
                    await loadProfileData();
                    if (typeof preveriPrijavo === "function") await preveriPrijavo();
                }
            } else {
                alert(`Napaka: ${data.message || 'Podatkov ni bilo mogoče posodobiti.'}`);
            }
        });
    }

    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
            const newPassword = newPasswordInput ? newPasswordInput.value : '';
            const confirmNewPassword = confirmNewPasswordInput ? confirmNewPasswordInput.value : '';

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
                body: JSON.stringify({currentPassword, newPassword}) // fetchZAvtentikacijo bo dodal Content-Type
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message || 'Geslo uspešno spremenjeno!');
                passwordChangeForm.reset();
            } else {
                alert(`Napaka: ${data.message || 'Gesla ni bilo mogoče spremeniti.'}`);
            }
        });
    }

    // Začetno nalaganje podatkov ob odprtju strani
    await loadProfileData();
});