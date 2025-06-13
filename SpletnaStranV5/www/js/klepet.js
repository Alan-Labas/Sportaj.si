// ==========================================================

// DATOTEKA: www/js/klepet.js (CELOTNA VSEBINA - ZANESLJIV POPRAVEK)

// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

    const socket = io();



    const klepetContainer = document.getElementById('klepet-container');

    const seznamKlepetovContainer = document.getElementById('seznam-klepetov-container');

    if (!seznamKlepetovContainer) return;



    const zacetniPogled = document.getElementById('zacetni-pogled');

    const aktivniKlepetView = document.getElementById('aktivni-klepet-view');

    const imeSogovornikaEl = document.getElementById('ime-sogovornika');

    const slikaSogovornikaEl = document.getElementById('sogovornik-slika');

    const teloKlepetEl = document.getElementById('telo-klepeta-body');

    const sporociloForm = document.getElementById('sporocilo-form');

    const vnosSporocilaInput = document.getElementById('vnos-sporocila-input');

    const btnNazaj = document.getElementById('btn-nazaj-na-seznam');



    let prijavljenUporabnik = null;

    let trenutniKlepetId = null;


    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }


    async function fetchZAvtentikacijo(url, options = {}) {
        const token = sessionStorage.getItem('accessToken');
        options.headers = { ...options.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        const response = await fetch(url, options);
        if (response.status === 401) {
            showCustomAlert("Vaša seja je potekla, prosimo prijavite se ponovno.");
            window.location.href = 'prijava.html?sessionExpired=true';
        }
        return response;
    }


    async function naloziKlepeteInOdpriSpecificnega() {
        try {
            const response = await fetchZAvtentikacijo('/api/klepeti');
            if (!response.ok) throw new Error('Napaka pri pridobivanju pogovorov.');
            const klepeti = await response.json();
            prikaziSeznamKlepetov(klepeti);

            const urlParams = new URLSearchParams(window.location.search);
            const zacetniTrenerId = urlParams.get('trenerId');
            const odpriKlepetId = urlParams.get('openChat');

            if (odpriKlepetId) {
                const klepetToOpen = klepeti.find(k => k.klepet_id == odpriKlepetId);
                if (klepetToOpen) {
                    setTimeout(() => {
                        odpriKlepet(klepetToOpen.klepet_id, klepetToOpen.sogovornik.ime, klepetToOpen.sogovornik.id, klepetToOpen.sogovornik.slika);
                    }, 0);
                }
            } else if (zacetniTrenerId && prijavljenUporabnik && !prijavljenUporabnik.jeTrener) {
                // Ta del kode se uporablja, ko uporabnik klikne "Kontaktiraj" na profilu trenerja
                const obstojecKlepetSPrejemnikom = klepeti.find(k => {
                    const trenerPovezanUporabnikId = k.sogovornik.id;
                    return trenerPovezanUporabnikId == zacetniTrenerId;
                });
                
                if (obstojecKlepetSPrejemnikom) {
                    odpriKlepet(obstojecKlepetSPrejemnikom.klepet_id, obstojecKlepetSPrejemnikom.sogovornik.ime, obstojecKlepetSPrejemnikom.sogovornik.id, obstojecKlepetSPrejemnikom.sogovornik.slika);
                } else {
                    const trenerResponse = await fetchZAvtentikacijo(`/api/uporabnik/${zacetniTrenerId}/details`);
                    if (!trenerResponse.ok) throw new Error("Trener ni najden.");
                    const trenerPodatki = await trenerResponse.json();
                    pripraviOknoZaNovKlepet(zacetniTrenerId, trenerPodatki.ime_prikazno, trenerPodatki.slika_base64);
                }
            }
        } catch (error) {
            console.error(error);
            seznamKlepetovContainer.innerHTML = `<p class="p-3 text-danger">Napaka pri nalaganju pogovorov.</p>`;
        }
    }



    function prikaziSeznamKlepetov(klepeti) {
        const listGroup = seznamKlepetovContainer.querySelector('.list-group');
        if (!listGroup) {
            console.error("Element .list-group ni bil najden znotraj #seznam-klepetov-container");
            return;
        }

        listGroup.innerHTML = ''; // Počisti prejšnjo vsebino

        if (!klepeti || klepeti.length === 0) {
            listGroup.innerHTML = '<p class="p-3 text-muted">Nimate še nobenih pogovorov.</p>';
            return;
        }

        klepeti.forEach(klepet => {
            const sogovornik = klepet.sogovornik;
            if (!sogovornik) return; // Varnostno preverjanje

            let zadnjeSporociloText = 'Začnite pogovor...';
            if (klepet.zadnje_sporocilo && klepet.zadnje_sporocilo.vsebina) {
                 zadnjeSporociloText = klepet.zadnje_sporocilo.vsebina;
            }

            const slikaPath = sogovornik.slika || '../slike/default-profile.png';
            
            // Nova, izboljšana HTML struktura, ki uporablja popravljen CSS
            const klepetItemHTML = `
                <a href="#" class="list-group-item list-group-item-action p-0" 
                   data-klepet-id="${klepet.klepet_id}"
                   data-sogovornik-id="${sogovornik.id}"
                   data-sogovornik-ime="${escapeHTML(sogovornik.ime)}"
                   data-sogovornik-slika="${slikaPath}">
                   
                    <div class="klepet-item-link">
                        <img src="${slikaPath}" alt="Avatar" class="klepet-avatar">
                        <div class="klepet-info">
                            <p class="klepet-ime mb-0">${escapeHTML(sogovornik.ime)}</p>
                            <small class="klepet-zadnje-sporocilo">${escapeHTML(zadnjeSporociloText)}</small>
                        </div>
                    </div>
                </a>
            `;

            // Vstavimo nov element v list-group
            listGroup.innerHTML += klepetItemHTML;
        });
        
        // Ponovno dodamo "event listenerje" na novo ustvarjene elemente
        listGroup.querySelectorAll('.list-group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                odpriKlepet(
                    item.dataset.klepetId, 
                    item.dataset.sogovornikIme, 
                    item.dataset.sogovornikId, 
                    item.dataset.sogovornikSlika
                );
            });
        });
    }



    function prikaziEnoSporocilo(sporocilo) {
        if (aktivniKlepetView.dataset.isNew === 'true') {
            teloKlepetEl.innerHTML = '';
            aktivniKlepetView.dataset.isNew = 'false';
        }
        const jePoslano = sporocilo.posiljatelj_id === prijavljenUporabnik.userId;
        const div = document.createElement('div');
        div.className = `d-flex ${jePoslano ? 'justify-content-end' : 'justify-content-start'} mb-2`;
        div.innerHTML = `<div class="sporocilo ${jePoslano ? 'poslano' : 'prejeto'}">${escapeHTML(sporocilo.vsebina)}</div>`;
        teloKlepetEl.appendChild(div);
        teloKlepetEl.scrollTop = teloKlepetEl.scrollHeight;
    }



    async function odpriKlepet(klepetId, sogovornikIme, sogovornikId, sogovornikSlika) {
        if (trenutniKlepetId === klepetId) return;
        if (trenutniKlepetId) socket.emit('leave_chat_room', { klepetId: trenutniKlepetId });

        trenutniKlepetId = klepetId;
        socket.emit('join_chat_room', { klepetId });

        document.querySelectorAll('.list-group-item.active').forEach(el => el.classList.remove('active'));
        const klepetElement = document.querySelector(`.list-group-item[data-klepet-id='${klepetId}']`);
        if (klepetElement) klepetElement.classList.add('active');

        aktivniKlepetView.dataset.sogovornikId = sogovornikId;
        aktivniKlepetView.dataset.isNew = 'false';
        imeSogovornikaEl.textContent = sogovornikIme;
        slikaSogovornikaEl.src = sogovornikSlika || '../slike/default-profile.png';
        teloKlepetEl.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Nalaganje...</span></div></div>';

        zacetniPogled.classList.add('d-none');
        aktivniKlepetView.classList.remove('d-none');
        klepetContainer.classList.add('mobile-chat-view');

        try {
            const response = await fetchZAvtentikacijo(`/api/klepeti/${klepetId}/sporocila`);
            if (!response.ok) throw new Error('Neuspešno pridobivanje sporočil.');
            const sporocila = await response.json();
            teloKlepetEl.innerHTML = '';
            sporocila.forEach(s => prikaziEnoSporocilo(s));
            vnosSporocilaInput.focus();
        } catch (error) {
            console.error(error);
            teloKlepetEl.innerHTML = '<p class="text-danger text-center p-3">Napaka pri nalaganju sporočil.</p>';
        }
    }



    function pripraviOknoZaNovKlepet(trenerId, trenerIme, trenerSlika) {
        if (trenutniKlepetId) socket.emit('leave_chat_room', { klepetId: trenutniKlepetId });

        trenutniKlepetId = `new-${trenerId}`;
        aktivniKlepetView.dataset.sogovornikId = trenerId;
        aktivniKlepetView.dataset.isNew = 'true';
        imeSogovornikaEl.textContent = trenerIme;
        slikaSogovornikaEl.src = trenerSlika || '../slike/default-profile.png';
        teloKlepetEl.innerHTML = '<p class="text-muted text-center p-3">Napišite prvo sporočilo, da začnete pogovor.</p>';

        zacetniPogled.classList.add('d-none');
        aktivniKlepetView.classList.remove('d-none');
        klepetContainer.classList.add('mobile-chat-view');
        vnosSporocilaInput.focus();
    }



    sporociloForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const vsebina = vnosSporocilaInput.value.trim();
        if (!vsebina || !trenutniKlepetId) return;

        vnosSporocilaInput.value = '';
        vnosSporocilaInput.disabled = true;
        const originalVsebina = vsebina;

        try {
            const sogovornikUporabnikId = aktivniKlepetView.dataset.sogovornikId;
            const payload = {
                prejemnikUporabnikId: parseInt(sogovornikUporabnikId),
                vsebina: originalVsebina
            };
            const response = await fetchZAvtentikacijo('/api/klepeti/sporocila', {
                method: 'POST', body: JSON.stringify(payload)
            });

            const novoSporocilo = await response.json();
            if (!response.ok) throw new Error(novoSporocilo.message || 'Napaka strežnika');

            if (String(trenutniKlepetId).startsWith('new-')) {
                // Po uspešnem pošiljanju prvega sporočila, preusmerimo na nov klepet
                // da se pravilno osveži seznam in stanje
                 window.location.href = `klepet.html?openChat=${novoSporocilo.klepet_id}`;
            }

        } catch (error) {
            console.error("Napaka pri pošiljanju sporočila:", error);
            vnosSporocilaInput.value = originalVsebina; // Vrnemo vsebino v polje
            showCustomAlert('Napaka pri pošiljanju sporočila.', 'error');
        } finally {
            vnosSporocilaInput.disabled = false;
            vnosSporocilaInput.focus();
        }
    });



    btnNazaj.addEventListener('click', () => {
        klepetContainer.classList.remove('mobile-chat-view');
        trenutniKlepetId = null;
        document.querySelectorAll('.list-group-item.active').forEach(el => el.classList.remove('active'));
        history.replaceState(null, '', window.location.pathname);
    });

    socket.on('receive_message', (novoSporocilo) => {
        // Preverimo, ali je uporabnik trenutno v tem klepetu
        if (novoSporocilo.klepet_id == trenutniKlepetId) {
            prikaziEnoSporocilo(novoSporocilo);
        }
        // V vsakem primeru osvežimo seznam klepetov, da se posodobi vrstni red in zadnje sporočilo
        naloziKlepeteInOdpriSpecificnega();
    });



    socket.on('receive_message', (novoSporocilo) => {

        if (novoSporocilo.klepet_id == trenutniKlepetId) {

            prikaziEnoSporocilo(novoSporocilo);

        } else {

            naloziKlepeteInOdpriSpecificnega();

        }

    });



    function init() {
        const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
        if (uporabnikInfoString) {
            prijavljenUporabnik = JSON.parse(uporabnikInfoString);
            socket.emit('register_user', prijavljenUporabnik.userId);
            naloziKlepeteInOdpriSpecificnega();
        } else {
            document.querySelector('.container.my-5').innerHTML = '<h1>Dostop zavrnjen</h1><p>Za dostop do sporočil se morate <a href="prijava.html">prijaviti</a>.</p>';
        }
    }

    init();

});
