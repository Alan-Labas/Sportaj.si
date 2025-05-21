const searchResults = JSON.parse(sessionStorage.getItem('searchResults'));
console.log(searchResults)
const activePage = sessionStorage.getItem('activePageButton');

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