const API_URL = 'http://localhost:3000/api';
let neaktivonstTimer;


async function osveziDostopniZeton(shraniUporabnika = false) {
    const osvezilniToken = localStorage.getItem('refreshToken');
    if (!osvezilniToken) {
        console.log('Ni osvežilnega žetona za osvežitev.');
        await odjava(true, 'Vaša seja je potekla. Prosimo, prijavite se ponovno.');
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/token/refresh`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({osvezilniToken: osvezilniToken})
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
                    email: data.uporabnik.email,
                    slika_base64: data.uporabnik.slika_base64,
                    JeAdmin: data.uporabnik.JeAdmin,
                    jeTrener: data.uporabnik.jeTrener, ...(data.uporabnik.jeTrener && {
                        trenerId: data.uporabnik.trenerId,
                        trenerIme: data.uporabnik.trenerIme,
                        trenerPriimek: data.uporabnik.trenerPriimek
                    })
                };
                sessionStorage.setItem('uporabnikInfo', JSON.stringify(uporabnikInfo));
                console.log('Uporabniški podatki (vključno z vlogo) osveženi ob osvežitvi žetona.');
            }
            console.log('Dostopni žeton uspešno osvežen.');
            resetTimerNeaktivnosti();
            return data.accessToken;
        } else {
            console.error('Napaka pri osveževanju žetona:', response.status);
            const errorData = await response.json().catch(() => ({}));
            console.error('Podrobnosti napake pri osveževanju:', errorData);
            await odjava(true, `Seja je potekla (${errorData.message || response.statusText}). Prosimo, prijavite se ponovno.`);
            return null;
        }
    } catch (error) {
        console.error('Napaka pri klicu za osvežitev žetona:', error);
        await odjava(true, 'Napaka pri komunikaciji s strežnikom. Prosimo, prijavite se ponovno.');
        return null;
    }
}


async function fetchZAvtentikacijo(url, options = {}) {
    let token = sessionStorage.getItem('accessToken');

    if (!token && localStorage.getItem('refreshToken')) {
        console.log('Ni accessTokena v seji, poskušam osvežiti pred zahtevo...');
        token = await osveziDostopniZeton(true);
        if (!token) {
            return new Response(JSON.stringify({message: "Seja je potekla, prijavite se ponovno."}), {
                status: 401, headers: {'Content-Type': 'application/json'}
            });
        }
    }


    if (token) {
        options.headers = {
            ...options.headers, 'Authorization': `Bearer ${token}`,
        };
    } else if (!url.includes('/prijava') && !url.includes('/registracija') && !url.includes('/token/refresh')) {
    }


    let response = await fetch(url, options);

    if ((response.status === 401 || response.status === 403) && localStorage.getItem('refreshToken')) {
        if (!url.includes('/token/refresh')) {
            console.log(`Odgovor ${response.status} na ${url}, dostopni žeton potekel ali neveljaven, poskušam osvežiti...`);
            const novDostopniToken = await osveziDostopniZeton(true);
            if (novDostopniToken) {
                options.headers['Authorization'] = `Bearer ${novDostopniToken}`;
                console.log('Ponovno pošiljam zahtevo z novim dostopnim žetonom.');
                response = await fetch(url, options);
            } else {
                console.log('Osvežitev žetona ni uspela, vračam originalni neuspešen odgovor.');
            }
        }
    }
    return response;
}


function showLoginModal() {
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        const registrationOverlay = document.getElementById('registrationOverlay');
        if (registrationOverlay) registrationOverlay.style.display = 'none';

        const emailInput = loginOverlay.querySelector('#emailInput');
        const passwordInput = loginOverlay.querySelector('#passwordInput');
        const messageElement = loginOverlay.querySelector('#loginMessage') || loginOverlay.querySelector('#loginMessageModal');

        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (messageElement) messageElement.innerHTML = '';

        loginOverlay.style.display = 'flex';
    }
}

function showRegistrationModal() {
    const registrationOverlay = document.getElementById('registrationOverlay');
    if (registrationOverlay) {
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) loginOverlay.style.display = 'none';

        const inputs = registrationOverlay.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        inputs.forEach(input => input.value = '');
        const messageElement = registrationOverlay.querySelector('#registrationMessage') || registrationOverlay.querySelector('#registrationMessageModal');
        if (messageElement) messageElement.innerHTML = '';

        registrationOverlay.style.display = 'flex';
    }
}


function odjavaNeaktivnegaUporabnika() {
    console.log("Odjava zaradi neaktivnosti.");
    odjava(false, 'Seja je potekla zaradi neaktivnosti. Prosimo, prijavite se ponovno.');
}

function resetTimerNeaktivnosti() {
    clearTimeout(neaktivonstTimer);
    if (sessionStorage.getItem('accessToken')) {
        neaktivonstTimer = setTimeout(odjavaNeaktivnegaUporabnika, 30 * 60 * 1000);
    }
}


async function prijavaUporabnika() {
    const loginOverlay = document.getElementById('loginOverlay');
    let emailInputId = 'emailInput';
    let passwordInputId = 'passwordInput';
    let rememberMeId = 'rememberMeCheckbox';
    let messageElementId = 'loginMessage';

    if (loginOverlay && loginOverlay.style.display === 'flex') {
        if (document.getElementById('emailInputModalLogin')) emailInputId = 'emailInputModalLogin';
        if (document.getElementById('passwordInputModalLogin')) passwordInputId = 'passwordInputModalLogin';
        if (document.getElementById('rememberMeCheckboxModalLogin')) rememberMeId = 'rememberMeCheckboxModalLogin';
        if (document.getElementById('loginMessageModal')) messageElementId = 'loginMessageModal';
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
        console.log(API_URL)
        const response = await fetch(`${API_URL}/prijava`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, geslo, rememberMe})
        });
        const data = await response.json();
        console.log(data)

        if (response.ok) {
            prikaziObvestilo(data.message || 'Prijava uspešna!', messageElementId, 'text-success');

            setTimeout(async () => {
                sessionStorage.setItem('accessToken', data.accessToken);
                if (data.uporabnik) {
                    const uporabnikInfo = {
                        userId: data.uporabnik.userId,
                        username: data.uporabnik.username,
                        email: data.uporabnik.email,
                        slika_base64: data.uporabnik.slika_base64,
                        JeAdmin: data.uporabnik.JeAdmin,
                        jeTrener: data.uporabnik.jeTrener, ...(data.uporabnik.jeTrener && {
                            trenerId: data.uporabnik.trenerId,
                            trenerIme: data.uporabnik.trenerIme,
                            trenerPriimek: data.uporabnik.trenerPriimek
                        })
                    };
                    sessionStorage.setItem('uporabnikInfo', JSON.stringify(uporabnikInfo));
                }

                if (rememberMe && data.osvezilniToken) {
                    localStorage.setItem('refreshToken', data.osvezilniToken);
                } else {
                    localStorage.removeItem('refreshToken');
                }

                const currentLoginOverlay = document.getElementById('loginOverlay');
                if (currentLoginOverlay && currentLoginOverlay.style.display === 'flex') {
                    currentLoginOverlay.style.display = 'none';
                }
                const msgEl = document.getElementById(messageElementId);
                if (msgEl) msgEl.innerHTML = '';

                await preveriPrijavo();
                resetTimerNeaktivnosti();

                if (window.location.pathname !== '/' && !window.location.pathname.includes('search-stran.html') && !window.location.pathname.includes('uredi-profil.html') && !window.location.pathname.includes('profilTrener.html')) {

                }

            window.location.href = '/html/index.html';
            }, 1500);

        } else {
            prikaziObvestilo(`Napaka pri prijavi: ${data.message || 'Neznana napaka.'}`, messageElementId, 'text-danger');
        }
    } catch (error) {
        console.error('Napaka pri prijavi:', error);
        prikaziObvestilo('Prišlo je do napake pri komunikaciji s strežnikom.', messageElementId, 'text-danger');
    }
}


function prikaziObvestilo(sporocilo, elementId, sporociloClass = 'text-info', timeout = 3000) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        const extraClass = sporocilo.length > 70 ? 'long-message' : '';
        messageElement.innerHTML = `<span class="${sporociloClass} ${extraClass}">${sporocilo}</span>`;
        if (timeout) {
            setTimeout(() => {
                if (messageElement.innerHTML.includes(sporocilo)) {
                    messageElement.innerHTML = '';
                }
            }, timeout);
        }
    } else {
        console.warn(`Element za sporočila z ID '${elementId}' ni bil najden. Alert: ${sporocilo}`);
    }
}

async function registracijaUporabnika() {
    const registrationOverlay = document.getElementById('registrationOverlay');
    let imeInputId = 'ime_reg_input';
    let priimekInputId = 'priimek_reg_input';
    let emailInputId = 'email_reg_input';
    let gesloInputId = 'geslo_reg_input';
    let potrdiGesloInputId = 'potrdiGeslo_reg_input';
    let messageElementId = 'registrationMessage';

    if (registrationOverlay && registrationOverlay.style.display === 'flex') {
        if (document.getElementById('ime_reg_input_modal')) imeInputId = 'ime_reg_input_modal';
        if (document.getElementById('priimek_reg_input_modal')) priimekInputId = 'priimek_reg_input_modal';
        if (document.getElementById('email_reg_input_modal')) emailInputId = 'email_reg_input_modal';
        if (document.getElementById('geslo_reg_input_modal')) gesloInputId = 'geslo_reg_input_modal';
        if (document.getElementById('potrdiGeslo_reg_input_modal')) potrdiGesloInputId = 'potrdiGeslo_reg_input_modal';
        if (document.getElementById('registrationMessageModal')) messageElementId = 'registrationMessageModal';
    }


    const ime = document.getElementById(imeInputId).value.trim();
    const priimek = document.getElementById(priimekInputId).value.trim();
    const email = document.getElementById(emailInputId).value.trim();
    const geslo = document.getElementById(gesloInputId).value.trim();
    const potrdiGeslo = document.getElementById(potrdiGesloInputId).value.trim();

    if (!ime || !priimek || !email || !geslo || !potrdiGeslo) {
        prikaziObvestilo('Prosim, izpolnite vsa obvezna polja!', messageElementId, 'text-danger');
        return;
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        prikaziObvestilo('Vnesli ste nepravilen e-mail!', messageElementId, 'text-danger');
        return;
    }
    const gesloRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!gesloRegex.test(geslo)) {
        prikaziObvestilo('Geslo mora vsebovati vsaj 6 znakov, eno veliko črko in eno številko!', messageElementId, 'text-danger long-message', 5000);
        return;
    }
    if (geslo !== potrdiGeslo) {
        prikaziObvestilo('Gesli se ne ujemata!', messageElementId, 'text-danger');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/registracija`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ime, priimek, email, geslo})
        });
        const data = await response.json();

        if (response.ok) {
            prikaziObvestilo(data.message || 'Registracija uspešna! Lahko se prijavite.', messageElementId, 'text-success', 2500);
            setTimeout(() => {
                const regOverlay = document.getElementById('registrationOverlay');
                if (regOverlay) regOverlay.style.display = 'none';
                const msgEl = document.getElementById(messageElementId);
                if (msgEl) msgEl.innerHTML = '';
                window.location.href="../html/prijava.html";
            }, 2500);
        } else {
            let errorMessage = data.message || 'Registracija neuspešna.';
            prikaziObvestilo(`Napaka pri registraciji: ${errorMessage}`, messageElementId, 'text-danger', 5000);
        }
    } catch (error) {
        console.error('Napaka pri registraciji:', error);
        prikaziObvestilo('Prišlo je do napake pri komunikaciji s strežnikom.', messageElementId, 'text-danger', 5000);
    }
}

async function preveriPrijavo() {
    const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
    const loginSignUpButtons = document.getElementById('loginSignUpButtons'); // Kontejner za gumba Prijava/Registracija
    const userDropdownNavItem = document.getElementById('userDropdownNavItem'); // Kontejner za dropdown meni prijavljenega uporabnika

    const userProfilePicNav = document.getElementById('userProfilePicNav');
    const usernameNav = document.getElementById('usernameNav');
    const urediProfilLinkNav = document.getElementById('urediProfilLinkNav');
    const logoutLinkNav = document.getElementById('logoutLinkNav');
    const adminPanelLinkContainerNav = document.getElementById('adminPanelLinkContainerNav');
    const trenerDodajAktivnostLinkContainerNav = document.getElementById('trenerDodajAktivnostLinkContainerNav');
    const postaniTrenerLinkContainerNav = document.getElementById('postaniTrenerLinkContainerNav');
    // Gumb "Postani Trener" na index.html, če obstaja
    const postaniTrenerIndexGumbContainer = document.getElementById('postaniTrenerIndexGumbContainer');


    if (uporabnikInfoString && sessionStorage.getItem('accessToken')) {
        const uporabnik = JSON.parse(uporabnikInfoString);

        if (loginSignUpButtons) loginSignUpButtons.classList.add('d-none');
        if (userDropdownNavItem) userDropdownNavItem.classList.remove('d-none');

        if (userProfilePicNav) {
            userProfilePicNav.src = uporabnik.slika_base64 || '../slike/default-profile.png'; // Privzeta slika, če ni na voljo
        }
        if (usernameNav) {
            usernameNav.textContent = uporabnik.username;
        }

        if (urediProfilLinkNav) {
            // Preverimo, ali smo že na uredi-profil.html, da se izognemo relativni poti, če ni potrebna
            if (window.location.pathname.includes('uredi-profil.html') || window.location.pathname.endsWith('/')) {
                urediProfilLinkNav.href = 'uredi-profil.html'; // Če smo v root ali že tam
            } else if (window.location.pathname.startsWith('/html/')) {
                urediProfilLinkNav.href = 'uredi-profil.html'; // Če smo v podmapi /html/
            }
            else {
                urediProfilLinkNav.href = 'html/uredi-profil.html'; // Privzeta pot, če nismo v rootu
            }
        }

        if (logoutLinkNav) {
            logoutLinkNav.removeEventListener('click', odjavaObKlikNav); // Odstranimo prejšnji listener, da preprečimo podvajanje
            logoutLinkNav.addEventListener('click', odjavaObKlikNav);
        }

        if (adminPanelLinkContainerNav) {
            if (uporabnik.JeAdmin) {
                adminPanelLinkContainerNav.innerHTML = '<li><a class="dropdown-item" href="../html/admin-panel.html">Admin Panel</a></li>';
            } else {
                adminPanelLinkContainerNav.innerHTML = '';
            }
        }

        if (trenerDodajAktivnostLinkContainerNav) {
            if (uporabnik.jeTrener) { // Uporabimo jeTrener boolean
                trenerDodajAktivnostLinkContainerNav.innerHTML = '<li><a class="dropdown-item" href="../html/dodaj-aktivnost.html">Dodaj Aktivnost</a></li>';
                if(postaniTrenerIndexGumbContainer) postaniTrenerIndexGumbContainer.innerHTML = '<a class="btn btn-info" href="../html/dodaj-aktivnost.html">Dodaj Svojo Aktivnost &raquo;</a>';

            } else {
                trenerDodajAktivnostLinkContainerNav.innerHTML = '';
            }
        }
        if (postaniTrenerLinkContainerNav) {
            if (!uporabnik.jeTrener && !uporabnik.JeAdmin) { // Uporabnik ni trener in ni admin
                postaniTrenerLinkContainerNav.innerHTML = '<li><a class="dropdown-item" href="#" id="postaniTrenerModalGumbNav">Postani Trener</a></li>';

                // Gumb na index.html, če uporabnik NI trener in NI admin
                if(postaniTrenerIndexGumbContainer && !uporabnik.jeTrener && !uporabnik.JeAdmin) {
                    postaniTrenerIndexGumbContainer.innerHTML = '<a class="btn btn-success" href="#" id="postaniTrenerModalGumbIndex">Postani Trener &raquo;</a>';
                }


                // Dodaj event listenerje za odpiranje modala (če obstaja) ali preusmeritev
                const modalGumbNav = document.getElementById('postaniTrenerModalGumbNav');
                if(modalGumbNav) {
                    modalGumbNav.removeEventListener('click', obdelajKlikPostaniTrener);
                    modalGumbNav.addEventListener('click', obdelajKlikPostaniTrener);
                }
                const modalGumbIndex = document.getElementById('postaniTrenerModalGumbIndex');
                if(modalGumbIndex) {
                    modalGumbIndex.removeEventListener('click', obdelajKlikPostaniTrener);
                    modalGumbIndex.addEventListener('click', obdelajKlikPostaniTrener);
                }

            } else { // Če je trener ali admin, skrij možnost "Postani trener"
                postaniTrenerLinkContainerNav.innerHTML = '';
                // Če je trener ali admin, tudi na index.html ne sme biti tega gumba
                if(postaniTrenerIndexGumbContainer && (uporabnik.jeTrener || uporabnik.JeAdmin === 1)) {
                    postaniTrenerIndexGumbContainer.innerHTML = ''; // Počisti, če je admin ali že trener
                }
            }
        }


        resetTimerNeaktivnosti();
    } else {
        if (loginSignUpButtons) loginSignUpButtons.classList.remove('d-none');
        if (userDropdownNavItem) userDropdownNavItem.classList.add('d-none');

        if (adminPanelLinkContainerNav) adminPanelLinkContainerNav.innerHTML = '';
        if (trenerDodajAktivnostLinkContainerNav) trenerDodajAktivnostLinkContainerNav.innerHTML = '';
        if (postaniTrenerLinkContainerNav) postaniTrenerLinkContainerNav.innerHTML = '';
        // Na index.html, če uporabnik ni prijavljen, prikaži gumb za registracijo kot trener
        if(postaniTrenerIndexGumbContainer) {
            postaniTrenerIndexGumbContainer.innerHTML = '<a class="btn btn-success" href="/html/registracija.html">Registriraj se kot Trener &raquo;</a>';
        }


        clearTimeout(neaktivonstTimer);
    }
}

async function odjavaObKlikNav(e){
    e.preventDefault()
    await odjava(false, 'Uspešno ste se odjavili!')
}

async function obdelajKlikPostaniTrener(e){
    e.preventDefault()
    window.location.href="/html/postani-trener.html";
}

async function odjava(forceStopTimers = false, sporocilo = null) {
    const osvezilniToken = localStorage.getItem('refreshToken');
    const accessToken = sessionStorage.getItem('accessToken');

    if (osvezilniToken) {
        try {
            await fetch(`${API_URL}/odjava`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({osvezilniToken})
            });
            console.log('Zahteva za odjavo poslana na strežnik.');
        } catch (error) {
            console.error('Napaka pri klicu /api/odjava (ne blokira odjave na odjemalcu):', error);
        }
    }

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('uporabnikInfo');
    localStorage.removeItem('refreshToken');

    if (sporocilo) {
        const globalAlert = document.getElementById('globalAlertMessage');
        if (globalAlert) {
            prikaziObvestilo(sporocilo, 'globalAlertMessage', 'text-success', 3000);
        } else {
            alert(sporocilo);
        }
    }

    await preveriPrijavo();

    if (forceStopTimers || !sessionStorage.getItem('accessToken')) {
        clearTimeout(neaktivonstTimer);
    }


    const trenutnaPot = window.location.pathname;
    const dovoljenePotiBrezPreusmeritve = ['/', '/search-stran.html', '/html/search-stran.html', '/html/uredi-profil.html', '/html/profilTrener.html'];

    if (!dovoljenePotiBrezPreusmeritve.some(pot => trenutnaPot.endsWith(pot))) {
        if (!forceStopTimers) {
            window.location.href = '/';
        }
    } else if (trenutnaPot.includes('/uredi-profil.html') || trenutnaPot.includes('/profilTrener.html')) {

        window.location.href = '/';
    }
}


async function inicializirajStanjePrijave() {
    const refreshToken = localStorage.getItem('refreshToken');
    let accessToken = sessionStorage.getItem('accessToken');

    if (refreshToken && !accessToken) {
        console.log('Najden refreshToken, accessToken manjka v seji, poskušam osvežiti sejo...');
        const novAccessToken = await osveziDostopniZeton(true);
        if (novAccessToken) {
            console.log('Seja uspešno obnovljena z refreshTokenom.');
        } else {
            console.log('Ni bilo mogoče obnoviti seje z refreshTokenom.');
        }
    }
    await preveriPrijavo();
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
            const closeButton = overlayElement.querySelector('.close-btn');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    overlayElement.style.display = 'none';
                });
            }
        }
    });

    ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimerNeaktivnosti, true);
    });

    const showLoginBtn = document.getElementById('showLogin');
    const showRegBtn = document.querySelector('button[onclick="showRegistrationModal()"]');

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', showLoginModal);
    }
    if (showRegBtn) {
        showRegBtn.addEventListener('click', showRegistrationModal);
    }

    const regLinkInLoginModal = document.querySelector('#loginOverlay a[onclick*="showRegistrationModal"]');
    if (regLinkInLoginModal) {
        regLinkInLoginModal.addEventListener('click', (e) => {
            e.preventDefault();
            showRegistrationModal();
        });
    }

    const loginLinkInRegModal = document.querySelector('#registrationOverlay a[onclick*="showLoginModal"]');
    if (loginLinkInRegModal) {
        loginLinkInRegModal.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }

    /*const loginButtonInModal = document.querySelector('#loginOverlay button[onclick="prijavaUporabnika()"], #loginOverlay button[onclick*="prijavaUporabnikaIzModala"]');
    if (loginButtonInModal) {
        loginButtonInModal.addEventListener('click', prijavaUporabnika);
    }*/

    const regButtonInModal = document.querySelector('#registrationOverlay button[onclick="registracijaUporabnika()"], #registrationOverlay button[onclick*="registracijaUporabnikaIzModala"]');
    if (regButtonInModal) {
        regButtonInModal.addEventListener('click', registracijaUporabnika);
    }

});