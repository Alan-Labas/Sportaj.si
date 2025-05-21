
const pageButtonsDiv = document.getElementById('buttonGroup');
const pageButtons = pageButtonsDiv.querySelectorAll('.btn');



const activePageButton = sessionStorage.getItem('activePageButton')

function update(){
    
}

setPageContent(activePageButton)

loadContent()

pageButtons.forEach(button =>{
    console.log(button.id)
    if(activePageButton != button.value){
        button.classList.add('border-0')
    }
    button.addEventListener('click', function(){
        activeButton = button;
        let navColEquivalent;
        pageButtons.forEach(b =>{
            if(button != b){
                b.classList.add('border-0');
            }
            
            
        })
        document.getElementById('dropdownMenu').querySelectorAll('.pageBtn').forEach(bb =>{
            if(bb.value === button.value){navColEquivalent = bb}
                    
        })
        button.classList.remove('border-0')
        document.getElementById('dropdownMenuButton').innerHTML = navColEquivalent.innerHTML;
        document.getElementById('dropdownMenuButton').value = navColEquivalent.value;
        sessionStorage.setItem('activePageButton', button.value)

        const activePage = button.value;
        console.log(activePage)
        setPageContent(activePage)
    })
})
const dropdownButto = document.getElementById('dropdownButton');
const dropdownMenu = document.querySelectorAll('.dropdown-item');

dropdownMenu.forEach(btn =>{
    btn.addEventListener('click', (e)=>{
        console.log(btn.id)
        
    })
})





async function setPageContent(activePage){
    
    switch(activePage){
        case "sport":
            document.getElementById('searchComp1').placeholder = "Išči šport";
            document.getElementById('searchComp2').classList.remove('d-lg-flex');
            document.getElementById('searchComp3').classList.remove('d-lg-flex');
            document.getElementById('searchComp4').classList.remove('d-lg-flex');
            document.getElementById('calendarBtn').classList.add('d-none')
            const vsiSporti = await fetchData()
            sessionStorage.setItem('sporti', JSON.stringify(vsiSporti))
            break;
        
        case "dejavnosti":
            document.getElementById('searchComp1').placeholder = "Išči dejavnost";
            
                document.getElementById('searchComp2').classList.remove('d-lg-flex');
                document.getElementById('searchComp3').classList.add('d-lg-flex');
                document.getElementById('searchComp4').classList.add('d-lg-flex');
                document.getElementById('calendarBtn').classList.remove('d-none')
            
            
            
            

            const firstContainer = document.getElementById('firstContainer');
            firstContainer.querySelector('#firstContainerText').innerHTML = "Prihajajoče dejavnosti";

            const secondContainer = document.getElementById('secondContainer');
            secondContainer.querySelector('#secondContainerText').innerHTML = "Dejavnosti v okolici"
            const vseDejavnosti = await fetchData("vseAktivnosti")   
            sessionStorage.setItem('dejavnosti', JSON.stringify(vseDejavnosti))
            const eventsMB = vseDejavnosti.filter(m => m.Lokacija === "Maribor")
            
            loadContent(eventsMB, 'firstContainerContent', activePage)
            loadContent(vseDejavnosti, 'secondContainerContent', activePage)
            
            console.log("stima")
            
            
            break;

        case "zdruzenja":
            document.getElementById('searchComp1').placeholder = "Išči združenja";
            document.getElementById('searchComp2').classList.remove('d-lg-flex');
            document.getElementById('searchComp3').classList.remove('d-lg-flex');
            document.getElementById('searchComp4').classList.add('d-lg-flex');      
            document.getElementById('calendarBtn').classList.add('d-none'); 
            
            break;

        case "trenerji":
            document.getElementById('searchComp1').placeholder = "Išči trenerje";
            
           
            document.querySelector('#firstContainerText').innerHTML = "Priporocamo";
            document.querySelector('#secondContainerText').innerHTML = "Trenerji v okolici"
            const vsiTrenerji = await fetchData("vsiTrenerji")   
            sessionStorage.setItem('trenerji', JSON.stringify(vsiTrenerji))
            const trenerjiMB = vsiTrenerji.filter(m => m.Lokacija === "Maribor")
            
            document.getElementById('searchComp2').classList.remove('d-lg-flex')
            document.getElementById('searchComp3').classList.remove('d-lg-flex')
            document.getElementById('searchComp4').classList.add('d-lg-flex')
            document.getElementById('calendarBtn').classList.add('d-none'); 
            
            loadContent(vsiTrenerji, 'firstContainerContent', activePage)
            loadContent(trenerjiMB, 'secondContainerContent', activePage)
            

            break;
    }
}

async function fetchData(what){
    const API_URL = 'http://localhost:3000/api' + "/" + what;
    console.log(API_URL)

    const response = await fetch(API_URL);
    if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json();
    
    console.log(data)
    return data;
    
}


function loadContent(content, divID, activePage){
   console.log(content)
    switch(activePage){
        case "sport":
            
            break;
        
        case "dejavnosti":
            let total = 0
            document.getElementById(divID).innerHTML = content.map(c=>{
                
                total++
                return `
                    <div class=" col-md-6 col-lg-6 col-xl-4 col-xxl-3">
                        <div class="card border bg-transparent border-0  m-3 p-1" style="min-width;300px;object-fit:contain;">
                            <div class="d-flex justify-content-center" style="object-fit:contain;">
                                <img class="card-img-top" style="max-height:150px;object-fit:contain;" src="${c.slika}"  alt="slika">
                            </div>
                    
                            <div class="card-body ">
                            <div class="d-flex">
                                <div class="d-flex">🚩 ${c.Lokacija}</div>
                                <div class="d-flex flex-row-reverse"></div>
                            </div>
                            <h5 class="card-title">${c.Naziv}</h5>
                            <h6 class="card-subtitle">${c.Opis}</h6>
                            <p>Prosta mesta:  ${c.ProstaMesta} <br>💵  ${c.Cena}e</p>
                            
                            
                            </div>
                        </div>
                    </div>
                `
            }).join('')
            if(total === 0){document.getElementById(divID).innerHTML = "<p>Ni rezultatov</p>"}
            break;

        case "zdruzenja":
             
            break;

        case "trenerji":
            document.getElementById(divID).innerHTML = content.map(c=>{
                return `
                    <div class=" col-sm-6 col-md-6 col-lg-4 col-xl-3">
                        <div class="card border bg-transparent border-0 m-3 p-1" style="min-width;300px;object-fit:contain;">
                            <div class="d-flex justify-content-center" style="object-fit:contain;">
                                <img class="card-img-top" style="max-height:150px;object-fit:contain;" src="${c.slika}"  alt="slika">
                            </div>
                            
                            <div class="card-body ">
                            <div class="d-flex">
                                <div class="d-flex">🚩 ${"d"} </div>
                                <div class="d-flex flex-row-reverse"></div>
                            </div>
                            <h5 class="card-title">${c.ime} ${c.priimek}</h5>
                            <p>📅  ${c.OpisProfila} <br ${c.urnik}></p>
                            
                            
                            </div>
                        </div>
                    </div>    
                    `
            }).join('')
            break;
    }
    
}

