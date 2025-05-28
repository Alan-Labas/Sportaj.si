document.addEventListener("DOMContentLoaded", function() {
    const postaniTrenerOverlay = document.getElementById('postaniTrenerOverlay');
    const postaniTrenerLinkContainer = document.getElementById('postaniTrenerLinkContainer');
    const postaniTrenerForm = document.getElementById("postaniTrenerForm");

    // Funkcija za prikaz modala
    function showPostaniTrenerModal() {
        if (postaniTrenerOverlay) {
            // Po potrebi skrijemo druge modale/overlaye
            const registrationOverlay = document.getElementById('registrationOverlay');
            const loginOverlay = document.getElementById('loginOverlay');
            if (registrationOverlay) registrationOverlay.style.display = 'none';
            if (loginOverlay) loginOverlay.style.display = 'none';
            postaniTrenerOverlay.style.display = 'flex';
        } else {
            console.error("Modalni element 'postaniTrenerOverlay' ni bil najden.");
        }
    }

    function hidePostaniTrenerModal() {
        if (postaniTrenerOverlay) {
            postaniTrenerOverlay.style.display = 'none';
        }
    }

    if (postaniTrenerLinkContainer) {
        postaniTrenerLinkContainer.addEventListener("click", function(e) {
            if (e.target && e.target.id === "postaniTrenerButton") {
                e.preventDefault();
                if (postaniTrenerOverlay) {
                    const isVisible = postaniTrenerOverlay.style.display === 'flex';
                    if (isVisible) {
                        hidePostaniTrenerModal();
                    } else {
                        showPostaniTrenerModal();
                    }
                } else {
                    console.error("Modal 'postaniTrenerOverlay' ni bil najden ob kliku na gumb.");
                }
            }
        });
    } else {
        console.warn("Element 'postaniTrenerLinkContainer' ni bil najden za pripenjanje poslušalca dogodkov.");
    }

    if (postaniTrenerForm) {
        postaniTrenerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const postaniTrenerImeInput = document.querySelector("#postaniTrenerImeInput")?.value || '';
            const postaniTrenerPriimekInput = document.querySelector("#postaniTrenerPriimekInput")?.value || '';
            const postaniTrenerTelefonInput = document.querySelector("#postaniTrenerTelefonInput")?.value || '';
            const postaniTrenerUrnikInput = document.querySelector("#postaniTrenerUrnikInput")?.value || '';
            const postaniTrenerOpisInput = document.querySelector("#postaniTrenerOpisInput")?.value || '';

            const userString = sessionStorage.getItem("uporabnikInfo");
            if (!userString) {
                console.error("Uporabnik ni prijavljen (podatki manjkajo v sessionStorage). Prošnja za trenerja ne bo poslana.");
                alert("Za pošiljanje prošnje morate biti prijavljeni.");
                return;
            }
            const user = JSON.parse(userString);

            if (!user || !user.email) {
                console.error("Email uporabnika ni na voljo. Prošnja za trenerja ne bo poslana.");
                alert("Napaka: Vaš email ni na voljo. Prosimo, poskusite se ponovno prijaviti.");
                return;
            }

            const dataToSend = {
                email: user.email,
                ime: postaniTrenerImeInput,
                priimek: postaniTrenerPriimekInput,
                telefon: postaniTrenerTelefonInput,
                urnik: postaniTrenerUrnikInput,
                opis: postaniTrenerOpisInput
            };

            console.log("Pošiljanje podatkov za 'Postani trener':", dataToSend);

            try {
                const response = await fetch('http://localhost:3000/api/postaniTrener', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend)
                });

                if (response.ok) {
                    const res = await response.json();
                    console.log("Odgovor strežnika (uspeh):", res);
                    alert(res.message || "Prošnja za trenerja je bila uspešno poslana!");
                    hidePostaniTrenerModal();
                    if (postaniTrenerLinkContainer) {
                        postaniTrenerLinkContainer.innerHTML = '<p class="text-success">Vaša prošnja za trenerja je v obdelavi.</p>';
                        setTimeout(() => {
                            if (document.body.contains(postaniTrenerLinkContainer)) {
                                postaniTrenerLinkContainer.classList.add('d-none');
                            }
                        }, 3000);
                    }
                } else {
                    const errorRes = await response.json().catch(() => ({ message: "Napaka pri obdelavi odgovora s strežnika." }));
                    console.error("Napaka s strežnika:", response.status, errorRes);
                    alert(`Napaka pri pošiljanju prošnje: ${errorRes.message || response.statusText}`);
                }
            } catch (error) {
                console.error("Napaka pri pošiljanju zahteve (fetch):", error);
                alert("Prišlo je do napake pri komunikaciji s strežnikom. Poskusite znova kasneje.");
            }
        });
    } else {
        console.warn("Obrazec 'postaniTrenerForm' ni bil najden.");
    }

    if (postaniTrenerOverlay) {
        const closeModalButton = postaniTrenerOverlay.querySelector('.close-modal-button');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', function() {
                hidePostaniTrenerModal();
            });
        }
        postaniTrenerOverlay.addEventListener('click', function(event) {
            if (event.target === postaniTrenerOverlay) {
                hidePostaniTrenerModal();
            }
        });
    }
});
