




const buttonsDiv = document.getElementById('dropdownMenu')

document.getElementById('dropdownMenuButton').addEventListener('click', ()=>{
    console.log()
    const dropdownButton = document.getElementById('dropdownMenuButton')
    if(buttonsDiv.classList.contains('d-none')){
        console.log("it contained d-none")
        buttonsDiv.classList.remove('d-none')
        buttonsDiv.querySelectorAll('.pageBtn').forEach(b =>{
            b.classList.add('border-0')
            const currentActiveBtn = dropdownButton.value
            console.log(currentActiveBtn)
            if(currentActiveBtn === b.value){
                
                console.log(b.value)
                b.classList.add('d-none')
            }else{b.classList.remove('d-none')}
        })
    }else{
        buttonsDiv.classList.add('d-none')
    }
})


const buttons = buttonsDiv.querySelectorAll('.pageBtn');        
buttons.forEach(btn =>{
    console.log(btn.value)
    
    
    btn.addEventListener('click', ()=>{
        
        const activePageButtonBefore = sessionStorage.getItem('activePageButton');
        const dropdownButton = document.getElementById('dropdownMenuButton');
        dropdownButton.innerHTML = btn.innerHTML;
        dropdownButton.value = btn.value
        let navRowEquivalent ;
        document.getElementById('navBarPageButtonsRow').querySelectorAll('.btn').forEach(e =>{
            if(e.value === btn.value){
                console.log("---------------------------")
                console.log(e.value)
                console.log(btn.value)
                
                e.classList.remove('border-0')
            }else{
                
                e.classList.add('border-0')
            }
        })
        
        btn.classList.remove('border-0')

        

        
        buttonsDiv.classList.add('d-none')
        

        const activePageButtonAfter = btn
        sessionStorage.setItem('activePageButton', activePageButtonAfter)
        sessionStorage.setItem('activePageButton', btn.value)
        setPageContent(activePageButtonAfter.value)

        
    })
    
})