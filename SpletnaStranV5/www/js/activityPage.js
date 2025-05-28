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
    const starsContainer = document.getElementById('starRating');
    const currentRatingText = document.getElementById('currentRatingText');
    const commentForm = document.getElementById('activityCommentForm');
    const commentTextElement = document.getElementById('activityCommentText');
    const activityDate = document.getElementById('activityDate');
    const activityLocation = document.getElementById('activityLocation')
    const similarActivitiesSection = document.getElementById('similarActivitiesSection');
    

    const defaultProfilePicPath = '../slike/sporti/atlettrening.jfif';

    if(!activityId || isNaN(activityId)){
        if(activityNameTitle) activityNameTitle.textContent = 'Aktivnost ni najdena';
        console.error('ID aktivnosti manjka ali ni veljaven.');
        const mainContent = document.querySelector('main.container');
        if (mainContent) mainContent.innerHTML = '<p class="text-danger text-center display-6 mt-5">ID trenerja manjka ali ni veljaven. Prosimo, vrnite se na <a href="/">domačo stran</a> in poskusite znova.</p>';
        return;
    }

    const activityData = await fetchData(`/api/aktivnost/${activityId}/details`);
    console.log(await activityData);
    if(!activityData) return;
    activityData.slika = atob(activityData.slika.split(',')[1])
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
    
    commentForm.addEventListener('submit', async(e)=>{
        e.preventDefault();
        const isLoggedIn = !!sessionStorage.getItem('accessToken');
        const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
        if (isLoggedIn && uporabnikInfoString) {
            
            
        }else{
            const globalAlert = document.getElementById('globalAlertMessage');
            if (globalAlert) {
                prikaziObvestilo('Za komentiranje morate prijaviti.', 'globalAlertMessage', 'text-success', 3000);
            } else {
                alert('Za komentiranje se morate prijaviti.');
            }
            return;
        }
        
        const comment = commentForm.querySelector('#activityCommentText').value;
        const activityId = commentForm.id;
        console.log(activityId)
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
            }
        }catch(err){
            console.error('Napaka pri objavljanju komentarja: ',err)
        }

    })

    const prijavaNaAktivnostBtn = document.getElementById('prijavaNaAktivnostBtn');
    prijavaNaAktivnostBtn.addEventListener('click', async()=>{
        const isLoggedIn = !!sessionStorage.getItem('accessToken');
        const uporabnikInfoString = sessionStorage.getItem('uporabnikInfo');
        if (isLoggedIn && uporabnikInfoString) {
            
        }else{
            const globalAlert = document.getElementById('globalAlertMessage');
            if (globalAlert) {
                prikaziObvestilo('Za prijavo na aktivnost se morate prijaviti.', 'globalAlertMessage', 'text-success', 3000);
            } else {
                alert('Za prijavo na aktivnost se morate prijaviti.');
            }
            return;
        }

        const user = JSON.parse(uporabnikInfoString);
        console.log(user)
        const activity = activityData;
        console.log(activity);




    })

    const params = new URLSearchParams({activityId : activityData.id})
    console.log(params.toString())
    const comments = await fetchData(`${API_URL}/getKomentarji?${params.toString()}`)
    if(comments){console.log(comments)}

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
    })
    
})