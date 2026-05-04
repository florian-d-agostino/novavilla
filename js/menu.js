document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector(".menu-icon");
    const overlay = document.getElementById("burger-menu");
    const closeBtn = document.querySelector(".close-menu");
    const menuLinks = document.querySelectorAll(".menu-link");

    // Fonction pour ouvrir le menu
    function openMenu() {
        overlay.classList.add("active");
        document.body.style.overflow = "hidden"; // Empêche le scroll derrière
    }

    // Fonction pour fermer le menu
    function closeMenu() {
        overlay.classList.remove("active");
        document.body.style.overflow = "auto";
    }

    // Événements
    menuBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);

    // Fermer si on clique sur un lien
    menuLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Fermer si on clique en dehors du contenu blanc
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeMenu();
        }
    });
});
