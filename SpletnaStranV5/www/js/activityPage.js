// SpletnaStranV5/www/js/activityPage.js
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const aktivnostId = urlParams.get('id');

    if (!aktivnostId) {
        document.body.innerHTML = '<div class="alert alert-danger">Manjka ID aktivnosti.</div>';
        return;
    }

    // --- FUNKCIJE ---
    function prikaziPodatke(data) {
        document.getElementById('activityNameTitle').textContent = data.Naziv || "Neznana aktivnost";
        document.title = `Sportaj.si - ${data.Naziv || "Aktivnost"}`;
        document.getElementById('activityImage').src = data.slika || '../slike/default-sport.png';
        document.getElementById('activityDescription').textContent = data.Opis || 'Opis ni na voljo.';
        document.getElementById('activitySport').textContent = data.ime_sporta_aktivnosti || 'Ni podatka';
        document.getElementById('activityDate').textContent = new Date(data.Datum_Cas_Izvedbe).toLocaleString('sl-SI');
        document.getElementById('activityLocation').textContent = data.Lokacija || 'Ni podatka';
        document.getElementById('activityProstaMesta').textContent = `${data.ProstaMesta} / ${data.MaxMesta || data.ProstaMesta}`;
        document.getElementById('activityNacinIzvedbe').textContent = data.Nacin_Izvedbe || 'Ni podatka';
        document.getElementById('activityPrice').textContent = data.Cena > 0 ? `${parseFloat(data.Cena).toFixed(2)} €` : 'Brezplačno';

        const trenerCard = document.getElementById('activityTrainerCard');
        if (data.trener_id) {
            trenerCard.style.display = 'block';
            document.getElementById('activityTrainerImg').src = data.slika_trenerja || '../slike/default-profile.png';
            document.getElementById('activityTrainerFullName').textContent = `${data.trener_ime} ${data.trener_priimek}`;
            document.getElementById('activityTrainerEmail').textContent = data.trener_kontakt_email || '';
            document.getElementById('activityTrainerPhone').textContent = data.trener_telefon || '';
            trenerCard.onclick = () => window.location.href = `profilTrener.html?id=${data.trener_id}`;
        } else {
            trenerCard.style.display = 'none';
        }

        prikaziGumbZaPrijavo(data);
        prikaziKomentarje(data.ocene);
    }

    function prikaziGumbZaPrijavo(aktivnost) {
        const container = document.getElementById('prijava-container');
        const uporabnikInfo = JSON.parse(sessionStorage.getItem('uporabnikInfo'));

        if (!uporabnikInfo) {
            container.innerHTML = `<p class="text-muted">Za prijavo se morate <a href="prijava.html?redirect=${window.location.pathname + window.location.search}">prijaviti</a>.</p>`;
            return;
        }

        if (uporabnikInfo.jeTrener || uporabnikInfo.JeAdmin) {
            container.innerHTML = `<p class="text-muted small">Kot trener ali administrator se ne morete prijaviti na aktivnosti.</p>`;
            return;
        }

        if (aktivnost.jePrijavljen) {
            container.innerHTML = `<button id="btn-odjava" class="btn btn-danger w-100">Odjavi se</button>`;
            document.getElementById('btn-odjava').addEventListener('click', () => obravnavajOdjavo(aktivnost.id));
        } else if (aktivnost.ProstaMesta <= 0) {
            container.innerHTML = `<button class="btn btn-secondary w-100" disabled>Ni prostih mest</button>`;
        } else {
            container.innerHTML = `<button id="btn-prijava" class="btn btn-success w-100">Prijavi se</button>`;
            document.getElementById('btn-prijava').addEventListener('click', () => obravnavajPrijavo(aktivnost.id));
        }
    }

    function prikaziKomentarje(ocene) {
        const commentsSection = document.getElementById('activityUserCommentsSection');
        const commentFormContainer = document.getElementById('ocenjevanjeInKomentiranjeCard');
        const uporabnikInfo = JSON.parse(sessionStorage.getItem('uporabnikInfo'));

        commentsSection.innerHTML = '';
        if (!ocene || ocene.length === 0) {
            commentsSection.innerHTML = '<p class="text-muted mb-0">Za to aktivnost še ni komentarjev.</p>';
        } else {
            ocene.forEach(ocena => {
                const stars = '★'.repeat(ocena.ocena_vrednost) + '☆'.repeat(5 - ocena.ocena_vrednost);
                const commentHTML = `
                    <div class="mb-3">
                        <strong>${ocena.username_uporabnika}</strong>
                        <span class="text-warning ms-2">${stars}</span>
                        <p class="mb-0">${ocena.komentar_ocene || '<i>Brez komentarja.</i>'}</p>
                        <small class="text-muted">${new Date(ocena.datum_ocene).toLocaleDateString('sl-SI')}</small>
                    </div><hr>`;
                commentsSection.innerHTML += commentHTML;
            });
        }

        if (uporabnikInfo && !uporabnikInfo.jeTrener && !uporabnikInfo.JeAdmin) {
            commentFormContainer.style.display = 'block';
        } else {
            commentFormContainer.style.display = 'none';
        }
    }

    async function fetchZAvtentikacijo(url, options = {}) {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
        }
        const response = await fetch(url, options);
        if (response.status === 401 && !url.includes('/prijava')) {
            window.location.href = `prijava.html?redirect=${window.location.pathname + window.location.search}`;
        }
        return response;
    }

    async function naloziPodrobnosti() {
        try {
            const response = await fetchZAvtentikacijo(`/api/aktivnost/${aktivnostId}/details`);
            if (!response.ok) throw new Error('Aktivnost ni najdena.');
            const data = await response.json();
            prikaziPodatke(data);
        } catch (error) {
            document.getElementById('activity-details-container').innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    async function obravnavajPrijavo(id) {
        const gumb = document.getElementById('btn-prijava');
        gumb.disabled = true;
        gumb.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Prijavljam...`;

        const response = await fetchZAvtentikacijo(`/api/aktivnosti/${id}/prijava`, { method: 'POST' });
        const result = await response.json();

        if (response.ok) {
            showCustomAlert(result.message);
            naloziPodrobnosti(); // Osveži podatke
        } else {
            showCustomAlert(`Napaka: ${result.message}`, true);
            gumb.disabled = false;
            gumb.textContent = 'Prijavi se';
        }
    }

    async function obravnavajOdjavo(id) {
        const gumb = document.getElementById('btn-odjava');
        gumb.disabled = true;
        gumb.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Odjavljam...`;

        const response = await fetchZAvtentikacijo(`/api/aktivnosti/${id}/odjava`, { method: 'POST' });
        const result = await response.json();

        if (response.ok) {
            showCustomAlert(result.message);
            naloziPodrobnosti(); // Osveži podatke
        } else {
            showCustomAlert(`Napaka: ${result.message}`, true);
            gumb.disabled = false;
            gumb.textContent = 'Odjavi se';
        }
    }

    document.getElementById('activityCommentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const selectedRating = form.querySelector('input[name="rating"]:checked');
        const komentar = form.querySelector('#activityCommentText').value.trim();
        const gumb = form.querySelector('button[type="submit"]');

        if (!selectedRating) {
            showCustomAlert('Prosimo, izberite oceno s klikom na zvezdice.', true);
            return;
        }

        gumb.disabled = true;
        gumb.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Objavljam...`;

        const response = await fetchZAvtentikacijo(`/api/aktivnosti/${aktivnostId}/ocene`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ocena: selectedRating.value, komentar: komentar })
        });
        const result = await response.json();

        if (response.ok) {
            showCustomAlert(result.message);
            form.reset();
            naloziPodrobnosti();
        } else {
            showCustomAlert(`Napaka: ${result.message}`, true);
        }

        gumb.disabled = false;
        gumb.textContent = 'Objavi';
    });


    // Inicializacija
    naloziPodrobnosti();
});