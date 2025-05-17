
document.addEventListener('submit', (e)=>{
    e.preventDefault();

    document.getElementById('navRight').classList.remove('d-none');
    document.getElementById('loginSignUpButtons').classList.add('d-none')
    document.getElementById('loginOverlay').style.display = 'none'
})