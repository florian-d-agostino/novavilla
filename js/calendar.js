// On attend que la page soit bien chargée
document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. RÉCUPÉRATION DES ÉLÉMENTS HTML ---
    const boutonCalendrier = document.querySelector('.calendar-btn');
    const modaleCalendrier = document.getElementById('calendar-modal');
    const grilleDesJours = document.getElementById('calendar-days');
    const texteMoisAnnee = document.getElementById('current-month-year');
    const boutonMoisPrecedent = document.getElementById('prev-month');
    const boutonMoisSuivant = document.getElementById('next-month');
    const zoneDateTexte = document.getElementById('date-text');
    const boutonJourPrecedent = document.querySelector('.arrow-btn-prev');
    const boutonJourSuivant = document.querySelector('.arrow-btn-next');

    // --- 2. GESTION DES DATES (MÉMOIRE) ---
    const nomsDesMois = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    // On regarde si une date était déjà enregistrée dans le navigateur
    let dateSauvegardee = localStorage.getItem('novaVillaSelectedDate');
    
    // Variable pour la date sélectionnée (celle qu'on veut afficher)
    let dateChoisie;
    if (dateSauvegardee) {
        dateChoisie = new Date(dateSauvegardee);
    } else {
        dateChoisie = new Date(); // Par défaut, aujourd'hui
    }

    // Variable pour savoir quel mois le calendrier affiche actuellement
    let dateAffichageMois = new Date(dateChoisie);


    // --- 3. FONCTIONS POUR L'AFFICHAGE ---

    // Fonction pour mettre à jour le texte de la date dans la barre violette
    function rafraichirTexteBarreDate() {
        let jour = dateChoisie.getDate();
        let mois = nomsDesMois[dateChoisie.getMonth()].toLowerCase();
        let annee = dateChoisie.getFullYear();

        zoneDateTexte.innerText = jour + " " + mois + " " + annee;
    }

    // Fonction principale qui dessine les jours dans le calendrier
    function dessinerCalendrier() {
        // On vide d'abord les anciens jours
        grilleDesJours.innerHTML = '';
        
        let annee = dateAffichageMois.getFullYear();
        let mois = dateAffichageMois.getMonth();
        
        // On écrit le mois et l'année en haut du calendrier
        texteMoisAnnee.innerText = nomsDesMois[mois] + " " + annee;

        // ÉTAPE A : Calculer où commence le mois (Lundi ? Mardi ?)
        let premierJourDuMois = new Date(annee, mois, 1).getDay();
        // Le système commence par Dimanche (0), on transforme pour commencer par Lundi (0)
        let decalage;
        if (premierJourDuMois === 0) {
            decalage = 6; // Dimanche devient le 7ème jour
        } else {
            decalage = premierJourDuMois - 1;
        }

        // ÉTAPE B : Calculer combien il y a de jours dans ce mois
        let dernierJourDuMois = new Date(annee, mois + 1, 0).getDate();

        // ÉTAPE C : Créer les cases vides avant le 1er du mois
        for (let i = 0; i < decalage; i++) {
            let caseVide = document.createElement('div');
            caseVide.classList.add('day');
            caseVide.classList.add('empty');
            grilleDesJours.appendChild(caseVide);
        }

        // ÉTAPE D : Créer les cases pour chaque jour
        let aujourdhui = new Date();

        for (let i = 1; i <= dernierJourDuMois; i++) {
            let caseJour = document.createElement('div');
            caseJour.classList.add('day');
            caseJour.innerText = i;

            // Est-ce que c'est aujourd'hui ?
            if (i === aujourdhui.getDate() && mois === aujourdhui.getMonth() && annee === aujourdhui.getFullYear()) {
                caseJour.classList.add('today');
            }

            // Est-ce que c'est le jour qu'on a sélectionné ?
            if (i === dateChoisie.getDate() && mois === dateChoisie.getMonth() && annee === dateChoisie.getFullYear()) {
                caseJour.classList.add('selected');
            }

            // Quand on clique sur un jour du calendrier
            caseJour.addEventListener('click', function() {
                dateChoisie = new Date(annee, mois, i);
                
                // On sauvegarde dans le navigateur
                localStorage.setItem('novaVillaSelectedDate', dateChoisie.toISOString());
                
                rafraichirTexteBarreDate();
                fermerLeCalendrier();
            });

            grilleDesJours.appendChild(caseJour);
        }
    }


    // --- 4. GESTION DE LA MODALE ---

    function ouvrirLeCalendrier() {
        modaleCalendrier.style.display = 'flex';
        // Petit délai pour que l'animation CSS fonctionne
        setTimeout(function() {
            modaleCalendrier.classList.add('active');
        }, 10);
        dessinerCalendrier();
    }

    function fermerLeCalendrier() {
        modaleCalendrier.classList.remove('active');
        // On attend la fin de l'animation pour cacher l'élément
        setTimeout(function() {
            modaleCalendrier.style.display = 'none';
        }, 300);
    }


    // --- 5. ÉCOUTE DES CLICS (INTERACTION) ---

    // Ouvrir / Fermer
    boutonCalendrier.addEventListener('click', ouvrirLeCalendrier);
    
    modaleCalendrier.addEventListener('click', function(evenement) {
        // Si on clique sur le fond sombre, on ferme
        if (evenement.target === modaleCalendrier) {
            fermerLeCalendrier();
        }
    });

    // Changer de mois dans le calendrier
    boutonMoisPrecedent.addEventListener('click', function() {
        dateAffichageMois.setMonth(dateAffichageMois.getMonth() - 1);
        dessinerCalendrier();
    });

    boutonMoisSuivant.addEventListener('click', function() {
        dateAffichageMois.setMonth(dateAffichageMois.getMonth() + 1);
        dessinerCalendrier();
    });

    // Changer de jour via les flèches rapides
    boutonJourPrecedent.addEventListener('click', function() {
        dateChoisie.setDate(dateChoisie.getDate() - 1);
        localStorage.setItem('novaVillaSelectedDate', dateChoisie.toISOString());
        rafraichirTexteBarreDate();
        // On synchronise le calendrier au cas où
        dateAffichageMois = new Date(dateChoisie);
        dessinerCalendrier();
    });

    boutonJourSuivant.addEventListener('click', function() {
        dateChoisie.setDate(dateChoisie.getDate() + 1);
        localStorage.setItem('novaVillaSelectedDate', dateChoisie.toISOString());
        rafraichirTexteBarreDate();
        // On synchronise le calendrier au cas où
        dateAffichageMois = new Date(dateChoisie);
        dessinerCalendrier();
    });


    // --- 6. INITIALISATION AU DÉMARRAGE ---
    rafraichirTexteBarreDate();

});
