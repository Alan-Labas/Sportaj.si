document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const trainerId = parseInt(urlParams.get('id'));

    const trainerNameTitle = document.getElementById('trainerNameTitle');
    const trainerImage = document.getElementById('trainerImage');
    const trainerFullName = document.getElementById('trainerFullName');
    const trainerPhone = document.getElementById('trainerPhone');
    const trainerEmail = document.getElementById('trainerEmail');
    const trainerSchedule = document.getElementById('trainerSchedule');
    const trainerDescription = document.getElementById('trainerDescription');
    const trainerActivitiesSection = document.getElementById('trainerActivitiesSection');
    const userCommentsSection = document.getElementById('userCommentsSection');
    const starsContainer = document.getElementById('starRating');
    const currentRatingText = document.getElementById('currentRatingText');
    const commentForm = document.getElementById('commentForm');
    const commentTextElement = document.getElementById('commentText');

    const defaultProfilePicPath = '/slike/default-profile.png';

    if (!trainerId || isNaN(trainerId)) {
        if (trainerNameTitle) trainerNameTitle.textContent = 'Trener ni najden';
        console.error('ID trenerja manjka ali ni veljaven.');
        const mainContent = document.querySelector('main.container');
        if (mainContent) mainContent.innerHTML = '<p class="text-danger text-center display-6 mt-5">ID trenerja manjka ali ni veljaven. Prosimo, vrnite se na <a href="/">domačo stran</a> in poskusite znova.</p>';
        return;
    }

    async function fetchTrainerDetails(id) {
        try {
            const response = await fetch(`/api/trener/${id}/details`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Strežnik je vrnil napako ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Napaka pri pridobivanju podrobnosti trenerja ${id}:`, error);
            if (trainerNameTitle) trainerNameTitle.textContent = 'Napaka pri nalaganju';
            const mainContent = document.querySelector('main.container');
            if (mainContent) mainContent.innerHTML = `<p class="text-danger text-center display-6 mt-5">Napaka pri nalaganju podatkov o trenerju: ${error.message}. Poskusite <a href="javascript:location.reload()">osvežiti stran</a> ali se vrnite na <a href="/">domačo stran</a>.</p>`;
            return null;
        }
    }

    const trainerData = await fetchTrainerDetails(trainerId);

    if (!trainerData) return;


    if (trainerNameTitle) trainerNameTitle.textContent = `Profil: ${trainerData.ime} ${trainerData.priimek}`;
    if (trainerImage) {
        trainerImage.src = trainerData.slika ? `data:image/jpeg;base64,${trainerData.slika}` : defaultProfilePicPath;
        trainerImage.alt = `Slika ${trainerData.ime} ${trainerData.priimek}`;
    }
    if (trainerFullName) trainerFullName.textContent = `${trainerData.ime} ${trainerData.priimek}`;
    //tel in email
    if (trainerPhone) trainerPhone.innerHTML = trainerData.telefon ? `<a href="tel:${trainerData.telefon}">${trainerData.telefon}</a>` : 'Ni podatka';
    if (trainerEmail) trainerEmail.innerHTML = trainerData.email ? `<a href="mailto:${trainerData.email}">${trainerData.email}</a>` : 'Ni podatka';
    if (trainerSchedule) trainerSchedule.textContent = trainerData.urnik || 'Ni podatka';
    if (trainerDescription) trainerDescription.textContent = trainerData.OpisProfila || 'Opis ni na voljo.';


    if (trainerActivitiesSection) {
        trainerActivitiesSection.innerHTML = '<h5>Poučevane športne aktivnosti:</h5>';
        if (trainerData.aktivnosti && trainerData.aktivnosti.length > 0) {
            let activitiesHtml = '<ul class="list-group list-group-flush">';
            trainerData.aktivnosti.forEach(akt => {
                let actSlikaPath = akt.slika_aktivnosti || '/slike/default-sport.png';
                activitiesHtml += `
                    <li class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${akt.Naziv} (${akt.ime_sporta})</h6>
                            <small>${akt.Cena != null ? parseFloat(akt.Cena).toFixed(2) + ' €' : 'N/A'}</small>
                        </div>
                        <p class="mb-1"><small>Lokacija: ${akt.Lokacija}</small></p>
                    </li>`;
            });
            activitiesHtml += '</ul>';
            trainerActivitiesSection.innerHTML += activitiesHtml;
        } else {
            trainerActivitiesSection.innerHTML += '<p>Ta trener trenutno nima vpisanih aktivnosti.</p>';
        }
    }

    function generateStarsHTML(rating, interactive = false) {
        let html = '';
        const roundedRating = rating ? Math.round(parseFloat(rating) * 2) / 2 : 0;
        for (let i = 1; i <= 5; i++) {
            const starClass = i <= roundedRating ? 'fas fa-star' : (i - 0.5 === roundedRating ? 'fas fa-star-half-alt' : 'far fa-star');
            html += `<i class="${starClass}" ${interactive ? `data-value="${i}"` : ''}></i>`;
        }
        return html;
    }

    //komentraji in ocene iz baze
    function displayCommentsAndAverageRating(ocene) {
        if (userCommentsSection) {
            userCommentsSection.innerHTML = '';
            if (ocene && ocene.length > 0) {
                ocene.forEach(ocena => {
                    const commentDiv = document.createElement('div');
                    commentDiv.classList.add('card', 'mb-2');
                    const datumOcene = ocena.Datum ? new Date(ocena.Datum).toLocaleDateString('sl-SI') : 'Neznan datum';
                    const starsHTML = generateStarsHTML(ocena.Ocena);
                    commentDiv.innerHTML = `
                        <div class="card-body">
                            <h6 class="card-subtitle mb-1 text-muted">
                                ${ocena.username_uporabnika || 'Anonimen'} - <small>${datumOcene}</small>
                            </h6>
                            <div class="mb-1" style="color: #ffc107;">${starsHTML} (${ocena.Ocena || 'N/A'})</div>
                            <p class="card-text">${ocena.Komentar || 'Brez komentarja'}</p>
                        </div>`;
                    userCommentsSection.appendChild(commentDiv);
                });
            } else {
                userCommentsSection.innerHTML = '<p class="text-muted">Za tega trenerja še ni ocen.</p>';
            }
        }

        let averageRating = 0;
        if (ocene && ocene.length > 0) {
            const sum = ocene.reduce((acc, o) => acc + (parseFloat(o.Ocena) || 0), 0);
            averageRating = sum / ocene.length;
        }
        updateDisplayStars(averageRating, averageRating > 0 ? "Povprečna ocena:" : "Ni ocen", true);
    }

    displayCommentsAndAverageRating(trainerData.ocene);

    let currentUserRating = 0;

    function updateDisplayStars(ratingToDisplay, textPrefix = "Povprečna ocena:", makeInteractive = false) {
        if (starsContainer) {
            starsContainer.innerHTML = generateStarsHTML(ratingToDisplay, makeInteractive);
        }
        if (currentRatingText) {
            currentRatingText.textContent = `${textPrefix} ${ratingToDisplay ? ratingToDisplay.toFixed(1) : ''}${ratingToDisplay ? '/5' : ''}`;
        }
    }

    if (starsContainer) {
        starsContainer.addEventListener('click', (event) => {
            const targetStar = event.target.closest('i[data-value]');
            if (targetStar) {
                currentUserRating = parseInt(targetStar.dataset.value);
                updateDisplayStars(currentUserRating, "Vaša ocena:", true);
            }
        });
        starsContainer.addEventListener('mouseover', (event) => {
            const targetStar = event.target.closest('i[data-value]');
            if (targetStar) {
                const hoverValue = parseInt(targetStar.dataset.value);
                const allStars = starsContainer.querySelectorAll('i');
                allStars.forEach(s => {
                    const sValue = parseInt(s.dataset.value);
                    s.className = sValue <= hoverValue ? 'fas fa-star' : 'far fa-star';
                });
            }
        });
        starsContainer.addEventListener('mouseout', () => {
            if (currentUserRating > 0) {
                updateDisplayStars(currentUserRating, "Vaša ocena:", true);
            } else {
                let avgRat = 0;
                if (trainerData.ocene && trainerData.ocene.length > 0) {
                    const sum = trainerData.ocene.reduce((acc, o) => acc + (parseFloat(o.Ocena) || 0), 0);
                    avgRat = sum / trainerData.ocene.length;
                }
                updateDisplayStars(avgRat, avgRat > 0 ? "Povprečna ocena:" : "Ni ocen", true);
            }
        });
    }

    if (commentForm && commentTextElement) {
        commentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const komentar = commentTextElement.value.trim();

            if (!sessionStorage.getItem('accessToken')) {
                alert('Za oddajo ocene in komentarja se morate prijaviti.');
                if (typeof showLoginModal === "function") showLoginModal();
                return;
            }
            if (currentUserRating === 0) {
                alert('Prosimo, najprej ocenite trenerja s klikom na zvezdice.');
                return;
            }

            try {
                const response = await fetchZAvtentikacijo(`/api/trener/${trainerId}/ocena`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        ocena: currentUserRating,
                        komentar: komentar
                    })
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message || 'Ocena in komentar uspešno oddana!');
                    commentTextElement.value = '';
                    currentUserRating = 0;

                    const updatedTrainerData = await fetchTrainerDetails(trainerId);
                    if (updatedTrainerData) {
                        displayCommentsAndAverageRating(updatedTrainerData.ocene);
                    }
                } else {
                    alert(`Napaka: ${result.message || 'Ocene ni bilo mogoče oddati.'}`);
                }
            } catch (error) {
                console.error('Napaka pri oddaji ocene/komentarja:', error);
                alert('Prišlo je do napake pri komunikaciji s strežnikom.');
            }
        });
    }

    if (typeof preveriPrijavo === "function") {
        preveriPrijavo();
    }
});