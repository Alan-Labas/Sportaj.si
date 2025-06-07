document.addEventListener('DOMContentLoaded', () => {
    const searchQueryInput = document.getElementById('searchQuery');
    const searchLocationInput = document.getElementById('location');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');

    // Gumb za iskanje v search-form
    const mainSearchButton = document.querySelector('.search-form .search-button-wrapper button');
    if (mainSearchButton) {
        mainSearchButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Preberemo vrednosti iz polj in jih damo v URL, nato kličemo performSearch
            const urlParams = new URLSearchParams(window.location.search);
            if (searchQueryInput) urlParams.set('term', searchQueryInput.value);
            if (searchLocationInput) urlParams.set('location', searchLocationInput.value);
            history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
            performSearch();
        });
    }

    const defaultProfileImg = '/slike/default-profile.png';
    const defaultSportImg = '/slike/default-sport.png';
    const defaultActivityImg = '/slike/default_activity.webp';

    async function performSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const term = urlParams.get('term') || '';
        const location = urlParams.get('location') || '';
        const tip = urlParams.get('tip');
        const datum = urlParams.get('datum');

        if (!category) {
            resultsTitle.textContent = 'Kategorija iskanja ni določena.';
            resultsContainer.innerHTML = '<p class="text-center">Prosimo, izberite kategorijo (Trenerji, Šport, Aktivnosti) preko navigacije.</p>';
            if(resultsPlaceholder) resultsPlaceholder.style.display = 'none';
            return;
        }

        if (resultsPlaceholder) resultsPlaceholder.style.display = 'block';
        resultsTitle.textContent = 'Iskanje...';
        resultsContainer.innerHTML = '';

        try {
            const apiQueryParams = new URLSearchParams();
            if (term) apiQueryParams.set('term', term);
            if (location) apiQueryParams.set('location', location);
            if (tip) apiQueryParams.set('tip', tip);
            if (datum) apiQueryParams.set('datum', datum);

            const response = await fetch(`/api/search/${category}?${apiQueryParams.toString()}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Napaka pri iskanju. Status: " + response.status }));
                throw new Error(errorData.message || 'Neznana napaka');
            }

            const data = await response.json();
            if (resultsPlaceholder) resultsPlaceholder.style.display = 'none';
            displayResults(data, category);

        } catch (error) {
            console.error('Napaka pri pridobivanju rezultatov iskanja:', error);
            resultsTitle.textContent = 'Prišlo je do napake pri iskanju.';
            if (resultsPlaceholder) resultsPlaceholder.style.display = 'none';
        }
    }

    function displayResults(responseData, category) {
        resultsContainer.innerHTML = '';

        if (!responseData || !Array.isArray(responseData) || responseData.length < 2) {
            resultsTitle.textContent = 'Ni rezultatov za vaše iskanje ali pa je odgovor strežnika nepopoln.';
            return;
        }

        const results = responseData[0];
        const filtersUsed = responseData[1];

        let filterTextParts = [];
        if (filtersUsed.term) filterTextParts.push(`izraz: "${filtersUsed.term}"`);
        if (filtersUsed.location) filterTextParts.push(`lokacija: "${filtersUsed.location}"`);
        if (filtersUsed.tip) filterTextParts.push(`tip: "${filtersUsed.tip}"`);
        if (filtersUsed.datum === 'danes') filterTextParts.push(`datum: "danes"`);

        const filterString = filterTextParts.length > 0 ? ` (Filtri: ${filterTextParts.join(', ')})` : '';

        let categoryName;
        switch(category) {
            case "trenerji": categoryName = "Trenerji"; break;
            case "sport": categoryName = "Športi"; break;
            case "Sportna_Aktivnost": categoryName = "Športne aktivnosti"; break;
            default: categoryName = "Rezultati";
        }

        resultsTitle.textContent = results.length > 0 ? `Rezultati iskanja za "${categoryName}"${filterString}` : `Ni rezultatov za "${categoryName}"${filterString}`;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="text-center">Za izbrane kriterije ni bilo najdenih zadetkov.</p>';
            return;
        }

        results.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-4';
            let cardHtml = '';

            if (category === 'trenerji') {
                const imageSrc = item.slika || defaultProfileImg;
                cardHtml = `
                    <div class="card h-100 shadow-sm clickable-card" onclick="window.location.href='profilTrener.html?id=${item.id}'">
                        <img src="${imageSrc}" class="card-img-top" alt="${item.ime} ${item.priimek}" style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${item.ime || ''} ${item.priimek || ''}</h5>
                            <p class="card-text small text-muted">
                                Specializacija: ${item.specializacija || 'Ni podatka'}<br>
                                Lokacija: ${item.lokacija_trenerja || 'Ni podatka'}
                            </p>
                        </div>
                        <div class="card-footer bg-transparent border-top-0">
                             <a href="profilTrener.html?id=${item.id}" class="btn btn-sm btn-outline-primary w-100">Ogled profila</a>
                        </div>
                    </div>`;
            } else if (category === 'Sportna_Aktivnost') {
                const imageSrc = item.slika || defaultActivityImg;
                const cenaText = item.cena > 0 ? `${parseFloat(item.cena).toFixed(2)} €` : 'Brezplačno';
                cardHtml = `
                    <div class="card h-100 shadow-sm clickable-card" onclick="window.location.href='pregledAktivnosti.html?id=${item.id}'">
                        <img src="${imageSrc}" class="card-img-top" alt="${item.ime_aktivnosti}" style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${item.ime_aktivnosti || 'Neznana aktivnost'}</h5>
                            <p class="card-text small text-muted">
                                Šport: ${item.ime_sporta || 'Ni podatka'}<br>
                                Lokacija: ${item.lokacija_aktivnosti || 'Ni podatka'}<br>
                                Trener: ${item.ime_trenerja || 'Ni navedeno'}
                            </p>
                        </div>
                        <div class="card-footer bg-white border-0 pb-3">
                           <div class="d-flex justify-content-between align-items-center">
                               <span class="price fw-bold">${cenaText}</span>
                               <a href="pregledAktivnosti.html?id=${item.id}" class="btn btn-primary btn-sm">Odpri</a>
                           </div>
                        </div>
                    </div>`;
            }
            col.innerHTML = cardHtml;
            resultsContainer.appendChild(col);
        });
    }

    function initializePage() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const term = urlParams.get('term') || '';
        const location = urlParams.get('location') || '';

        if (!category) {
            if(resultsPlaceholder) {
                resultsPlaceholder.style.display = 'block';
                resultsPlaceholder.innerHTML = '<p class="text-center mt-2">Prosimo, izberite kategorijo (Trenerji, Šport, Aktivnosti) preko navigacije za začetek iskanja.</p>';
            }
            resultsContainer.innerHTML = '';
            resultsTitle.textContent = 'Iskanje';
            return;
        }

        if (searchQueryInput) searchQueryInput.value = term;
        if (searchLocationInput) searchLocationInput.value = location;

        performSearch();
    }

    initializePage();
});