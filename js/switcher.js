document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("events-container");
    const prevBtn = document.getElementById("prev-event");
    const nextBtn = document.getElementById("next-event");
    
    let currentIndex = 0;
    let totalCards = 0;

    // --- MODE ATTENTE API (Lecture du HTML existant) ---
    function initFromHTML() {
        const cards = container.querySelectorAll(".main-card");
        totalCards = cards.length;
        
        if (totalCards <= 1) {
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
            return;
        } else {
            if (prevBtn) prevBtn.style.display = "flex";
            if (nextBtn) nextBtn.style.display = "flex";
        }
        updateSwitcher();
    }

    function updateSwitcher() {
        const offset = currentIndex * -100;
        container.style.transform = `translateX(${offset}%)`;

        // Désactivation des flèches aux extrémités
        prevBtn.classList.toggle("disabled", currentIndex === 0);
        nextBtn.classList.toggle("disabled", currentIndex === totalCards - 1);
    }

    // Événements de navigation
    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSwitcher();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentIndex < totalCards - 1) {
            currentIndex++;
            updateSwitcher();
        }
    });

    // Support du Swipe Tactile
    let touchStartX = 0;
    container.addEventListener("touchstart", e => touchStartX = e.changedTouches[0].screenX);
    container.addEventListener("touchend", e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50 && currentIndex < totalCards - 1) {
            currentIndex++;
            updateSwitcher();
        } else if (touchEndX > touchStartX + 50 && currentIndex > 0) {
            currentIndex--;
            updateSwitcher();
        }
    });

    // Lancement immédiat sur le contenu HTML
    initFromHTML();
});
