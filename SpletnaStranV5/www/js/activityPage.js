import {fetchData} from './activePage.js'

document.addEventListener('DOMContentLoaded', async() =>{
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = parseInt(urlParams.get('id'));

    const activityNameTitle = document.getElementById('activityNameTitle');
    const activityImage = document.getElementById('activityImage');
    const activityTrainerCard = document.getElementById('activityTrainerCard')
    const activityTrainerFullName = document.getElementById('activityTrainerFullName');
    const activityTrainerPhone = document.getElementById('activityTrainerPhone');
    const activityTrainerEmail = document.getElementById('activityTrainerEmail');
    const activityDescription = document.getElementById('activityDescription');
    const userCommentsSection = document.getElementById('activityUserCommentsSection');

    const starsContainer = document.getElementById('activityStarRating');
    const currentRatingText = document.getElementById('activityCurrentRatingText');
    const commentForm = document.getElementById('activityCommentForm');
    const commentTextElement = document.getElementById('activityCommentText');

    const ocenjevanjeInKomentiranjeCard = document.getElementById('ocenjevanjeInKomentiranjeCard');


    const activityDate = document.getElementById('activityDate');
    const activityLocation = document.getElementById('activityLocation')
    const similarActivitiesSection = document.getElementById('similarActivitiesSection');
    const aktivnostId = new URLSearchParams(window.location.search).get('id');


    const defaultProfilePicPath = '../slike/sporti/atlettrening.jfif';

    const isLoggedIn = !!sessionStorage.getItem('accessToken');

    if (aktivnostId) {
        naloziPodrobnostiAktivnosti(aktivnostId);
    }

    if (!isLoggedIn) {
        if (ocenjevanjeInKomentiranjeCard) {
            ocenjevanjeInKomentiranjeCard.style.display = 'none';
        }
    } else {
        if (ocenjevanjeInKomentiranjeCard) {
            ocenjevanjeInKomentiranjeCard.style.display = 'block'; // Ali 'flex', odvisno od originalnega stila
        }
    }


    if(!activityId || isNaN(activityId)){
        if(activityNameTitle) activityNameTitle.textContent = 'Aktivnost ni najdena';
        console.error('ID aktivnosti manjka ali ni veljaven.');
        const mainContent = document.querySelector('main.container');
        if (mainContent) mainContent.innerHTML = '<p class="text-danger text-center display-6 mt-5">ID aktivnosti manjka ali ni veljaven. Prosimo, vrnite se na <a href="/">domačo stran</a> in poskusite znova.</p>';
        return;
    }

    const activityData = await fetchData(`/api/aktivnost/${activityId}/details`);
    console.log(await activityData);
    if(!activityData) return;
    activityData.slika = activityData.slika
    document.getElementById('activityCommentForm').id = activityId;
    if(activityNameTitle) activityNameTitle.textContent = `${activityData.Naziv}`;
    if(activityImage){
        activityImage.src = activityData.slika ? `${activityData.slika}` : defaultProfilePicPath;
        activityImage.alt = `Slika ${activityData.slika}`;
    }
    if (activityTrainerFullName) activityTrainerFullName.textContent = `${activityData.trener_ime} ${activityData.trener_priimek}`;
    if (activityTrainerPhone) activityTrainerPhone.innerHTML = activityData.trener_telefon ? `${activityData.trener_telefon}` : 'Ni podatka';
    if (activityTrainerEmail) activityTrainerEmail.innerHTML = activityData.trainer_email ? `${trainerData.email}` : 'Ni podatka';

    if(activityDescription) activityDescription.innerHTML = activityData.Opis ? `${activityData.Opis}` : 'Ni podatka';
    if(activityLocation) activityLocation.textContent = activityData.Lokacija ? `${activityData.Lokacija}` : 'Ni podatka';
    if(activityTrainerCard) activityTrainerCard.id = activityData.id;
    if(commentForm) commentForm.id = activityData.id;
    document.getElementById('activitySport').textContent = activityData.ime_sporta;
    activityTrainerCard.addEventListener('click', ()=>{
        window.location.href = `/html/profilTrener.html?id=${activityData.TK_Trener}`
    })

    if (commentForm) {
        commentForm.addEventListener('submit', async(e)=>{
            e.preventDefault();
            const isLoggedInSubmit = !!sessionStorage.getItem('accessToken');
            const uporabnikInfoStringSubmit = sessionStorage.getItem('uporabnikInfo');
            if (!isLoggedInSubmit || !uporabnikInfoStringSubmit) {
                const globalAlert = document.getElementById('activityGlobalAlertMessage');
                if (globalAlert && typeof prikaziObvestilo === 'function') {
                    prikaziObvestilo('Za komentiranje se morate prijaviti.', 'activityGlobalAlertMessage', 'text-danger', 3000);
                } else {
                    alert('Za komentiranje se morate prijaviti.');
                }
                return;
            }

            const comment = commentForm.querySelector('#activityCommentText').value;
            const activityIdForm = commentForm.id;
            console.log(activityIdForm)
            const user = JSON.parse(sessionStorage.getItem('uporabnikInfo'));
            console.log(user);

            try{
                const response = await fetch(`${API_URL}/komentiraj`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({userId: user.userId, komentar:comment, activityId:activityData.id})
                });
                if(response.ok){
                    const res = await response.json();
                    console.log('Uspešno ste dodali komentar.', res)
                    if (typeof prikaziObvestilo === 'function') {
                         prikaziObvestilo('Komentar uspešno dodan!', 'activityGlobalAlertMessage', 'text-success', 3000);
                    } else {
                        alert('Komentar uspešno dodan!');
                    }
                    commentForm.querySelector('#activityCommentText').value = '';
                    // Optionally, refresh comments section
                    const params = new URLSearchParams({activityId : activityData.id});
                    const comments = await fetchData(`${API_URL}/getKomentarji?${params.toString()}`);
                    if(comments && userCommentsSection){
                        userCommentsSection.innerHTML = comments.map(comment =>{
                            return `
                                <div class="w-100  d-flex mb-1 rounded shadow " style="max-height:fit-content;" >
                                  <div class="" style="max-width: 50px;max-height:fit-content;">
                                      <img id="userPic" src="../slike/profilne/profileIcon.avif" style="margin-right:10px;max-width: 40px;border-radius:20px">
                                  </div>
                                  <div id="commentb" class="flex-fill d-flex flex-column  ">
                                      <div class="h-25 d-flex  " style="" >
                                        <p style="font-size: 15px;" id="userName">@${comment.username}</p>
                                      </div>
                                      <div class="d-flex align-items-center " style="max-height: fit-content;;">
                                          <p style="margin-left:5px;">${comment.komentar}</p>
                                      </div>
                                  </div>
                              </div>
                            `
                        }).join('');
                    }

                } else {
                    const errRes = await response.json().catch(() => ({message: 'Neznana napaka strežnika.'}));
                     if (typeof prikaziObvestilo === 'function') {
                         prikaziObvestilo(`Napaka: ${errRes.message}`, 'activityGlobalAlertMessage', 'text-danger', 3000);
                    } else {
                        alert(`Napaka: ${errRes.message}`);
                    }
                }
            }catch(err){
                console.error('Napaka pri objavljanju komentarja: ',err);
                if (typeof prikaziObvestilo === 'function') {
                    prikaziObvestilo('Napaka pri komunikaciji s strežnikom.', 'activityGlobalAlertMessage', 'text-danger', 3000);
                } else {
                    alert('Napaka pri komunikaciji s strežnikom.');
                }
            }

        });
    }


    const prijavaNaAktivnostBtn = document.getElementById('gumbPrijavaAktivnost');
    if (prijavaNaAktivnostBtn) {
        prijavaNaAktivnostBtn.addEventListener('click', async()=>{
            const isLoggedInSubmit = !!sessionStorage.getItem('accessToken');
            const uporabnikInfoStringSubmit = sessionStorage.getItem('uporabnikInfo');
            if (!isLoggedInSubmit || !uporabnikInfoStringSubmit) {
                const globalAlert = document.getElementById('activityGlobalAlertMessage');
                if (globalAlert && typeof prikaziObvestilo === 'function') {
                    prikaziObvestilo('Za prijavo na aktivnost se morate prijaviti.', 'activityGlobalAlertMessage', 'text-danger', 3000);
                } else {
                    alert('Za prijavo na aktivnost se morate prijaviti.');
                }
                return;
            }

            const user = JSON.parse(uporabnikInfoStringSubmit);
            console.log(user)
            const activity = activityData;
            console.log(activity);
        })
    }


    const params = new URLSearchParams({activityId : activityData.id})
    console.log(params.toString())
    const comments = await fetchData(`${API_URL}/getKomentarji?${params.toString()}`)
    if(comments){console.log(comments)}

    if (userCommentsSection) {
        if (comments && comments.length > 0) {
            userCommentsSection.innerHTML = comments.map(comment =>{
                return `
                    <div class="w-100  d-flex mb-1 rounded shadow " style="max-height:fit-content;" >
                      <div class="" style="max-width: 50px;max-height:fit-content;">
                          <img id="userPic" src="../slike/profilne/default-profile.png" style="margin-right:10px;max-width: 40px; border-radius:50%; object-fit:cover;">
                      </div>
                      <div id="commentb" class="flex-fill d-flex flex-column  ">
                          <div class="h-25 d-flex  " style="" >
                            <p style="font-size: 15px;" id="userName">@${comment.username}</p>
                          </div>
                          <div class="d-flex align-items-center " style="max-height: fit-content;;">
                              <p style="margin-left:5px;">${comment.komentar}</p>
                          </div>
                      </div>
                  </div>
                `
            }).join('');
        } else {
            userCommentsSection.innerHTML = '<p class="text-muted">Za to aktivnost še ni komentarjev.</p>';
        }
    }

});

async function fetchZAvtentikacijo(url, options = {}) {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    } else {
        options.headers = {
            ...options.headers,
            'Content-Type': 'application/json'
        };
    }
    const response = await fetch(url, options);
    // Osnovno obravnavanje napak, lahko razširiš
    if (response.status === 401 && !options.skipAuthRedirect) {
        // Uporabnik ni prijavljen, preusmeri ga
        window.location.href = `/html/prijava.html?redirect=${window.location.pathname + window.location.search}`;
    }
    return response;
}


async function naloziPodrobnostiAktivnosti(id) {
    try {
        const response = await fetchZAvtentikacijo(`/api/aktivnost/${id}/details`);
        if (!response.ok) {
            throw new Error('Aktivnost ni bila najdena.');
        }
        const aktivnost = await response.json();

        // Prikaz osnovnih podatkov (to kodo verjetno že imaš)
        document.getElementById('naziv-aktivnosti').textContent = aktivnost.Naziv;
        document.getElementById('opis-aktivnosti').textContent = aktivnost.Opis;
        // ... ostali podatki ...

        // --- NOVA LOGIKA ZA GUMB ---
        prikaziGumbZaPrijavo(aktivnost);

    } catch (error) {
        console.error('Napaka pri nalaganju podrobnosti:', error);
        document.getElementById('activity-details-container').innerHTML = `<p class="text-danger">${error.message}</p>`;
    }
}

function prikaziGumbZaPrijavo(aktivnost) {
    const container = document.getElementById('prijava-container');
    if (!container) return;

    container.innerHTML = ''; // Počisti prejšnjo vsebino
    const uporabnikInfo = JSON.parse(sessionStorage.getItem('uporabnikInfo'));

    if (!uporabnikInfo) {
        // Uporabnik ni prijavljen
        container.innerHTML = `
            <p class="text-muted">Za prijavo na aktivnost se morate <a href="/html/prijava.html?redirect=${window.location.pathname + window.location.search}">prijaviti</a>.</p>
        `;
        return;
    }

    if (aktivnost.ProstaMesta <= 0 && !aktivnost.jePrijavljen) {
        // Ni prostih mest in uporabnik ni prijavljen
        container.innerHTML = '<button class="btn btn-secondary" disabled>Ni prostih mest</button>';
        return;
    }

    let gumbHTML = '';
    if (aktivnost.jePrijavljen) {
        gumbHTML = `<button class="btn btn-danger" id="btn-odjava">Odjavi se</button>`;
    } else {
        gumbHTML = `<button class="btn btn-primary" id="btn-prijava">Prijavi se na aktivnost</button>`;
    }

    container.innerHTML = gumbHTML + '<div id="prijava-sporocilo" class="mt-2"></div>';

    // Dodaj event listenerje
    if (aktivnost.jePrijavljen) {
        document.getElementById('btn-odjava').addEventListener('click', () => obravnavajOdjavo(aktivnost.id));
    } else {
        document.getElementById('btn-prijava').addEventListener('click', () => obravnavajPrijavo(aktivnost.id));
    }
}

async function obravnavajPrijavo(aktivnostId) {
    const sporociloEl = document.getElementById('prijava-sporocilo');
    sporociloEl.innerHTML = `<div class="spinner-border spinner-border-sm"></div>`;

    try {
        const response = await fetchZAvtentikacijo(`/api/aktivnosti/${aktivnostId}/prijava`, { method: 'POST' });
        const data = await response.json();

        if (response.ok) {
            sporociloEl.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            naloziPodrobnostiAktivnosti(aktivnostId); // Osveži podatke na strani
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        sporociloEl.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

async function obravnavajOdjavo(aktivnostId) {
    const sporociloEl = document.getElementById('prijava-sporocilo');
    sporociloEl.innerHTML = `<div class="spinner-border spinner-border-sm"></div>`;

    try {
        const response = await fetchZAvtentikacijo(`/api/aktivnosti/${aktivnostId}/odjava`, { method: 'POST' });
        const data = await response.json();

        if (response.ok) {
            sporociloEl.innerHTML = `<div class="alert alert-info">${data.message}</div>`;
            naloziPodrobnostiAktivnosti(aktivnostId); // Osveži podatke na strani
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        sporociloEl.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}