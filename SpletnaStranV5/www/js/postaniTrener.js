document.addEventListener("DOMContentLoaded", function() {
    const postaniTrenerForm = document.getElementById("postaniTrenerForm");
    const sportiSelect = document.getElementById('sportiInput');

    // Funkcija za pridobitev in prikaz vseh športov v select meniju
    async function naloziSporte() {
        if (!sportiSelect) return;
        try {
            const response = await fetch('/api/vsi-sporti');
            if (!response.ok) throw new Error('Napaka pri nalaganju športov.');

            const sporti = await response.json();
            sportiSelect.innerHTML = ''; // Počistimo morebitne obstoječe opcije
            sporti.forEach(sport => {
                const option = document.createElement('option');
                option.value = sport.id;
                option.textContent = sport.ime_sporta;
                sportiSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Napaka pri pridobivanju športov:", error);
            sportiSelect.innerHTML = '<option disabled>Ni mogoče naložiti seznama športov.</option>';
        }
    }

    // Naložimo športe takoj, ko je stran pripravljena
    naloziSporte();

    if (postaniTrenerForm) {
        postaniTrenerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Pridobimo žeton iz sessionStorage ali localStorage
            const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

            if (!token) {
                alert("Za oddajo prošnje morate biti prijavljeni. Preusmerjam na prijavo.");
                window.location.href = 'prijava.html'; // Preusmeritev na prijavo
                return;
            }

            // Pravilno preberemo vrednosti iz obrazca
            const ime = document.getElementById("imeInput").value;
            const priimek = document.getElementById("priimekInput").value;
            const kontakt_email = document.getElementById("emailInput").value;
            const telefon = document.getElementById("telefonInput").value;
            const lokacija = document.getElementById("lokacijaInput").value;
            const urnik = document.getElementById("urnikInput").value;
            const opis = document.getElementById("opisInput").value;

            // Pridobimo vrednosti iz multi-select polja
            const izbraniSporti = Array.from(sportiSelect.selectedOptions).map(option => option.value);

            if (izbraniSporti.length === 0) {
                alert("Izbrati morate vsaj en šport.");
                return;
            }

            const dataToSend = {
                ime: ime,
                priimek: priimek,
                kontakt_email: kontakt_email,
                telefon: telefon,
                lokacija: lokacija,
                urnik: urnik,
                opis: opis,
                sporti: izbraniSporti // Pošljemo kot polje ID-jev
            };

            console.log("Pošiljanje podatkov na /api/postaniTrener:", dataToSend);

            try {
                const response = await fetch('/api/postaniTrener', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // KLJUČEN DEL: Pošiljanje avtorizacijskega žetona
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(dataToSend)
                });

                const responseData = await response.json();

                if (response.ok) {
                    alert(responseData.message || "Uspešno ste postali trener! Vaše pravice so bile posodobljene.");

                    // Posodobimo podatke v sessionStorage/localStorage z novim žetonom in podatki
                    if (sessionStorage.getItem("accessToken")) {
                        sessionStorage.setItem("accessToken", responseData.accessToken);
                        sessionStorage.setItem("uporabnikInfo", JSON.stringify(responseData.uporabnik));
                    }
                    if (localStorage.getItem("accessToken")) {
                        localStorage.setItem("accessToken", responseData.accessToken);
                        localStorage.setItem("uporabnikInfo", JSON.stringify(responseData.uporabnik));
                    }

                    // Preusmerimo na profilno stran ali domačo stran
                    window.location.href = 'uredi-profil.html';

                } else {
                    console.error("Napaka s strežnika:", response.status, responseData);
                    alert(`Napaka pri pošiljanju prošnje: ${responseData.message || response.statusText}`);
                }
            } catch (error) {
                console.error("Napaka pri pošiljanju zahteve (fetch):", error);
                alert("Prišlo je do napake pri komunikaciji s strežnikom. Poskusite znova kasneje.");
            }
        });
    }
});