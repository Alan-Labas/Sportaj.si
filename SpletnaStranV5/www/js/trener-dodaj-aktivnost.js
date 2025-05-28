document.addEventListener('DOMContentLoaded', async () => {
    const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
    if (!uporabnikInfoString) {
        alert('Za dostop do te strani morate biti prijavljeni.');
        return;
    }

    const uporabnik = JSON.parse(uporabnikInfoString);

    if (uporabnik && typeof uporabnik.email !== 'string' && uporabnik.email.endsWith('@trener.si')) {
        alert('Nimate dovoljenja za dostop do te strani. Ta stran je namenjena samo trenerjem.');
        window.location.href = '/'; // Preusmeri na domačo stran
        return;
    }

    const idPrijavljenegaTrenerja = uporabnik.id_trenerja;

    // Pozdrav in odjava (elementi morajo obstajati v HTML)
    const pozdravUporabnikaEl = document.getElementById('pozdravUporabnika');
    if (pozdravUporabnikaEl) {
        pozdravUporabnikaEl.textContent = `Trener: ${uporabnik.username || uporabnik.ime}`;
    }

    const odjavaBtn = document.getElementById('odjavaBtn');
    if (odjavaBtn) {
        odjavaBtn.addEventListener('click', () => {
            // Funkcija odjava() mora biti na voljo globalno (npr. iz PrijavaInRegistracija.js)
            if (typeof odjava === 'function') {
                odjava(false, "Uspešno ste se odjavili.");
            } else {
                console.error('Funkcija za odjavo ni na voljo.');
                sessionStorage.removeItem('uporabnikInfo');
                sessionStorage.removeItem('token');
                window.location.href = '/';
            }
        });
    }


    const aktivnostForm = document.getElementById('aktivnostForm');
    const aktivnostNazivInput = document.getElementById('aktivnostNazivInput');
    const aktivnostOpisInput = document.getElementById('aktivnostOpisInput');
    const aktivnostLokacijaInput = document.getElementById('aktivnostLokacijaInput');
    const aktivnostCenaInput = document.getElementById('aktivnostCenaInput');
    const aktivnostProstaMestaInput = document.getElementById('aktivnostProstaMestaInput');
    const aktivnostSlikaUploadInput = document.getElementById('aktivnostSlikaUploadInput');
    const aktivnostTipSelect = document.getElementById('aktivnostTipSelect');
    // Polje za izbiro trenerja ni potrebno, saj bo ID trenerja samodejno dodeljen

    const shraniAktivnostBtn = document.getElementById('shraniAktivnostBtn');

    // Funkcija za prikaz obvestil (mora biti definirana ali pa uporabite obstoječo)
    function prikaziObvestilo(sporocilo, tip = 'success', elementId = 'obvestiloSporocilo') {
        const container = document.getElementById(elementId);
        if (!container) {
            console.warn(`Element z ID '${elementId}' za prikaz obvestil ne obstaja.`);
            alert(sporocilo); // Fallback na alert
            return;
        }
        container.innerHTML = `<div class="alert alert-${tip}" role="alert">${sporocilo}</div>`;
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000); // Obvestilo izgine po 5 sekundah
    }

    // Naloži tipe aktivnosti (športe) v select polje
    async function loadSportiZaSelect(selectElement) {
        try {
            const response = await fetch(`/api/vsi-sporti`);
            if (!response.ok) throw new Error('Napaka pri nalaganju športov.');
            const sporti = await response.json();
            selectElement.innerHTML = '<option value="">Izberite tip...</option>'; //
            sporti.forEach(s => {
                selectElement.innerHTML += `<option value="${s.id}">${s.Sport}</option>`;
            });
        } catch (error) {
            console.error('Napaka pri nalaganju športov za select:', error);
            prikaziObvestilo('Napaka pri nalaganju seznamov športov. Prosim, osvežite stran.', 'danger');
        }
    }

    await loadSportiZaSelect(aktivnostTipSelect);

    // Funkcija za shranjevanje aktivnosti
    async function shraniAktivnost() {
        const naziv = aktivnostNazivInput.value.trim();
        const opis = aktivnostOpisInput.value.trim();
        const lokacija = aktivnostLokacijaInput.value.trim();
        const cena = aktivnostCenaInput.value;
        const prostaMesta = aktivnostProstaMestaInput.value;
        const tipAktivnosti = aktivnostTipSelect.value;

        if (!naziv || !opis || !lokacija || cena === '' || prostaMesta === '' || !tipAktivnosti) {
            prikaziObvestilo('Izpolnite vsa obvezna polja (*) pravilno.', 'warning');
            return;
        }
        if (isNaN(parseFloat(cena)) || parseFloat(cena) < 0 || isNaN(parseInt(prostaMesta)) || parseInt(prostaMesta) < 0 || isNaN(parseInt(tipAktivnosti))) {
            prikaziObvestilo('Cena, prosta mesta in tip aktivnosti morajo biti veljavna pozitivna števila.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('Naziv', naziv);
        formData.append('Opis', opis);
        formData.append('Lokacija', lokacija);
        formData.append('Cena', parseFloat(cena));
        formData.append('ProstaMesta', parseInt(prostaMesta));
        formData.append('TK_TipAktivnosti', parseInt(tipAktivnosti));
        //formData.append('TK_Trener', idPrijavljenegaTrenerja); // Samodejno dodeli ID prijavljenega trenerja

        if (aktivnostSlikaUploadInput.files.length > 0) {
            formData.append('slikaAktivnosti', aktivnostSlikaUploadInput.files[0]);
        }

        const url = `/api/admin/aktivnosti`; // Uporabimo obstoječo pot, ki podpira trenerje
        const method = 'POST';

        try {
            // Funkcija fetchZAvtentikacijo mora biti na voljo globalno (npr. iz PrijavaInRegistracija.js)
            if (typeof fetchZAvtentikacijo !== 'function') {
                throw new Error('Funkcija fetchZAvtentikacijo ni na voljo.');
            }
            const response = await fetchZAvtentikacijo(url, {
                method: method,
                body: formData
                // Content-Type se ne nastavlja ročno pri FormData, brskalnik to stori sam
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || `Napaka pri shranjevanju aktivnosti: ${response.statusText}`);
            }

            prikaziObvestilo(responseData.message || 'Aktivnost uspešno dodana.', 'success');
            aktivnostForm.reset(); // Počisti obrazec po uspešnem dodajanju
            await loadSportiZaSelect(aktivnostTipSelect); // Ponovno naloži, če se obrazec resetira
        } catch (error) {
            console.error('Napaka pri shranjevanju aktivnosti:', error);
            prikaziObvestilo(error.message || 'Prišlo je do napake pri shranjevanju.', 'danger');
        }
    }

    if (shraniAktivnostBtn) {
        shraniAktivnostBtn.addEventListener('click', shraniAktivnost);
    } else {
        console.error("Gumb 'shraniAktivnostBtn' ni najden.");
    }
});