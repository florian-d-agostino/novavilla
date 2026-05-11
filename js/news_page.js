document.addEventListener("DOMContentLoaded", () => {
    const newsContainer = document.getElementById("news-container");
    const categoryCheckboxes = document.querySelectorAll(".news-categories input[type='checkbox']");
    const subscribeForm = document.getElementById("subscribe-form");
    const unsubscribeTrigger = document.getElementById("unsubscribe-trigger");
    const unsubscribeModal = document.getElementById("unsubscribe-modal");
    const closeUnsubscribe = document.getElementById("close-unsubscribe");
    const unsubscribeForm = document.getElementById("unsubscribe-form");




    // --- Mock gen IA ---
    const MOCK_NEWS = [
        {
            id: 1,
            title: "Ouverture officielle de la saison NovaVilla",
            category: "Concert",
            date: "25 Avril 2026",
            desc: "Découvrez notre nouvelle programmation artistique et notre scène de concert rétro futuriste face au Vieux-Port. Une expérience visuelle et acoustique inédite vous attend.",
            image: "../assets/img/concert.jpg"
        },
        {
            id: 2,
            title: "Le Tournoi de Tennis amateur de la Corniche",
            category: "Sportif",
            date: "30 Avril 2026",
            desc: "Inscrivez-vous dès aujourd'hui pour participer au tournoi annuel de tennis sur terre battue. De superbes prix NovaVilla et partenaires sont à gagner pour toutes les tranches d'âge.",
            image: "../assets/img/sportif - tennis.jpg"
        },
        {
            id: 3,
            title: "Le Grand Festival des Arts de Rue de Marseille",
            category: "Festival",
            date: "04 Mai 2026",
            desc: "Rejoignez-nous sur l'Esplanade de la Major pour trois jours de spectacles vivants, d'expositions éphémères et de performances néons nocturnes d'artistes locaux.",
            image: "../assets/img/festival.jpg"
        },
        {
            id: 4,
            title: "Chasse au trésor géante pour toute la famille",
            category: "Famille",
            date: "10 Mai 2026",
            desc: "Une aventure ludique au coeur des parcs marseillais pour petits et grands. Résolvez les énigmes de la Villa, gagnez des indices et partagez un goûter festif géant.",
            image: "../assets/img/famille.jpg"
        },
        {
            id: 5,
            title: "NovaVilla s'associe aux artistes locaux",
            category: "Festival",
            date: "14 Mai 2026",
            desc: "Une nouvelle exposition d'art contemporain et rétro-synthwave s'installe dans nos murs. Entrée libre tous les weekends de mai pour un voyage sensoriel unique.",
            image: "../assets/img/festival.jpg"
        },
        {
            id: 6,
            title: "Cours de yoga collectif face à la mer",
            category: "Sportif",
            date: "18 Mai 2026",
            desc: "Prenez un instant pour respirer chaque dimanche matin. Une séance de yoga encadrée par des professionnels, ouverte à tous les niveaux avec vue imprenable sur l'horizon.",
            image: "../assets/img/sportif - tennis.jpg"
        }
    ];




    // --- FUNCTIONS ---
    function initNewsPage() {
        renderNews();


        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                renderNews();
            });
        });


        if (subscribeForm) {
            subscribeForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const emailInput = document.getElementById("subscribe-email");
                const email = emailInput.value.trim();

                if (email) {
                    subscribeEmail(email);
                    emailInput.value = "";
                }
            });
        }


        if (unsubscribeTrigger) {
            unsubscribeTrigger.addEventListener("click", () => {
                unsubscribeModal.classList.add("active");
            });
        }

        if (closeUnsubscribe) {
            closeUnsubscribe.addEventListener("click", () => {
                unsubscribeModal.classList.remove("active");
            });
        }

        if (unsubscribeModal) {
            unsubscribeModal.addEventListener("click", (e) => {
                if (e.target === unsubscribeModal) {
                    unsubscribeModal.classList.remove("active");
                }
            });
        }

        if (unsubscribeForm) {
            unsubscribeForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const emailInput = document.getElementById("unsubscribe-email");
                const email = emailInput.value.trim();

                if (email) {
                    unsubscribeEmail(email);
                    emailInput.value = "";
                }
            });
        }
    }

    function renderNews() {
        newsContainer.innerHTML = "";

        const checkedCategories = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (checkedCategories.length === 0) {
            newsContainer.innerHTML = `
                <div class="empty-news-message">
                    <p><i class="fa-solid fa-circle-exclamation fa-2x"></i></p>
                    <p style="margin-top:10px;">Veuillez cocher au moins une catégorie pour afficher les actualités.</p>
                </div>
            `;
            return;
        }

        const filteredNews = MOCK_NEWS.filter(news => checkedCategories.includes(news.category));

        if (filteredNews.length === 0) {
            newsContainer.innerHTML = `
                <div class="empty-news-message">
                    <p>Aucune actualité disponible pour les catégories sélectionnées.</p>
                </div>
            `;
            return;
        }

        filteredNews.forEach(item => {
            const catClass = item.category.toLowerCase();
            const newsHTML = `
                <article class="news-card ${catClass} fade-in">
                    <div class="news-card-img-wrapper">
                        <img src="${item.image}" alt="${item.title}" onerror="this.src='../assets/map.png';">
                        <span class="category-badge ${catClass}">${item.category}</span>
                    </div>
                    <div class="news-card-content">
                        <div class="news-card-meta">
                            <span class="news-card-date"><i class="fa-regular fa-calendar-days"></i> ${item.date}</span>
                        </div>
                        <h3 class="news-card-title">${item.title}</h3>
                        <p class="news-card-desc">${item.desc}</p>
                        <button class="news-card-btn" onclick="alert('Cet article complet sera disponible très prochainement !')">
                            Lire la suite <i class="fa-solid fa-arrow-right-long"></i>
                        </button>
                    </div>
                </article>
            `;
            newsContainer.insertAdjacentHTML("beforeend", newsHTML);
        });
    }

    function getStoredSubscribers() {
        const stored = localStorage.getItem("novavilla_newsletter_subscribers");
        return stored ? JSON.parse(stored) : [];
    }

    function saveSubscribers(list) {
        localStorage.setItem("novavilla_newsletter_subscribers", JSON.stringify(list));
    }

    function subscribeEmail(email) {
        const subscribers = getStoredSubscribers();

        if (subscribers.includes(email)) {
            alert("Cette adresse e-mail est déjà inscrite à la newsletter NovaVilla !");
            return;
        }

        subscribers.push(email);
        saveSubscribers(subscribers);
        alert("Inscription réussie ! Vous recevrez désormais les actualités NovaVilla par e-mail.");
    }

    function unsubscribeEmail(email) {
        const subscribers = getStoredSubscribers();

        if (!subscribers.includes(email)) {
            alert("Cette adresse e-mail n'est pas inscrite à notre newsletter.");
            return;
        }

        const updated = subscribers.filter(e => e !== email);
        saveSubscribers(updated);
        alert("Désinscription validée. Votre adresse e-mail a été supprimée avec succès.");
        unsubscribeModal.classList.remove("active");
    }

    initNewsPage();
});
