// V datoteki SpletnaStranV5/www/js/search-stran.js
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchCategorySelect = document.getElementById('searchCategory');
    const searchLocationInput = document.getElementById('searchLocation');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');

    async function performSearch(searchTerm, category, location) {
        if (resultsPlaceholder) resultsPlaceholder.style.display = 'block';
        resultsContainer.innerHTML = '';

        let queryParams = new URLSearchParams();
        if (searchTerm) {
            if (category === 'trenerji') queryParams.append('ime', searchTerm); // Lahko išče po imenu ali priimku, server podpira 'like'
            else if (category === 'sport') queryParams.append('Sport', searchTerm);
            else if (category === 'sportna_aktivnost') queryParams.append('Naziv', searchTerm);
        }
        if (location) {
            queryParams.append('Lokacija', location);
        }

        if (!category && searchCategorySelect) {
            category = searchCategorySelect.value;
        }

        if (!category) {
            if (resultsPlaceholder) {
                resultsPlaceholder.innerHTML = '<p class="text-center mt-2">Prosimo, izberite kategorijo za iskanje.</p>';
                resultsPlaceholder.style.display = 'block';
            }
            resultsTitle.textContent = 'Iskanje';
            return;
        }

        const apiUrl = `/api/search/${category}?${queryParams.toString()}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Napaka pri iskanju: ${response.statusText}`);
            }
            const data = await response.json();
            const searchResults = data[0];
            const appliedFilters = data[1];

            displayResults(searchResults, category, appliedFilters);
        } catch (error) {
            console.error('Napaka pri iskanju:', error);
            resultsTitle.textContent = 'Napaka pri iskanju';
            resultsContainer.innerHTML = `<p class="text-danger col-12">${error.message}</p>`;
        } finally {
            if (resultsPlaceholder) resultsPlaceholder.style.display = 'none';
        }
    }

    function displayResults(results, category, filters) {
        resultsContainer.innerHTML = '';

        let filterText = "";
        if (filters && Object.keys(filters).length > 0) {
            filterText = Object.entries(filters)
                .filter(([key, value]) => value && value.trim() !== '')
                .map(([key, value]) => `${value}`)
                .join(', ');
        }

        let categoryName = category;
        if (category === 'sportna_aktivnost') categoryName = 'dejavnosti';
        else if (category === 'sport') categoryName = 'športi';
        else if (category === 'trenerji') categoryName = 'trenerji';


        resultsTitle.textContent = filterText ? `Rezultati iskanja za ${categoryName}: ${filterText}` : `Vsi rezultati za kategorijo: ${categoryName}`;

        if (!results || results.length === 0) {
            resultsContainer.innerHTML = '<p class="text-muted col-12">Ni rezultatov za vaše iskanje.</p>';
            return;
        }

        results.forEach(item => {
            let cardHtml = '';
            if (category === 'trenerji') {
                // item.slika bi morala biti pravilna pot ali base64 iz strežnika
                const imageUrl = item.slika || '/slike/profilne/default-profile.png';
                cardHtml = `
                    <div class="col">
                        <div class="card h-100 shadow-sm clickable-card" data-type="trener" data-id="${item.id}">
                            <img src="${imageUrl}" class="card-img-top card-img-top-search" alt="${item.ime} ${item.priimek}" onerror="this.src='/slike/profilne/default-profile.png';">
                            <div class="card-body">
                                <h5 class="card-title">${item.ime} ${item.priimek}</h5>
                                <p class="card-text text-muted small">${(item.OpisProfila || 'Opis ni na voljo.').substring(0, 70)}...</p>
                                ${item.povprecna_ocena ? `<p class="card-text"><small class="text-warning">${generateStars(item.povprecna_ocena)} (${parseFloat(item.povprecna_ocena).toFixed(1)})</small></p>` : '<p class="card-text"><small class="text-muted">Ni ocen</small></p>'}
                            </div>
                        </div>
                    </div>`;
            } else if (category === 'sport') {
                // item.slika bi morala biti pot, ki jo je sestavil strežnik
                const imageUrl = item.slika || '/slike/sporti/default-sport.png';
                cardHtml = `
                    <div class="col">
                        <div class="card h-100 shadow-sm clickable-card" data-type="sport" data-id="${item.id}">
                            <img src="${imageUrl}" class="card-img-top card-img-top-search" alt="${item.Sport}" onerror="this.src='/slike/sporti/default-sport.png';">
                            <div class="card-body text-center">
                                <h5 class="card-title">${item.Sport}</h5>
                            </div>
                        </div>
                    </div>`;
            } else if (category === 'sportna_aktivnost') {
                // item.slika bi morala biti pravilna pot ali base64 iz strežnika
                const imageUrl = item.slika || '/slike/sporti/default-sport.png';
                cardHtml = `
                    <div class="col">
                        <div class="card h-100 shadow-sm clickable-card" data-type="aktivnost" data-id="${item.id}">
                            <img src="${imageUrl}" class="card-img-top card-img-top-search" alt="${item.Naziv}" onerror="this.src='/slike/sporti/default-sport.png';">
                            <div class="card-body">
                                <h5 class="card-title">${item.Naziv}</h5>
                                <p class="card-text mb-1"><small class="text-muted">Lokacija: ${item.Lokacija || 'Neznana'}</small></p>
                                <p class="card-text mb-1"><small>Šport: ${item.ime_sporta || 'Neznan'}</small></p>
                                <p class="card-text"><small>Cena: ${item.Cena != null ? parseFloat(item.Cena).toFixed(2) + ' €' : 'N/A'}</small></p>
                            </div>
                        </div>
                    </div>`;
            }
            resultsContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    function generateStars(rating) {
        const numStars = Math.round(parseFloat(rating));
        if (isNaN(numStars) || numStars <= 0) return '☆☆☆☆☆';
        return '★'.repeat(numStars) + '☆'.repeat(5 - numStars);
    }

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const searchTerm = searchInput.value.trim();
        const category = searchCategorySelect.value;
        const location = searchLocationInput.value.trim();

        // Posodobimo URL ob iskanju preko forme
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set('category', category);
        if (searchTerm) currentParams.set('term', searchTerm); else currentParams.delete('term');
        if (location) currentParams.set('location', location); else currentParams.delete('location');
        // Odstranimo sport_id, če izvajamo novo splošno iskanje
        currentParams.delete('sport_id');

        window.history.pushState({}, '', `${window.location.pathname}?${currentParams.toString()}`);
        performSearch(searchTerm, category, location);
    });

    resultsContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.clickable-card');
        if (card) {
            const type = card.dataset.type;
            const id = card.dataset.id;
            if (type === 'trener') {
                window.location.href = `profilTrener.html?id=${id}`;
            } else if (type === 'aktivnost') {
                window.location.href = `pregledAktivnosti.html?id=${id}`;
            } else if (type === 'sport') {
                // Preusmeritev na novo stran pregledSporta.html
                window.location.href = `pregledSporta.html?id=${id}`;
            }
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category');
    const initialSearchTerm = urlParams.get('term');
    const initialLocation = urlParams.get('location');
    // const initialSportId = urlParams.get('sport_id'); // To bi obravnavala stran pregledSporta.html ali pa search-stran, če bi filtrirala aktivnosti

    if (initialCategory) {
        searchCategorySelect.value = initialCategory;
        // Če je v URL term, ga vpišemo v iskalno polje
        if (initialSearchTerm) {
            searchInput.value = initialSearchTerm;
        }
        if (initialLocation) {
            searchLocationInput.value = initialLocation;
        }
        performSearch(initialSearchTerm || '', initialCategory, initialLocation || '');
    } else {
        if (resultsPlaceholder) {
            resultsPlaceholder.innerHTML = '<p class="text-center mt-2">Začnite z iskanjem ali izberite kategorijo preko navigacije.</p>';
            resultsPlaceholder.style.display = 'block';
        }
        resultsContainer.innerHTML = '';
        resultsTitle.textContent = 'Iskanje';
    }
});