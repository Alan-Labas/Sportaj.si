document.addEventListener('DOMContentLoaded', async () => {

    const aktivnostForm = document.getElementById('aktivnostForm');
    const aktivnostNazivInput = document.getElementById('aktivnostNazivInput');
    const aktivnostOpisInput = document.getElementById('aktivnostOpisInput');
    const aktivnostLokacijaInput = document.getElementById('aktivnostLokacijaInput');
    const aktivnostCenaInput = document.getElementById('aktivnostCenaInput');
    const aktivnostProstaMestaInput = document.getElementById('aktivnostProstaMestaInput');
    const aktivnostSlikaUploadInput = document.getElementById('aktivnostSlikaUploadInput');
    const aktivnostTipSelect = document.getElementById('aktivnostTipSelect');
    const datumUreInput = document.getElementById('datumUreInput'); // Ujema se z ID-jem v HTML
    const nacinIzvedbeSelect = document.getElementById('nacinIzvedbeSelect');
    console.log(JSON.parse(sessionStorage.getItem('uporabnikInfo')))
    function prikaziObvestilo(sporocilo, tip = 'success') {
        // Preverimo, ali je tip sporočila napaka ('danger' ali 'warning')
        const jeNapaka = (tip === 'danger' || tip === 'warning');

        // Kličemo našo standardno funkcijo za prikaz obvestil
        showCustomAlert(sporocilo, jeNapaka);
    }

    async function loadSportiZaSelect() {
        try {
            const response = await fetch('/api/vsi-sporti');
            if (!response.ok) throw new Error('Napaka pri nalaganju športov.');
            const sporti = await response.json();

            aktivnostTipSelect.innerHTML = '<option value="" disabled selected>Izberite tip...</option>';
            sporti.forEach(sport => {
                const option = document.createElement('option');
                option.value = sport.id;
                option.textContent = sport.ime_sporta; // V server.js je to 'ime_sporta'
                aktivnostTipSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Napaka pri nalaganju športov za select:', error);
            prikaziObvestilo('Napaka pri nalaganju seznama športov. Prosim, osvežite stran.', 'danger');
        }
    }


    async function shraniAktivnost(event) {
        event.preventDefault();
        const uporabnikInfo = JSON.parse(sessionStorage.getItem('uporabnikInfo'));
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
            prikaziObvestilo('Za dodajanje aktivnosti morate biti prijavljeni.', 'danger');
            // Možna preusmeritev na prijavo
            window.location.href = 'prijava.html';
            return;
        }

        // Zberemo podatke iz obrazca
        const formData = new FormData();
        formData.append('Naziv', aktivnostNazivInput.value.trim());
        formData.append('Opis', aktivnostOpisInput.value.trim());
        formData.append('Lokacija', aktivnostLokacijaInput.value.trim());
        formData.append('Cena', aktivnostCenaInput.value);
        formData.append('ProstaMesta', aktivnostProstaMestaInput.value);
        formData.append('TK_TipAktivnosti', aktivnostTipSelect.value);
        formData.append('Datum_Cas_Izvedbe', datumUreInput.value); // Strežnik pričakuje 'Datum_Cas_Izvedbe'
        formData.append('Nacin_Izvedbe', nacinIzvedbeSelect.value);
        

        const slikaFile = aktivnostSlikaUploadInput.files[0];
        if (slikaFile) {
            formData.append('slikaAktivnosti', slikaFile);
        }

        // Validacija
        if (!formData.get('Naziv') || !formData.get('Opis') || !formData.get('Lokacija') || !formData.get('Datum_Cas_Izvedbe') || !formData.get('TK_TipAktivnosti')) {
            prikaziObvestilo('Prosimo, izpolnite vsa obvezna polja (*).', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/admin/aktivnosti', {
                method: 'POST',
                headers: {
                    // Content-Type se NE nastavlja ročno, ko uporabljamo FormData
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            console.log(result)
            if (!response.ok) {
                // Če strežnik vrne napako, jo prikažemo
                throw new Error(result.message || `Napaka strežnika: ${response.status}`);
            }

            prikaziObvestilo('Aktivnost je bila uspešno dodana!', 'success');
            aktivnostForm.reset(); // Počisti obrazec
            // Po uspešnem dodajanju lahko preusmerimo uporabnika
            //setTimeout(() => {
                //const uporabnikInfo = JSON.parse(sessionStorage.getItem('uporabnikInfo'));
                //if (uporabnikInfo && uporabnikInfo.trenerId) {
                    //window.location.href = `profilTrener.html?id=${uporabnikInfo.trenerId}`;
                //} else {
                    //window.location.href = 'index.html';
                //}
            //}, 2000);

        } catch (error) {
            console.error('Napaka pri shranjevanju aktivnosti:', error);
            prikaziObvestilo(`Napaka: ${error.message}`, 'danger');
        }
    }

    const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
    if (!uporabnikInfoString) {
        document.querySelector('main').innerHTML = '<div class="alert alert-danger">Za dostop do te strani morate biti prijavljeni.</div>';
        return;
    }
    const uporabnik = JSON.parse(uporabnikInfoString);
    if (!uporabnik.jeTrener && !uporabnik.JeAdmin) {
        document.querySelector('main').innerHTML = '<div class="alert alert-danger">Nimate ustreznih pravic za dostop do te strani.</div>';
        return;
    }

    await loadSportiZaSelect();
    if (aktivnostForm) {
        aktivnostForm.addEventListener('submit', shraniAktivnost);
    }

});