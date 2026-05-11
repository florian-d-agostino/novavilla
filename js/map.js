document.addEventListener('DOMContentLoaded', function() {





    // --- MAP CREATION ---
    var myMap = L.map('map').setView([43.2965, 5.3698], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(myMap);





    // --- EVENT DATA ---
    const OPENAGENDA_API_KEY = "512a334322fe409fbbfb9da05c29440a";
    const OPENAGENDA_UID = "21769447";

    var eventList = [];
    var savedDateStr = localStorage.getItem('novaVillaSelectedDate');
    var selectedFilterDate = savedDateStr ? new Date(savedDateStr) : new Date("2026-04-29");
    var selectedFilterCategory = "Tous";
    var rawApiEvents = [];

    const MOCK_EVENTS = [
        {
            name: "Festival des Arts",
            date: "29 Avril",
            location: "127 Blvd Taschereau, Marseille",
            image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400",
            gps: [43.2965, 5.3698],
            type: "Festival",
            color: "#B000FF"
        },
        {
            name: "Soirée Jazz",
            date: "05 Mai",
            location: "Vieux Port, Marseille",
            image: "https://images.unsplash.com/photo-1511192303578-4a7b974a4286?w=400",
            gps: [43.2850, 5.3750],
            type: "Concert",
            color: "#FF2975"
        },
        {
            name: "Marathon Marseille",
            date: "12 Mai",
            location: "Corniche Kennedy, Marseille",
            image: "https://images.unsplash.com/photo-1530549387631-afb168514626?w=400",
            gps: [43.3000, 5.3800],
            type: "Sportif",
            color: "#17FF62"
        },
        {
            name: "Sortie Famille Parc",
            date: "15 Mai",
            location: "Parc Borély, Marseille",
            image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400",
            gps: [43.2600, 5.3800],
            type: "Famille",
            color: "#FFD319"
        }
    ];





    // --- MARKER MANAGEMENT ---
    
    var markerGroup = L.layerGroup().addTo(myMap);

    /**
     * Clears existing markers and generates new colored map pins
     * for each event matching the chosen category.
     * Also binds a click event to open the customized popup window.
     * 
     * @param {string} chosenCategory - The name of the category to filter ("Tous", "Concert", etc.).
     */
    function displayPoints(chosenCategory) {
        
        markerGroup.clearLayers();

        for (var i = 0; i < eventList.length; i++) {
            var event = eventList[i];

            if (chosenCategory === "Tous" || event.type === chosenCategory) {
                
                var colorIcon = L.divIcon({
                    className: 'marker-style',
                    html: '<div style="background-color:' + event.color + '; width:15px; height:15px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>',
                    iconSize: [15, 15]
                });

                var marker = L.marker(event.gps, { icon: colorIcon });

                marker.on('click', function(e) {
                    document.getElementById('popup-title').innerText = this.options.eventTitle;
                    document.getElementById('popup-date').innerText = this.options.eventDate;
                    document.getElementById('popup-address').innerText = this.options.eventLocation;
                    document.getElementById('popup-img').src = this.options.eventImage;

                    var popupElement = document.getElementById('custom-popup');
                    popupElement.style.background = "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, " + this.options.eventColor + " 100%)";
                    popupElement.classList.add('active');
                });

                marker.options.eventTitle = event.name;
                marker.options.eventDate = event.date;
                marker.options.eventLocation = event.location;
                marker.options.eventImage = event.image;
                marker.options.eventColor = event.color;

                marker.addTo(markerGroup);
            }
        }
    }





    // --- CATEGORY MENU MANAGEMENT ---
    var menuBtn = document.getElementById('categories-btn');
    var menuList = document.getElementById('categories-menu');
    var menuOptions = document.getElementsByClassName('category-option');

    menuBtn.addEventListener('click', function() {
        menuList.classList.toggle('active');
    });

    for (var j = 0; j < menuOptions.length; j++) {
        menuOptions[j].addEventListener('click', function() {
            var categoryName = this.getAttribute('data-category');
            
            menuBtn.innerText = categoryName;

            selectedFilterCategory = categoryName;
            filterAndDisplayPoints();

            menuList.classList.remove('active');
        });
    }




    // --- CLOSING THE POPUP ---
    var closePopupBtn = document.querySelector('.close-popup');
    
    closePopupBtn.addEventListener('click', function() {
        document.getElementById('custom-popup').classList.remove('active');
    });

    myMap.on('click', function() {
        document.getElementById('custom-popup').classList.remove('active');
    });

    /**
     * Parses a mock date string (e.g. "1 mai")
     * and converts it to a usable standard YYYY-MM-DD ISO format.
     * 
     * @param {string} dateStr - The mock date string to parse.
     * @returns {string} Normalized date in YYYY-MM-DD format or empty string.
     */
    function parseMockDate(dateStr) {
        if (!dateStr) return "";
        var parts = dateStr.trim().split(" ");
        if (parts.length < 2) return "";
        var day = parts[0].padStart(2, "0");
        var monthName = parts[1].toLowerCase();
        var year = new Date().getFullYear();
        
        var months = {
            "janvier": "01", "février": "02", "mars": "03", "avril": "04", "mai": "05", "juin": "06",
            "juillet": "07", "août": "08", "septembre": "09", "octobre": "10", "novembre": "11", "décembre": "12"
        };
        var month = months[monthName] || "04";
        return year + "-" + month + "-" + day;
    }

    /**
     * Filters OpenAgenda events based on the active category
     * and selected date (excludes events ending before this date),
     * then updates the map display.
     */
    function filterAndDisplayPoints() {
        var targetDate = new Date(selectedFilterDate);
        targetDate.setHours(0, 0, 0, 0);

        eventList = rawApiEvents.filter(function(event) {
            if (selectedFilterCategory !== "Tous" && event.type !== selectedFilterCategory) {
                return false;
            }

            if (event.rawTimings && event.rawTimings.length > 0) {
                return event.rawTimings.some(function(timing) {
                    var endDate = new Date(timing.end);
                    endDate.setHours(0, 0, 0, 0);
                    return endDate >= targetDate;
                });
            }

            if (event.rawDate) {
                if (event.rawDate.includes("-")) {
                    var eventDate = new Date(event.rawDate);
                    eventDate.setHours(0, 0, 0, 0);
                    return eventDate >= targetDate;
                } else {
                    var dateStr = parseMockDate(event.rawDate);
                    if (dateStr) {
                        var eventDate = new Date(dateStr);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate >= targetDate;
                    }
                }
            }

            return true;
        });

        displayPoints("Tous");
    }




    // --- ON START WITH DYNAMIC LOADING ---
    /**
     * Initializes the geographical map. Tries to fetch real events
     * from the OpenAgenda API and format them. If an API error occurs or it's unconfigured,
     * loads offline mock local data (MOCK_EVENTS).
     */
    async function initMapEvents() {
        if (!OPENAGENDA_API_KEY || !OPENAGENDA_UID) {
            rawApiEvents = MOCK_EVENTS.map(function(ev) {
                return {
                    name: ev.name,
                    date: ev.date,
                    location: ev.location,
                    image: ev.image,
                    gps: ev.gps,
                    type: ev.type,
                    color: ev.color,
                    rawDate: ev.date
                };
            });
            filterAndDisplayPoints();
            return;
        }



        // Fetch MAPS Events data 
        const url = `https://api.openagenda.com/v2/agendas/${OPENAGENDA_UID}/events?key=${OPENAGENDA_API_KEY}&monolingual=fr&detailed=1&relative%5B0%5D=current&relative%5B1%5D=upcoming&size=100`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("API Error");
            const data = await response.json();
            const apiEvents = data.events || [];

            if (apiEvents.length === 0) {
                rawApiEvents = MOCK_EVENTS.map(function(ev) {
                    return {
                        name: ev.name,
                        date: ev.date,
                        location: ev.location,
                        image: ev.image,
                        gps: ev.gps,
                        type: ev.type,
                        color: ev.color,
                        rawDate: ev.date
                    };
                });
            } else {
                rawApiEvents = apiEvents.map(event => {
                    let cat = "Festival";
                    let color = "#B000FF";
                    const titleText = (event.title?.fr || event.title || "").toLowerCase();
                    if (titleText.includes("concert") || titleText.includes("jazz") || titleText.includes("musique")) {
                        cat = "Concert";
                        color = "#FF2975";
                    } else if (titleText.includes("sport") || titleText.includes("tennis") || titleText.includes("marathon") || titleText.includes("vélo") || titleText.includes("ride") || titleText.includes("challenge")) {
                        cat = "Sportif";
                        color = "#17FF62";
                    } else if (titleText.includes("famille") || titleText.includes("enfant") || titleText.includes("atelier")) {
                        cat = "Famille";
                        color = "#FFD319";
                    }




                    let img = "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400";
                    if (cat === "Concert") img = "https://images.unsplash.com/photo-1511192303578-4a7b974a4286?w=400";
                    if (cat === "Sportif") img = "https://images.unsplash.com/photo-1530549387631-afb168514626?w=400";
                    if (cat === "Famille") img = "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400";




                    let realImg = img;
                    if (event.image) {
                        if (typeof event.image === "string") {
                            realImg = event.image;
                        } else if (event.image.base && event.image.filename) {
                            realImg = event.image.base + event.image.filename;
                        } else if (event.image.square) {
                            realImg = event.image.square;
                        } else if (event.image.original) {
                            realImg = event.image.original;
                        }
                    }

                    let lat = event.location?.latitude || 43.2965;
                    let lng = event.location?.longitude || 5.3698;

                    return {
                        name: event.title?.fr || event.title || "Événement NovaVilla",
                        date: event.dateRange || (event.timings?.[0]?.start ? formatDate(event.timings[0].start) : "Prochainement"),
                        location: event.location?.name || event.location?.address || "Marseille",
                        image: realImg,
                        gps: [lat, lng],
                        type: cat,
                        color: color,
                        rawTimings: event.timings,
                        rawDate: event.timings?.[0]?.start
                    };
                });
            }

        // If error 
        } catch (error) {
            console.warn("Could not load OpenAgenda events for map. Using offline mock.", error);
            rawApiEvents = MOCK_EVENTS.map(function(ev) {
                return {
                    name: ev.name,
                    date: ev.date,
                    location: ev.location,
                    image: ev.image,
                    gps: ev.gps,
                    type: ev.type,
                    color: ev.color,
                    rawDate: ev.date
                };
            });
        }
        filterAndDisplayPoints();
    }




    // --- DATE FORMATTING FR --  
    /**
     * Formats a standard ISO date into friendly French text (e.g., "11 Mai").
     * 
     * @param {string} isoString - Date in ISO format.
     * @returns {string} Human-readable formatted date.
     */
    function formatDate(isoString) {
        const d = new Date(isoString);
        const day = d.getDate();
        const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const monthName = months[d.getMonth()] || "Avril";
        return `${day} ${monthName}`;
    }


    // --- EVENT LISTENER --  
    document.addEventListener("novaVillaDateChanged", function(e) {
        selectedFilterDate = e.detail;
        filterAndDisplayPoints();
    });

    initMapEvents();

});
