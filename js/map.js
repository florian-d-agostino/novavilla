let map;
let customPopup;

async function initMap() {
    // Éléments du DOM pour le popup
    customPopup = document.getElementById("custom-popup");
    const popupTitle = document.getElementById("popup-title");
    const popupDesc = document.getElementById("popup-desc");
    const closeBtn = document.querySelector(".close-popup");

    // Importer les bibliothèques
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    // Initialisation de la carte (Marseille par défaut)
    map = new Map(document.getElementById("map"), {
        zoom: 14,
        center: { lat: 43.2965, lng: 5.3698 },
        mapId: "DEMO_MAP_ID", // Remplacez par votre Map ID si vous avez des styles personnalisés
        disableDefaultUI: true, // Désactive les boutons Google pour un look plus clean
    });

    // Liste des activités avec leurs positions et couleurs
    const activities = [
        { 
            title: "Plongée VillaNova", 
            description: "Découvrez les fonds marins de la côte bleue avec nos moniteurs certifiés.", 
            position: { lat: 43.2965, lng: 5.3698 },
            color: "#17FF62" // Vert
        },
        { 
            title: "Randonnée Calanques", 
            description: "Une balade inoubliable au cœur du parc national des Calanques.", 
            position: { lat: 43.2850, lng: 5.3850 },
            color: "#FF2975" // Rouge
        },
        { 
            title: "Surf Session", 
            description: "Cours de surf pour tous niveaux sur la plage du Prado.", 
            position: { lat: 43.2650, lng: 5.3750 },
            color: "#FFD319" // Jaune
        }
    ];

    // Création des marqueurs
    activities.forEach(activity => {
        // Personnalisation du pin
        const pin = new PinElement({
            background: activity.color,
            borderColor: "white",
            glyphColor: "white",
        });

        const marker = new AdvancedMarkerElement({
            map,
            position: activity.position,
            content: pin.element,
            title: activity.title,
        });

        // Click sur le marqueur -> Ouvrir le popup personnalisé
        marker.addListener("click", () => {
            popupTitle.innerText = activity.title;
            popupDesc.innerText = activity.description;
            customPopup.classList.add("active");
            
            // Centrer la carte sur le marqueur
            map.panTo(activity.position);
        });
    });

    // Fermer le popup au clic sur la croix
    closeBtn.addEventListener("click", () => {
        customPopup.classList.remove("active");
    });

    // Fermer le popup si on clique ailleurs sur la carte
    map.addListener("click", () => {
        customPopup.classList.remove("active");
    });
}

// Lancement de la carte
initMap();
