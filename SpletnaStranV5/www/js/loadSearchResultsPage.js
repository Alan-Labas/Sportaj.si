const result = JSON.parse(sessionStorage.getItem('searchResults'));

let activePage = sessionStorage.getItem('activePageButton');
console.log(activePage)
document.getElementById('rezultatiIskanjaText').innerHTML = "";


const searchedBy = result[1]
const searchResults = result[0];
console.log(searchedBy)
console.log(searchResults)
if(searchedBy.length > 0){
    document.getElementById('rezultatiIskanjaText').innerHTML = `Rezultati iskanja za: ${searchedBy.ime}`
}else{
    if(activePage === 'dejavnosti'){
         document.getElementById('rezultatiIskanjaText').innerHTML = `Vse dejavnosti`;
    }else if(activePage === 'zdruzenja'){
         document.getElementById('rezultatiIskanjaText').innerHTML = `Vsa zdruzenja`;
    }else if ( activePage === 'sport'){
        document.getElementById('rezultatiIskanjaText').innerHTML =  `Vsi sporti`;
    }else if(activePage === 'trenerji'){
         document.getElementById('rezultatiIskanjaText').innerHTML =  `Vsi trenerji`;
    }
    
   
}


switch(activePage){
    case "dejavnosti":
        document.getElementById('searchResults').innerHTML = searchResults.map(ent =>{
            return `
                <div class="col-sm-6 col-md-4 col-lg-3">
                    <div class="card m-1 p-2">
                        <img src="${ent.Slika}" class="card-img-top">
                        <div class="card-body">
                            <h4 class="card-title">${ent.Naziv }</h4>
                            <h6 class="card-subtitle">${ent.Opis }</h6>
                            <p class="card-subtitle">${ent.Lokacija }</p>
                        </div>
                    </div>
                </div>
            `
        })
        break;

    case "trenerji":
        document.getElementById('searchResults').innerHTML = searchResults.map(ent =>{
            return `
                <div class="col-sm-6 col-md-4 col-lg-3">
                    <div class="card m-1 p-2">
                        <img src="${ent.slika}" class="card-img-top">
                        <div class="card-body">
                            <h4 class="card-title">${ent.ime + " " + ent.priimek }</h4>
                            <h6 class="card-subtitle">${ent.urnik }</h6>
                            <p class="card-subtitle">${ent.telefon }</p>
                            <p class="card-subtitle">${ent.email }</p>
                        </div>
                    </div>
                </div>
            `
        }).join(' ');
        break;

}