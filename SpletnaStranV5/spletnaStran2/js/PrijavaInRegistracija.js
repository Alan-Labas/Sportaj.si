// PrijavaInRegistracija.js

const API_URL = 'http://localhost:3000/api';
let neaktivonstTimer;

async function osveziDostopniZeton(shraniUporabnika = false) {
    const osvezilniToken = localStorage.getItem('refreshToken');
    if (!osvezilniToken) {
        console.log('Ni osvežilnega žetona za osvežitev.');
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/token/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ osvezilniToken: osvezilniToken })
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('accessToken', data.accessToken);
            if (data.osvezilniToken) {
                localStorage.setItem('refreshToken', data.osvezilniToken);
            }

            if (shraniUporabnika && data.uporabnik) {
                const uporabnikInfo = {
                    userId: data.uporabnik.userId,
                    username: data.uporabnik.username,
                    email: data.uporabnik.email || '',
                    slika_profila_url: data.uporabnik.slika_profila_url || null
                };
                sessionStorage.setItem('uporabnikInfo', JSON.stringify(uporabnikInfo));
                console.log('Uporabniški podatki osveženi in shranjeni ob osvežitvi žetona.');
            }
            console.log('Dostopni žeton uspešno osvežen.');
            return data.accessToken;
        } else {
            console.error('Napaka pri osveževanju žetona:', response.status);
            await odjava(true, null); // Odjavi uporabnika, če osvežitev ne uspe
            return null;
        }
    } catch (error) {
        console.error('Napaka pri klicu za osvežitev žetona:', error);
        await odjava(true, null); // Odjavi tudi ob mrežni napaki
        return null;
    }
}

async function fetchZAvtentikacijo(url, options = {}) {
    let token = sessionStorage.getItem('accessToken');

    if (!token && localStorage.getItem('refreshToken')) {
        console.log('Ni accessTokena v seji, poskušam osvežiti pred zahtevo...');
        token = await osveziDostopniZeton(true); // Shrani uporabnika ob uspešni osvežitvi
    }

    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };
    }

    let response = await fetch(url, options);

    if ((response.status === 401 || response.status === 403) && localStorage.getItem('refreshToken')) {
        console.log('Dostopni žeton potekel ali neveljaven, poskušam osvežiti...');
        const novDostopniToken = await osveziDostopniZeton(true); // Shrani uporabnika
        if (novDostopniToken) {
            options.headers['Authorization'] = `Bearer ${novDostopniToken}`;
            response = await fetch(url, options); // Ponovi zahtevo z novim žetonom
        }
    }
    return response;
}

function showLoginModal() {
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        const registrationOverlay = document.getElementById('registrationOverlay');
        if (registrationOverlay) registrationOverlay.style.display = 'none';
        loginOverlay.style.display = 'flex';
    }
}

function showRegistrationModal() {
    const registrationOverlay = document.getElementById('registrationOverlay');
    if (registrationOverlay) {
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) loginOverlay.style.display = 'none';
        registrationOverlay.style.display = 'flex';
    }
}

function odjavaNeaktivnegaUporabnika() {
    console.log("Odjava zaradi neaktivnosti.");
    odjava(false, 'Seja je potekla ali pa ste bili odjavljeni zaradi neaktivnosti.');
}

function resetTimerNeaktivnosti() {
    clearTimeout(neaktivonstTimer);
    if (sessionStorage.getItem('accessToken')) {
        neaktivonstTimer = setTimeout(odjavaNeaktivnegaUporabnika, 30 * 60 * 1000); // 30 minut
    }
}

async function prijavaUporabnika() {
    // Določimo, kateri elementi za sporočila se uporabljajo glede na odprt overlay
    let emailInputId = 'emailInput';
    let passwordInputId = 'passwordInput';
    let rememberMeId = 'rememberMeCheckbox';
    let messageElementId = 'loginMessage'; // Privzeto za glavno prijavno okno

    // Preverimo, ali je modalno okno na uredi-profil.html morda aktivno
    // (To je poenostavljeno preverjanje; morda boste potrebovali bolj robusten način za določanje konteksta)
    const loginOverlayElement = document.getElementById('loginOverlay');
    if (loginOverlayElement && loginOverlayElement.querySelector('#emailInputModal')) { // Preverimo, če obstaja modalni email input
        // Predpostavimo, da gre za modal na uredi-profil, če obstaja emailInputModal
        // Vendar, ker smo ID-je poenotili, to preverjanje ni več tako direktno.
        // Najbolje je, da modalna prijava na uredi-profil.html uporablja ISTE ID-je
        // kot tista na index.html za vnosna polja.
        // Torej, 'emailInput', 'passwordInput', 'rememberMeCheckbox'.
        // Za sporočilo pa lahko uporabimo specifičen ID, če želimo ločeno stiliziranje ali pozicijo.
        // Za ta primer, če je #loginMessageModal prisoten, ga uporabimo.
        if (document.getElementById('loginMessageModal')) {
            messageElementId = 'loginMessageModal';
        }
    }


    const email = document.getElementById(emailInputId).value.trim();
    const geslo = document.getElementById(passwordInputId).value.trim();
    const rememberMeCheckbox = document.getElementById(rememberMeId);
    const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

    if (!email || !geslo) {
        prikaziObvestilo('Prosimo, vnesite e-poštni naslov in geslo!', messageElementId, 'text-danger');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/prijava`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, geslo, rememberMe })
        });
        const data = await response.json();

        if (response.ok) {
            prikaziObvestilo(data.message || 'Prijava uspešna!', messageElementId, 'text-success'); // Prikaži sporočilo

            setTimeout(async () => { // Počakaj 2 sekundi
                sessionStorage.setItem('accessToken', data.accessToken);
                if (data.uporabnik) {
                    const uporabnikInfo = {
                        userId: data.uporabnik.userId,
                        username: data.uporabnik.username,
                        email: data.uporabnik.email,
                        slika_profila_url: data.uporabnik.slika_profila_url
                    };
                    sessionStorage.setItem('uporabnikInfo', JSON.stringify(uporabnikInfo));
                }

                if (rememberMe && data.osvezilniToken) {
                    localStorage.setItem('refreshToken', data.osvezilniToken);
                } else {
                    localStorage.removeItem('refreshToken');
                }

                // Skrij prijavno okno šele po prikazu sporočila in zakasnitvi
                const loginOverlay = document.getElementById('loginOverlay');
                if (loginOverlay) {
                    loginOverlay.style.display = 'none';
                }
                // Počisti sporočilo, da ni vidno ob naslednjem odpiranju
                const msgEl = document.getElementById(messageElementId);
                if (msgEl) msgEl.innerHTML = '';


                await preveriPrijavo();
                resetTimerNeaktivnosti();
            }, 2000); // 2000 ms = 2 sekundi

        } else {
            prikaziObvestilo(`Napaka pri prijavi: ${data.message || 'Neznana napaka.'}`, messageElementId, 'text-danger');
        }
    } catch (error) {
        console.error('Napaka pri prijavi:', error);
        prikaziObvestilo('Prišlo je do napake pri komunikaciji s strežnikom.', messageElementId, 'text-danger');
    }
}

// Nova pomožna funkcija za prikaz sporočil
function prikaziObvestilo(sporocilo, elementId, sporociloClass = 'text-info') {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.innerHTML = `<span class="${sporociloClass}">${sporocilo}</span>`;
        // Če želite, da sporočilo o napaki tudi izgine po določenem času:
        if (sporociloClass === 'text-danger' || sporociloClass === 'text-warning') {
            setTimeout(() => {
                messageElement.innerHTML = '';
            }, 5000); // Sporočila o napakah naj bodo vidna dlje, npr. 5 sekund
        }
    } else {
        // Fallback na alert, če element za sporočilo ni najden
        alert(sporocilo);
    }
}

async function registracijaUporabnika() {
    // Določimo ID elementa za sporočila glede na kontekst
    let messageElementId = 'registrationMessage'; // Privzeto za glavno registracijsko okno
    const registrationOverlayElement = document.getElementById('registrationOverlay');

    // Preverimo, ali gre za modalno okno na uredi-profil.html
    // Najbolje je, da modalna registracija na uredi-profil.html uporablja ISTE ID-je za vnosna polja.
    // Za sporočilo pa lahko uporabimo specifičen ID, če želimo ločeno stiliziranje ali pozicijo.
    if (registrationOverlayElement && registrationOverlayElement.querySelector('#registrationFormInModal')) {
        if (document.getElementById('registrationMessageModal')) {
            messageElementId = 'registrationMessageModal';
        }
    }

    const ime = document.getElementById('ime_reg_input').value.trim();
    const priimek = document.getElementById('priimek_reg_input').value.trim();
    const email = document.getElementById('email_reg_input').value.trim();
    const geslo = document.getElementById('geslo_reg_input').value.trim();
    const potrdiGeslo = document.getElementById('potrdiGeslo_reg_input').value.trim();

    if (!ime || !priimek || !email || !geslo || !potrdiGeslo) {
        prikaziObvestilo('Prosim, izpolnite vsa obvezna polja!', messageElementId, 'text-danger');
        return;
    }
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        prikaziObvestilo('Vnesli ste nepravilen e-mail!', messageElementId, 'text-danger');
        return;
    }
    const gesloRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!gesloRegex.test(geslo)) {
        prikaziObvestilo('Geslo mora vsebovati vsaj 6 znakov, eno veliko črko in eno številko!', messageElementId, 'text-danger long-message'); // Dodan razred za daljša sporočila, če je potrebno
        return;
    }
    if (geslo !== potrdiGeslo) {
        prikaziObvestilo('Gesli se ne ujemata!', messageElementId, 'text-danger');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/registracija`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ime, priimek, email, geslo })
        });
        const data = await response.json();

        if (response.ok) {
            prikaziObvestilo(data.message || 'Registracija uspešna! Lahko se prijavite.', messageElementId, 'text-success');

            // Počakamo, da uporabnik vidi sporočilo, nato preusmerimo/skrijemo modal
            setTimeout(() => {
                const regOverlay = document.getElementById('registrationOverlay');
                if (regOverlay) regOverlay.style.display = 'none';

                // Počisti sporočilo, da ni vidno ob naslednjem odpiranju
                const msgEl = document.getElementById(messageElementId);
                if (msgEl) msgEl.innerHTML = '';

                showLoginModal(); // Po uspešni registraciji odpri modal za prijavo
            }, 2500); // Npr. 2.5 sekunde za sporočilo o uspešni registraciji

        } else {
            let errorMessage = data.message || 'Registracija neuspešna.';
            // Dodatna sporočila glede na status, če jih strežnik pošilja
            if (response.status === 400) {
                errorMessage = data.message || 'Zahteva je bila nepravilna. Preverite vnesene podatke.';
            } else if (response.status === 409) {
                errorMessage = data.message || 'Uporabnik s tem e-poštnim naslovom že obstaja.';
            }
            prikaziObvestilo(`Napaka pri registraciji: ${errorMessage}`, messageElementId, 'text-danger');
        }
    } catch (error) {
        console.error('Napaka pri registraciji:', error);
        prikaziObvestilo('Prišlo je do napake pri komunikaciji s strežnikom.', messageElementId, 'text-danger');
    }
}


async function preveriPrijavo() {
    const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
    const navRight = document.getElementById('navRight');
    const loginSignUpButtons = document.getElementById('loginSignUpButtons');
    const pozdravElement = document.getElementById('pozdrav');
    const odjavaKontejner = document.getElementById('oddjava');

    if (uporabnikInfoString && sessionStorage.getItem('accessToken')) {
        const uporabnik = JSON.parse(uporabnikInfoString);

        if (navRight) {
            navRight.classList.remove('d-none');
            navRight.classList.add('d-flex'); // Uporabi d-flex za pravilen prikaz
        }
        if (loginSignUpButtons) {
            loginSignUpButtons.classList.add('d-none');
            loginSignUpButtons.classList.remove('d-flex');
        }

        if (pozdravElement) {
            pozdravElement.textContent = `Pozdravljeni, ${uporabnik.username}!`;
        }
        if (odjavaKontejner) {
            odjavaKontejner.innerHTML = '<a href="#" id="logoutLink" class="btn btn-warning btn-sm">Odjava</a>';
            const logoutLink = document.getElementById('logoutLink');
            if (logoutLink) {
                logoutLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await odjava(false, 'Uspešno ste se odjavili!');
                });
            }
        }
        resetTimerNeaktivnosti();
    } else {
        if (navRight) {
            navRight.classList.add('d-none');
            navRight.classList.remove('d-flex');
        }
        if (loginSignUpButtons) {
            loginSignUpButtons.classList.remove('d-none');
            loginSignUpButtons.classList.add('d-flex'); // Pokaži gumbe za prijavo/reg
        }

        if (pozdravElement) pozdravElement.textContent = '';
        if (odjavaKontejner) odjavaKontejner.innerHTML = '';
        clearTimeout(neaktivonstTimer);
    }
}

async function odjava(forceStopTimers = false, sporocilo = null) {
    const osvezilniToken = localStorage.getItem('refreshToken');

    if (osvezilniToken) {
        try {
            await fetch(`${API_URL}/odjava`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ osvezilniToken })
            });
        } catch (error) {
            console.error('Napaka pri klicu /api/odjava:', error);
        }
    }

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('uporabnikInfo');
    localStorage.removeItem('refreshToken');

    // Uporabi prikaziObvestilo namesto alert
    if (sporocilo) {
        // Uporabimo ID globalnega elementa za sporočila
        prikaziObvestilo(sporocilo, 'globalAlertMessage', 'text-success');
        setTimeout(() => {
            const globalMsgEl = document.getElementById('globalAlertMessage');
            if (globalMsgEl) globalMsgEl.innerHTML = '';
        }, 3000); //
    }

    await preveriPrijavo(); // Posodobi UI, da odraža stanje odjave

    if (forceStopTimers || !sessionStorage.getItem('accessToken')) {
        clearTimeout(neaktivonstTimer);
    }

    if (!forceStopTimers && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.href = '/';
    }
}

async function inicializirajStanjePrijave() {
    const refreshToken = localStorage.getItem('refreshToken');
    let uspesnoOsvezeno = false;

    if (refreshToken && !sessionStorage.getItem('accessToken')) { // Poskusi osvežiti samo, če accessToken manjka
        console.log('Najden refreshToken, accessToken manjka, poskušam osvežiti sejo...');
        const novAccessToken = await osveziDostopniZeton(true); // true za shranjevanje uporabnika
        if (novAccessToken) {
            console.log('Seja uspešno obnovljena z refreshTokenom.');
            uspesnoOsvezeno = true;
        } else {
            console.log('Ni bilo mogoče obnoviti seje z refreshTokenom.');
            // osveziDostopniZeton bi moral že poklicati odjavo ob neuspehu
        }
    }
    await preveriPrijavo(); // Vedno preveri prijavo za posodobitev UI
}

document.addEventListener('DOMContentLoaded', async () => {
    await inicializirajStanjePrijave();

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

    ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimerNeaktivnosti, true);
    });
});