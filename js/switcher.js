document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("events-container");
    const prevBtn = document.getElementById("prev-event");
    const nextBtn = document.getElementById("next-event");
    
    let currentIndex = 0;
    let totalCards = 0;

    const OPENAGENDA_API_KEY = "512a334322fe409fbbfb9da05c29440a";
    const OPENAGENDA_UID = "4464467";  

    // Initialize the application
    async function initApp() {
        if (!OPENAGENDA_API_KEY || !OPENAGENDA_UID) {
            console.log("OpenAgenda not configured. Using existing HTML cards.");
            initFromHTML();
            return;
        }

        console.log("Connecting to OpenAgenda API...");
        await loadEventsFromOpenAgenda();
    }

    async function loadEventsFromOpenAgenda() {
        const url = `https://api.openagenda.com/v2/agendas/${OPENAGENDA_UID}/events?key=${OPENAGENDA_API_KEY}&monolingual=fr&detailed=1`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            const events = data.events || [];
            
            if (events.length === 0) {
                container.innerHTML = `
                    <div class="main-card" style="display:flex; justify-content:center; align-items:center; text-align:center; padding:20px; color:inherit;">
                        <div>
                            <h3>No events</h3>
                            <p style="font-size:0.8rem; margin-top:5px;">Your OpenAgenda is empty or has no upcoming events.</p>
                        </div>
                    </div>
                `;
                initFromHTML();
                return;
            }

            renderEvents(events);

        } catch (error) {
            console.error("Failed to load OpenAgenda:", error);
            container.innerHTML = `
                <div class="main-card" style="display:flex; justify-content:center; align-items:center; text-align:center; padding:20px; color:inherit;">
                    <div>
                        <h3 style="color:#FF2975;">Connection Error</h3>
                        <p style="font-size:0.8rem; margin-top:5px;">Check your API key, UID, or internet connection.</p>
                    </div>
                </div>
            `;
            initFromHTML();
        }
    }

    function renderEvents(events) {
        container.innerHTML = "";
        
        const eventsToDisplay = events.slice(0, 5);
        totalCards = eventsToDisplay.length;

        eventsToDisplay.forEach(event => {
            const title = event.title?.fr || event.title || "Untitled Event";
            const address = event.location?.name || event.location?.address || "Location unspecified";
            const imageUrl = event.image?.square || event.image?.original || "../assets/map.png";
            const bookingUrl = event.registration?.[0]?.value || `https://openagenda.com/villanova/events/${event.slug}` || "#";

            const cardHTML = `
                <div class="main-card">
                    <div class="card-header">${title}</div>
                    <div class="card-body">
                        <img src="${imageUrl}" alt="${title}" onerror="this.src='../assets/map.png';">
                    </div>
                    <div class="card-footer">
                        <span><i class="fa-solid fa-location-dot"></i> ${address}</span>
                        <div class="button-booking" onclick="window.open('${bookingUrl}', '_blank')">Reservation</div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", cardHTML);
        });

        initSwitcherControls();
    }

    function initFromHTML() {
        const cards = container.querySelectorAll(".main-card");
        totalCards = cards.length;
        initSwitcherControls();
    }

    function initSwitcherControls() {
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

        prevBtn.classList.toggle("disabled", currentIndex === 0);
        nextBtn.classList.toggle("disabled", currentIndex === totalCards - 1);
    }

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

    let touchStartX = 0;
    container.addEventListener("touchstart", e => touchStartX = e.changedTouches[0].screenX, { passive: true });
    container.addEventListener("touchend", e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50 && currentIndex < totalCards - 1) {
            currentIndex++;
            updateSwitcher();
        } else if (touchEndX > touchStartX + 50 && currentIndex > 0) {
            currentIndex--;
            updateSwitcher();
        }
    }, { passive: true });

    initApp();
});
