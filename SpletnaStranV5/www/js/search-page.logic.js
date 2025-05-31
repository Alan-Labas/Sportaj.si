import { handleDynamicItemClick } from "./activePage.js"; // Če je ta funkcija še relevantna za klik na kartice

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm'); // Formular na search-stran.html
    const searchInput = document.getElementById('searchInput'); // Glavno iskalno polje
    const searchCategorySelect = document.getElementById('searchCategory'); // Select za kategorijo
    const searchLocationInput = document.getElementById('searchLocation'); // Polje za lokacijo
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder'); // Placeholder element

    // Predpomnimo elemente iz navbarja za lažji dostop in posodabljanje 'active' stanja
    const navbarLinks = document.querySelectorAll('.navbar-nav .nav-link[data-page]');

    // Mapa za API tabele (iz seacrhh.js)
    const apiTableMap = {
        dejavnosti: "sportna_aktivnost",
        sport: "sport",
        trenerji: "trenerji"
    };

    // Funkcija za prikaz zvezdic (če je potrebna, lahko jo vzamete iz loadSearchResultsPage.js)
    function generateStars(rating) {
        const numStars = Math.round(parseFloat(rating));
        if (isNaN(numStars) || numStars <= 0) return '☆☆☆☆☆'; // Privzeto, če ni ocene
        return '★'.repeat(numStars) + '☆'.repeat(5 - numStars);
    }

    // Funkcija za prikaz rezultatov (združena in prilagojena iz loadSearchResultsPage.js)
    function displayResults(resultsData, category) {
        if (resultsPlaceholder) resultsPlaceholder.style.display = 'none';
        resultsContainer.innerHTML = ''; // Počisti prejšnje rezultate

        // API endpoint /api/search/:table vrača [formattedResult, filters]
        // Zato moramo dostopati do prvega elementa polja za rezultate
        const searchResults = resultsData[0];
        const appliedFilters = resultsData[1] || {}; // Vzamemo filtre ali prazen objekt

        let filterTextParts = [];
        for (const key in appliedFilters) {
            if (appliedFilters[key] && appliedFilters[key].trim() !== '') {
                // Uporabimo bolj opisne ključe, če je mogoče
                let displayKey = key;
                if (key === 'ime' && category === 'trenerji') displayKey = 'Trener';
                else if (key === 'Sport' && category === 'sport') displayKey = 'Šport';
                else if (key === 'Naziv' && category === 'dejavnosti') displayKey = 'Dejavnost';
                else if (key === 'Lokacija') displayKey = 'Lokacija';

                filterTextParts.push(appliedFilters[key]);
            }
        }
        const filterText = filterTextParts.join(', ');
        resultsTitle.textContent = filterText ? `Rezultati iskanja za: ${filterText}` : `Vsi rezultati za kategorijo: ${category.charAt(0).toUpperCase() + category.slice(1)}`;


        if (!searchResults || searchResults.length === 0) {
            resultsContainer.innerHTML = '<p class="text-muted col-12">Ni rezultatov za vaše iskanje.</p>';
            return;
        }

        searchResults.forEach(item => {
            let cardHtml = '';
            const defaultProfileImg = '/slike/default-profile.png';
            const defaultSportImg = '/slike/default-sport.png';

            if (category === 'trenerji') {
                const imageUrl = item.slika_profila_url || defaultProfileImg;
                cardHtml = `
                    <div class="col">
                        <div class="card h-100 shadow-sm clickable-card" data-type="trener" data-id="${item.id_trenerja}">
                            <img src="${imageUrl}" class="card-img-top card-img-top-search" alt="${item.ime} ${item.priimek}" onerror="this.src='${defaultProfileImg}';">
                            <div class="card-body">
                                <h5 class="card-title">${item.ime} ${item.priimek}</h5>
                                <p class="card-text text-muted small">${(item.OpisProfila || 'Opis ni na voljo.').substring(0, 70)}...</p>
                                ${item.povprecna_ocena ? `<p class="card-text"><small class="text-warning">${generateStars(item.povprecna_ocena)} (${parseFloat(item.povprecna_ocena).toFixed(1)})</small></p>` : '<p class="card-text"><small class="text-muted">Ni ocen</small></p>'}
                            </div>
                        </div>
                    </div>`;
            } else if (category === 'sport') {
                // Predpostavimo, da ime športa lahko uporabimo za generiranje poti do slike
                const sportImageName = item.Sport ? item.Sport.toLowerCase().replace(/\s+/g, '-') + '.png' : 'default-sport.png';
                const imageUrl = `/slike/${sportImageName}`;
                cardHtml = `
                    <div class="col">
                        <div class="card h-100 shadow-sm clickable-card" data-type="sport" data-id="${item.id_sporta}">
                             <img src="${imageUrl}" class="card-img-top card-img-top-search" alt="${item.Sport || 'Šport'}" onerror="this.src='${defaultSportImg}';">
                            <div class="card-body text-center">
                                <h5 class="card-title">${item.Sport || 'Neznan šport'}</h5>
                            </div>
                        </div>
                    </div>`;
            } else if (category === 'dejavnosti') { // 'sportna_aktivnost' iz API-ja, 'dejavnosti' iz selecta
                const imageUrl = item.slika_url || defaultSportImg;
                cardHtml = `
                    <div class="col">
                        <div class="card h-100 shadow-sm clickable-card" data-type="aktivnost" data-id="${item.id_aktivnosti}">
                            <img src="${imageUrl}" class="card-img-top card-img-top-search" alt="${item.Naziv}" onerror="this.src='${defaultSportImg}';">
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

        // Ponovno poveži event listenerje za klik na novo dodane kartice
        if (typeof handleDynamicItemClick === 'function') {
            document.querySelectorAll('.clickable-card').forEach(card => {
                card.removeEventListener('click', handleDynamicItemClick); // Odstrani stare listenerje
                card.addEventListener('click', handleDynamicItemClick); // Dodaj nove
            });
        }
    }


    // Funkcija za izvedbo iskanja (prilagojena iz seacrhh.js)
    async function performSearch() {
        const searchTerm = searchInput.value.trim();
        const categoryValue = searchCategorySelect.value; // vrednost iz selecta: 'trenerji', 'sport', 'dejavnosti'
        const locationTerm = searchLocationInput.value.trim();
        const table = apiTableMap[categoryValue]; // Dobimo ime tabele za API

        if (!table) {
            console.error('Neznana kategorija za iskanje:', categoryValue);
            resultsContainer.innerHTML = '<p class="text-danger col-12">Napaka: Izbrana je neveljavna kategorija.</p>';
            return;
        }

        if (resultsPlaceholder) resultsPlaceholder.style.display = 'block';
        resultsContainer.innerHTML = ''; // Počisti prejšnje rezultate

        const urlParams = new URLSearchParams();
        if (searchTerm) {
            // Prilagodimo ključ glede na kategorijo
            if (categoryValue === 'trenerji') urlParams.append('ime', searchTerm); // Lahko bi iskali po 'ime', 'priimek', 'OpisProfila'
            else if (categoryValue === 'sport') urlParams.append('Sport', searchTerm);
            else if (categoryValue === 'dejavnosti') urlParams.append('Naziv', searchTerm); // Lahko tudi 'Opis'
        }
        if (locationTerm) {
            urlParams.append('Lokacija', locationTerm);
        }

        const API_URL = 'http://localhost:3000/api/search/';
        const fullUrl = new URL(`${API_URL}${table}`);
        fullUrl.search = urlParams.toString();

        try {
            const response = await fetch(fullUrl);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Poskusi prebrati JSON napako
                throw new Error(errorData.message || `Napaka pri pridobivanju podatkov: ${response.status}`);
            }
            const data = await response.json();
            displayResults(data, categoryValue); // Podamo 'categoryValue' za pravilno renderiranje kartic

            // Posodobi URL, da odraža iskalne parametre (opcijsko, za boljšo UX in deljenje)
            const currentPath = window.location.pathname;
            const newUrlParams = new URLSearchParams();
            newUrlParams.append('category', categoryValue);
            if(searchTerm) newUrlParams.append('term', searchTerm);
            if(locationTerm) newUrlParams.append('location', locationTerm);
            window.history.pushState({path: `${currentPath}?${newUrlParams.toString()}`}, '', `${currentPath}?${newUrlParams.toString()}`);

        } catch (error) {
            console.error('Napaka pri klicu API-ja:', error);
            resultsTitle.textContent = 'Napaka pri iskanju';
            resultsContainer.innerHTML = `<p class="text-danger col-12">${error.message}</p>`;
        } finally {
            if (resultsPlaceholder) resultsPlaceholder.style.display = 'none';
        }
    }

    // Listener za oddajo forme
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            performSearch();
        });
    }

    // Listener za klik na navbar linke (na tej search-stran.html)
    navbarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageCategory = this.dataset.page;

            // Posodobi 'active' class na navbarju
            navbarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Nastavi vrednost v select polju
            searchCategorySelect.value = pageCategory;
            // Počisti iskalna polja
            searchInput.value = '';
            searchLocationInput.value = '';
            // Sproži iskanje za vse elemente v tej kategoriji
            performSearch();
        });
    });

    // Funkcija za inicializacijo strani glede na URL parametre
    function initializePage() {
        const urlParams = new URLSearchParams(window.location.search);
        const initialCategory = urlParams.get('category');
        const initialSearchTerm = urlParams.get('term');
        const initialLocation = urlParams.get('location');

        let categoryToLoad = 'trenerji'; // Privzeta kategorija, če ni podana

        if (initialCategory && apiTableMap[initialCategory]) {
            categoryToLoad = initialCategory;
            searchCategorySelect.value = initialCategory;
            if (initialSearchTerm) searchInput.value = initialSearchTerm;
            if (initialLocation) searchLocationInput.value = initialLocation;
        } else if (initialCategory) {
            console.warn(`Neznana kategorija v URL: ${initialCategory}. Nalagam privzeto.`);
        }

        // Posodobi 'active' class na navbarju
        navbarLinks.forEach(l => {
            l.classList.remove('active');
            if (l.dataset.page === categoryToLoad) {
                l.classList.add('active');
            }
        });
        searchCategorySelect.value = categoryToLoad; // Zagotovi, da je select pravilno nastavljen

        performSearch(); // Izvedemo iskanje ob nalaganju
    }

    // Inicializacija strani
    initializePage();

    // Preveri stanje prijave
    if (typeof preveriPrijavo === "function") {
        preveriPrijavo();
    }
    // Posodobi leto v nogi
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
});