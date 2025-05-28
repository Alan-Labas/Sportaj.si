function showPostaniTrenerModal() {
    if (postaniTrenerOverlay) {
        const registrationOverlay = document.getElementById('registrationOverlay');
        const loginOverlay = document.getElementById('loginOverlay');
        if (registrationOverlay) registrationOverlay.style.display = 'none';
        if (loginOverlay) loginOverlay.style.display = 'none';

        const telefonInput = loginOverlay.querySelector('#telefonInput');
        const passwordInput = loginOverlay.querySelector('#passwordInput');
        const messageElement = loginOverlay.querySelector('#loginMessage') || loginOverlay.querySelector('#loginMessageModal');

        if (telefonInput) telefonInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (messageElement) messageElement.innerHTML = '';

        postaniTrenerOverlay.style.display = 'flex';
    }
}

const postaniTrenerOverlay = document.getElementById('postaniTrenerOverlay');

document.addEventListener("DOMContentLoaded", function() {

    document.getElementById("postaniTrenerButton").addEventListener("click", (e) => {
        e.preventDefault();
        const postaniTrenerOverlay = document.getElementById("postaniTrenerOverlay");
        if (postaniTrenerOverlay.style.display === "none") {
            postaniTrenerOverlay.style.display = "flex";
        } else {
            postaniTrenerOverlay.style.display = "none";
        }
    })

    const postaniTrenerForm = document.getElementById("postaniTrenerForm");
    postaniTrenerForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const postaniTrenerImeInput = document.querySelector("#postaniTrenerImeInput").value;
        console.log(postaniTrenerImeInput);
        const postaniTrenerPriimekInput = document.querySelector("#postaniTrenerPriimekInput").value;
        console.log(postaniTrenerPriimekInput);
        const postaniTrenerTelefonInput = document.querySelector("#postaniTrenerTelefonInput").value;
        console.log(postaniTrenerTelefonInput);
        const postaniTrenerUrnikInput = document.querySelector("#postaniTrenerUrnikInput").value;
        console.log(postaniTrenerUrnikInput);
        const postaniTrenerOpisInput = document.querySelector("#postaniTrenerOpisInput").value;
        console.log(postaniTrenerOpisInput);

        const user = JSON.parse(sessionStorage.getItem("uporabnikInfo"));

        const response = await fetch('http://localhost:3000/api/postaniTrener', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({email: user.email, ime: postaniTrenerImeInput, priimek: postaniTrenerPriimekInput, telefon: postaniTrenerTelefonInput, urnik: postaniTrenerUrnikInput, opis: postaniTrenerOpisInput})

        })

        if (response.ok) {
            const res = await response.json();
            console.log(res);
            console.log("uspesen trener");
        }
    })
    
});

