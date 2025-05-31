// www/js/pregledSporta.js
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sportId = urlParams.get('id');

    const sportNameEl = document.getElementById('sportName');
    const sportImageEl = document.getElementById('sportImage');
    const sportDescriptionEl = document.getElementById('sportDescription');
    const relatedActivitiesContainer = document.getElementById('relatedActivitiesContainer');
    const loadingActivitiesText = document.getElementById('loadingActivitiesText');
    const noActivitiesText = document.getElementById('noActivitiesText');

    if (sportId) {
        if (loadingActivitiesText) loadingActivitiesText.style.display = 'block';

        // Pridobivanje podrobnosti športa IN povezanih aktivnosti
        fetch(`/api/sport/${sportId}/details`) // Klic na posodobljen API
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (loadingActivitiesText) loadingActivitiesText.style.display = 'none';

                // 1. Prikaz informacij o športu
                if (data.sportDetails) {
                    const sport = data.sportDetails;
                    if (sportNameEl) sportNameEl.textContent = sport.ime || 'Podrobnosti športa';

                    if (sportImageEl) {
                        sportImageEl.src = sport.slikaUrl || '/slike/sporti/default-sport.png';
                        sportImageEl.alt = sport.ime || 'Slika športa';
                        sportImageEl.onerror = () => { sportImageEl.src = '/slike/sporti/default-sport.png'; };
                    }

                    if (sportDescriptionEl) {
                        sportDescriptionEl.textContent = sport.opis || 'Opis za ta šport trenutno ni na voljo.';
                    }
                } else {
                    if (sportNameEl) sportNameEl.textContent = 'Podrobnosti športa niso na voljo';
                    if (sportDescriptionEl) sportDescriptionEl.textContent = '';
                    if (sportImageEl) sportImageEl.src = '/slike/sporti/default-sport.png';
                }

                // 2. Prikaz povezanih aktivnosti
                if (data.povezaneAktivnosti && data.povezaneAktivnosti.length > 0) {
                    if (noActivitiesText) noActivitiesText.style.display = 'none';
                    relatedActivitiesContainer.innerHTML = ''; // Počisti prejšnje

                    data.povezaneAktivnosti.forEach(activity => {
                        const imageUrl = activity.SlikaAktivnosti || '/slike/sporti/default-sport.png';
                        // Oblikovanje datuma in časa (če je potrebno, sicer lahko prikažete direktno)
                        const datumZacetka = activity.Datum_Zacetka ? new Date(activity.Datum_Zacetka).toLocaleDateString('sl-SI') : 'N/A';
                        const casZacetka = activity.Cas_Zacetka || 'N/A';

                        const cardHtml = `
                            <div class="col">
                                <div class="card h-100 shadow-sm clickable-card" data-type="aktivnost" data-id="${activity.Aktivnosti_ID}">
                                    <img src="${imageUrl}" class="card-img-top card-img-top-search" alt="${activity.Naziv || 'Slika aktivnosti'}" onerror="this.src='/slike/sporti/default-sport.png';" style="height: 180px; object-fit: cover;">
                                    <div class="card-body">
                                        <h5 class="card-title">${activity.Naziv || 'Neznan naziv'}</h5>
                                        <p class="card-text"><small class="text-muted">${activity.Kraj || 'Neznana lokacija'}</small></p>
                                        <p class="card-text"><strong>Datum:</strong> ${datumZacetka}</p>
                                        <p class="card-text"><strong>Čas:</strong> ${casZacetka}</p>
                                        ${activity.PovprecnaOcena ? `<p class="card-text"><strong>Ocena:</strong> ${parseFloat(activity.PovprecnaOcena).toFixed(1)}/5 (${activity.SteviloOcen} ocen)</p>` : '<p class="card-text">Ni ocen</p>'}
                                    </div>
                                    <div class="card-footer">
                                        <a href="/html/pregledAktivnosti.html?id=${activity.Aktivnosti_ID}" class="btn btn-sm btn-primary">Več podrobnosti</a>
                                    </div>
                                </div>
                            </div>
                        `;
                        relatedActivitiesContainer.innerHTML += cardHtml;
                    });
                } else {
                    if (noActivitiesText) noActivitiesText.style.display = 'block';
                }
                addCardClickListeners(); // Ponovno dodaj event listenerje, če jih imate
            })
            .catch(error => {
                console.error('Napaka pri nalaganju podrobnosti športa:', error);
                if (loadingActivitiesText) loadingActivitiesText.style.display = 'none';
                if (sportNameEl) sportNameEl.textContent = 'Napaka pri nalaganju';
                if (sportDescriptionEl) sportDescriptionEl.textContent = 'Prosimo, poskusite znova kasneje.';
                if (relatedActivitiesContainer) relatedActivitiesContainer.innerHTML = '<p class="text-danger text-center">Prišlo je do napake pri nalaganju povezanih aktivnosti.</p>';
            });
    } else {
        if (sportNameEl) sportNameEl.textContent = 'ID športa ni določen.';
        if (sportDescriptionEl) sportDescriptionEl.textContent = 'Ne morem naložiti podrobnosti brez ID-ja športa.';
        if (noActivitiesText) noActivitiesText.style.display = 'block';
        if (loadingActivitiesText) loadingActivitiesText.style.display = 'none';
    }

    // Funkcija za dodajanje click listenerjev na kartice (če jo uporabljate za preusmeritev)
    function addCardClickListeners() {
        document.querySelectorAll('.clickable-card[data-type="aktivnost"]').forEach(card => {
            card.addEventListener('click', function(event) {
                // Prepreči proženje, če je kliknjeno na gumb znotraj kartice
                if (event.target.closest('a.btn')) {
                    return;
                }
                const aktivnostId = this.dataset.id;
                window.location.href = `/html/pregledAktivnosti.html?id=${aktivnostId}`;
            });
        });
    }
});