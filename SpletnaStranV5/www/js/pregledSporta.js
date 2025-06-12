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

        fetch(`/api/sport/${sportId}/details`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (loadingActivitiesText) loadingActivitiesText.style.display = 'none';

                if (sportNameEl) sportNameEl.textContent = data.ime_sporta || 'Podrobnosti športa';

                if (sportImageEl) {
                    const imageName = (data.ime_sporta || '').toLowerCase().replace(/\s+/g, '-').replace(/[čć]/g, 'c').replace(/[š]/g, 's').replace(/[ž]/g, 'z');
                    sportImageEl.src = `/slike/${imageName}.png`;
                    sportImageEl.alt = data.ime_sporta || 'Slika športa';
                    sportImageEl.onerror = () => { sportImageEl.src = '/slike/default-sport.png'; };
                }

                if (sportDescriptionEl) {
                    sportDescriptionEl.textContent = data.opis_sporta || 'Opis za ta šport trenutno ni na voljo.';
                }


                if (data.aktivnosti && data.aktivnosti.length > 0) {
                    if (noActivitiesText) noActivitiesText.style.display = 'none';
                    if (relatedActivitiesContainer) relatedActivitiesContainer.innerHTML = ''; // Počisti prejšnje

                    data.aktivnosti.forEach(activity => {
                        const imageUrl = activity.slika_aktivnosti || '/slike/default-sport.png';
                        const cenaText = activity.Cena != null ? `${parseFloat(activity.Cena).toFixed(2)} €` : 'N/A';
                        const trenerText = activity.trener_ime ? `<strong>Trener:</strong> ${activity.trener_ime} ${activity.trener_priimek}` : '';

                        const cardHtml = `
                    <div class="col">
                        <div class="card h-100 shadow-sm clickable-card" data-type="aktivnost" data-id="${activity.id}">
                            <img src="${imageUrl}" class="card-img-top card-img-top-search" alt="${activity.Naziv || 'Slika aktivnosti'}" onerror="this.src='/slike/default-sport.png';" style="height: 180px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">${activity.Naziv || 'Neznan naziv'}</h5>
                                <p class="card-text"><small class="text-muted">📍 ${activity.Lokacija || 'Neznana lokacija'}</small></p>
                                <p class="card-text">${trenerText}</p>
                            </div>
                            <div class="card-footer d-flex justify-content-between align-items-center">
                                <span class="fw-bold text-primary">${cenaText}</span>
                                <a href="/html/pregledAktivnosti.html?id=${activity.id}" class="btn btn-sm btn-outline-primary">Več</a>
                            </div>
                        </div>
                    </div>
                `;
                        if (relatedActivitiesContainer) relatedActivitiesContainer.innerHTML += cardHtml;
                    });
                } else {
                    if (noActivitiesText) noActivitiesText.style.display = 'block';
                }
                addCardClickListeners();
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