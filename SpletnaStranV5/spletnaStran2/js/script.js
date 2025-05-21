





function toggleSidebar(){
    const side = document.getElementById("mainRight");
    const main = document.getElementById("mainCenter");

    if(side.classList.contains('d-none')){
        side.classList.replace('d-none', 'd-flex');
    }else{
        side.classList.add('d-none');
    }
}

document.addEventListener("DOMContentLoaded", function(){
    
    const buttons = document.querySelectorAll("#buttonGroup .btn");
    let activeButton;
    for(b of buttons){
        if(!(b.classList.contains('border-0'))){
            activeButton = b;
            sessionStorage.setItem("activeButtonId", JSON.stringify({activeButtonID : activeButton.id}))
        }
    }

    const eventList = JSON.parse(sessionStorage.getItem("events"));
    console.log(JSON.parse(sessionStorage.getItem('welcomeMsgRead')))
    if(JSON.parse(sessionStorage.getItem('welcomeMsgRead')) === null){
         sessionStorage.setItem('welcomeMsgRead', JSON.stringify({read:false}));
    }else if(JSON.parse(sessionStorage.getItem('welcomeMsgRead')).read=== true){
        document.getElementById('welcomemsg').style.display = 'none'
    }else{ document.getElementById('welcomemsg').style.display = 'flex' }

    

    console.log(JSON.parse(sessionStorage.getItem('welcomeMsgRead')).read)
    swich(activeButton)
    
    const searchGroup = document.getElementById('searchInputGroup');
    const searchFields = searchGroup.querySelectorAll('.form-control');
    searchFields.forEach(TF =>{
        TF.addEventListener("blur", ()=>{
            searchFields.forEach(f =>{
                
                    f.style.backgroundColor = "white";
                
            })
            searchGroup.style.backgroundColor = "white";
            
        })

        TF.addEventListener("focus", ()=>{
            searchFields.forEach(f =>{
                if(f != TF){
                    f.style.backgroundColor = "rgb(209, 207, 207)";
                }
            })
            TF.style.backgroundColor = "white"
            searchGroup.style.backgroundColor = "rgb(209, 207, 207)";
        })
        
    })
    

   
    
    buttons.forEach(btn =>{
        btn.addEventListener('click', ()=>{

            
            if(window.innerWidth > 768){
                buttons.forEach(b =>{
                    if(btn != b){
                        b.classList.add('border-0')
                    }
                    btn.classList.remove('border-0')
                })
            };
            
            
            activeButton = btn
            sessionStorage.setItem("activeButtonId", JSON.stringify({activeButtonID : activeButton.id}))
            
            console.log(activeButton.id)
            swich(activeButton)
            
        })
    })


    document.getElementById("showLogin").addEventListener('click', ()=>{
        

        const loginOverlay = document.getElementById("loginOverlay")
        loginOverlay.style.display = "flex";

        loginOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'loginOverlay') {
                loginOverlay.style.display = 'none';
                
            }
        });
    })


    document.getElementById('showAllBtn').addEventListener('click', ()=>{
        if(document.querySelector('#vseContainer').classList.contains('d-none')){
            document.getElementById('showAllBtn').innerHTML = "Nazaj"
            document.getElementById('prihajajociContainer').classList.add('d-none')
            document.getElementById('vOkoliciContainer').classList.add('d-none')
            document.getElementById('vseContainer').classList.remove('d-none')
        }else{
            document.getElementById('showAllBtn').innerHTML = "Prikaži vse"
            document.getElementById('prihajajociContainer').classList.remove('d-none')
            document.getElementById('vOkoliciContainer').classList.remove('d-none')
            document.getElementById('vseContainer').classList.add('d-none')
        }
        

    })

    
    
    
})


function swich(activeButton){
        switch(activeButton.id){
            case "sportiBtn":
                sessionStorage.setItem('activeButton', JSON.stringify({activeBtn: activeButton.id}))
                document.getElementById('searchComp').placeholder = "Išči Šport"
                document.getElementById('searchDate').type = "text";
                document.getElementById('searchDate').classList.add('d-none')
                document.getElementById('prihajajoci').innerHTML = "Najpopularnejši športi"
                document.getElementById('vsi').innerHTML = "Vsi Sporti"
                document.getElementById('searchSport').classList.add('d-none');
                
                
                
                break;

            case "dejavnostiBtn":
                sessionStorage.setItem('activeButton', JSON.stringify({activeBtn: activeButton.id}))
                document.getElementById('searchComp').placeholder = "Išči dejavnosti"
                document.getElementById('searchDate').type = "text";
                document.getElementById('searchDate').classList.remove('d-none');
                document.getElementById('vokolici').innerHTML = "Dejavnosti v bližini"
                document.getElementById('prihajajoci').innerHTML = "Prihajajoči dogodki"
                document.getElementById('vsi').innerHTML = "Vse dejavnosti"
                document.getElementById('searchSport').classList.add('d-none');
                loadEventsPrihajajoci()
                loadEventsVBlizini()
                break;
            
            case "zdruzenjeBtn":
                sessionStorage.setItem('activeButton', JSON.stringify({activeBtn: activeButton.id}))
                document.getElementById('searchComp').placeholder = "Išči združenja"
                document.getElementById('searchDate').type = "text";
                document.getElementById('searchDate').classList.remove('d-none');
                document.getElementById('prihajajoci').innerHTML = "Popularna združenja"
                document.getElementById('vokolici').innerHTML = "Zdruzenja v bližini"
                document.getElementById('vsi').innerHTML = "Vsa zdruzenja"
                document.getElementById('searchSport').classList.add('d-none');
                
                
                break;

            case "trenerjiBtn":
                sessionStorage.setItem('activeButton', JSON.stringify({activeBtn: activeButton.id}))
                document.getElementById('searchComp').placeholder = "Poišči Trenerja"
                document.getElementById('searchSport').type = "text";
                document.getElementById('searchSport').placeholder = "Šport";
                document.getElementById('searchSport').classList.remove('d-none');
                document.getElementById('vokolici').innerHTML = "Trenerji v bližini"
                document.getElementById('prihajajoci').innerHTML = "Najbolj 'lajkani' trenerji"
                document.getElementById('vsi').innerHTML = "Vsi trenerji"
                document.getElementById('searchDate').classList.add('d-none')
                loadTrenerjiMostLiked();
                loadTrenerjiVBlizini();
        }
    }


function loadEventsPrihajajoci(){
     const eventList = JSON.parse(sessionStorage.getItem("events"));
    const eventListDateStr = eventList;
    console.log(eventListDateStr)
    console.log(eventList)
    
    
    for(e of eventList){
        
        
        const dateArray = e.date.split('/')
        dateArray.reverse();
        let datee = "";
        for(u of dateArray){
            datee += u;
        }
        e.date = parseInt(datee)

        
        
        
    }
    
    eventList.sort((a, b)=> a.date - b.date);
    let events12 = [];
    for(let i=0;i<12;i++){events12.push(eventList[i])}
    console.log(events12.length)
    document.getElementById("prihajajociDogodki").innerHTML = events12.map(event =>{
        console.log(event.id)
        return `
            <div class=" col-md-6 col-lg-6 col-xl-4 col-xxl-3">
                <div class="card border bg-transparent border-0  m-3 p-1" style="min-width;300px;object-fit:contain;">
                    <div class="d-flex justify-content-center" style="object-fit:contain;">
                        <img class="card-img-top" style="max-height:150px;object-fit:contain;" src="${event.slika}"  alt="slika">
                    </div>
                    
                    <div class="card-body ">
                    <div class="d-flex">
                        <div class="d-flex">🚩 ${event.location}</div>
                        <div class="d-flex flex-row-reverse"></div>
                    </div>
                       <h5 class="card-title">${event.name}</h5>
                       <p>📅  ${event.date} <br>💵  ${event.price}</p>
                       
                       
                    </div>
                </div>
            </div>    
            `
    }).join('')

}



    
function loadEventsVBlizini(){
    const eventList = JSON.parse(sessionStorage.getItem("events"));
    document.getElementById("dogodkiVokolici").innerHTML = eventList.map(event =>{
        if(event.location.includes("Maribor")){
            return `
            <div class=" col-sm-6 col-md-6 col-lg-4 col-xl-3">
                <div class="card border bg-transparent border-0 m-3 p-1" style="min-width;300px;object-fit:contain;">
                    <div class="d-flex justify-content-center" style="object-fit:contain;">
                        <img class="card-img-top" style="max-height:150px;object-fit:contain;" src="${event.slika}"  alt="slika">
                    </div>
                    
                    <div class="card-body ">
                    <div class="d-flex">
                        <div class="d-flex">🚩 ${event.location}</div>
                        <div class="d-flex flex-row-reverse"></div>
                    </div>
                       <h5 class="card-title">${event.name}</h5>
                       <p>📅  ${event.date} <br>💵  ${event.price}</p>
                       
                       
                    </div>
                </div>
            </div>    
            `
        }
    }).join('');
}


function loadTrenerjiVBlizini(){
    const trenerji = JSON.parse(sessionStorage.getItem("trenerji"));
    document.getElementById("dogodkiVokolici").innerHTML = trenerji.map(trener =>{
        if(trener.location.includes("Maribor")){
            return `
            <div class=" col-sm-6 col-md-6 col-lg-4 col-xl-3">
                <div class="card border bg-transparent border-0 m-3 p-1" style="min-width;300px;object-fit:contain;">
                    <div class="d-flex justify-content-center" style="object-fit:contain;">
                        <img class="card-img-top" style="max-height:150px;object-fit:contain;" src="${trener.slika}"  alt="slika">
                    </div>
                    
                    <div class="card-body ">
                    <div class="d-flex">
                        <div class="d-flex">🚩 ${trener.location} </div>
                        <div class="d-flex flex-row-reverse"></div>
                    </div>
                       <h5 class="card-title">${trener.ime} ${trener.priimek}</h5>
                       <p>📅  ${trener.dejavnost} <br>💵  ${event.price}</p>
                       
                       
                    </div>
                </div>
            </div>    
            `
        }
    }).join('');
    

}

function loadTrenerjiMostLiked(){
    const trenerji = JSON.parse(sessionStorage.getItem("trenerji"));
    
    document.getElementById("prihajajociDogodki").innerHTML = trenerji.map(trener =>{
        
            return `
            <div class=" col-sm-6 col-md-6 col-lg-4 col-xl-3">
                <div class="card border bg-transparent border-0 m-3 p-1" style="min-width;300px;object-fit:contain;">
                    <div class="d-flex justify-content-center" style="object-fit:contain;">
                        <img class="card-img-top" style="max-height:150px;object-fit:contain;" src="${trener.slika}"  alt="slika">
                    </div>
                    
                    <div class="card-body ">
                    <div class="d-flex">
                        <div class="d-flex">🚩 ${trener.location} </div>
                        <div class="d-flex flex-row-reverse"></div>
                    </div>
                       <h5 class="card-title">${trener.ime} ${trener.priimek}</h5>
                       <p>📅  ${trener.dejavnost} <br>💵  ${event.price}</p>
                       
                       
                    </div>
                </div>
            </div>    
            `
        
    }).join('');
}

document.addEventListener("DOMContentLoaded", function () {
    flatpickr("#searchDate", {
        locale: "sl", // slovenski jezik
        dateFormat: "d. F Y", // npr. 18. maj 2025
        allowInput: true
    });
});