document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector(".menu-icon");
    const overlay = document.getElementById("burger-menu");
    const closeBtn = document.querySelector(".close-menu");
    const menuLinks = document.querySelectorAll(".menu-link");

    function openMenu() {
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeMenu() {
        overlay.classList.remove("active");
        document.body.style.overflow = "auto";
    }

    menuBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);

    menuLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeMenu();
        }
    });
});
