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
    const userCommentsSection = document.getElementById('trainerUserCommentsSection');
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

    activityTrainerCard.addEventListener('click', ()=>{
        window.location.href = `/html/profilTrener.html?id=${activityData.TK_Trener}`
    })
    
    commentForm.addEventListener('submit', async(e)=>{
        e.preventDefault();
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
})