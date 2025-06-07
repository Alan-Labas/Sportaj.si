const aktivnostSlikaUploadInput = document.getElementById('aktivnostSlikaUploadInput');
const aktivnostOdstraniSlikoGroup = document.getElementById('aktivnostOdstraniSlikoGroup');
const aktivnostOdstraniSlikoCheckbox = document.getElementById('aktivnostOdstraniSlikoCheckbox');

document.addEventListener('DOMContentLoaded', async () => {
    const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
    if (!uporabnikInfoString) {
        alert('Za dostop do te strani morate biti prijavljeni.');
        window.location.href = '/';
        return;
    }
    const uporabnik = JSON.parse(uporabnikInfoString);
    if (!uporabnik.JeAdmin) {
        alert('Nimate dovoljenja za dostop do te strani.');
        window.location.href = '/';
        return;
    }

    const pozdravAdminEl = document.getElementById('pozdravAdmin');
    if (pozdravAdminEl) pozdravAdminEl.textContent = `Admin: ${uporabnik.username}`;

    const odjavaAdminBtn = document.getElementById('odjavaAdminBtn');
    if (odjavaAdminBtn) odjavaAdminBtn.addEventListener('click', () => odjava(false, "Odjavljeni iz admin panela."));


    const API_BASE_URL = '/api/admin';

    const oceneTrenerjevTableBody = document.getElementById('oceneTrenerjevTableBody');
    const oceneAktivnostiTableBody = document.getElementById('oceneAktivnostiTableBody');
    const aktivnostiTableBody = document.getElementById('aktivnostiTableBody');
    const trenerjiTableBody = document.getElementById('trenerjiTableBody');
    const sectionTitle = document.getElementById('sectionTitle');

    const urediOcenoModal = new bootstrap.Modal(document.getElementById('urediOcenoModal'));
    const aktivnostModal = new bootstrap.Modal(document.getElementById('aktivnostModal'));
    const trenerModal = new bootstrap.Modal(document.getElementById('trenerModal'));

    const urediOcenoForm = document.getElementById('urediOcenoForm');
    const ocenaIdInput = document.getElementById('ocenaIdInput');
    const ocenaTypeInput = document.getElementById('ocenaTypeInput');
    const ocenaKomentarInput = document.getElementById('ocenaKomentarInput');
    const ocenaVrednostInput = document.getElementById('ocenaVrednostInput');

    const aktivnostForm = document.getElementById('aktivnostForm');
    const aktivnostIdInput = document.getElementById('aktivnostIdInput');
    const aktivnostNazivInput = document.getElementById('aktivnostNazivInput');
    const aktivnostOpisInput = document.getElementById('aktivnostOpisInput');
    const aktivnostLokacijaInput = document.getElementById('aktivnostLokacijaInput');
    const aktivnostCenaInput = document.getElementById('aktivnostCenaInput');
    const aktivnostProstaMestaInput = document.getElementById('aktivnostProstaMestaInput');
    const aktivnostSlikaInput = document.getElementById('aktivnostSlikaInput');
    const aktivnostTipSelect = document.getElementById('aktivnostTipSelect');
    const aktivnostTrenerSelect = document.getElementById('aktivnostTrenerSelect');
    const aktivnostDatumInput = document.getElementById('aktivnostDatumInput');
    const nacinIzvedbeSelect = document.getElementById('nacinIzvedbeSelect');

    const trenerForm = document.getElementById('trenerForm');
    const trenerIdInput = document.getElementById('trenerIdInput');
    const trenerUporabnikIdInput = document.getElementById('trenerUporabnikIdInput');
    const trenerUsernameInput = document.getElementById('trenerUsernameInput');
    const trenerLoginEmailInput = document.getElementById('trenerLoginEmailInput');
    const trenerGesloInput = document.getElementById('trenerGesloInput');
    const trenerGesloGroup = document.getElementById('trenerGesloGroup');
    const trenerImeInputModal = document.getElementById('trenerImeInputModal');
    const trenerPriimekInputModal = document.getElementById('trenerPriimekInputModal');
    const trenerKontaktEmailInputModal = document.getElementById('trenerKontaktEmailInputModal');
    const trenerTelefonInputModal = document.getElementById('trenerTelefonInputModal');
    const trenerUrnikTextareaModal = document.getElementById('trenerUrnikTextareaModal');
    const trenerOpisProfilaTextareaModal = document.getElementById('trenerOpisProfilaTextareaModal');

    document.getElementById('shraniOcenoBtn').addEventListener('click', shraniOceno);
    document.getElementById('shraniAktivnostBtn').addEventListener('click', shraniAktivnost);
    document.getElementById('shraniTrenerjaBtn').addEventListener('click', shraniTrenerja);

    document.getElementById('dodajAktivnostBtn').addEventListener('click', () => prikaziAktivnostModalZaDodajanje());
    document.getElementById('dodajTrenerjaBtn').addEventListener('click', () => prikaziTrenerModalZaDodajanje());

    const navLinks = document.querySelectorAll('#adminNavbar .nav-link');
    const sections = document.querySelectorAll('.admin-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetSectionId = link.dataset.section + '-section';
            sections.forEach(s => {
                s.classList.toggle('d-none', s.id !== targetSectionId);
            });
            sectionTitle.textContent = link.textContent;
            loadDataForSection(link.dataset.section);
        });
    });

    async function loadDataForSection(sectionName) {
        switch (sectionName) {
            case 'ocene-trenerjev':
                await loadOceneTrenerjev();
                break;
            case 'ocene-aktivnosti':
                await loadOceneAktivnosti();
                break;
            case 'aktivnosti':
                await loadAktivnosti();
                await loadSportiZaSelect(aktivnostTipSelect);
                await loadTrenerjiZaSelect(aktivnostTrenerSelect);
                break;
            case 'trenerji':
                await loadTrenerji();
                break;
        }
    }

    function prikaziObvestiloAdmin(sporocilo, tip = 'success', timeout = 3000) {
        const alertContainer = document.getElementById('globalAlertMessageFixed');
        if (!alertContainer) return;

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tip} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${sporocilo}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alertDiv);

        if (timeout) {
            setTimeout(() => {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(alertDiv);
                if (bsAlert) bsAlert.close();
            }, timeout);
        }
    }


    // --- Funkcije za nalaganje in prikaz podatkov ---
    async function loadOceneTrenerjev() {
        try {
            const response = await fetchZAvtentikacijo(`${API_BASE_URL}/ocene/trenerjev`);
            if (!response.ok) throw new Error(`Napaka nalaganja ocen trenerjev: ${response.statusText}`);
            const data = await response.json();
            oceneTrenerjevTableBody.innerHTML = '';
            data.forEach(ocena => {
                const row = oceneTrenerjevTableBody.insertRow();
                row.innerHTML = `
                    <td>${ocena.id}</td>
                    <td>${ocena.trener_ime} ${ocena.trener_priimek}</td>
                    <td>${ocena.uporabnik_username} (${ocena.uporabnik_email})</td>
                    <td>${ocena.Ocena}/5</td>
                    <td>${ocena.Komentar || '-'}</td>
                    <td>${new Date(ocena.Datum).toLocaleDateString('sl-SI')}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary btn-uredi-oceno" data-id="${ocena.id}" data-type="trenerja">Uredi</button>
                        <button class="btn btn-sm btn-danger btn-izbrisi-oceno" data-id="${ocena.id}" data-type="trenerja">Izbriši</button>
                    </td>
                `;
            });
            addEventListenersZaOcene();
        } catch (error) {
            console.error(error);
            prikaziObvestiloAdmin(error.message, 'danger');
        }
    }

    async function loadOceneAktivnosti() {
        try {
            const response = await fetchZAvtentikacijo(`${API_BASE_URL}/ocene/aktivnosti`);
            if (!response.ok) throw new Error(`Napaka nalaganja ocen aktivnosti: ${response.statusText}`);
            const data = await response.json();
            oceneAktivnostiTableBody.innerHTML = '';
            data.forEach(ocena => {
                const row = oceneAktivnostiTableBody.insertRow();
                row.innerHTML = `
                    <td>${ocena.id}</td>
                    <td>${ocena.aktivnost_naziv}</td>
                    <td>${ocena.uporabnik_username} (${ocena.uporabnik_email})</td>
                    <td>${ocena.Ocena}/5</td>
                    <td>${ocena.Komentar || '-'}</td>
                    <td>${new Date(ocena.Datum).toLocaleDateString('sl-SI')}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary btn-uredi-oceno" data-id="${ocena.id}" data-type="aktivnosti">Uredi</button>
                        <button class="btn btn-sm btn-danger btn-izbrisi-oceno" data-id="${ocena.id}" data-type="aktivnosti">Izbriši</button>
                    </td>
                `;
            });
            addEventListenersZaOcene();
        } catch (error) {
            console.error(error);
            prikaziObvestiloAdmin(error.message, 'danger');
        }
    }

    async function loadAktivnosti() {
        try {
            const response = await fetchZAvtentikacijo(`${API_BASE_URL}/aktivnosti`);
            if (!response.ok) throw new Error(`Napaka nalaganja aktivnosti: ${response.statusText}`);
            const data = await response.json();
            aktivnostiTableBody.innerHTML = '';
            data.forEach(akt => {
                const row = aktivnostiTableBody.insertRow();
                row.innerHTML = `
                    <td>${akt.id}</td>
                    <td>${akt.Naziv}</td>
                    <td>${akt.ime_sporta || '-'}</td>
                    <td>${akt.ime_trenerja || '-'}</td>
                    <td>${akt.Lokacija}</td>
                    <td>${(typeof akt.Cena === 'number' ? akt.Cena.toFixed(2) : (parseFloat(akt.Cena) ? parseFloat(akt.Cena).toFixed(2) : 'N/A'))} €</td>
                    <td>${akt.ProstaMesta}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary btn-uredi-aktivnost" data-id="${akt.id}">Uredi</button>
                        <button class="btn btn-sm btn-danger btn-izbrisi-aktivnost" data-id="${akt.id}">Izbriši</button>
                    </td>
                `;
            });
            addEventListenersZaAktivnosti();
        } catch (error) {
            console.error(error);
            prikaziObvestiloAdmin(error.message, 'danger');
        }
    }

    async function loadTrenerji() {
        try {
            const response = await fetchZAvtentikacijo(`${API_BASE_URL}/trenerji`);
            if (!response.ok) throw new Error(`Napaka nalaganja trenerjev: ${response.statusText}`);
            const data = await response.json();
            trenerjiTableBody.innerHTML = '';
            data.forEach(t => {
                const row = trenerjiTableBody.insertRow();
                row.innerHTML = `
                    <td>${t.id}</td>
                    <td>${t.ime} ${t.priimek}</td>
                    <td>${t.uporabnisko_ime || '-'}</td>
                    <td>${t.login_email_uporabnika || '-'}</td>
                    <td>${t.kontakt_email_trenerja}</td>
                    <td>${t.telefon}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary btn-uredi-trenerja" data-id="${t.id}" data-uporabnikid="${t.uporabnik_id || ''}">Uredi</button>
                        <button class="btn btn-sm btn-danger btn-izbrisi-trenerja" data-id="${t.id}">Izbriši</button>
                    </td>
                `;
            });
            addEventListenersZaTrenerje();
        } catch (error) {
            console.error(error);
            prikaziObvestiloAdmin(error.message, 'danger');
        }
    }

    async function loadSportiZaSelect(selectElement) {
        try {
            const response = await fetch(`/api/vsi-sporti`);
            if (!response.ok) throw new Error('Napaka nalaganja športov');
            const sporti = await response.json();
            selectElement.innerHTML = '<option value="">Izberite šport...</option>';
            sporti.forEach(s => {
                selectElement.innerHTML += `<option value="${s.id}">${s.Sport}</option>`;
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function loadTrenerjiZaSelect(selectElement) {
        try {
            const response = await fetchZAvtentikacijo(`/api/admin/trenerji`);
            if (!response.ok) throw new Error('Napaka nalaganja trenerjev za select');
            const trenerji = await response.json();
            selectElement.innerHTML = '<option value="">Izberite trenerja (opcijsko)...</option>';
            trenerji.forEach(t => {
                selectElement.innerHTML += `<option value="${t.id}">${t.ime} ${t.priimek}</option>`;
            });
        } catch (error) {
            console.error(error);
        }
    }


    // --- Event listenerji za gumbe v tabelah ---
    function addEventListenersZaOcene() {
        document.querySelectorAll('.btn-uredi-oceno').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                const row = btn.closest('tr');
                const komentar = row.cells[4].textContent;
                const vrednost = parseInt(row.cells[3].textContent.split('/')[0]);

                ocenaIdInput.value = id;
                ocenaTypeInput.value = type;
                ocenaKomentarInput.value = komentar === '-' ? '' : komentar;
                ocenaVrednostInput.value = vrednost;
                urediOcenoModal.show();
            });
        });
        document.querySelectorAll('.btn-izbrisi-oceno').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                if (confirm(`Ali ste prepričani, da želite izbrisati to oceno (${type})?`)) {
                    await izbrisiOceno(id, type);
                }
            });
        });
    }

    function addEventListenersZaAktivnosti() {
        document.querySelectorAll('.btn-uredi-aktivnost').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const response = await fetchZAvtentikacijo(`${API_BASE_URL}/aktivnosti`);
                const aktivnosti = await response.json();
                const aktivnost = aktivnosti.find(a => a.id == id);
                if (aktivnost) {
                    prikaziAktivnostModalZaUrejanje(aktivnost);
                } else {
                    prikaziObvestiloAdmin('Aktivnosti ni mogoče najti za urejanje.', 'warning');
                }
            });
        });
        document.querySelectorAll('.btn-izbrisi-aktivnost').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm('Ali ste prepričani, da želite izbrisati to aktivnost? Povezane ocene bodo tudi izbrisane.')) {
                    await izbrisiAktivnost(id);
                }
            });
        });
    }

    function addEventListenersZaTrenerje() {
        document.querySelectorAll('.btn-uredi-trenerja').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const response = await fetchZAvtentikacijo(`${API_BASE_URL}/trenerji`);
                const trenerji = await response.json();
                const trener = trenerji.find(t => t.id == id);

                if (trener) {
                    prikaziTrenerModalZaUrejanje(trener);
                } else {
                    prikaziObvestiloAdmin('Trenerja ni mogoče najti za urejanje.', 'warning');
                }
            });
        });
        document.querySelectorAll('.btn-izbrisi-trenerja').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm('Ali ste prepričani, da želite izbrisati tega trenerja? Povezan uporabniški račun bo prav tako izbrisan! Njegove aktivnosti bodo ostale brez trenerja.')) {
                    await izbrisiTrenerja(id);
                }
            });
        });
    }

    // Ocene
    async function shraniOceno() {
        const id = ocenaIdInput.value;
        const type = ocenaTypeInput.value;
        const podatki = {
            Komentar: ocenaKomentarInput.value.trim(),
            Ocena: parseInt(ocenaVrednostInput.value)
        };
        if (isNaN(podatki.Ocena) || podatki.Ocena < 1 || podatki.Ocena > 5) {
            prikaziObvestiloAdmin('Ocena mora biti med 1 in 5.', 'warning');
            return;
        }
        try {
            const response = await fetchZAvtentikacijo(`${API_BASE_URL}/ocene/${type}/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(podatki)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Napaka pri shranjevanju ocene: ${response.statusText}`);
            }
            prikaziObvestiloAdmin('Ocena uspešno shranjena.');
            urediOcenoModal.hide();
            loadDataForSection(type === 'trenerja' ? 'ocene-trenerjev' : 'ocene-aktivnosti');
        } catch (error) {
            console.error(error);
            prikaziObvestiloAdmin(error.message, 'danger');
        }
    }

    async function izbrisiOceno(id, type) {
        try {
            const response = await fetchZAvtentikacijo(`${API_BASE_URL}/ocene/${type}/${id}`, {method: 'DELETE'});
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Napaka pri brisanju ocene: ${response.statusText}`);
            }
            prikaziObvestiloAdmin('Ocena uspešno izbrisana.');
            loadDataForSection(type === 'trenerja' ? 'ocene-trenerjev' : 'ocene-aktivnosti');
        } catch (error) {
            console.error(error);
            prikaziObvestiloAdmin(error.message, 'danger');
        }
    }

    async function shraniAktivnost() {
        const id = aktivnostIdInput.value;

        // Validacija osnovnih polj pred ustvarjanjem FormData
        const naziv = aktivnostNazivInput.value.trim();
        const opis = aktivnostOpisInput.value.trim();
        const lokacija = aktivnostLokacijaInput.value.trim();
        const cena = aktivnostCenaInput.value; // Validacija na strežniku
        const prostaMesta = aktivnostProstaMestaInput.value; // Validacija na strežniku
        const tipAktivnosti = aktivnostTipSelect.value;
        const datumCas = aktivnostDatumInput.value;
        const nacinIzvedbe = nacinIzvedbeSelect.value;

        if (!naziv || !opis || !lokacija || cena === '' || prostaMesta === '' || !tipAktivnosti || !datumCas || !nacinIzvedbe) {
            prikaziObvestiloAdmin('Izpolnite vsa obvezna polja (*) za aktivnost pravilno.', 'warning');
            return;
        }
        if (isNaN(parseFloat(cena)) || isNaN(parseInt(prostaMesta)) || isNaN(parseInt(tipAktivnosti))) {
            prikaziObvestiloAdmin('Cena, Prosta mesta in Tip aktivnosti morajo biti veljavna števila.', 'warning');
            return;
        }


        const formData = new FormData();
        formData.append('Naziv', naziv);
        formData.append('Opis', opis);
        formData.append('Lokacija', lokacija);
        formData.append('Cena', parseFloat(cena));
        formData.append('ProstaMesta', parseInt(prostaMesta));
        formData.append('TK_TipAktivnosti', parseInt(tipAktivnosti));
        formData.append('DatumCas', datumCas);
        formData.append('NacinIzvedbe', nacinIzvedbe);

        if (aktivnostTrenerSelect.value) {
            formData.append('TK_Trener_Select', parseInt(aktivnostTrenerSelect.value));
        }

        if (aktivnostSlikaUploadInput.files.length > 0) {
            formData.append('slikaAktivnosti', aktivnostSlikaUploadInput.files[0]);
        } else if (id && aktivnostOdstraniSlikoCheckbox && aktivnostOdstraniSlikoCheckbox.checked) {
            formData.append('odstraniSliko', 'true');
        }

        const url = id ? `${API_BASE_URL}/aktivnosti/${id}` : `${API_BASE_URL}/aktivnosti`;
        const method = id ? 'PUT' : 'POST';

        try {
            const response = await fetchZAvtentikacijo(url, {
                method: method,
                body: formData
                // NE nastavljajte Content-Type headerja, ko uporabljate FormData!
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: `Strežnik je vrnil napako ${response.status}` }));
                throw new Error(errData.message || `Napaka pri shranjevanju aktivnosti: ${response.statusText}`);
            }
            const data = await response.json(); // Preberemo odgovor, če je bil uspešen
            prikaziObvestiloAdmin(data.message || `Aktivnost uspešno ${id ? 'posodobljena' : 'dodana'}.`);
            aktivnostModal.hide();
            await loadAktivnosti(); // Ponovno naloži tabelo aktivnosti
        } catch (error) {
            console.error('Napaka pri klicu shraniAktivnost:', error);
            prikaziObvestiloAdmin(error.message || 'Prišlo je do napake.', 'danger');
        }
    }

    function prikaziAktivnostModalZaDodajanje() {
        aktivnostForm.reset();
        aktivnostIdInput.value = '';
        document.getElementById('aktivnostModalLabel').textContent = 'Dodaj Novo Aktivnost';
        if (aktivnostOdstraniSlikoGroup) aktivnostOdstraniSlikoGroup.style.display = 'none';
        if (aktivnostOdstraniSlikoCheckbox) aktivnostOdstraniSlikoCheckbox.checked = false;
        if (aktivnostSlikaUploadInput) aktivnostSlikaUploadInput.value = '';
        // Pazi, da imaš v HTML-ju element z ID-jem 'aktivnostModal'
        const modalElement = document.getElementById('aktivnostModal');
        if (modalElement) {
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            bootstrapModal.show();
        }
    }

    async function prikaziAktivnostModalZaUrejanje(aktivnost) { // Dodan async, ker morda kličemo API
        aktivnostForm.reset();
        aktivnostIdInput.value = aktivnost.id;
        document.getElementById('aktivnostModalLabel').textContent = 'Uredi Aktivnost';

        aktivnostNazivInput.value = aktivnost.Naziv || '';
        aktivnostOpisInput.value = aktivnost.Opis || '';
        aktivnostLokacijaInput.value = aktivnost.Lokacija || '';
        aktivnostCenaInput.value = aktivnost.Cena !== undefined ? aktivnost.Cena : 0;
        aktivnostProstaMestaInput.value = aktivnost.ProstaMesta !== undefined ? aktivnost.ProstaMesta : 0;

        if (aktivnost.Datum_Cas_Izvedbe) {
            const datumCas = new Date(aktivnost.Datum_Cas_Izvedbe);
            aktivnostDatumInput.value = datum.toISOString().slice(0, 16);
        }

        nacinIzvedbeSelect.value = aktivnost.Nacin_Izvedbe || 'Skupinsko';
        aktivnostTipSelect.value = aktivnost.TK_TipAktivnosti || '';
        aktivnostTrenerSelect.value = aktivnost.TK_Trener || '';

        if (aktivnostSlikaUploadInput) aktivnostSlikaUploadInput.value = ''; // Počisti prejšnjo izbiro datoteke

        if (aktivnost.imaSliko) {
            if (aktivnostOdstraniSlikoGroup) aktivnostOdstraniSlikoGroup.style.display = 'block';
            if (aktivnostOdstraniSlikoCheckbox) aktivnostOdstraniSlikoCheckbox.checked = false;
        } else {
            if (aktivnostOdstraniSlikoGroup) aktivnostOdstraniSlikoGroup.style.display = 'none';
        }

        aktivnostModal.show();
    }
    async function izbrisiAktivnost(id) {
        try {
            const response = await fetchZAvtentikacijo(`${API_BASE_URL}/aktivnosti/${id}`, {method: 'DELETE'});
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Napaka pri brisanju aktivnosti: ${response.statusText}`);
            }
            prikaziObvestiloAdmin('Aktivnost uspešno izbrisana.');
            await loadAktivnosti();
        } catch (error) {
            console.error(error);
            prikaziObvestiloAdmin(error.message, 'danger');
        }
    }

    // Trenerji
    function prikaziTrenerModalZaDodajanje() {
        trenerForm.reset();
        trenerIdInput.value = '';
        trenerUporabnikIdInput.value = '';
        document.getElementById('trenerModalLabel').textContent = 'Dodaj Novega Trenerja';
        trenerGesloInput.setAttribute('required', 'required');
        trenerGesloGroup.querySelector('small').textContent = 'Obvezno pri dodajanju.';
        trenerModal.show();
    }

    function prikaziTrenerModalZaUrejanje(trener) {
        trenerForm.reset();
        trenerIdInput.value = trener.id;
        trenerUporabnikIdInput.value = trener.uporabnik_id || '';
        document.getElementById('trenerModalLabel').textContent = 'Uredi Trenerja';

        trenerUsernameInput.value = trener.uporabnisko_ime || '';
        trenerLoginEmailInput.value = trener.login_email_uporabnika || '';
        trenerGesloInput.removeAttribute('required');
        trenerGesloGroup.querySelector('small').textContent = 'Pustite prazno, če ne želite spremeniti gesla.';

        trenerImeInputModal.value = trener.ime;
        trenerPriimekInputModal.value = trener.priimek;
        trenerKontaktEmailInputModal.value = trener.kontakt_email_trenerja;
        trenerTelefonInputModal.value = trener.telefon;
        trenerUrnikTextareaModal.value = trener.urnik;
        trenerOpisProfilaTextareaModal.value = trener.OpisProfila || '';
        trenerModal.show();
    }

    async function shraniTrenerja() {
        const id = trenerIdInput.value;
        const uporabnikId = trenerUporabnikIdInput.value;

        const podatki = {
            username: trenerUsernameInput.value.trim(),
            login_email: trenerLoginEmailInput.value.trim(),
            ime: trenerImeInputModal.value.trim(),
            priimek: trenerPriimekInputModal.value.trim(),
            kontakt_email: trenerKontaktEmailInputModal.value.trim(),
            telefon: trenerTelefonInputModal.value.trim(),
            urnik: trenerUrnikTextareaModal.value.trim(),
            OpisProfila: trenerOpisProfilaTextareaModal.value.trim()
        };

        if (trenerGesloInput.value) {
            podatki.geslo = trenerGesloInput.value;
            if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(podatki.geslo) && !id) {
                prikaziObvestiloAdmin('Geslo mora vsebovati vsaj 6 znakov, 1 veliko črko in 1 številko.', 'warning');
                return;
            }
        } else if (!id) {
            prikaziObvestiloAdmin('Geslo je obvezno pri dodajanju novega trenerja.', 'warning');
            return;
        }


        if (!podatki.username || !podatki.login_email || !podatki.ime || !podatki.priimek || !podatki.kontakt_email || !podatki.telefon || !podatki.urnik) {
            prikaziObvestiloAdmin('Izpolnite vsa obvezna polja (*) za trenerja pravilno.', 'warning');
            return;
        }

        const url = id ? `${API_BASE_URL}/trenerji/${id}` : `${API_BASE_URL}/trenerji`;
        const method = id ? 'PUT' : 'POST';

        try {
            const response = await fetchZAvtentikacijo(url, {
                method: method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(podatki)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Napaka pri shranjevanju trenerja: ${response.statusText}`);
            }
            prikaziObvestiloAdmin(`Trener uspešno ${id ? 'posodobljen' : 'dodan'}.`);
            trenerModal.hide();
            await loadTrenerji();
        } catch (error) {
            console.error(error);
            prikaziObvestiloAdmin(error.message, 'danger');
        }
    }

    async function izbrisiTrenerja(id) {
        try {
            const response = await fetchZAvtentikacijo(`${API_BASE_URL}/trenerji/${id}`, {method: 'DELETE'});
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Napaka pri brisanju trenerja: ${response.statusText}`);
            }
            prikaziObvestiloAdmin('Trener uspešno izbrisan.');
            await loadTrenerji();
        } catch (error) {
            console.error(error);
            prikaziObvestiloAdmin(error.message, 'danger');
        }
    }

    loadDataForSection('ocene-trenerjev');
});