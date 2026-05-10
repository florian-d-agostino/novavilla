document.addEventListener("DOMContentLoaded", () => {
    const carouselContainer = document.getElementById("events-container");
    const gridContainer = document.getElementById("events-grid");
    const prevBtn = document.getElementById("prev-event");
    const nextBtn = document.getElementById("next-event");
    const categoriesBtn = document.getElementById("categories-btn");
    const categoriesMenu = document.getElementById("categories-menu");
    const categoryOptions = document.querySelectorAll(".category-option");

    let currentIndex = 0;
    let filteredEvents = [];
    let activeCategory = "Tous";

    const OPENAGENDA_API_KEY = "512a334322fe409fbbfb9da05c29440a";
    const OPENAGENDA_UID = "4464467";

    const MOCK_EVENTS = [
        {
            title: "Festival des Arts",
            category: "Festival",
            date: "29 Avril 2026",
            address: "127 Blvd Taschereau, Marseille",
            image: "../assets/img/festival.jpg",
            bookingUrl: "https://openagenda.com"
        },
        {
            title: "Soirée Jazz au Vieux-Port",
            category: "Concert",
            date: "05 Mai 2026",
            address: "Vieux Port, Marseille",
            image: "../assets/img/concert.jpg",
            bookingUrl: "https://openagenda.com"
        },
        {
            title: "Tournoi de Tennis NovaVilla",
            category: "Sportif",
            date: "12 Mai 2026",
            address: "Corniche Kennedy, Marseille",
            image: "../assets/img/sportif - tennis.jpg",
            bookingUrl: "https://openagenda.com"
        },
        {
            title: "Sortie Pique-Nique en Famille",
            category: "Famille",
            date: "15 Mai 2026",
            address: "Parc Borély, Marseille",
            image: "../assets/img/famille.jpg",
            bookingUrl: "https://openagenda.com"
        },
        {
            title: "Grand Concert Électro",
            category: "Concert",
            date: "22 Mai 2026",
            address: "Le Dôme, Marseille",
            image: "../assets/img/concert.jpg",
            bookingUrl: "https://openagenda.com"
        },
        {
            title: "Raid VTT Urbain",
            category: "Sportif",
            date: "28 Mai 2026",
            address: "Luminy, Marseille",
            image: "../assets/img/sportif - tennis.jpg",
            bookingUrl: "https://openagenda.com"
        },
        {
            title: "Foire de Printemps",
            category: "Festival",
            date: "02 Juin 2026",
            address: "Esplanade de la Major, Marseille",
            image: "../assets/img/festival.jpg",
            bookingUrl: "https://openagenda.com"
        },
        {
            title: "Chasse au Trésor des Minots",
            category: "Famille",
            date: "06 Juin 2026",
            address: "Palais Longchamp, Marseille",
            image: "../assets/img/famille.jpg",
            bookingUrl: "https://openagenda.com"
        }
    ];

    // Initialize application
    async function initPage() {
        if (categoriesBtn) {
            categoriesBtn.addEventListener("click", () => {
                categoriesMenu.classList.toggle("active");
            });
        }

        document.addEventListener("click", (e) => {
            if (categoriesBtn && categoriesMenu && !categoriesBtn.contains(e.target) && !categoriesMenu.contains(e.target)) {
                categoriesMenu.classList.remove("active");
            }
        });

        // Bind Category filter clicks
        categoryOptions.forEach(option => {
            option.addEventListener("click", () => {
                activeCategory = option.getAttribute("data-category");
                categoriesBtn.innerText = activeCategory === "Tous" ? "Catégories" : activeCategory;
                categoriesMenu.classList.remove("active");
                filterAndRender();
            });
        });

        // Load data from API or fall back to Mock
        await loadEventsData();
    }

    async function loadEventsData() {
        if (!OPENAGENDA_API_KEY || !OPENAGENDA_UID) {
            useMockData();
            return;
        }

        const url = `https://api.openagenda.com/v2/agendas/${OPENAGENDA_UID}/events?key=${OPENAGENDA_API_KEY}&monolingual=fr&detailed=1`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("API Error");
            const data = await response.json();
            const apiEvents = data.events || [];

            if (apiEvents.length === 0) {
                useMockData();
            } else {
                // Map OpenAgenda properties to our structure
                filteredEvents = apiEvents.map(event => {
                    // Map categories loosely or default to Festival/Concert based on description or title
                    let cat = "Festival";
                    const titleText = (event.title?.fr || event.title || "").toLowerCase();
                    if (titleText.includes("concert") || titleText.includes("jazz") || titleText.includes("musique")) {
                        cat = "Concert";
                    } else if (titleText.includes("sport") || titleText.includes("tennis") || titleText.includes("marathon")) {
                        cat = "Sportif";
                    } else if (titleText.includes("famille") || titleText.includes("enfant") || titleText.includes("atelier")) {
                        cat = "Famille";
                    }

                    // Map correct local image asset if available, else fallback
                    let img = "../assets/img/festival.jpg";
                    if (cat === "Concert") img = "../assets/img/concert.jpg";
                    if (cat === "Sportif") img = "../assets/img/sportif - tennis.jpg";
                    if (cat === "Famille") img = "../assets/img/famille.jpg";

                    return {
                        title: event.title?.fr || event.title || "Événement NovaVilla",
                        category: cat,
                        date: event.timings?.[0]?.start ? formatDate(event.timings[0].start) : "Prochainement",
                        address: event.location?.name || event.location?.address || "Marseille",
                        image: event.image?.square || event.image?.original || img,
                        bookingUrl: event.registration?.[0]?.value || "#"
                    };
                });
                filterAndRender();
            }
        } catch (error) {
            console.warn("Could not connect to OpenAgenda. Using offline mock events.", error);
            useMockData();
        }
    }

    function useMockData() {
        filteredEvents = MOCK_EVENTS;
        filterAndRender();
    }

    function formatDate(isoString) {
        const d = new Date(isoString);
        const day = d.getDate();
        const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    function filterAndRender() {
        // Filter events based on selected category
        const eventsToShow = activeCategory === "Tous" 
            ? filteredEvents 
            : filteredEvents.filter(e => e.category === activeCategory);

        renderCarousel(eventsToShow);
        renderGrid(eventsToShow);
    }

    function renderCarousel(events) {
        carouselContainer.innerHTML = "";
        currentIndex = 0;

        if (events.length === 0) {
            carouselContainer.innerHTML = `
                <div class="main-card" style="display:flex; justify-content:center; align-items:center; text-align:center; padding:20px; color:inherit;">
                    <div>
                        <h3>Aucun événement</h3>
                        <p style="font-size:0.8rem; margin-top:5px;">Il n'y a aucun événement planifié dans cette catégorie.</p>
                    </div>
                </div>
            `;
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
            return;
        }

        events.forEach(event => {
            const cardHTML = `
                <div class="main-card">
                    <div class="card-header">${event.title}</div>
                    <div class="card-body">
                        <img src="${event.image}" alt="${event.title}" onerror="this.src='../assets/map.png';">
                    </div>
                    <div class="card-footer">
                        <span><i class="fa-solid fa-location-dot"></i> ${event.address}</span>
                        <div class="button-booking" onclick="window.open('${event.bookingUrl}', '_blank')">Reservation</div>
                    </div>
                </div>
            `;
            carouselContainer.insertAdjacentHTML("beforeend", cardHTML);
        });

        initSwitcherControls(events.length);
    }

    function initSwitcherControls(length) {
        if (length <= 1) {
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
        } else {
            if (prevBtn) prevBtn.style.display = "flex";
            if (nextBtn) nextBtn.style.display = "flex";
        }
        updateSwitcher(length);
    }

    function updateSwitcher(length) {
        const offset = currentIndex * -100;
        carouselContainer.style.transform = `translateX(${offset}%)`;

        if (prevBtn && nextBtn) {
            prevBtn.classList.toggle("disabled", currentIndex === 0);
            nextBtn.classList.toggle("disabled", currentIndex === length - 1);
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            const length = carouselContainer.querySelectorAll(".main-card").length;
            if (currentIndex > 0) {
                currentIndex--;
                updateSwitcher(length);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            const length = carouselContainer.querySelectorAll(".main-card").length;
            if (currentIndex < length - 1) {
                currentIndex++;
                updateSwitcher(length);
            }
        });
    }

    function renderGrid(events) {
        gridContainer.innerHTML = "";

        if (events.length === 0) {
            gridContainer.innerHTML = `
                <div class="empty-grid-message">
                    <p>Aucun événement dans cette catégorie pour le moment.</p>
                </div>
            `;
            return;
        }

        events.forEach(event => {
            const catClass = event.category.toLowerCase();
            const gridCardHTML = `
                <div class="event-grid-card ${catClass} fade-in">
                    <div class="grid-card-img-wrapper">
                        <img src="${event.image}" alt="${event.title}" onerror="this.src='../assets/map.png';">
                        <span class="category-badge ${catClass}">${event.category}</span>
                    </div>
                    <div class="grid-card-content">
                        <h3 class="grid-card-title">${event.title}</h3>
                        <div class="grid-card-meta">
                            <p class="grid-card-date"><i class="fa-regular fa-calendar-days"></i> ${event.date}</p>
                            <p class="grid-card-address"><i class="fa-solid fa-location-dot"></i> ${event.address}</p>
                        </div>
                        <button class="button-booking" onclick="window.open('${event.bookingUrl}', '_blank')">Reservation</button>
                    </div>
                </div>
            `;
            gridContainer.insertAdjacentHTML("beforeend", gridCardHTML);
        });
    }

    initPage();
});
