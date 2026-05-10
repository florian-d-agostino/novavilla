document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("events-container");
    const prevBtn = document.getElementById("prev-event");
    const nextBtn = document.getElementById("next-event");
    
    let currentIndex = 0;
    let totalCards = 0;

    // =========================================================================
    // 🎓 CONFIGURATION DE L'API OPENAGENDA (Façon Étudiant)
    // =========================================================================
    // 💡 Astuce : Laisse ces valeurs vides pour utiliser tes cartes HTML par défaut.
    // Dès que tu mets tes vraies infos, le site se connecte tout seul à OpenAgenda !
    const OPENAGENDA_API_KEY = ""; // 🔑 Colle ta clé publique API OpenAgenda ici
    const OPENAGENDA_UID = "";     // 📅 Colle l'identifiant unique (UID) de ton agenda ici (ex: "1234567")

    // =========================================================================
    // 🔄 LOGIQUE DE CHARGEMENT
    // =========================================================================
    async function initApp() {
        // Si les clés ne sont pas configurées, on utilise le HTML statique actuel
        if (!OPENAGENDA_API_KEY || !OPENAGENDA_UID) {
            console.log("ℹ️ OpenAgenda non configuré. Utilisation des cartes HTML existantes.");
            initFromHTML();
            return;
        }

        console.log("🚀 Connexion à l'API OpenAgenda en cours...");
        await loadEventsFromOpenAgenda();
    }

    // =========================================================================
    // 📡 RÉCUPÉRATION DES DONNÉES (FETCH API)
    // =========================================================================
    async function loadEventsFromOpenAgenda() {
        // Construction de l'URL OpenAgenda API v2
        // On demande la langue française ('monolingual=fr') et des détails complets ('detailed=1')
        const url = `https://api.openagenda.com/v2/agendas/${OPENAGENDA_UID}/events?key=${OPENAGENDA_API_KEY}&monolingual=fr&detailed=1`;

        try {
            // ⚡ Fetch: On envoie la requête HTTP à l'API
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            // Les événements d'OpenAgenda se trouvent généralement dans l'attribut 'events'
            const events = data.events || [];
            
            if (events.length === 0) {
                container.innerHTML = `
                    <div class="main-card" style="display:flex; justify-content:center; align-items:center; text-align:center; padding:20px; color:#fff;">
                        <div>
                            <h3>📅 Aucun événement</h3>
                            <p style="font-size:0.8rem; margin-top:5px;">Ton agenda OpenAgenda est vide ou n'a pas d'événements à venir.</p>
                        </div>
                    </div>
                `;
                initFromHTML();
                return;
            }

            // Génération des cartes avec les données récupérées !
            renderEvents(events);

        } catch (error) {
            console.error("❌ Impossible de charger OpenAgenda:", error);
            // En cas d'erreur de connexion ou de CORS, on affiche un message d'erreur sympa
            container.innerHTML = `
                <div class="main-card" style="display:flex; justify-content:center; align-items:center; text-align:center; padding:20px; color:#fff;">
                    <div>
                        <h3 style="color:#FF2975;">⚠️ Erreur de connexion</h3>
                        <p style="font-size:0.8rem; margin-top:5px;">Vérifie ta clé API, ton UID ou ta connexion Internet.</p>
                    </div>
                </div>
            `;
            initFromHTML();
        }
    }

    // =========================================================================
    // 🎨 INJECTION DANS LE DOM (Rendu des cartes)
    // =========================================================================
    function renderEvents(events) {
        container.innerHTML = ""; // On vide les cartes HTML temporaires
        
        // On limite par exemple à 5 événements max pour un carrousel fluide
        const eventsToDisplay = events.slice(0, 5);
        totalCards = eventsToDisplay.length;

        eventsToDisplay.forEach(event => {
            // 🔍 Traitement des données pour éviter les bugs si un champ est manquant :
            const title = event.title?.fr || event.title || "Événement sans titre";
            const address = event.location?.name || event.location?.address || "Lieu non précisé";
            
            // Image : On cherche s'il y a une image d'OpenAgenda, sinon on met une image de secours (placeholder)
            const imageUrl = event.image?.square || event.image?.original || "../assets/map.png";
            
            // Lien de réservation : On cherche s'il y a un lien de billetterie, sinon on renvoie vers sa page OpenAgenda
            const bookingUrl = event.registration?.[0]?.value || `https://openagenda.com/events/${event.slug}` || "#";

            // Création de la structure HTML de la carte
            const cardHTML = `
                <div class="main-card">
                    <div class="card-header">${title}</div>
                    <div class="card-body">
                        <img src="${imageUrl}" alt="${title}" onerror="this.src='../assets/map.png';">
                    </div>
                    <div class="card-footer">
                        <span>📍 ${address}</span>
                        <div class="button-booking" onclick="window.open('${bookingUrl}', '_blank')">Reservation</div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", cardHTML);
        });

        // Activation de l'interactivité du carrousel
        initSwitcherControls();
    }

    // =========================================================================
    // 🎛️ LOGIQUE INTERACTIVE DU CARROUSEL (SWAP)
    // =========================================================================
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

        // Style désactivé si on est au bout du carrousel
        prevBtn.classList.toggle("disabled", currentIndex === 0);
        nextBtn.classList.toggle("disabled", currentIndex === totalCards - 1);
    }

    // Clics sur les flèches
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

    // Support tactile (Swipe)
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

    // Initialisation globale au chargement de la page
    initApp();
});
