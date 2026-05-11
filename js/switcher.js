document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("events-container");
    const prevBtn = document.getElementById("prev-event");
    const nextBtn = document.getElementById("next-event");
    
    let currentIndex = 0;
    let totalCards = 0;

    const OPENAGENDA_API_KEY = "512a334322fe409fbbfb9da05c29440a";
    const OPENAGENDA_UID = "21769447";  

    const MOCK_EVENTS = [
        {
            title: "Festival des Arts",
            date: "29 Avril 2026",
            location: { name: "127 Blvd Taschereau, Marseille" },
            image: { square: "./assets/img/festival.jpg" },
            registration: [{ value: "https://openagenda.com" }]
        },
        {
            title: "Soirée Jazz",
            date: "05 Mai 2026",
            location: { name: "Vieux Port, Marseille" },
            image: { square: "./assets/img/concert.jpg" },
            registration: [{ value: "https://openagenda.com" }]
        },
        {
            title: "Marathon Marseille",
            date: "12 Mai 2026",
            location: { name: "Corniche Kennedy, Marseille" },
            image: { square: "./assets/img/sportif - tennis.jpg" },
            registration: [{ value: "https://openagenda.com" }]
        },
        {
            title: "Sortie Famille Parc",
            date: "15 Mai 2026",
            location: { name: "Parc Borély, Marseille" },
            image: { square: "./assets/img/famille.jpg" },
            registration: [{ value: "https://openagenda.com" }]
        }
    ];

    let originalEventsList = [];
    let savedDateStr = localStorage.getItem('novaVillaSelectedDate');
    let selectedDate = savedDateStr ? new Date(savedDateStr) : new Date("2026-04-29");


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
        const url = `https://api.openagenda.com/v2/agendas/${OPENAGENDA_UID}/events?key=${OPENAGENDA_API_KEY}&monolingual=fr&detailed=1&relative%5B0%5D=current&relative%5B1%5D=upcoming&size=100`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            const events = data.events || [];
            
            if (events.length === 0) {
                console.log("OpenAgenda is empty. Displaying beautiful offline mock events.");
                originalEventsList = MOCK_EVENTS;
            } else {
                originalEventsList = events;
            }

            filterAndDisplayEvents();

        } catch (error) {
            console.warn("Failed to load OpenAgenda (maybe local CORS block). Displaying offline mock events:", error);
            originalEventsList = MOCK_EVENTS;
            filterAndDisplayEvents();
        }
    }

    function parseMockDate(dateStr) {
        if (!dateStr) return "";
        const parts = dateStr.split(" ");
        if (parts.length < 3) return "";
        const day = parts[0].padStart(2, "0");
        const monthName = parts[1].toLowerCase();
        const year = parts[2];
        
        const months = {
            "janvier": "01", "février": "02", "mars": "03", "avril": "04", "mai": "05", "juin": "06",
            "juillet": "07", "août": "08", "septembre": "09", "octobre": "10", "novembre": "11", "décembre": "12"
        };
        const month = months[monthName] || "01";
        return `${year}-${month}-${day}`;
    }

    function filterAndDisplayEvents() {
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);

        const filtered = originalEventsList.filter(event => {

            if (event.timings && event.timings.length > 0) {
                return event.timings.some(timing => {
                    const endDate = new Date(timing.end);
                    endDate.setHours(0, 0, 0, 0);
                    return endDate >= targetDate;
                });
            }
            

            const dateStr = event.date;
            if (dateStr) {
                if (dateStr.includes("-")) {
                    const eventDate = new Date(dateStr);
                    eventDate.setHours(0, 0, 0, 0);
                    return eventDate >= targetDate;
                } else {
                    const eventDateStr = parseMockDate(dateStr);
                    if (eventDateStr) {
                        const eventDate = new Date(eventDateStr);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate >= targetDate;
                    }
                }
            }
            return true;
        });

        renderEvents(filtered);
    }

    document.addEventListener("novaVillaDateChanged", (e) => {
        selectedDate = e.detail;
        filterAndDisplayEvents();
    });


    function renderEvents(events) {
        container.innerHTML = "";
        
        if (events.length === 0) {
            totalCards = 0;
            container.innerHTML = `
                <div class="main-card" style="display:flex; justify-content:center; align-items:center; text-align:center; padding:20px; color:#fff;">
                    <div>
                        <h3 style="font-size:1.1rem; color:#FFD319;"><i class="fa-regular fa-calendar-xmark" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i> Aucun événement</h3>
                        <p style="font-size:0.8rem; margin-top:5px; opacity: 0.8;">Il n'y a aucun événement planifié à partir de cette date.</p>
                    </div>
                </div>
            `;
            initSwitcherControls();
            return;
        }
        
        const eventsToDisplay = events.slice(0, 5);
        totalCards = eventsToDisplay.length;

        eventsToDisplay.forEach(event => {
            const title = event.title?.fr || event.title || "Untitled Event";
            const address = event.location?.name || event.location?.address || "Location unspecified";
            const bookingUrl = event.registration?.[0]?.value || `https://openagenda.com/villanova/events/${event.slug}` || "#";


            let fallbackImg = "./assets/img/festival.jpg";
            const titleText = title.toLowerCase();
            if (titleText.includes("concert") || titleText.includes("jazz") || titleText.includes("musique")) {
                fallbackImg = "./assets/img/concert.jpg";
            } else if (titleText.includes("sport") || titleText.includes("tennis") || titleText.includes("marathon") || titleText.includes("vélo") || titleText.includes("ride") || titleText.includes("challenge")) {
                fallbackImg = "./assets/img/sportif - tennis.jpg";
            } else if (titleText.includes("famille") || titleText.includes("enfant") || titleText.includes("atelier")) {
                fallbackImg = "./assets/img/famille.jpg";
            }


            let imageUrl = fallbackImg;
            if (event.image) {
                if (typeof event.image === "string") {
                    imageUrl = event.image;
                } else if (event.image.base && event.image.filename) {
                    imageUrl = event.image.base + event.image.filename;
                } else if (event.image.square) {
                    imageUrl = event.image.square;
                } else if (event.image.original) {
                    imageUrl = event.image.original;
                }
            }

            const cardHTML = `
                <div class="main-card">
                    <div class="card-header">${title}</div>
                    <div class="card-body">
                        <img src="${imageUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='${fallbackImg}';">
                    </div>
                    <div class="card-footer">
                        ${address}
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
