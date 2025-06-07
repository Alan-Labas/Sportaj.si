// ==========================================================
// DATOTEKA: www/js/klepet.js (CELOTNA VSEBINA)
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const klepetContainer = document.getElementById('klepet-container');
    const seznamKlepetovContainer = document.getElementById('seznam-klepetov-container');
    if (!seznamKlepetovContainer) return;

    const zacetniPogled = document.getElementById('zacetni-pogled');
    const aktivniKlepetView = document.getElementById('aktivni-klepet-view');
    const imeSogovornikaEl = document.getElementById('ime-sogovornika');
    const teloKlepetEl = document.getElementById('telo-klepeta-body');
    const sporociloForm = document.getElementById('sporocilo-form');
    const vnosSporocilaInput = document.getElementById('vnos-sporocila-input');
    const btnNazaj = document.getElementById('btn-nazaj-na-seznam');

    let prijavljenUporabnik = null;
    let trenutniKlepetId = null;

    async function fetchZAvtentikacijo(url, options = {}) {
        const token = sessionStorage.getItem('accessToken');
        options.headers = { ...options.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        const response = await fetch(url, options);
        if (response.status === 401) window.location.href = 'prijava.html?sessionExpired=true';
        return response;
    }

    async function naloziKlepete() {
        try {
            const response = await fetchZAvtentikacijo('/api/klepeti');
            if (!response.ok) throw new Error('Napaka pri pridobivanju pogovorov.');
            const klepeti = await response.json();
            prikaziSeznamKlepetov(klepeti);

            const urlParams = new URLSearchParams(window.location.search);
            const zacetniTrenerId = urlParams.get('trenerId');
            if (zacetniTrenerId && !prijavljenUporabnik.jeTrener) {
                const obstojecKlepet = klepeti.find(k => k.sogovornik.id == zacetniTrenerId);
                if (obstojecKlepet) {
                    odpriKlepet(obstojecKlepet.klepet_id, obstojecKlepet.sogovornik.ime, obstojecKlepet.sogovornik.id);
                } else {
                    const trenerResponse = await fetchZAvtentikacijo(`/api/uporabnik/${zacetniTrenerId}/details`);
                    if (!trenerResponse.ok) throw new Error("Trener ni najden.");
                    const trenerPodatki = await trenerResponse.json();
                    pripraviOknoZaNovKlepet(zacetniTrenerId, trenerPodatki.ime_prikazno);
                }
            }
        } catch (error) {
            console.error(error);
            seznamKlepetovContainer.innerHTML = `<p class="p-3 text-danger">Napaka pri nalaganju.</p>`;
        }
    }

    function prikaziSeznamKlepetov(klepeti) {
        if (!klepeti || klepeti.length === 0) {
            seznamKlepetovContainer.innerHTML = '<p class="p-3 text-muted">Nimate še nobenih sporočil.</p>';
            return;
        }
        const listGroup = document.createElement('div');
        listGroup.className = 'list-group list-group-flush';
        klepeti.forEach(klepet => {
            const zadnjeSporociloText = klepet.zadnje_sporocilo ? klepet.zadnje_sporocilo.vsebina.substring(0, 30) + '...' : '<i>Začnite pogovor...</i>';
            const klepetEl = document.createElement('a');
            klepetEl.href = '#';
            klepetEl.className = 'list-group-item list-group-item-action';
            klepetEl.dataset.klepetId = klepet.klepet_id;
            klepetEl.dataset.sogovornikIme = klepet.sogovornik.ime;
            klepetEl.dataset.sogovornikUporabnikId = klepet.sogovornik.id;
            klepetEl.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${klepet.sogovornik.ime}</h6>
                </div>
                <small class="text-muted">${zadnjeSporociloText}</small>`;
            klepetEl.addEventListener('click', (e) => {
                e.preventDefault();
                odpriKlepet(klepet.klepet_id, klepet.sogovornik.ime, klepet.sogovornik.id);
            });
            listGroup.appendChild(klepetEl);
        });
        seznamKlepetovContainer.innerHTML = '';
        seznamKlepetovContainer.appendChild(listGroup);
    }

    function prikaziEnoSporocilo(sporocilo) {
        const jePoslano = sporocilo.posiljatelj_id === prijavljenUporabnik.userId;
        const div = document.createElement('div');
        div.className = `sporocilo ${jePoslano ? 'poslano' : 'prejeto'}`;
        div.textContent = sporocilo.vsebina;
        teloKlepetEl.appendChild(div);
        teloKlepetEl.scrollTop = teloKlepetEl.scrollHeight;
    }

    async function odpriKlepet(klepetId, sogovornikIme, sogovornikUporabnikId) {
        if (trenutniKlepetId) socket.emit('leave_chat_room', { klepetId: trenutniKlepetId });

        trenutniKlepetId = klepetId;
        socket.emit('join_chat_room', { klepetId });

        document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));
        const klepetElement = document.querySelector(`.list-group-item[data-klepet-id='${klepetId}']`);
        if (klepetElement) {
            klepetElement.classList.add('active');
            klepetElement.classList.remove('has-unread'); // Odstrani piko obvestila
        }

        aktivniKlepetView.dataset.sogovornikUporabnikId = sogovornikUporabnikId;
        imeSogovornikaEl.textContent = sogovornikIme;
        teloKlepetEl.innerHTML = '<p class="text-muted text-center">Nalagam sporočila...</p>';
        zacetniPogled.classList.add('d-none');
        aktivniKlepetView.classList.remove('d-none');
        klepetContainer.classList.add('mobile-chat-view'); // Za mobilno odzivnost

        try {
            const response = await fetchZAvtentikacijo(`/api/klepeti/${klepetId}/sporocila`);
            if (!response.ok) throw new Error('Neuspešno pridobivanje sporočil.');
            const sporocila = await response.json();
            teloKlepetEl.innerHTML = '';
            sporocila.forEach(s => prikaziEnoSporocilo(s));
        } catch (error) {
            console.error(error);
            teloKlepetEl.innerHTML = '<p class="text-danger text-center">Napaka pri nalaganju sporočil.</p>';
        }
    }

    function pripraviOknoZaNovKlepet(trenerUporabnikId, trenerIme) {
        trenutniKlepetId = `new-${trenerUporabnikId}`;
        aktivniKlepetView.dataset.sogovornikUporabnikId = trenerUporabnikId;
        imeSogovornikaEl.textContent = trenerIme;
        teloKlepetEl.innerHTML = '<p class="text-muted text-center">Napišite prvo sporočilo, da začnete pogovor.</p>';
        zacetniPogled.classList.add('d-none');
        aktivniKlepetView.classList.remove('d-none');
        klepetContainer.classList.add('mobile-chat-view');
        vnosSporocilaInput.focus();
    }

    sporociloForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const vsebina = vnosSporocilaInput.value.trim();
        if (!vsebina || !trenutniKlepetId) return;

        const originalnoSporocilo = vsebina;
        vnosSporocilaInput.value = '';
        vnosSporocilaInput.disabled = true;

        try {
            const sogovornikUporabnikId = aktivniKlepetView.dataset.sogovornikUporabnikId;
            if (!sogovornikUporabnikId) throw new Error("ID sogovornika ni znan.");

            const payload = {
                prejemnikUporabnikId: parseInt(sogovornikUporabnikId),
                vsebina: vsebina
            };

            const response = await fetchZAvtentikacijo('/api/klepeti/sporocila', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Napaka strežnika: ${response.status}`);
            }

            if (typeof trenutniKlepetId === 'string' && trenutniKlepetId.startsWith('new-')) {
                // Če je bil to nov klepet, osvežimo celoten seznam, da se prikaže
                await naloziKlepete();
                const novoSporocilo = await response.json();
                // Počakamo in odpremo nov klepet
                setTimeout(() => {
                    const novKlepetEl = document.querySelector(`.list-group-item[data-klepet-id='${novoSporocilo.klepet_id}']`);
                    if(novKlepetEl) novKlepetEl.click();
                }, 300);
            }
        } catch (error) {
            console.error("Napaka pri pošiljanju sporočila:", error);
            alert(`Napaka pri pošiljanju: ${error.message}`);
            vnosSporocilaInput.value = originalnoSporocilo;
        } finally {
            vnosSporocilaInput.disabled = false;
            vnosSporocilaInput.focus();
        }
    });

    btnNazaj.addEventListener('click', () => {
        klepetContainer.classList.remove('mobile-chat-view');
        trenutniKlepetId = null;
    });

    socket.on('receive_message', (novoSporocilo) => {
        if (novoSporocilo.klepet_id === trenutniKlepetId) {
            // Sporočilo pripada trenutno odprtemu klepetu
            prikaziEnoSporocilo(novoSporocilo);
        } else {
            // Sporočilo je za drug klepet, prikaži obvestilo
            const klepetElement = document.querySelector(`.list-group-item[data-klepet-id='${novoSporocilo.klepet_id}']`);
            if (klepetElement) {
                klepetElement.classList.add('has-unread');
                // Premakni klepet na vrh seznama
                seznamKlepetovContainer.querySelector('.list-group').prepend(klepetElement);
            } else {
                // Klepet še ne obstaja na seznamu, ponovno naloži vse
                naloziKlepete();
            }
        }
    });

    function init() {
        const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
        if (uporabnikInfoString) {
            prijavljenUporabnik = JSON.parse(uporabnikInfoString);
            naloziKlepete();
        } else {
            document.querySelector('.container').innerHTML = '<h1>Dostop zavrnjen</h1><p>Za dostop do sporočil se morate <a href="prijava.html">prijaviti</a>.</p>';
        }
    }

    init();
});