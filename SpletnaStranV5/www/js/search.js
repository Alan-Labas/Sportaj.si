




    const searchForm = document.getElementById('searchInputGroup');
    
    searchForm.addEventListener('submit', function(e){
        e.preventDefault();
        
        const activePageButton = sessionStorage.getItem('activePageButton');
        
        
        let data;
        switch(activePageButton){
            
            case "sport":
                const sport = searchForm.querySelector('#searchComp').textContent;
                const sportLoc = searchForm.querySelector('#searchComp').textContent;

                data = JSON.parse(sessionStorage.getItem("sport"))
                search(data, sport, sportLoc)
                break;

            case "dejavnosti":
                const dejavnostTF = searchForm.querySelector('#searchComp1').textContent;
                const datum = searchForm.querySelector('#searchComp3')
                const dejavnostiLoc = searchForm.querySelector('#searchComp4').textContent

                data = JSON.parse(sessionStorage.getItem("events"))
                search(data, dejavnostTF, dejavnostiLoc)
                break;

            case "zdruzenja":
                const zdruzenjeTF = searchForm.querySelector('#searchComp').textContent;
                const zdruzenjeLoc = searchForm.querySelector('#searchComp').textContent;
                data = JSON.parse(sessionStorage.getItem("zdruzenja"))
                search(data, zdruzenjeTF, zdruzenjeLoc)
                break;

            case "trenerji":
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
