document.addEventListener('DOMContentLoaded', async () => {
    const defaultActivityImg = '../slike/default-activity.png'; // Predpostavimo, da ta slika obstaja v /www/slike/
    const defaultSportImg = '../slike/default-sport.png';     // Predpostavimo, da ta slika obstaja v /www/slike/
    const defaultTrainerImg = '../slike/default-profile.png'; // Predpostavimo, da ta slika obstaja v /www/slike/profilne/




    async function prikazSteviloTrenerjev (){
        const prikazElement = document.getElementById('stevilo_Trenerjev');
        try {
            const response = await fetch('/api/trener/count'); // UPORABI ABSOLUTNO POT
            console.log('Status odgovora za /api/trener/count:', response.status);

            if (response.status === 304) {
                console.log('Odgovor 304: Podatki se niso spremenili. Uporabljam predpomnjeno vrednost ali ne naredim ničesar.');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Napaka pri nalaganju: ${response.statusText} (status: ${response.status})` }));
                console.error('Napaka pri pridobivanju števila trenerjev:', errorData.message);
                prikazElement.textContent = 'Napaka!';
                return;
            }

            const data = await response.json();

            if (data && typeof data.steviloTrenerjev !== 'undefined') {
                prikazElement.textContent = data.steviloTrenerjev;
            } else {
                console.error('Prejeti podatki nimajo pričakovane oblike (manjka steviloTrenerjev).');
                prikazElement.textContent = 'Ni podatka';
            }
        } catch (error) {
            console.error('Napaka pri komunikaciji s strežnikom (catch block):', error);
            if (prikazElement) {
                prikazElement.textContent = 'Napaka pri nalaganju!';
            }
        }
    }

    async function prikazSteviloOcen() {
        const prikazElement = document.getElementById('stevilo_Ocen');
        if (!prikazElement) return;

        try {
            const response = await fetch('/api/ocene/count'); // Klic na novo/popravljeno pot
            if (!response.ok) {
                throw new Error(`Napaka strežnika: ${response.status}`);
            }
            const data = await response.json();
            prikazElement.textContent = data.skupnoSteviloOcen;
        } catch (error) {
            console.error('Napaka pri pridobivanju skupnega števila ocen:', error);
            prikazElement.textContent = 'Napaka!';
        }
    }

    async function prikazSteviloSportnihAktivnosti() {
        const prikazElement = document.getElementById('stevilo_Aktivnosti');
        if (!prikazElement) {
            console.error('Element z ID-jem "stevilo_Aktivnosti" ne obstaja v HTML-ju.');
            return;
        }

        try {
            const response = await fetch('/api/aktivnost/count'); // Dodana začetna poševnica za absolutno pot
            if (!response.ok) {
                // Poskusimo prebrati sporočilo o napaki s strežnika, če obstaja
                let errorMessage = `Napaka na strežniku: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    // Če odgovor ni JSON ali je prazen, ostanemo pri osnovnem sporočilu
                }
                throw new Error(errorMessage);
            }
            const data = await response.json();
            if (data && typeof data.steviloAktivnosti !== 'undefined') {
                prikazElement.textContent = data.steviloAktivnosti;
            } else {
                console.error('Odgovor strežnika ne vsebuje pričakovanega polja "steviloAktivnosti".', data);
                prikazElement.textContent = 'Ni podatka';
            }
        } catch (error) {
            console.error('Napaka pri pridobivanju števila športnih aktivnosti:', error.message);
            prikazElement.textContent = 'Napaka pri nalaganju';
        }
    }

    await prikazSteviloTrenerjev();
    await prikazSteviloOcen();
    await prikazSteviloSportnihAktivnosti()

    // Funkcija za prikaz prihajajočih dejavnosti
    async function displayUpcomingActivities(limit = 6) {
        const container = document.getElementById('upcoming-activities-container');
        if (!container) return;

        try {
            const response = await fetch('/api/index/dejavnosti/prihajajoce?limit=6');
            if (!response.ok) throw new Error('Network response was not ok');
            const activities = await response.json();

            container.innerHTML = ''; // Počisti vsebino pred dodajanjem
            if (activities.length === 0) {
                container.innerHTML = '<p class="text-center">Trenutno ni na voljo prihajajočih dejavnosti.</p>';
                return;
            }

            activities.forEach(activity => {
                const imgSrc = activity.slika_url || '/slike/default_activity.webp';
                // Zagotovimo, da je cena numerična vrednost in jo pravilno formatiramo
                //const cenaValue = parseFloat(activity.cena);
                const cenaText = activity.cena> 0 ? `${parseFloat(activity.cena).toFixed(2)} €` : 'Brezplačno';

                const cardHtml = `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 trainer-card shadow-sm" style="cursor: pointer;" onclick="window.location.href='/html/pregledAktivnosti.html?id=${activity.Aktivnosti_ID}'">
                    <img src="${imgSrc}" class="card-img-top" alt="${activity.naziv}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${activity.naziv}</h5>
                        <p class="card-text text-muted small">${activity.ime_sporta}</p>
                        <ul class="list-unstyled text-muted small mt-auto">
                            <li><i class="fas fa-map-marker-alt fa-fw me-2"></i>${activity.lokacija_naziv || 'Neznana lokacija'}</li>
                            <li><i class="fas fa-calendar-alt fa-fw me-2"></i>${new Date(activity.datum_cas_izvedbe).toLocaleDateString('sl-SI')}</li>
                        </ul>
                    </div>
                    <div class="card-footer bg-white border-0 pb-3">
                       <div class="d-flex justify-content-between align-items-center">
                           <span class="price fw-bold">${cenaText}</span>
                           <a href="/html/pregledAktivnosti.html?id=${activity.Aktivnosti_ID}" class="btn btn-primary btn-sm">Odpri</a>
                       </div>
                    </div>
                </div>
            </div>`;
                container.innerHTML += cardHtml;
            });
        } catch (error) {
            console.error('Error fetching upcoming activities:', error);
            if (container) container.innerHTML = '<p class="text-center text-danger">Napaka pri nalaganju dejavnosti.</p>';
        }
    }

    // Funkcija za prikaz top trenerjev
    async function displayTopTrainers(limit = 6) {
        const container = document.getElementById('top-trainers-container');
        if (!container) return;

        try {
            const response = await fetch(`/api/index/trenerji/top?limit=${limit}`);
            if (!response.ok) throw new Error('Napaka pri nalaganju trenerjev.');
            const trainers = await response.json();

            container.innerHTML = ''; // Počisti placeholder
            if (trainers.length === 0) {
                container.innerHTML = '<p class="text-center col-12">Trenutno ni na voljo nobenih trenerjev.</p>';
                return;
            }

            trainers.forEach(trainer => {
                const imgSrc = trainer.ProfilnaSlikaURL || defaultTrainerImg;
                const cardHtml = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100 trainer-card shadow-sm" style="cursor: pointer;" onclick="window.location.href='/html/profilTrener.html?id=${trainer.TrenerID}'">
                         <div class="card-body">
                             <div class="d-flex align-items-center mb-3">
                                 <img src="${imgSrc}" class="rounded-circle" alt="${trainer.Ime}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;">
                                 <div>
                                     <h5 class="card-title mb-0">${trainer.Ime} ${trainer.Priimek}</h5>
                                     <span class="rating small">
                                         <i class="fas fa-star text-warning me-1"></i>
                                         ${trainer.PovprecnaOcena ? parseFloat(trainer.PovprecnaOcena).toFixed(1) : 'Ni ocen'}
                                     </span>
                                 </div>
                             </div>
                             <p class="activity-badge">${trainer.Specializacija || 'Splošni trener'}</p>
                             <ul class="list-unstyled text-muted small mt-2">
                                 <li><i class="fas fa-map-marker-alt fa-fw me-2"></i>${trainer.lokacija_trenerja || 'Neznana lokacija'}</li>
                             </ul>
                         </div>
                         <div class="card-footer bg-white border-0 pb-3">
                            <a href="/html/profilTrener.html?id=${trainer.TrenerID}" class="btn btn-outline-primary btn-sm w-100">Ogled profila</a>
                         </div>
                    </div>
                </div>`;
                container.innerHTML += cardHtml;
            });
        } catch (error) {
            console.error(error);
            container.innerHTML = '<p class="text-center text-danger col-12">Napaka pri nalaganju trenerjev.</p>';
        }
    }


    // Funkcija za prikaz top športov
    async function displayTopSports(sports) {
        const container = document.getElementById('top-sports-container'); // Pravilen ID iz index.html
        if (!container) {
            console.error('Element z ID-jem "top-sports-container" ne obstaja.');
            return;
        }
        container.innerHTML = ''; // Počisti obstoječo vsebino (placeholder bo izginil)

        const placeholder = document.getElementById('top-sports-placeholder');
        if (placeholder) placeholder.style.display = 'none';

        if (!sports || sports.length === 0) {
            container.innerHTML = '<a href="#" class="list-group-item list-group-item-action text-center">Ni športov za prikaz.</a>';
            return;
        }

        sports.forEach(sport => {
            const sportElement = document.createElement('a');
            sportElement.href = `/html/pregledSporta.html?id=${sport.Sport_ID}`;
            sportElement.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center clickable-card';
            sportElement.dataset.id = sport.Sport_ID;
            sportElement.dataset.type = 'sport';

            // Privzeta slika, če `sport.slika` ni na voljo ali je pot neveljavna
            const imgSrc = sport.slika || defaultSportImg;

            sportElement.innerHTML = `
                <span>
                    <img src="${imgSrc}" alt="${sport.Naziv_Sporta}" style="width: 32px; height: 32px; object-fit: cover; margin-right: 10px; border-radius: 0.25rem;" onerror="this.onerror=null;this.src='${defaultSportImg}';">
                    ${sport.Naziv_Sporta}
                </span>
                <span class="badge bg-primary rounded-pill">${sport.stevilo_aktivnosti || 0}</span>
            `;
            container.appendChild(sportElement);
        });
    }

    // Nalaganje vsebine za index.html
    try {
        const [activitiesRes, trainersRes, sportsRes] = await Promise.all([
            fetch('/api/index/dejavnosti/prihajajoce?limit=6'), // Popravljena pot
            fetch('/api/index/trenerji/top?limit=3'),         // Popravljena pot
            fetch('/api/index/sporti/top?limit=5')            // Popravljena pot
        ]);

        if (activitiesRes.ok) {
            const activities = await activitiesRes.json();
            await displayUpcomingActivities(activities); // Dodan await
        } else {
            console.error('Napaka pri nalaganju prihajajočih dejavnosti:', activitiesRes.status, await activitiesRes.text());
            await displayUpcomingActivities([]); // Pokaži prazno stanje
        }

        if (trainersRes.ok) {
            const trainers = await trainersRes.json();
            await displayTopTrainers(trainers); // Dodan await
        } else {
            console.error('Napaka pri nalaganju top trenerjev:', trainersRes.status, await trainersRes.text());
            await displayTopTrainers([]);
        }

        if (sportsRes.ok) {
            const sports = await sportsRes.json();
            await displayTopSports(sports); // Dodan await
        } else {
            console.error('Napaka pri nalaganju top športov:', sportsRes.status, await sportsRes.text());
            await displayTopSports([]);
        }

    } catch (error) {
        console.error('Napaka pri nalaganju vsebine za domačo stran:', error);
        // Prikaz napak ali praznih stanj za vse sekcije
        await displayUpcomingActivities([]);
        await displayTopTrainers([]);
        await displayTopSports([]);
    }


    document.body.addEventListener('click', function(event) {
        // Najde najbližji starševski element s classom 'clickable-card'
        const card = event.target.closest('.clickable-card');

        if (card) {
            // Preveri, ali je bil kliknjen gumb znotraj kartice (ki ima že svojo funkcionalnost)
            if (event.target.closest('a.btn')) {
                return; // Ne naredi ničesar, pusti gumbu, da opravi svoje delo
            }
            // Preveri, ali je kartica sama <a> element
            if (card.tagName === 'A' && card.href && card.href !== '#') {
                return; // Pusti brskalniku, da sledi href atributu
            }

            event.preventDefault(); // Prepreči privzeto akcijo samo, če ni veljaven href ali gumb

            const id = card.dataset.id;
            const type = card.dataset.type;

            if (id && type) {
                if (type === 'trener') {
                    window.location.href = `profilTrener.html?id=${id}`;
                } else if (type === 'aktivnost') {
                    window.location.href = `pregledAktivnosti.html?id=${id}`;
                } else if (type === 'sport') {
                    window.location.href = `pregledSporta.html?id=${id}`;
                }
            } else {
                // console.warn('Klik na .clickable-card brez data-id ali data-type atributa, ali pa je bil gumb.');
            }
        }
    });
});