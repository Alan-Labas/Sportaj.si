
const searchForm = document.getElementById('searchInputGroup');

searchForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const searchComp1 = searchForm.querySelector('#searchComp1');
    console.log(searchComp1.textContent)
    const searchComp2 = searchForm.querySelector('#searchComp2');
    const searchComp3 = searchForm.querySelector('#searchComp3');
    const searchComp4 = searchForm.querySelector('#searchComp4');
    const calendarButton = searchForm.querySelector('#calendarBtn')

    const activePageButton = sessionStorage.getItem('activePageButton');
    console.log(activePageButton)

    switch(activePageButton){
        case "sport":
            const isciField = searchComp1.value;
            
            search(activePageButton, isciField, null, null)
            break;

        case "dejavnosti":
            const isciDejavnost = searchComp1.value;
            
            const datum = window.innerWidth > 992 ? searchComp2.value :  calendarButton.value;
            let lokacijaD = window.innerHeight > 992 ? searchComp4.value : [];
            
            if(lokacijaD.length === 0){lokacijaD = null}
            
            
            search(activePageButton, isciDejavnost, null,null, lokacijaD)
            break;

        case "zdruzenja":
            const isciZdruzenje = searchComp1.textContent;
            
            const lokacijaZ = window.innerHeight > 992 ? searchComp4.textContent : "";
            search(activePageButton, isciZdruzenje, lokacijaZ)
            break;

        case "trenerji":
            
            const isciTrenerja = searchComp1.value;
            console.log(isciTrenerja)
            let imePriimek = [];
            if(isciTrenerja.includes(" ")){
                imePriimek = isciTrenerja.split(" ") ;
            }else{imePriimek.push(isciTrenerja)}
              
            console.log(imePriimek)
            search(activePageButton, imePriimek,null, null, null)
            break;
    }


})

function search(activePageButton, input1, input2, input3, input4){
    const data = JSON.parse(sessionStorage.getItem(activePageButton))
    
    let args= [input1,input2,input3];
    let searchBy = [];
    let searchResults =[];

    let dataByArg = []
    for(let i of args){
        if(i != null){
            searchBy.push(i);
        }
    }

    switch(activePageButton){
        
        case "sport":
            let sportMatch = []
            if(input1 != null){
                data.forEach(entity =>{
                    if(entity.Sport === input1){
                        sportMatch.push(entity)
                    }

                })
            }else{
                data.forEach(entity =>{
                    sportMatch.push(entity)
                })
            }
                
            searchResults.push(sportMatch)
            sessionStorage.setItem('searchResults', JSON.stringify(sportMatch))
            break;

        case "dejavnosti":
            let dejavnostiMatch = []
            if(input1 != null && input4 != null){
                console.log('yess')
                console.log(input4)
                data.forEach(entity =>{
                    if(entity.Naziv === input1 && entity.Lokacija === input4){
                        dejavnostiMatch.push(entity)
                    }

                })
            }else if ( input1 !=null && input4 === null){
                console.log('nooo')
                data.forEach(entity =>{
                    if(entity.Naziv === input1){
                        dejavnostiMatch.push(entity)
                    }

                })
            }else if( input1 === null && input4 != null){
                console.log('myb')
                data.forEach(entity =>{
                    if(entity.Lokacija === input4){
                        dejavnostiMatch.push(entity)
                    }

                })
            }
                
           searchResults.push(dejavnostiMatch)
           sessionStorage.setItem('searchResults', JSON.stringify(dejavnostiMatch))
            break;

        case "zdruzenja":
            let zdruzenjaMatch = []
            if(input1 != null && input4 != null){
                data.forEach( entity =>{
                    if(entity.Naziv === input1 && entity.Lokacija === input4){
                        zdruzenjaMatch.push(entity)
                    }
                })
            }else if(input1 != null & input4 ===null){
                data.forEach( entity =>{
                    if(entity.Naziv === input1){
                        zdruzenjaMatch.push(entity)
                    }
                })
            }else if(input1 ===null && input4 != null){
                data.forEach(entity =>{
                    if(entity.Lokacija === input4){
                        zdruzenjaMatch.push(entity);
                    }
                })
                
            }
            searchResults.push(zdruzenjaMatch)
            sessionStorage.setItem('searchResults', JSON.stringify(zdruzenjaMatch))
            break;

        case "trenerji":
            
            console.log(input1)
            console.log(input1[0])
            let trenerjiMatch = []
            
            if(input1 != null && input4 === null){
                console.log('yesss')
                if(input1.length === 1){
                    data.forEach(entity =>{
                        if(entity.ime === input1[0] || entity.priimek === input1[0]){
                            trenerjiMatch.push(entity);
                        }

                    })
                }else if(input1.length === 2){
                    data.forEach(entity =>{
                        if(entity.ime === input1[0] && entity.priimek === input1[1]){
                            console.log(entity.ime)
                            console.log(input1[0])
                            console.log("and")
                            console.log(entity.priimek)
                            console.log(input1[1])
                            console.log(entity)
                            trenerjiMatch.push(entity);
                        }

                    })
                }
            }else if ( input1 != null && input4 != null){
                console.log('nooo')
                if(input1.length === 1){
                    data.forEach(entity =>{
                        if((entity.ime === input1[0] || entity.priimek === input1[0]) && entity.Lokacija === input4){
                            trenerjiMatch.push(entity);
                        }

                    })
                }else if(input1.length === 2){
                    data.forEach(entity =>{
                        if((entity.ime === input1[0] && entity.priimek === input1[1])&& entity.Lokacija === input4){
                            console.log(entity.ime)
                            console.log(input1[0])
                            console.log("and")
                            console.log(entity.priimek)
                            console.log(input1[1])
                            console.log(entity)
                            trenerjiMatch.push(entity);
                        }

                    })
                }
            }else if(input1 === null && input4 != null){
                console.log('myb')
                data.forEach(entity =>{
                    if(entity.Lokacija === input4){
                        trenerjiMatch.push(entity);
                    }
                })
            }

            
            console.log(trenerjiMatch)
            searchResults.push(trenerjiMatch)
            
            sessionStorage.setItem('searchResults', JSON.stringify(trenerjiMatch))
            break;
        console.log(searchResults)
        
    }
    
    window.location.href = "../html/searchResults.html"
    console.log(searchResults)
    

    
    
}

