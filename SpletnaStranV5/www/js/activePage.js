document.addEventListener('DOMContentLoaded', function () {
    
    const pageButtonsDiv = document.getElementById('buttonGroup');
    const pageButtonsDropdown = document.getElementById('dropdownMenu');

    let initialActivePage = sessionStorage.getItem('activePageButton') || "dejavnosti";

    function setActivePage(pageValue) {
        sessionStorage.setItem('activePageButton', pageValue);

        if (pageButtonsDiv) {
            pageButtonsDiv.querySelectorAll('.pageBtn').forEach(b => {
                if (b.value === pageValue) {
                    b.classList.remove('border-0');
                    b.classList.add('active');
                } else {
                    b.classList.add('border-0');
                    b.classList.remove('active');
                }
            });
        }

        const dropdownButton = document.getElementById('dropdownMenuButton');
        if (pageButtonsDropdown && dropdownButton) {
            const correspondingDropdownBtn = pageButtonsDropdown.querySelector(`.pageBtn[value="${pageValue}"]`);
            if (correspondingDropdownBtn) {
                dropdownButton.innerHTML = correspondingDropdownBtn.innerHTML;
                dropdownButton.value = pageValue;
            }
            pageButtonsDropdown.querySelectorAll('.pageBtn').forEach(b => {
                b.classList.toggle('d-none', b.value === pageValue);
            });
        }
        setPageContent(pageValue);
    }

    if (pageButtonsDiv) {
        pageButtonsDiv.querySelectorAll('.pageBtn').forEach(button => {
            button.addEventListener('click', function () {
                setActivePage(this.value);
            });
        });
    }

    if (pageButtonsDropdown) {
        pageButtonsDropdown.querySelectorAll('.pageBtn').forEach(button => {
            button.addEventListener('click', function () {
                setActivePage(this.value);
                pageButtonsDropdown.classList.add('d-none');
            });
        });
    }

    
    if(window.location.pathname.includes ( '/index.html') || window.location.pathname === '/'){
        setActivePage(initialActivePage);
        document.getElementById('firstContainerContent').addEventListener('click', handleDynamicItemClick);
        document.getElementById('secondContainerContent').addEventListener('click', handleDynamicItemClick);
    }
    
});


export function handleDynamicItemClick(event) {
    const targetItem = event.target.closest('.dynamic-card-item');
    if (targetItem) {
        const id = targetItem.dataset.id;
        const type = targetItem.dataset.type;
        console.log(type, id, targetItem.id)
        

        if (type === 'trener') {
            window.location.href = `/html/profilTrener.html?id=${id}`;
        } else if (type === 'aktivnost') {
            //showActivityDetails(id);
            console.log(type, id)
            window.location.href = `../html/pregledAktivnosti.html?id=${id}`
        } else if (type === 'sport') {
            showSportDetails(id);
        }
    }
}


export async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}, url: ${url}`);
            const errorData = await response.json().catch(() => ({message: 'Neznana napaka pri branju odgovora.'}));
            throw new Error(errorData.message || `Status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Could not fetch data from ${url}:`, error);

        const globalAlert = document.getElementById('globalAlertMessage');
        if (globalAlert) {
            globalAlert.innerHTML = `<div class="alert alert-danger" role="alert">Napaka pri pridobivanju podatkov: ${error.message} (${url})</div>`;
            setTimeout(() => globalAlert.innerHTML = '', 5000);
        }
        return [];
    }
}

function generateStars(rating) {
    const numStars = Math.round(parseFloat(rating));
    if (isNaN(numStars) || numStars <= 0) return '☆☆☆☆☆ (Ni ocen)';
    return '★'.repeat(numStars) + '☆'.repeat(5 - numStars);
}

async function setPageContent(activePage) {
    const searchComp1 = document.getElementById('searchComp1');
    const searchComp2 = document.getElementById('searchComp2');
    const searchComp3 = document.getElementById('searchComp3');
    const searchComp4 = document.getElementById('searchComp4');
    const calendarBtn = document.getElementById('calendarBtn');

    searchComp1.value = '';
    searchComp2.classList.add('d-none');
    searchComp2.value = '';
    searchComp2.placeholder = "Šport";
    searchComp3.classList.add('d-none');
    searchComp3.value = '';
    searchComp3.placeholder = "Datum";
    searchComp4.classList.add('d-none');
    searchComp4.value = '';
    searchComp4.placeholder = "Lokacija";
    calendarBtn.classList.add('d-none');

    let firstContainerTitle = "";
    let secondContainerTitle = "";
    let firstApiUrl = "";
    let secondApiUrl = "";
    let itemTypeFirst = "";


    const firstContainer = document.getElementById('firstContainer');
    const secondContainer = document.getElementById('secondContainer');


    if (firstContainer) firstContainer.classList.remove('d-none');
    if (secondContainer) secondContainer.classList.add('d-none');


    switch (activePage) {
        case "sport":
            searchComp1.placeholder = "Išči šport";
            firstContainerTitle = "Vsi Športi";
            firstApiUrl = "/api/vsi-sporti";
            itemTypeFirst = "sport";

            break;

        case "dejavnosti":
            searchComp1.placeholder = "Išči dejavnost";
            searchComp3.classList.remove('d-none');
            searchComp4.classList.remove('d-none');
            calendarBtn.classList.remove('d-none');

            firstContainerTitle = "Prihajajoče dejavnosti";
            secondContainerTitle = "Dejavnosti v okolici";
            firstApiUrl = "/api/prihajajoce-dejavnosti";
            secondApiUrl = "/api/dejavnosti-okolica";
            itemTypeFirst = "aktivnost";
            if (secondContainer) secondContainer.classList.remove('d-none');
            break;

        case "zdruzenja":
            searchComp1.placeholder = "Išči združenja";
            firstContainerTitle = "Športna Združenja";
            itemTypeFirst = "zdruzenje";
            document.getElementById('firstContainerContent').innerHTML = '<p class="text-center text-muted p-4">Podatki o športnih združenjih trenutno niso na voljo.</p>';
            document.getElementById('secondContainerContent').innerHTML = '';
            firstApiUrl = null;
            break;

        case "trenerji":
            searchComp1.placeholder = "Išči trenerje (ime, priimek)";
            searchComp2.classList.remove('d-none');
            searchComp2.placeholder = "Šport trenerja";
            searchComp4.classList.remove('d-none');

            firstContainerTitle = "Vsi Trenerji";
            firstApiUrl = "/api/vsi-trenerji";
            itemTypeFirst = "trener";
            secondApiUrl = null;
            break;
        default:
            console.warn("Neznana aktivna stran:", activePage);
            document.getElementById('firstContainerText').innerHTML = "";
            document.getElementById('firstContainerContent').innerHTML = '<p>Prosimo izberite kategorijo.</p>';
            document.getElementById('secondContainerText').innerHTML = "";
            document.getElementById('secondContainerContent').innerHTML = '';
            return;
    }

    document.getElementById('firstContainerText').innerHTML = firstContainerTitle;
    if (secondContainerTitle && secondContainer && !secondContainer.classList.contains('d-none')) {
        document.getElementById('secondContainerText').innerHTML = secondContainerTitle;
    } else if (secondContainer) {
        document.getElementById('secondContainerText').innerHTML = "";
    }


    if (firstApiUrl) {
        const firstData = await fetchData(firstApiUrl);
        loadContentToContainer(firstData, 'firstContainerContent', itemTypeFirst, activePage);
    } else if (activePage !== "zdruzenja") {
        document.getElementById('firstContainerContent').innerHTML = '<p class="text-center text-muted p-4">Nalaganje podatkov ni uspelo ali pa podatkov ni.</p>';
    }

    if (secondApiUrl && secondContainer && !secondContainer.classList.contains('d-none')) {
        const secondData = await fetchData(secondApiUrl);
        loadContentToContainer(secondData, 'secondContainerContent', itemTypeFirst, activePage);
    } else if (secondContainer) {
        document.getElementById('secondContainerContent').innerHTML = '';
    }
}


export function loadContentToContainer(content, containerId, itemType, activePage) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!content || content.length === 0) {
        container.innerHTML = "<p class='text-center text-muted p-3'>Ni rezultatov za prikaz.</p>";
        return;
    }
    console.log(content)
    content.forEach(c => {
        let itemHtml = '';
        const displayItemType = itemType;
        
        let slikaPath;
        const defaultSportImage = '/slike/default-sport.png';
        const defaultTrainerImage = '/slike/default-profile.png';

        if (displayItemType === 'trener') {
            slikaPath = c.slika ? `data:image/jpeg;base64,${c.slika}` : defaultTrainerImage;
        } else {
            slikaPath = c.slika || defaultSportImage;
        }
        console.log()

        switch (displayItemType) {
            case "sport":
                itemHtml = `
                    <div class="col-sm-6 col-md-4 col-lg-3 col-xl-3 mb-4 dynamic-card-item" data-id="${c.id}" data-type="sport" style="cursor:pointer;">
                        <div class="card h-100 shadow-sm">
                            <img class="card-img-top" style="height: 180px; object-fit: cover;" src="${slikaPath}" alt="${c.Sport}" onerror="this.onerror=null;this.src='${defaultSportImage}';">
                            <div class="card-body text-center">
                                <h5 class="card-title">${c.Sport}</h5>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case "aktivnost":
                itemHtml = `
                    <div class="col-sm-6 col-md-4 col-lg-3 col-xl-3 mb-4 dynamic-card-item" data-id="${c.id}" data-type="aktivnost" style="cursor:pointer;">
                        <div class="card h-100 shadow-sm">
                            <img class="card-img-top" style="height: 180px; object-fit: cover;" src="${atob(c.slika.split(',')[1])}" alt="${c.Naziv}" onerror="this.onerror=null;this.src='${defaultSportImage}';">
                            <div class="card-body">
                                <h5 class="card-title">${c.Naziv}</h5>
                                <p class="card-text mb-1"><small class="text-muted">📍 ${c.Lokacija || 'Neznana lokacija'}</small></p>
                                <p class="card-text mb-1"><small>Šport: ${c.ime_sporta || 'Neznan'}</small></p>
                                <p class="card-text"><small>Cena: ${c.Cena != null ? parseFloat(c.Cena).toFixed(2) + ' €' : 'N/A'}</small></p>
                            </div>
                        </div>
                    </div>
                `;
                break;


            case "trener":
                const opis = c.OpisProfila || c.urnik || 'Specializacije niso navedene';
                const povprecnaOcena = c.povprecna_ocena ? parseFloat(c.povprecna_ocena).toFixed(1) : null;
                itemHtml = `
                    <div class="col-sm-6 col-md-4 col-lg-3 col-xl-3 mb-4 dynamic-card-item" data-id="${c.id}" data-type="trener" style="cursor:pointer;">
                        <div class="card h-100 shadow-sm">
                            <img class="card-img-top" style="height: 180px; object-fit: cover;" src="${slikaPath}" alt="${c.ime} ${c.priimek}" onerror="this.onerror=null;this.src='${defaultTrainerImage}';">
                            <div class="card-body">
                                <h5 class="card-title">${c.ime} ${c.priimek}</h5>
                                <p class="card-text"><small class="text-muted">${opis.substring(0, 50)}${opis.length > 50 ? '...' : ''}</small></p>
                                ${povprecnaOcena ? `<p class="card-text"><small class="text-warning">${generateStars(povprecnaOcena)} (${povprecnaOcena})</small></p>` : '<p class="card-text"><small class="text-muted">Ni ocen</small></p>'}
                            </div>
                        </div>
                    </div>    
                `;
                break;
        }
        container.insertAdjacentHTML('beforeend', itemHtml);
    });
}


async function showTrainerDetails(trainerId) {
    const trainer = await fetchData(`/api/trener/${trainerId}/details`);
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));


    if (trainer && modalTitle && modalBody) {
        modalTitle.textContent = `${trainer.ime} ${trainer.priimek}`;

        const slikaPath = trainer.slika ? `data:image/jpeg;base64,${trainer.slika}` : '/slike/default-profile.png';

        let activitiesHtml = '<h5>Poučevane športne aktivnosti:</h5>';
        if (trainer.aktivnosti && trainer.aktivnosti.length > 0) {
            activitiesHtml += '<ul class="list-group list-group-flush">';
            trainer.aktivnosti.forEach(act => {
                activitiesHtml += `<li class="list-group-item dynamic-card-item" data-id="${act.id}" data-type="aktivnost" style="cursor:pointer;">
                                    <strong>${act.Naziv}</strong> (${act.ime_sporta}) - Lokacija: ${act.Lokacija}, Cena: ${act.Cena != null ? parseFloat(act.Cena).toFixed(2) + '€' : 'N/A'}
                                   </li>`;
            });
            activitiesHtml += '</ul>';
        } else {
            activitiesHtml += '<p>Ta trener trenutno nima vpisanih aktivnosti, ki bi jih poučeval.</p>';
        }

        let ratingsHtml = '<h5>Ocene in komentarji:</h5>';
        if (trainer.ocene && trainer.ocene.length > 0) {
            ratingsHtml += '<ul class="list-group list-group-flush">';
            trainer.ocene.forEach(ocena => {
                const stars = generateStars(ocena.Ocena);
                const datumOcene = ocena.Datum ? new Date(ocena.Datum).toLocaleDateString('sl-SI') : 'Neznan datum';
                ratingsHtml += `<li class="list-group-item"><strong>${ocena.username_uporabnika || 'Anonimen'}:</strong> ${stars} (${ocena.Ocena || 'N/A'})<br><em>${ocena.Komentar || 'Brez komentarja'}</em><br><small class="text-muted">(${datumOcene})</small></li>`;
            });
            ratingsHtml += '</ul>';
        } else {
            ratingsHtml += '<p>Za tega trenerja še ni ocen.</p>';
        }

        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center">
                    <img src="${slikaPath}" alt="${trainer.ime}" class="img-fluid rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover;" onerror="this.onerror=null;this.src='/slike/default-profile.png';">
                </div>
                <div class="col-md-8">
                    <p><strong>Email:</strong> <a href="mailto:${trainer.email}">${trainer.email}</a></p>
                    <p><strong>Telefon:</strong> <a href="tel:${trainer.telefon}">${trainer.telefon}</a></p>
                    <p><strong>Urnik:</strong> ${trainer.urnik || 'Po dogovoru'}</p>
                </div>
            </div>
            <div class="mt-3">
              <p><strong>Opis:</strong> ${trainer.OpisProfila || 'Trener še ni dodal opisa.'}</p>
            </div>
            <hr>
            ${activitiesHtml}
            <hr>
            ${ratingsHtml}
        `;
        detailsModal.show();

        modalBody.querySelectorAll('.dynamic-card-item[data-type="aktivnost"]').forEach(item => {
            item.addEventListener('click', function () {
                detailsModal.hide();
                const modalElement = document.getElementById('detailsModal');
                modalElement.addEventListener('hidden.bs.modal', function handler() {
                    showActivityDetails(item.dataset.id);
                    modalElement.removeEventListener('hidden.bs.modal', handler);
                });
            });
        });

    } else {
        console.error("Could not load trainer details or modal elements not found for ID:", trainerId);
        if (modalBody) modalBody.innerHTML = `<p class="text-danger">Napaka pri nalaganju podrobnosti trenerja. ID: ${trainerId}</p>`;
        if (detailsModal && !detailsModal._isShown) detailsModal.show();
    }
}

async function showActivityDetails(activityId) {
    
    const activity = await fetchData(`/api/aktivnost/${activityId}/details`);
    let modalElement;
    let modalTitle;
    let modalBody;
    let detailsModal;
    if(window.location.pathname === '/html/searchResults.html'){
        modalElement = document.getElementById('detailsModalSR')
        modalTitle = document.getElementById('modalTitleSR');
        console.log(modalTitle.value)
        modalBody = document.getElementById('modalBodySR');
        detailsModal = new bootstrap.Modal(document.getElementById('detailsModalSR'));
    }else if(window.location.pathname === '/'){
        modalElement = document.getElementById('detailsModal')
        modalTitle = document.getElementById('modalTitle');
        modalBody = document.getElementById('modalBody');
        detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
    }
    if (!modalElement) {
    console.error("Modal element not found for current page", window.location.pathname);
    return; // stop if modal element not found to prevent errors
    }
    console.log(activity, modalTitle, modalBody)
    if (activity && modalTitle && modalBody) {
        
        modalTitle.textContent = activity.Naziv;

        const slikaPath = activity.slika || '/slike/default-sport.png';

        let trainerInfoHtml = '<h5>Informacije o trenerju:</h5>';
        if (activity.trener_ime) {
            trainerInfoHtml += `<p class="dynamic-card-item" data-id="${activity.TK_Trener}" data-type="trener" style="cursor:pointer;"><strong>Trener:</strong> ${activity.trener_ime} ${activity.trener_priimek} (klikni za podrobnosti)</p>
                                <p><strong>Kontakt trenerja:</strong> Email: <a href="mailto:${activity.trener_email}">${activity.trener_email}</a>, Tel: <a href="tel:${activity.trener_telefon}">${activity.trener_telefon}</a></p>
                                <p><strong>Urnik trenerja:</strong> ${activity.urnik_trenerja || 'Po dogovoru z trenerjem'}</p>`;
        } else {
            trainerInfoHtml += '<p>Ni podatkov o trenerju za to aktivnost.</p>';
        }

        let ratingsHtml = '<h5>Ocene in komentarji:</h5>';
        if (activity.ocene && activity.ocene.length > 0) {
            ratingsHtml += '<ul class="list-group list-group-flush">';
            activity.ocene.forEach(ocena => {
                const stars = generateStars(ocena.Ocena);
                const datumOcene = ocena.Datum ? new Date(ocena.Datum).toLocaleDateString('sl-SI') : 'Neznan datum';
                ratingsHtml += `<li class="list-group-item"><strong>${ocena.username_uporabnika || 'Anonimen'}:</strong> ${stars} (${ocena.Ocena || 'N/A'})<br><em>${ocena.Komentar || 'Brez komentarja'}</em><br><small class="text-muted">(${datumOcene})</small></li>`;
            });
            ratingsHtml += '</ul>';
        } else {
            ratingsHtml += '<p>Za to aktivnost še ni ocen.</p>';
        }

        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center">
                    <img src="${slikaPath}" alt="${activity.Naziv}" class="img-fluid rounded mb-3" style="max-height: 200px; object-fit: cover;" onerror="this.onerror=null;this.src='/slike/default-sport.png';">
                </div>
                <div class="col-md-8">
                    <p class="dynamic-card-item" data-id="${activity.TK_TipAktivnosti}" data-type="sport" style="cursor:pointer;"><strong>Šport:</strong> ${activity.ime_sporta || 'Neznan'} (klikni za podrobnosti)</p>
                    <p><strong>Opis:</strong> ${activity.Opis || 'Aktivnost nima podrobnejšega opisa.'}</p>
                    <p><strong>Lokacija:</strong> ${activity.Lokacija}</p>
                    <p><strong>Cena:</strong> ${activity.Cena != null ? parseFloat(activity.Cena).toFixed(2) + ' €' : 'Brezplačno ali po dogovoru'}</p>
                    <p><strong>Prosta mesta:</strong> ${activity.ProstaMesta != null ? activity.ProstaMesta : 'Ni podatka'}</p>
                    </div>
            </div>
            <hr>
            ${trainerInfoHtml}
            <hr>
            ${ratingsHtml}
        `;
        detailsModal.show();

        modalBody.querySelectorAll('.dynamic-card-item').forEach(item => {
            item.addEventListener('click', function () {
                const clickId = this.dataset.id;
                const clickType = this.dataset.type;
                detailsModal.hide();
                const modalElement = document.getElementById('detailsModal');
                modalElement.addEventListener('hidden.bs.modal', function handler() {
                    if (clickType === 'trener') showTrainerDetails(clickId);
                    if (clickType === 'sport') showSportDetails(clickId);
                    modalElement.removeEventListener('hidden.bs.modal', handler);
                });
            });
        });

    } else {
        console.error("Could not load activity details or modal elements not found for ID:", activityId);
        if (modalBody) modalBody.innerHTML = `<p class="text-danger">Napaka pri nalaganju podrobnosti aktivnosti. ID: ${activityId}</p>`;
        if (detailsModal && !detailsModal._isShown) detailsModal.show();
    }
}

async function showSportDetails(sportId) {
    const sportData = await fetchData(`/api/sport/${sportId}/details`);
    console.log(sportData)
    let modalElement;
    let modalTitle;
    let modalBody;
    let detailsModal;
    
    if(window.location.pathname === '/'){
        modalElement = document.getElementById('detailsModal')
        modalTitle = document.getElementById('modalTitle');
        modalBody = document.getElementById('modalBody');
        detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
    }else if(window.location.pathname === '/html/searchResults.html'){
        modalElement = document.getElementById('detailsModalSR')
        modalTitle = document.getElementById('modalTitleSR');
        modalBody = document.getElementById('modalBodySR');
        detailsModal = new bootstrap.Modal(document.getElementById('detailsModalSR'));
    }
    if (!modalElement) {
    console.error("Modal element not found for current page", window.location.pathname);
    return; // stop if modal element not found to prevent errors
    }

    if (sportData && modalTitle && modalBody) {
        modalTitle.textContent = `Šport: ${sportData.Sport}`;

        let slikaPath = `/slike/${sportData.Sport.toLowerCase().replace(/\s+/g, '-')}.png`;

        let activitiesHtml = '<h5>Povezane športne aktivnosti:</h5>';
        if (sportData.aktivnosti && sportData.aktivnosti.length > 0) {
            activitiesHtml += '<ul class="list-group list-group-flush">';
            sportData.aktivnosti.forEach(act => {
                let trenerText = act.trener_ime ? ` (Trener: ${act.trener_ime} ${act.trener_priimek})` : '';
                activitiesHtml += `<li class="list-group-item dynamic-card-item" data-id="${act.id}" data-type="aktivnost" style="cursor:pointer;">
                                    <strong>${act.Naziv}</strong> - Lokacija: ${act.Lokacija} 
                                    ${trenerText}
                                    - Cena: ${act.Cena != null ? parseFloat(act.Cena).toFixed(2) + '€' : 'N/A'}
                                   </li>`;
            });
            activitiesHtml += '</ul>';
        } else {
            activitiesHtml += '<p>Za ta šport trenutno ni vpisanih aktivnosti.</p>';
        }

        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center">
                     <img src="${slikaPath}" alt="${sportData.Sport}" class="img-fluid rounded mb-3" style="max-height: 200px; object-fit: cover;" onerror="this.onerror=null;this.src='/slike/default-sport.png';">
                </div>
                <div class="col-md-8">
                    <p>Prebrskajte aktivnosti, povezane s športom <strong>${sportData.Sport}</strong>.</p>
                    </div>
            </div>
            <hr>
            ${activitiesHtml}
        `;
        detailsModal.show();

        modalBody.querySelectorAll('.dynamic-card-item[data-type="aktivnost"]').forEach(item => {
            item.addEventListener('click', function () {
                detailsModal.hide();
                const modalElement = document.getElementById('detailsModal');
                modalElement.addEventListener('hidden.bs.modal', function handler() {
                    showActivityDetails(item.dataset.id);
                    modalElement.removeEventListener('hidden.bs.modal', handler);
                });
            });
        });

    } else {
        console.error("Could not load sport details or modal elements not found for ID:", sportId);
        if (modalBody) modalBody.innerHTML = `<p class="text-danger">Napaka pri nalaganju podrobnosti športa. ID: ${sportId}</p>`;
        if (detailsModal && !detailsModal._isShown) detailsModal.show();
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    if(window.location.pathname === '/searchResults.html'){
        console.log("aaaaaa")
    }
})