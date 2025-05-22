document.addEventListener('DOMContentLoaded', async () => {
    const profilePictureForm = document.getElementById('profilePictureForm');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const profilePictureInput = document.getElementById('profilePictureInput');

    const userInfoForm = document.getElementById('userInfoForm');
    const usernameInput = document.getElementById('usernameInput');
    const emailInputProfile = document.getElementById('emailInputProfile');

    const trainerSpecificFieldsDiv = document.getElementById('trainerSpecificFields');
    const trainerImeInput = document.getElementById('trainerImeInput');
    const trainerPriimekInput = document.getElementById('trainerPriimekInput');
    const trainerKontaktEmailInput = document.getElementById('trainerKontaktEmailInput');
    const trainerTelefonInput = document.getElementById('trainerTelefonInput');
    const trainerUrnikTextarea = document.getElementById('trainerUrnikTextarea');
    const trainerOpisProfilaTextarea = document.getElementById('trainerOpisProfilaTextarea');

    const passwordChangeForm = document.getElementById('passwordChangeForm');
    const currentPasswordInput = document.getElementById('currentPasswordInput');
    const newPasswordInput = document.getElementById('newPasswordInput');
    const confirmNewPasswordInput = document.getElementById('confirmNewPasswordInput');

    const defaultProfilePicPath = '/slike/default-profile.png';

    async function loadProfileData() {
        const response = await fetchZAvtentikacijo('/api/profil');
        if (response.ok) {
            const data = await response.json();


            usernameInput.value = data.username || '';
            emailInputProfile.value = data.email || '';
            profileImagePreview.src = data.slika_base64 ? `data:image/png;base64,${data.slika_base64}` : defaultProfilePicPath;

            if (data.isTrainer && trainerSpecificFieldsDiv) {
                trainerSpecificFieldsDiv.classList.remove('d-none');
                if (trainerImeInput) trainerImeInput.value = data.trenerIme || '';
                if (trainerPriimekInput) trainerPriimekInput.value = data.trenerPriimek || '';
                if (trainerKontaktEmailInput) trainerKontaktEmailInput.value = data.trenerKontaktEmail || '';
                if (trainerTelefonInput) trainerTelefonInput.value = data.trenerTelefon || '';
                if (trainerUrnikTextarea) trainerUrnikTextarea.value = data.trenerUrnik || '';
                if (trainerOpisProfilaTextarea) trainerOpisProfilaTextarea.value = data.trenerOpisProfila || '';
            } else if (trainerSpecificFieldsDiv) {
                trainerSpecificFieldsDiv.classList.add('d-none');
            }
        } else {
            console.error('Napaka pri nalaganju podatkov profila:', response.status);
            const errorData = await response.json().catch(() => ({}));
            alert(`Napaka pri nalaganju podatkov profila: ${errorData.message || response.statusText}. Poskusite osvežiti stran.`);
            if (response.status === 401 || response.status === 403) {
                await odjava(true, 'Vaša seja je potekla, prijavite se ponovno.');
            }
        }
    }

    if (sessionStorage.getItem('accessToken') || localStorage.getItem('refreshToken')) {
        await loadProfileData();
    } else {
        alert('Za dostop do te strani morate biti prijavljeni.');
        window.location.href = '/';
        return;
    }

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

    profilePictureForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData();
        if (profilePictureInput.files.length > 0) {
            formData.append('profilePicture', profilePictureInput.files[0]);

            const response = await fetchZAvtentikacijo('/api/profil/slika', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message || 'Profilna slika uspešno posodobljena!');
                if (data.slika_base64) {
                    profileImagePreview.src = `data:image/png;base64,${data.slika_base64}`;
                    const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
                    if (uporabnikInfoString) {
                        const uporabnikInfo = JSON.parse(uporabnikInfoString);
                        uporabnikInfo.slika_base64 = data.slika_base64;
                        sessionStorage.setItem('uporabnikInfo', JSON.stringify(uporabnikInfo));
                    }
                }
            } else {
                alert(`Napaka: ${data.message || 'Slike ni bilo mogoče naložiti.'}`);
            }
        } else {
            alert('Prosimo, izberite sliko za nalaganje.');
        }
    });

    userInfoForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const uporabnikData = {
            username: usernameInput.value.trim(),
            email: emailInputProfile.value.trim()
        };

        const uporabnikSessionInfo = JSON.parse(sessionStorage.getItem('uporabnikInfo'));
        let trainerDataPayload = {};

        if (uporabnikSessionInfo && uporabnikSessionInfo.isTrainer) {
            trainerDataPayload = {
                trainerIme: trainerImeInput ? trainerImeInput.value.trim() : undefined,
                trainerPriimek: trainerPriimekInput ? trainerPriimekInput.value.trim() : undefined,
                trainerKontaktEmail: trainerKontaktEmailInput ? trainerKontaktEmailInput.value.trim() : undefined,
                trainerTelefon: trainerTelefonInput ? trainerTelefonInput.value.trim() : undefined,
                trainerUrnik: trainerUrnikTextarea ? trainerUrnikTextarea.value.trim() : undefined,
                trainerOpisProfila: trainerOpisProfilaTextarea ? trainerOpisProfilaTextarea.value.trim() : undefined
            };
        }

        const payload = {...uporabnikData, ...trainerDataPayload};

        const response = await fetchZAvtentikacijo('/api/profil/info', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message || 'Podatki uspešno posodobljeni!');
            if (data.accessToken && data.uporabnik) {
                sessionStorage.setItem('accessToken', data.accessToken);

                const newUporabnikInfo = {
                    userId: data.uporabnik.userId,
                    username: data.uporabnik.username,
                    email: data.uporabnik.email,
                    slika_base64: data.uporabnik.slika_base64 !== undefined ? data.uporabnik.slika_base64 : (uporabnikSessionInfo ? uporabnikSessionInfo.slika_base64 : null),
                    JeAdmin: data.uporabnik.JeAdmin,
                    isTrainer: data.uporabnik.isTrainer,
                    ...(data.uporabnik.isTrainer && {
                        trenerId: data.uporabnik.trenerId,
                        trenerIme: data.uporabnik.trenerIme,
                        trenerPriimek: data.uporabnik.trenerPriimek,
                        trenerKontaktEmail: data.uporabnik.trenerKontaktEmail,
                        trenerTelefon: data.uporabnik.trenerTelefon,
                        trenerUrnik: data.uporabnik.trenerUrnik,
                        trenerOpisProfila: data.uporabnik.trenerOpisProfila
                    })
                };
                sessionStorage.setItem('uporabnikInfo', JSON.stringify(newUporabnikInfo));

                await loadProfileData();
                if (typeof preveriPrijavo === "function") await preveriPrijavo();
            }
        } else {
            alert(`Napaka: ${data.message || 'Podatkov ni bilo mogoče posodobiti.'}`);
        }
    });

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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({currentPassword, newPassword})
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message || 'Geslo uspešno spremenjeno!');
            passwordChangeForm.reset();
        } else {
            alert(`Napaka: ${data.message || 'Gesla ni bilo mogoče spremeniti.'}`);
        }
    });
});