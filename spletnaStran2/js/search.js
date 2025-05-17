




    const searchForm = document.getElementById('searchInputGroup');
    
    searchForm.addEventListener('submit', function(e){
        e.preventDefault();
        console.log(searchForm.querySelector('#searchComp').textContent)
        const activePage = JSON.parse(sessionStorage.getItem("activeButtonId")).activeButtonID
        console.log(activePage)
        
        let data;
        switch(activePage){
            
            case "sportiBtn":
                const sport = searchForm.querySelector('#searchComp').textContent;
                const sportLoc = searchForm.querySelector('#searchComp').textContent;

                data = JSON.parse(sessionStorage.getItem("sport"))
                search(data, sport, sportLoc)
                break;

            case "dejavnostiBtn":
                const dejavnostTF = searchForm.querySelector('#searchComp').textContent;
                const datum = searchForm.querySelector('#searchDate')
                const dejavnostiLoc = searchForm.querySelector('#searchLoc').textContent

                data = JSON.parse(sessionStorage.getItem("events"))
                search(data, dejavnostTF, dejavnostiLoc)
                break;

            case "zdruzenjeBtn":
                const zdruzenjeTF = searchForm.querySelector('#searchComp').textContent;
                const zdruzenjeLoc = searchForm.querySelector('#searchComp').textContent;
                data = JSON.parse(sessionStorage.getItem("zdruzenja"))
                search(data, zdruzenjeTF, zdruzenjeLoc)
                break;

            case "trenerjiBtn":
                const trenerTF = searchForm.querySelector('#searchComp').value
                
                const trenerLoc = searchForm.querySelector('#searchLoc').value;
                console.log(trenerTF)
                data = JSON.parse(sessionStorage.getItem("trenerji"))
                search(data, trenerTF, trenerLoc, "trenerji")
                break;
        }
        
        
    })



function search(data, imee, lokacija, tip){
    console.log( imee, lokacija)
    
    let searchResults = [];
    
        switch(tip){
                case "events":
                    console.log("yes")
                    
                    data.map(ent =>{
                        if(ent.name === imee){
                            searchResults.push(ent)
                        }
                    })
                    break;

                case "trenerji":
                    console.log("no")
                    dataType = "trenerji";
                    data.map(e =>{
                        if(e.ime === imee){
                            searchResults.push(e)
                        }
                    })
                    break;
            }
    
    return console.log(searchResults);

    

    


}
