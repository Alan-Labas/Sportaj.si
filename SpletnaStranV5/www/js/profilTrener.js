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
    const defaultProfilePicPath = '../slike/default-profile.png';

    const ocenaContainer = document.getElementById('ocenaContainer');
    const komentarFormContainer = document.getElementById('komentarFormContainer');
    const komentarjiUporabnikovContainer = document.getElementById('komentarjiUporabnikovContainer');

    const hrBeforeOcenaContainer = document.getElementById('hrBeforeOcenaContainer');
    const hrBeforeKomentarFormContainer = document.getElementById('hrBeforeKomentarFormContainer');
    const hrBeforeKomentarjiUporabnikovContainer = document.getElementById('hrBeforeKomentarjiUporabnikovContainer');


    const isLoggedIn = !!sessionStorage.getItem('accessToken');
    let isUserAdmin = false;
    const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
    if (isLoggedIn && uporabnikInfoString) {
        const uporabnik = JSON.parse(uporabnikInfoString);
        isUserAdmin = uporabnik.JeAdmin === 1;
    }

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
    if (trainerPhone) trainerPhone.innerHTML = trainerData.telefon ? `<a href="tel:${trainerData.telefon}">${trainerData.telefon}</a>` : 'Ni podatka';
    if (trainerEmail) trainerEmail.innerHTML = trainerData.email ? `<a href="mailto:${trainerData.email}">${trainerData.email}</a>` : 'Ni podatka';
    if (trainerSchedule) trainerSchedule.textContent = trainerData.urnik || 'Ni podatka';
    if (trainerDescription) trainerDescription.textContent = trainerData.OpisProfila || 'Opis ni na voljo.';

    if (trainerActivitiesSection) {
            trainerActivitiesSection.innerHTML = '<h5>Poučevane športne aktivnosti:</h5>';
            if (trainerData.aktivnosti && trainerData.aktivnosti.length > 0) {
                let activitiesHtml = '<div class="list-group">';
                trainerData.aktivnosti.forEach(akt => {
                    const slikaPath = akt.slika_aktivnosti || '../slike/default-profile.png';
                    const kratekOpis = `${akt.Naziv} (${akt.ime_sporta})`;
                    const cenaText = akt.Cena != null ? `${parseFloat(akt.Cena).toFixed(2)} €` : 'N/A';

                    activitiesHtml += `
                        <a href="/html/pregledAktivnosti.html?id=${akt.id}" class="list-group-item list-group-item-action flex-column align-items-start mb-2 shadow-sm" style="text-decoration: none; color: inherit;">
                            <div class="d-flex w-100">
                                <img src="slikaPath" alt="${akt.Naziv}" class="me-3 rounded" style="width: 100px; height: 100px; object-fit: cover;">
                                <div class="flex-grow-1">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1 fw-bold">${akt.Naziv}</h6>
                                        <small class="text-muted">Cena: ${cenaText}</small>
                                    </div>
                                    <p class="mb-1"><small>${akt.ime_sporta}</small></p>
                                    <p class="mb-1"><small class="text-muted">Lokacija: ${akt.Lokacija || 'Neznana lokacija'}</small></p>
                                </div>
                            </div>
                        </a>`;
                });
                activitiesHtml += '</div>';
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

    function displayCommentsAndAverageRating(ocene) {
        if (userCommentsSection) {
            userCommentsSection.innerHTML = '';
            if (ocene && ocene.length > 0) {
                ocene.forEach((ocena, index) => {
                    const commentDiv = document.createElement('div');
                    commentDiv.classList.add('card', 'mb-2', `comment-card-${ocena.ocena_id || index}`);
                    const datumOcene = ocena.Datum ? new Date(ocena.Datum).toLocaleDateString('sl-SI') : 'Neznan datum';
                    const starsHTML = generateStarsHTML(ocena.Ocena, false);

                    let adminDeleteButton = '';
                    if (isUserAdmin) {
                        adminDeleteButton = `<button class="btn btn-danger btn-sm float-end delete-comment-btn" data-comment-id="${ocena.ocena_id || index}">Izbriši</button>`;
                    }

                    commentDiv.innerHTML = `
                        <div class="card-body">
                            <h6 class="card-subtitle mb-1 text-muted">
                                ${ocena.username_uporabnika || 'Anonimen'} - <small>${datumOcene}</small>
                                ${adminDeleteButton}
                            </h6>
                            <div class="mb-1" style="color: #ffc107;">${starsHTML} (${ocena.Ocena || 'N/A'})</div>
                            <p class="card-text">${ocena.Komentar || 'Brez komentarja'}</p>
                        </div>`;
                    userCommentsSection.appendChild(commentDiv);
                });

                if (isUserAdmin) {
                    document.querySelectorAll('.delete-comment-btn').forEach(button => {
                        button.addEventListener('click', function() {
                            const commentId = this.dataset.commentId;
                            const commentCard = userCommentsSection.querySelector(`.comment-card-${commentId}`);
                            if (commentCard) {
                                commentCard.style.display = 'none';
                                console.log(`Komentar ${commentId} skrit (samo na front-endu).`);
                            }
                        });
                    });
                }
            } else {
                userCommentsSection.innerHTML = '<p class="text-muted">Za tega trenerja še ni ocen.</p>';
            }
        }

        let averageRating = 0;
        if (ocene && ocene.length > 0) {
            const sum = ocene.reduce((acc, o) => acc + (parseFloat(o.Ocena) || 0), 0);
            averageRating = sum / ocene.length;
        }

        updateDisplayStars(averageRating, averageRating > 0 ? "Povprečna ocena:" : "Ni ocen", isLoggedIn);
    }

    displayCommentsAndAverageRating(trainerData.ocene);

    let currentUserRating = 0;

    function updateDisplayStars(ratingToDisplay, textPrefix = "Povprečna ocena:", makeInteractive = false) {
        if (starsContainer) {
            starsContainer.innerHTML = generateStarsHTML(ratingToDisplay, makeInteractive && isLoggedIn);
        }
        if (currentRatingText) {
            currentRatingText.textContent = `${textPrefix} ${ratingToDisplay ? ratingToDisplay.toFixed(1) : ''}${ratingToDisplay ? '/5' : ''}`;
        }
    }

    if (!isLoggedIn) {
        if (ocenaContainer) ocenaContainer.style.display = 'none';
        if (komentarFormContainer) komentarFormContainer.style.display = 'none';

        if (hrBeforeOcenaContainer) hrBeforeOcenaContainer.style.display = 'none';
        if (hrBeforeKomentarFormContainer) hrBeforeKomentarFormContainer.style.display = 'none';

        if (komentarjiUporabnikovContainer && (komentarjiUporabnikovContainer.offsetParent === null || userCommentsSection.innerHTML.includes('Trenutno ni komentarjev.'))) {
             if (hrBeforeKomentarjiUporabnikovContainer) hrBeforeKomentarjiUporabnikovContainer.style.display = 'none';
        } else if (hrBeforeKomentarjiUporabnikovContainer) {
             hrBeforeKomentarjiUporabnikovContainer.style.display = 'block';
        }


        if (starsContainer) {
             starsContainer.style.pointerEvents = 'none';
        }
         if (currentRatingText && starsContainer.children.length > 0) {
            let avgRat = 0;
            if (trainerData.ocene && trainerData.ocene.length > 0) {
                const sum = trainerData.ocene.reduce((acc, o) => acc + (parseFloat(o.Ocena) || 0), 0);
                avgRat = sum / trainerData.ocene.length;
            }
            updateDisplayStars(avgRat, avgRat > 0 ? "Povprečna ocena:" : "Ni ocen", false);
        }
    } else {
        if (ocenaContainer) ocenaContainer.style.display = 'block';
        if (komentarFormContainer) komentarFormContainer.style.display = 'block';
        if (komentarjiUporabnikovContainer) komentarjiUporabnikovContainer.style.display = 'block';

        if (hrBeforeOcenaContainer) hrBeforeOcenaContainer.style.display = 'block';
        if (hrBeforeKomentarFormContainer) hrBeforeKomentarFormContainer.style.display = 'block';
        if (hrBeforeKomentarjiUporabnikovContainer) hrBeforeKomentarjiUporabnikovContainer.style.display = 'block';
    }


    if (starsContainer && isLoggedIn) {
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
                    if (sValue) {
                        s.className = sValue <= hoverValue ? 'fas fa-star' : 'far fa-star';
                    }
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

    if (commentForm && commentTextElement && isLoggedIn) {
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
    const posljiSporociloBtn = document.getElementById('posljiSporociloBtn');
    if (posljiSporociloBtn) {
        if (!isLoggedIn || (uporabnikInfoString && JSON.parse(uporabnikInfoString).jeTrener)) {
            posljiSporociloBtn.classList.add('d-none'); // Skrij gumb, če uporabnik ni prijavljen ali je sam trener
        } else {
            posljiSporociloBtn.href = `klepet.html?trenerId=${trainerId}`;
        }
    }
});