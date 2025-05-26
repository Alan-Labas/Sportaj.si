const result = JSON.parse(sessionStorage.getItem('searchResults'));

import { handleDynamicItemClick } from "./activePage.js";

let activePage = sessionStorage.getItem('activePageButton');
console.log(activePage)
console.log(result)
document.getElementById('rezultatiIskanjaText').innerHTML = "";


const searchedBy = result[1] ? result[1] : null;
const searchResults = result[0];
console.log(searchedBy)
console.log(searchResults)
const trener = []
const dejavnosti = []
const sport = []
const an = []
const cardContent = []

if(!searchedBy){
    if(activePage === 'dejavnosti'){
         document.getElementById('rezultatiIskanjaText').innerHTML = `Vse dejavnosti`;
    }else if(activePage === 'zdruzenja'){
         document.getElementById('rezultatiIskanjaText').innerHTML = `Vsa zdruzenja`;
    }else if ( activePage === 'sport'){
        document.getElementById('rezultatiIskanjaText').innerHTML =  `Vsi sporti`;
    }else if(activePage === 'trenerji'){
         document.getElementById('rezultatiIskanjaText').innerHTML =  `Vsi trenerji`;
    }  
}else{
    
    if(activePage === 'dejavnosti'){
         document.getElementById('rezultatiIskanjaText').innerHTML = `Rezultati iskanja za: ${searchedBy.naziv}`
    }else if(activePage === 'zdruzenja'){
         
    }else if ( activePage === 'sport'){
        document.getElementById('rezultatiIskanjaText').innerHTML = `Rezultati iskanja za: ${searchedBy.sport}`
    }else if(activePage === 'trenerji'){
        document.getElementById('rezultatiIskanjaText').innerHTML = `Rezultati iskanja za: ${searchedBy.ime}`
    } 
}



switch(activePage){
    case "dejavnosti":
        document.getElementById('searchResults').innerHTML = searchResults.map(ent =>{
            return `
                <div class="col-sm-6 col-md-4 col-lg-3 col-xl-3 mb-4 dynamic-card-item" data-id="${ent.id}" data-type="aktivnost" style="cursor:pointer;">
                        <div class="card h-100 shadow-sm">
                            <img class="card-img-top" style="height: 180px; object-fit: cover;" src="${ent.slika}" alt="${ent.Naziv}" onerror="this.onerror=null;this.src='';">
                            <div class="card-body">
                                <h5 class="card-title">${ent.Naziv}</h5>
                                <p class="card-text mb-1"><small class="text-muted">📍 ${ent.Lokacija || 'Neznana lokacija'}</small></p>
                                <p class="card-text mb-1"><small>Šport: ${ent.ime_sporta || 'Neznan'}</small></p>
                                <p class="card-text"><small>Cena: ${ent.Cena != null ? parseFloat(ent.Cena).toFixed(2) + ' €' : 'N/A'}</small></p>
                            </div>
                        </div>
                    </div>
                `
        })
        break;

    case "trenerji":
        
        
        document.getElementById('searchResults').innerHTML = searchResults.map(ent =>{
            return `
                <div class="col-sm-6 col-md-4 col-lg-3 col-xl-3 mb-4 dynamic-card-item" data-id="${ent.id}" data-type="trener" style="cursor:pointer;">
                        <div class="card h-100 shadow-sm">
                            <img class="card-img-top" style="height: 180px; object-fit: cover;" src="../slike/trenerji/MarkoSkace.avif" alt="${ent.ime} ${ent.priimek}" onerror="this.onerror=null">
                            <div class="card-body">
                                <h5 class="card-title">${ent.ime} ${ent.priimek}</h5>
                                <p class="card-text"><small class="text-muted">${ent.opis}</small></p>
                                ${ent.povprecna_ocena ? parseFloat(ent.povprecna_ocena).toFixed(1) : null ? `<p class="card-text"><small class="text-warning">${generateStars(ent.povprecna_ocena ? parseFloat(ent.povprecna_ocena).toFixed(1) : null)} (${ent.povprecna_ocena ? parseFloat(ent.povprecna_ocena).toFixed(1) : null})</small></p>` : '<p class="card-text"><small class="text-muted">Ni ocen</small></p>'}
                            </div>
                        </div>
                    </div>  
                `
        }).join(' ');
        break;
    
    case 'sport':
        console.log(activePage)
        document.getElementById('searchResults').innerHTML = searchResults.map(ent =>{
            return `
                <div class="col-sm-6 col-md-4 col-lg-3 col-xl-3 mb-4 dynamic-card-item" data-id="${ent.id}" data-type="sport" style="cursor:pointer;">
                        <div class="card h-100 shadow-sm">
                            <img class="card-img-top" style="height: 180px; object-fit: cover;" src="${`/slike/${ent.Sport.toLowerCase().replace(/\s+/g, '-')}.png`}" alt="" onerror="this.onerror=null;this.src='';">
                            <div class="card-body text-center">
                                <h5 class="card-title">${ent.Sport}</h5>
                            </div>
                        </div>
                    </div>
            `
        })
        break;

}

document.getElementById('searchResults').addEventListener('click', handleDynamicItemClick);


document.querySelectorAll('.trenerCardMsgBtn').forEach(btn =>{
    btn.addEventListener('click', ()=>{
        document.getElementById('trenerMsgOverlay').classList.remove('d-none');
    })
})