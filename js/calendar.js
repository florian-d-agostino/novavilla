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

    let dateSauvegardee = localStorage.getItem('novaVillaSelectedDate');
    
    let dateChoisie;
    if (dateSauvegardee) {
        dateChoisie = new Date(dateSauvegardee);
    } else {
        dateChoisie = new Date();
    }

    let dateAffichageMois = new Date(dateChoisie);

    // --- 3. FONCTIONS POUR L'AFFICHAGE ---

    function rafraichirTexteBarreDate() {
        let jour = dateChoisie.getDate();
        let mois = nomsDesMois[dateChoisie.getMonth()].toLowerCase();
        let annee = dateChoisie.getFullYear();

        zoneDateTexte.innerText = jour + " " + mois + " " + annee;
    }

    function dessinerCalendrier() {
        grilleDesJours.innerHTML = '';
        
        let annee = dateAffichageMois.getFullYear();
        let mois = dateAffichageMois.getMonth();
        
        texteMoisAnnee.innerText = nomsDesMois[mois] + " " + annee;

        let premierJourDuMois = new Date(annee, mois, 1).getDay();
        let decalage;
        if (premierJourDuMois === 0) {
            decalage = 6;
        } else {
            decalage = premierJourDuMois - 1;
        }

        let dernierJourDuMois = new Date(annee, mois + 1, 0).getDate();

        for (let i = 0; i < decalage; i++) {
            let caseVide = document.createElement('div');
            caseVide.classList.add('day');
            caseVide.classList.add('empty');
            grilleDesJours.appendChild(caseVide);
        }

        let aujourdhui = new Date();

        for (let i = 1; i <= dernierJourDuMois; i++) {
            let caseJour = document.createElement('div');
            caseJour.classList.add('day');
            caseJour.innerText = i;

            if (i === aujourdhui.getDate() && mois === aujourdhui.getMonth() && annee === aujourdhui.getFullYear()) {
                caseJour.classList.add('today');
            }

            if (i === dateChoisie.getDate() && mois === dateChoisie.getMonth() && annee === dateChoisie.getFullYear()) {
                caseJour.classList.add('selected');
            }

            caseJour.addEventListener('click', function() {
                dateChoisie = new Date(annee, mois, i);
                
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
        setTimeout(function() {
            modaleCalendrier.classList.add('active');
        }, 10);
        dessinerCalendrier();
    }

    function fermerLeCalendrier() {
        modaleCalendrier.classList.remove('active');
        setTimeout(function() {
            modaleCalendrier.style.display = 'none';
        }, 300);
    }

    // --- 5. ÉCOUTE DES CLICS (INTERACTION) ---

    boutonCalendrier.addEventListener('click', ouvrirLeCalendrier);
    
    modaleCalendrier.addEventListener('click', function(evenement) {
        if (evenement.target === modaleCalendrier) {
            fermerLeCalendrier();
        }
    });

    boutonMoisPrecedent.addEventListener('click', function() {
        dateAffichageMois.setMonth(dateAffichageMois.getMonth() - 1);
        dessinerCalendrier();
    });

    boutonMoisSuivant.addEventListener('click', function() {
        dateAffichageMois.setMonth(dateAffichageMois.getMonth() + 1);
        dessinerCalendrier();
    });

    boutonJourPrecedent.addEventListener('click', function() {
        dateChoisie.setDate(dateChoisie.getDate() - 1);
        localStorage.setItem('novaVillaSelectedDate', dateChoisie.toISOString());
        rafraichirTexteBarreDate();
        dateAffichageMois = new Date(dateChoisie);
        dessinerCalendrier();
    });

    boutonJourSuivant.addEventListener('click', function() {
        dateChoisie.setDate(dateChoisie.getDate() + 1);
        localStorage.setItem('novaVillaSelectedDate', dateChoisie.toISOString());
        rafraichirTexteBarreDate();
        dateAffichageMois = new Date(dateChoisie);
        dessinerCalendrier();
    });

    // --- 6. INITIALISATION AU DÉMARRAGE ---
    rafraichirTexteBarreDate();

});
