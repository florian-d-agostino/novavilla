// On attend que la page soit prête
document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. CRÉATION DE LA CARTE ---
    // On crée la carte et on la centre sur Marseille
    var maCarte = L.map('map').setView([43.2965, 5.3698], 13);

    // On ajoute le fond de carte (le dessin de la carte)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(maCarte);


    // --- 2. LES DONNÉES DES ÉVÉNEMENTS ---
    // Un tableau simple avec nos activités fictives
    var listeEvenements = [
        {
            nom: "Festival des Arts",
            jour: "29 Avril",
            lieu: "127 Blvd Taschereau, Marseille",
            image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400",
            gps: [43.2965, 5.3698],
            type: "Festival",
            couleur: "#B000FF"
        },
        {
            nom: "Soirée Jazz",
            jour: "05 Mai",
            lieu: "Vieux Port, Marseille",
            image: "https://images.unsplash.com/photo-1511192303578-4a7b974a4286?w=400",
            gps: [43.2850, 5.3750],
            type: "Concert",
            couleur: "#FF2975"
        },
        {
            nom: "Marathon Marseille",
            jour: "12 Mai",
            lieu: "Corniche Kennedy, Marseille",
            image: "https://images.unsplash.com/photo-1530549387631-afb168514626?w=400",
            gps: [43.3000, 5.3800],
            type: "Sportif",
            couleur: "#17FF62"
        },
        {
            nom: "Sortie Famille Parc",
            jour: "15 Mai",
            lieu: "Parc Borély, Marseille",
            image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400",
            gps: [43.2600, 5.3800],
            type: "Famille",
            couleur: "#FFD319"
        }
    ];


    // --- 3. GESTION DES MARQUEURS ---
    
    // On crée un "groupe" pour ranger nos marqueurs (pratique pour tout effacer d'un coup)
    var groupeMarqueurs = L.layerGroup().addTo(maCarte);

    // Fonction qui dessine les points sur la carte
    function afficherLesPoints(categorieChoisie) {
        
        // On commence par vider la carte
        groupeMarqueurs.clearLayers();

        // On parcourt tous nos événements
        for (var i = 0; i < listeEvenements.length; i++) {
            var event = listeEvenements[i];

            // Si on veut TOUT voir OU si le type correspond à la catégorie choisie
            if (categorieChoisie === "Tous" || event.type === categorieChoisie) {
                
                // Création d'une icône de couleur
                var iconeCouleur = L.divIcon({
                    className: 'marker-style',
                    html: '<div style="background-color:' + event.couleur + '; width:15px; height:15px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>',
                    iconSize: [15, 15]
                });

                // On crée le marqueur
                var marqueur = L.marker(event.gps, { icon: iconeCouleur });

                // On ajoute l'action au clic sur le marqueur
                marqueur.on('click', function(e) {
                    // On retrouve les données de l'event cliqué (on utilise une astuce simple ici)
                    // Pour simplifier, on remplit la popup avec les infos de l'event actuel de la boucle
                    // Note : dans une boucle, il faut faire attention au 'scope', mais ici avec var/let c'est ok
                    
                    // Remplissage de la popup personnalisée
                    document.getElementById('popup-title').innerText = this.options.titre_event;
                    document.getElementById('popup-date').innerText = this.options.date_event;
                    document.getElementById('popup-address').innerText = this.options.lieu_event;
                    document.getElementById('popup-img').src = this.options.image_event;

                    // Couleur du fond de la popup avec l'effet dégradé
                    var pop = document.getElementById('custom-popup');
                    pop.style.background = "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, " + this.options.couleur_event + " 100%)";
                    pop.classList.add('active');
                });

                // On stocke les infos dans le marqueur pour les retrouver au clic
                marqueur.options.titre_event = event.nom;
                marqueur.options.date_event = event.jour;
                marqueur.options.lieu_event = event.lieu;
                marqueur.options.image_event = event.image;
                marqueur.options.couleur_event = event.couleur;

                // On ajoute le marqueur au groupe sur la carte
                marqueur.addTo(groupeMarqueurs);
            }
        }
    }


    // --- 4. GESTION DU MENU CATÉGORIES ---
    var boutonMenu = document.getElementById('categories-btn');
    var menuListe = document.getElementById('categories-menu');
    var lesOptions = document.getElementsByClassName('category-option');

    // Ouvrir / Fermer le menu
    boutonMenu.addEventListener('click', function() {
        menuListe.classList.toggle('active');
    });

    // Quand on clique sur une option du menu
    for (var j = 0; j < lesOptions.length; j++) {
        lesOptions[j].addEventListener('click', function() {
            var nomCategorie = this.getAttribute('data-category');
            
            // On change le texte du bouton principal
            boutonMenu.innerText = nomCategorie;

            // On filtre les points sur la carte
            afficherLesPoints(nomCategorie);

            // On ferme le menu
            menuListe.classList.remove('active');
        });
    }


    // --- 5. FERMETURE DE LA POPUP ---
    var boutonFermerPopup = document.querySelector('.close-popup');
    
    boutonFermerPopup.addEventListener('click', function() {
        document.getElementById('custom-popup').classList.remove('active');
    });

    maCarte.on('click', function() {
        document.getElementById('custom-popup').classList.remove('active');
    });


    // --- 6. AU DÉMARRAGE ---
    afficherLesPoints("Tous");

});
