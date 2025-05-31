document.addEventListener('DOMContentLoaded', () => {
    // Obstoječe funkcije iz PrijavaInRegistracija.js (npr. preveriPrijavoZaIndex()) naj ostanejo.
    // Dodamo klic novih funkcij za nalaganje vsebine:
    loadUpcomingActivities();
    loadTopTrainers();
    loadTopSports();
});

// Funkcija za prikaz sporočila o napaki ali praznem stanju
function displayMessage(containerId, message, isError = false) {
    const container = document.getElementById(containerId);
    if (container) {
        const placeholder = document.getElementById(containerId.replace('-container', '-placeholder'));
        if(placeholder) placeholder.remove();
        container.innerHTML = `<div class="col-12"><p class="text-muted ${isError ? 'text-danger' : ''}">${message}</p></div>`;
    }
}

function displayUpcomingActivities(activities) {
    const container = document.getElementById('upcoming-activities-container');
    const placeholder = document.getElementById('upcoming-activities-placeholder');
    if (!container) return;
    container.innerHTML = ''; // Počisti placeholder ali prejšnje vsebine

    if (activities && activities.length > 0) {
        if(placeholder) placeholder.remove();
        activities.forEach(activity => {
            const imageUrl = activity.slika_url || '/slike/sporti/default-sport.png'; // Uporabi slika_url iz API-ja
            const cardHtml = `
                <div class="col">
                    <div class="card h-100 shadow-sm clickable-card" data-type="aktivnost" data-id="${activity.Aktivnosti_ID}">
                        <img src="${imageUrl}" class="card-img-top" alt="${activity.naziv}" onerror="this.src='/slike/sporti/default-sport.png';" style="height: 180px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${activity.naziv}</h5>
                            <p class="card-text mb-1"><small class="text-muted">Šport: ${activity.ime_sporta}</small></p>
                            <p class="card-text"><small class="text-muted">Kdaj: ${new Date(activity.datum_cas_izvedbe).toLocaleString('sl-SI')}</small></p>
                            <p class="card-text"><small class="text-muted">Kje: ${activity.lokacija_naziv}</small></p>
                        </div>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    } else {
        if(placeholder) placeholder.innerHTML = '<p class="text-muted col-12">Trenutno ni prihajajočih dejavnosti.</p>';
        else container.innerHTML = '<p class="text-muted col-12">Trenutno ni prihajajočih dejavnosti.</p>';
    }
}

// Funkcija za prikaz top trenerjev (primer)
function displayTopTrainers(trainers) {
    const container = document.getElementById('top-trainers-container');
    const placeholder = document.getElementById('top-trainers-placeholder');
    if (!container) return;
    container.innerHTML = '';

    if (trainers && trainers.length > 0) {
        if(placeholder) placeholder.remove();
        trainers.forEach(trainer => {
            const imageUrl = trainer.ProfilnaSlikaURL || '../slike/default-profile.png';
            const trainerFullName = `${trainer.Ime || ''} ${trainer.Priimek || ''}`.trim();
            cardHtml = `
                <div class="col">
                    <div class="card h-100 shadow-sm clickable-card" data-type="trener" data-id="${trainer.TrenerID}">
                        <img src="${imageUrl}" class="card-img-top" alt="${trainerFullName}" onerror="this.src='/slike/profilne/default-profile.png';" style="height: 180px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${trainerFullName}</h5>
                            <p class="card-text text-muted small">${(trainer.Specializacija || 'Specializacija ni na voljo.').substring(0,70)}...</p>
                            ${trainer.PovprecnaOcena ? `<p class="card-text"><small class="text-warning">${generateStars(trainer.PovprecnaOcena)} (${trainer.PovprecnaOcena})</small></p>` : '<p class="card-text"><small class="text-muted">Ni ocen</small></p>'}
                        </div>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    } else {
        if(placeholder) placeholder.innerHTML = '<p class="text-muted col-12">Ni podatkov o trenerjih.</p>';
        else container.innerHTML = '<p class="text-muted col-12">Ni podatkov o trenerjih.</p>';
    }
}

function displayTopSports(sports) {
    const container = document.getElementById('top-sports-container');
    const placeholder = document.getElementById('top-sports-placeholder');
    if (!container) return;
    container.innerHTML = ''; // Počisti placeholder in prejšnje

    if (sports && sports.length > 0) {
        if(placeholder) placeholder.remove();
        sports.forEach(sport => {
            // Strežnik v /api/sporti/top že vrača 'slika' polje s pravilno potjo
            const imageUrl = sport.slika;
            const sportElement = document.createElement('a');
            sportElement.href = `/html/pregledSporta.html?id=${sport.Sport_ID}`; // Direktna povezava
            sportElement.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center clickable-card';
            sportElement.dataset.id = sport.Sport_ID;
            sportElement.dataset.type = 'sport';

            sportElement.innerHTML = `
                <span>
                    <img src="${imageUrl}" alt="${sport.Naziv_Sporta}" style="width: 30px; height: 30px; object-fit: contain; margin-right: 10px;" onerror="this.src='/slike;">
                    ${sport.Naziv_Sporta}
                </span>
                <span class="badge bg-primary rounded-pill">${sport.stevilo_aktivnosti || 0}</span>
            `;
            container.appendChild(sportElement);
        });
    } else {
        if(placeholder) placeholder.innerHTML = '<div class="list-group-item"><p class="text-muted">Ni podatkov o športih.</p></div>';
        else container.innerHTML = '<div class="list-group-item"><p class="text-muted">Ni podatkov o športih.</p></div>';
    }
}


function generateStars(rating) {
    const numStars = Math.round(parseFloat(rating));
    if (isNaN(numStars) || numStars <= 0) return '☆☆☆☆☆';
    return '★'.repeat(numStars) + '☆'.repeat(5 - numStars);
}


document.addEventListener('DOMContentLoaded', async () => {
    // Nalaganje vsebine za index.html
    try {
        const [activitiesRes, trainersRes, sportsRes] = await Promise.all([
            fetch('/api/dejavnosti/prihajajoce?limit=6'),
            fetch('/api/trenerji/top?limit=3'),
            fetch('/api/sporti/top?limit=5')
        ]);

        if (activitiesRes.ok) {
            const activities = await activitiesRes.json();
            displayUpcomingActivities(activities);
        } else {
            console.error('Napaka pri nalaganju prihajajočih dejavnosti:', activitiesRes.statusText);
            displayUpcomingActivities([]); // Pokaži prazno stanje
        }

        if (trainersRes.ok) {
            const trainers = await trainersRes.json();
            displayTopTrainers(trainers);
        } else {
            console.error('Napaka pri nalaganju top trenerjev:', trainersRes.statusText);
            displayTopTrainers([]);
        }

        if (sportsRes.ok) {
            const sports = await sportsRes.json();
            displayTopSports(sports);
        } else {
            console.error('Napaka pri nalaganju top športov:', sportsRes.statusText);
            displayTopSports([]);
        }

    } catch (error) {
        console.error('Napaka pri nalaganju vsebine za domačo stran:', error);
        // Prikaz napak ali praznih stanj za vse sekcije
        displayUpcomingActivities([]);
        displayTopTrainers([]);
        displayTopSports([]);
    }

    // Event listener za klik na kartice (če ni rešeno z direktnimi href povezavami)
    // Če imajo .clickable-card elementi že pravilen href, ta listener ni nujno potreben zanje.
    // Vendar, če ostane, mora biti popravljen.
    document.body.addEventListener('click', function(event) {
        const card = event.target.closest('.clickable-card');
        if (card) {
            // Če ima kartica že href, bo brskalnik sledil povezavi.
            // Ta koda je relevantna, če href ni prisoten ali če želimo dodatno logiko.
            if (card.tagName === 'A' && card.href && card.href !== '#' && !card.href.startsWith('javascript:')) {
                // Pusti brskalniku, da sledi href atributu
                return;
            }
            event.preventDefault(); // Prepreči privzeto akcijo samo, če ni veljaven href

            const id = card.dataset.id;
            const type = card.dataset.type;

            if (id && type) {
                if (type === 'trener') {
                    window.location.href = `/html/profilTrener.html?id=${id}`;
                } else if (type === 'aktivnost') {
                    window.location.href = `/html/pregledAktivnosti.html?id=${id}`;
                } else if (type === 'sport') {
                    // Ta preusmeritev je zdaj že v href atributu za športne elemente
                    // Če element ni <a> z veljavnim href, potem ta koda poskrbi za preusmeritev
                    window.location.href = `/html/pregledSporta.html?id=${id}`;
                }
            } else {
                console.warn('Klik na .clickable-card brez data-id ali data-type atributa.');
            }
        }
    });
});