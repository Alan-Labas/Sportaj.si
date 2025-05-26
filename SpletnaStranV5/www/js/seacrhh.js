
const searchForm = document.getElementById('searchInputGroup');

searchForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const searchComp1 = searchForm.querySelector('#searchComp1');
    console.log(searchComp1.textContent)
    const searchComp2 = searchForm.querySelector('#searchComp2');
    const searchComp3 = searchForm.querySelector('#searchComp3');
    const searchComp4 = searchForm.querySelector('#searchComp4');
    const calendarButton = searchForm.querySelector('#calendarBtn')
    const searchFields = [searchComp1, searchComp2,searchComp3,searchComp4];
    const searchBy = [];
    

    const activePageButton = sessionStorage.getItem('activePageButton');
    console.log(activePageButton)

    const API_URL = 'http://localhost:3000/api/search/';
    const tab = {
        dejavnosti : "sportna_aktivnost",
        sport : "sport",
        trenerji : "trenerji"

    }
    let table;
    let searchParams = [];
    for(let field of searchFields){
        if(!(field.length === 0) || !(field.value === null)){
            searchParams.push(field);
            
        }
    }
    console.log(searchParams)
    const params = [];
    if(activePageButton === 'dejavnosti'){
        table = tab.dejavnosti;
        const inputDBPairs = [
            {key:"searchComp1", value:"naziv"} ,
            {key:"searchComp2", value:"sport"} ,
            {key:"searchComp3", value:"datum"} ,
            {key:"searchComp4", value:"lokacija"} 
        ]
        let paramKey;
        let paramValue;
        const paramKeyValuePair = [];
        for(let param of searchParams){
            for(let atr of inputDBPairs){
                
                if(param.id === atr.key ){
                    console.log(param.id+" "+atr.key)
                    paramKey = atr.value;
                    paramValue = param.value;

                    paramKeyValuePair.push({paramKey, paramValue});

                }
            }
        }
        console.log(paramKeyValuePair)
        const urlParams = new URLSearchParams()
        for(let param of paramKeyValuePair){
            if(param.paramValue.trim()){
                urlParams.append(param.paramKey, param.paramValue)
            }
            
        }
        
        
        console.log(urlParams.toString())
        
        const url = new URL(`${API_URL}${table}`)
        url.search = urlParams.toString()
        
        fetch(url)
        .then(response => response.json())
        .then(data =>{
            sessionStorage.setItem('searchResults', JSON.stringify(data));
            console.log(data)
        })
        .catch(error =>{console.error(error)})



        


    }else if(activePageButton === 'trenerji'){
        table = tab.trenerji;
        const inputDBPairs = [
            {key:"searchComp1", value:"ime"} ,
            {key:"searchComp2", value:"sport"} ,
            {key:"searchComp3", value:"datum"} ,
            {key:"searchComp4", value:"lokacija"} 
        ]
        let paramKey;
        let paramValue;
        const paramKeyValuePair = [];
        for(let param of searchParams){
            for(let atr of inputDBPairs){
                
                if(param.id === atr.key ){
                    console.log(param.id+" "+atr.key)
                    paramKey = atr.value;
                    paramValue = param.value;

                    paramKeyValuePair.push({paramKey, paramValue});

                }
            }
        }
        console.log(paramKeyValuePair)
        const urlParams = new URLSearchParams()
        for(let param of paramKeyValuePair){
            if(param.paramValue.trim()){
                urlParams.append(param.paramKey, param.paramValue)
            }
            
        }
        
        
        console.log(urlParams.toString())
        
        const url = new URL(`${API_URL}${table}`)
        url.search = urlParams.toString()
        
        fetch(url)
        .then(response => response.json())
        .then(data =>{
            sessionStorage.setItem('searchResults', JSON.stringify(data));
            console.log(data)
        })
        .catch(error =>{console.error(error)})

    }else if(activePageButton === 'sport'){
        table = tab.sport;
        const inputDBPairs = [
            {key:"searchComp1", value:"sport"} 
        ]

        let paramKey;
        let paramValue;
        const paramKeyValuePair = [];
        for(let param of searchParams){
            for(let atr of inputDBPairs){
                
                if(param.id === atr.key ){
                    console.log(param.id+" "+atr.key)
                    paramKey = atr.value;
                    paramValue = param.value;

                    paramKeyValuePair.push({paramKey, paramValue});

                }
            }
        }
        console.log(paramKeyValuePair)
        const urlParams = new URLSearchParams()
        for(let param of paramKeyValuePair){
            if(param.paramValue.trim()){
                urlParams.append(param.paramKey, param.paramValue)
            }
            
        }
        
        
        console.log(urlParams.toString())
        
        const url = new URL(`${API_URL}${table}`)
        url.search = urlParams.toString()
        
        fetch(url)
        .then(response => response.json())
        .then(data =>{
            sessionStorage.setItem('searchResults', JSON.stringify(data));
            console.log(data)
        })
        .catch(error =>{console.error(error)})
    }
    
    
    
    
    window.location.href = "../html/searchResults.html"
    
    
    
});

