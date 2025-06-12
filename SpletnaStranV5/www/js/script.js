/**
 * Prikaže obvestilo po meri, ki samo izgine.
 * @param {string} message Sporočilo, ki bo prikazano.
 * @param {boolean} isError Če je true, bo ozadje rdeče, sicer privzeto.
 */
function showCustomAlert(message, isError = false) {
    // Ustvari nov div element
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.textContent = message;

    // Spremeni barvo ozadja za napake
    if (isError) {
        alertBox.style.backgroundColor = '#e74c3c'; // Rdeča barva za napako
    }

    // Doda element na stran
    document.body.appendChild(alertBox);

    // Po kratkem času doda class 'show', da sproži animacijo
    setTimeout(() => {
        alertBox.classList.add('show');
    }, 10); // Majhna zakasnitev za sprožitev CSS prehoda

    // Nastavi časovnik, da se obvestilo odstrani po 2 sekundah
    setTimeout(() => {
        alertBox.classList.remove('show');

        // Počakaj, da se animacija zaključi, preden odstraniš element
        alertBox.addEventListener('transitionend', () => {
            if (alertBox.parentElement) {
                document.body.removeChild(alertBox);
            }
        });
    }, 2000); // 2000ms = 2 sekundi
}