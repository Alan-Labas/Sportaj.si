document.addEventListener('DOMContentLoaded', () => {
    //Podatki iz baze
    //kasnje z API
    const allTrainersData = [
        {
            id: 1, 
            TK_Uporabnik: 1,
            ime: 'Marko',
            priimek: 'Skace',
            telefon: '070176253', 
            email: 'markoskace@gmail.com',
            urnik: 'Pon: 16:00-18:00, Sre: 17:00-19:00, Pet: 16:00-18:00',
            OpisProfila: 'Izkušen nogometni strateg.',
            slika: '../slike/trenerji/MarkoSkace.avif'
        },
        {
            id: 2,
            TK_Uporabnik: 2,
            ime: 'Luka',
            priimek: 'Novak',
            telefon: '041576293',
            email: 'luka.novak@gmail.com',
            urnik: 'Tor: 18:00-20:00, Čet: 18:00-20:00, Sob: 10:00-12:00',
            OpisProfila: 'Motivator na košarkarskem igrišču.',
            slika: '../slike/trenerji/LukaNovak.jpg'
        },
        {
            id: 3,
            TK_Uporabnik: 3,
            ime: 'Tina',
            priimek: 'Kovačič',
            telefon: '051237458',
            email: 'tina.kovacic@gmail.com',
            urnik: 'Pon: 17:00-18:30, Sre: 17:00-18:30, Pet: 08:00-09:30',
            OpisProfila: 'Strokovnjakinja za tekaške discipline.',
            slika: '../slike/trenerji/LukaNovak.jpg' 
        },
        {
            id: 4,
            TK_Uporabnik: 4,
            ime: 'Jure',
            priimek: 'Zupančič',
            telefon: '040547630',
            email: 'jure.zupancic@gmail.com',
            urnik: 'Tor: 07:00-09:00 (bazen), Čet: 16:00-18:00 (bazen)',
            OpisProfila: 'Navdušen učitelj plavalnih tehnik.',
            slika: '../slike/trenerji/LukaNovak.jpg' 
        },
        {
            id: 5,
            TK_Uporabnik: 5,
            ime: 'Maja',
            priimek: 'Jereb',
            telefon: '070987654',
            email: 'maja.jereb@gmail.com',
            urnik: 'Pon: 15:00-17:00, Sre: 15:00-17:00, Sob: 09:00-11:00',
            OpisProfila: 'Specialistka za razvoj teniških talentov.',
            slika: '../slike/trenerji/LukaNovak.jpg' 
        },
        {
            id: 6,
            TK_Uporabnik: 6,
            ime: 'Neža',
            priimek: 'Tomić',
            telefon: '031678912',
            email: 'neza.tomic@gmail.net',
            urnik: 'Tor: 19:00-21:00, Čet: 19:00-21:00',
            OpisProfila: 'Predana razvoju odbojkarskih veščin.',
            slika: '../slike/trenerji/LukaNovak.jpg' 
        },
        {
            id: 7,
            TK_Uporabnik: 7,
            ime: 'David',
            priimek: 'Zajc',
            telefon: '041298736',
            email: 'david.zajc@gmail.com',
            urnik: 'Pon: 18:30-20:00, Sre: 18:30-20:00, Pet: 17:00-18:30',
            OpisProfila: 'Trener z poudarkom na ekipnem duhu.',
            slika: '../slike/trenerji/LukaNovak.jpg' 
        },
        {
            id: 8,
            TK_Uporabnik: 8,
            ime: 'Katarina',
            priimek: 'Vidmar',
            telefon: '051823907',
            email: 'katarina.vidmar@gmail.com',
            urnik: 'Sob: 09:00-13:00 (skupinske vožnje), Ned: po dogovoru (individualno)',
            OpisProfila: 'Strastna kolesarka in mentorica.',
            slika: '../slike/trenerji/LukaNovak.jpg' 
        },
        {
            id: 9,
            TK_Uporabnik: 9,
            ime: 'Matevž',
            priimek: 'Kralj',
            telefon: '031235678',
            email: 'matevz.kralj@gmail.si',
            urnik: 'Tor: 20:00-21:30, Čet: 20:00-21:30, Sob: 11:00-12:30',
            OpisProfila: 'Učitelj discipline in boksarske tehnike.',
            slika: '../slike/trenerji/LukaNovak.jpg' 
        },
        {
            id: 10,
            TK_Uporabnik: 10,
            ime: 'Simona',
            priimek: 'Smerdu',
            telefon: '070176253', 
            email: 'simona.smerdu@gmail.net',
            urnik: 'Sre: 10:00-12:00, Pet: 14:00-16:00, Ned: 09:00-11:00 (igrišče)',
            OpisProfila: 'Izpopolnjevanje vaše golf igre.',
            slika: '../slike/trenerji/LukaNovak.jpg'
        }
    ];

    // id iz url (profilTrener.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const trainerId = parseInt(urlParams.get('id'));

    let trainerData;
    if (trainerId && !isNaN(trainerId)) {
        trainerData = allTrainersData.find(t => t.id === trainerId);
    } else {
        
        // za demonstracijo samo 1. trener
        trainerData = allTrainersData[0];
        if (!trainerData) {
            console.error('Ni podatkov o trenerjih za prikaz.');
            document.getElementById('trainerNameTitle').textContent = 'Trener ni najden';
            return;
        }
    }
    
    if (!trainerData) {
        document.getElementById('trainerNameTitle').textContent = 'Trener ni najden';
        console.error(`Trener z ID ${trainerId} ni najden.`);
        return;
    }


    // Prikaz podatkov o trenerju
    document.getElementById('trainerNameTitle').textContent = `Profil: ${trainerData.ime} ${trainerData.priimek}`;
    document.getElementById('trainerImage').src = trainerData.slika;
    document.getElementById('trainerImage').alt = `Slika ${trainerData.ime} ${trainerData.priimek}`;
    document.getElementById('trainerFullName').textContent = `${trainerData.ime} ${trainerData.priimek}`;
    document.getElementById('trainerPhone').textContent = trainerData.telefon;
    document.getElementById('trainerEmail').textContent = trainerData.email;
    document.getElementById('trainerSchedule').textContent = trainerData.urnik;
    document.getElementById('trainerDescription').textContent = trainerData.OpisProfila;

    //zvezdice
    const stars = document.querySelectorAll('#starRating .fa-star');
    let currentTrainerRating = 0; //iz baze

    function updateStars(rating) {
        stars.forEach(star => {
            if (parseInt(star.dataset.value) <= rating) {
                star.classList.remove('far'); 
                star.classList.add('fas');   
            } else {
                star.classList.remove('fas'); 
                star.classList.add('far');   
            }
        });
        document.getElementById('currentRatingText').textContent = `Vaša ocena: ${rating}/5`;
    }
    
    
    function displayAverageRating(avgRating) {
        const roundedRating = Math.round(avgRating * 2) / 2;
        stars.forEach(star => {
            const starValue = parseFloat(star.dataset.value);
            if (starValue <= roundedRating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else if (starValue - 0.5 === roundedRating) {
                star.classList.remove('far');
                star.classList.add('fa-star-half-alt'); 
                star.classList.add('fas'); 
            }
            else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
         document.getElementById('currentRatingText').textContent = `Povprečna ocena: ${avgRating ? avgRating.toFixed(1) : 'N/A'}/5`;
    }

    //zvezdice iz baze
    const fetchAverageRating = (trainerId) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const mockRatings = { 1: 4.5, 2: 3.0, 3: 5.0 }; 
                resolve(mockRatings[trainerId] || 0);
            }, 500);
        });
    };

    fetchAverageRating(trainerData.id).then(avgRating => {
        displayAverageRating(avgRating);
    });


    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const hoverValue = parseInt(star.dataset.value);
            stars.forEach(s => {
                s.classList.toggle('fas', parseInt(s.dataset.value) <= hoverValue);
                s.classList.toggle('far', parseInt(s.dataset.value) > hoverValue);
            });
        });

        star.addEventListener('mouseout', () => {
            if (currentTrainerRating > 0) {
                 updateStars(currentTrainerRating);
            } else {
                fetchAverageRating(trainerData.id).then(avgRating => { // Ponovno pridobi povprečno
                    displayAverageRating(avgRating);
                });
            }
        });

        //prikaze toliko kolikor smo izbrali
        star.addEventListener('click', () => {
            currentTrainerRating = parseInt(star.dataset.value);
            updateStars(currentTrainerRating);
            console.log(`Trener ${trainerData.id} ocenjen z: ${currentTrainerRating} zvezdicami.`);
             fetchAverageRating(trainerData.id).then(avgRating => { 
                });
        });
    });

    // komentarji
    const commentForm = document.getElementById('commentForm');
    const commentText = document.getElementById('commentText');
    const userCommentsSection = document.getElementById('userCommentsSection');

    //fake obstojeci kometarji
    const loadComments = (trainerId) => {
        const mockComments = {
            1: [
                { user: "Ana K.", text: "Super trener, zelo priporočam!", date: "15.05.2025" },
                { user: "Marko P.", text: "Odlične vaje, že vidim napredek.", date: "12.05.2025" }
            ],
            2: [
                { user: "Luka Z.", text: "Treningi so naporni, ampak učinkoviti.", date: "18.05.2025" }
            ]
        };
        const comments = mockComments[trainerId] || [];
        userCommentsSection.innerHTML = ''; 

        if (comments.length > 0) {
            comments.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('card', 'mb-2');
                commentDiv.innerHTML = `
                    <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted">${comment.user} - <small>${comment.date}</small></h6>
                        <p class="card-text">${comment.text}</p>
                    </div>
                `;
                userCommentsSection.appendChild(commentDiv);
            });
        } else {
            userCommentsSection.innerHTML = '<p class="text-muted">Trenutno ni komentarjev.</p>';
        }
    };

    loadComments(trainerData.id); 

    commentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const comment = commentText.value.trim();
        if (comment && currentTrainerRating > 0) { 
            console.log(`Komentar za trenerja ${trainerData.id}: ${comment}, Ocena: ${currentTrainerRating}`);
             const newComment = { user: "Trenutni Uporabnik", text: comment, date: new Date().toLocaleDateString('sl-SI') };
             if (userCommentsSection.querySelector('p.text-muted')) {
                 userCommentsSection.innerHTML = '';
             }
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('card', 'mb-2');
            commentDiv.innerHTML = `
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">${newComment.user} - <small>${newComment.date}</small></h6>
                    <p class="card-text">${newComment.text}</p>
                </div>
            `;
            userCommentsSection.prepend(commentDiv); //nov komentar na vrh


            commentText.value = ''; 
        } else if (!comment) {
            alert('Prosimo, vnesite komentar.');
        } else {
            alert('Prosimo, najprej ocenite trenerja (kliknite na zvezdice).');
        }
    });

    //PRIJAVA IN REG
    if (typeof preveriPrijavo === "function") {
        preveriPrijavo();
    }

});
