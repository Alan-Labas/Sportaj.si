

    
document.querySelector(".searchForm").addEventListener("submit", function(e){
    e.preventDefault();
    
    const trenerji = JSON.parse(sessionStorage.getItem("trenerji"))
    const imeTrenerja = document.getElementById("imeTrenerja").value.trim().split(/\s+/);
    console.log(imeTrenerja)
    let izbraniTrenerji = [];
    if(imeTrenerja.length === 1){
        console.log(1)
        for(let trener of trenerji){
            if(trener.ime === imeTrenerja[0]){
                izbraniTrenerji.push(trener);
            }
        }
    }else if(imeTrenerja.length === 2){
        console.log(2)
        for(let trener of trenerji){
            if(trener.ime === imeTrenerja[0] & trener.priimek === imeTrenerja[1]){
                izbraniTrenerji.push(trener);
            }
        }
    }
    console.log(izbraniTrenerji)
    

    const searchResultsTrenerji = document.getElementById("searchResultsTrenerji");
    const resultsWrapperTrenerji = document.getElementById("resultsWrapperTrenerji");
    resultsWrapperTrenerji.style.display = resultsWrapperTrenerji.style.display === 'none' ? 'flex':'none';
    
    searchResultsTrenerji.innerHTML = izbraniTrenerji.length > 0 ? izbraniTrenerji.map(trener =>{
        

        return `
            <div class="col-lg-6 col-xl-4 col-xxl-3">
                <div class="card shadow-lg border-0 rounded-4 hover-shadow transition"  id="${trener.id}">
                    <img src="${trener.slika}" alt="${trener.ime}" class="card-img-top rounded-top-4">
                    <div class="card-body text-center">
                        <h5 class="card-title mb-1">${trener.ime + " " + trener.priimek}</h5>
                    </div>
                    <div class="position-absolute d-flex flex-row-reverse bg-transparent w-100">
                        <button type="button" class="floatMenu btn btn-warning">O</button>
                    </div>
                    <div class="floating-menu position-absolute p-2 bg-white border rounded shadow" style="top:10px; right:10px; display:none; z-index:1">
                        <button type="button" class="btn btn-sm btn-primary mb-1" onclick="profilTrener(${trener.id})">Profil</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="komentiraj(${trener.id})">Pusti Komentar</button>
                    </div>
                </div>
                
            </div>
        `
    }).join('') : `<p>Trener ${imeTrenerja} ne obstaja</p>`;
    
    searchResultsTrenerji.scrollIntoView({behavior: "smooth", block:"center"})
    TrenerBtnListener();
})


function TrenerBtnListener(){
    searchResultsTrenerji.querySelectorAll(".card").forEach(card => {
        const trenerMeniBtn = card.querySelector(".floatMenu")
        trenerMeniBtn.addEventListener("click", function(){
            console.log("pressed")
            card.querySelector(".floating-menu").style.display = card.querySelector(".floating-menu").style.display === 'none'?'block':'none';
        })
        card.addEventListener('mouseleave', ()=>{
            card.querySelector(".floating-menu").style.display = 'none';
        })
    })
}
    

document.getElementById("prikaziVseTrenerjeBtn").addEventListener("click", function(e){
    window.location.href = "../html/trener.html";
})


    

    
 
    
