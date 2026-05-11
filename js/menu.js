document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector(".menu-icon");
    const overlay = document.getElementById("burger-menu");
    const closeBtn = document.querySelector(".close-menu");
    const menuLinks = document.querySelectorAll(".menu-link");

    /**
     * Opens the fullscreen mobile overlay navigation menu
     * and disables body scrolling.
     */
    function openMenu() {
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    /**
     * Closes the fullscreen mobile overlay navigation menu
     * and re-enables body scrolling.
     */
    function closeMenu() {
        overlay.classList.remove("active");
        document.body.style.overflow = "auto";
    }

    if (menuBtn) menuBtn.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);

    menuLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeMenu();
            }
        });
    }

    const themeCheckbox = document.getElementById("theme-checkbox");

    /**
     * Dynamic logo switcher supporting path prefix detection.
     * Swaps the SVG logo file depending on light or dark mode.
     * 
     * @param {boolean} isLight - True if light theme is active, false for dark.
     */
    function updateLogo(isLight) {
        const logoImg = document.querySelector(".logo-container img");
        if (!logoImg) return;
        
        const currentSrc = logoImg.getAttribute("src");
        if (!currentSrc) return;
        
        const basePath = currentSrc.startsWith("../") ? "../" : "./";
        
        if (isLight) {
            logoImg.setAttribute("src", basePath + "assets/img/logo2%20light.svg");
        } else {
            logoImg.setAttribute("src", basePath + "assets/img/logo2%20dark.svg");
        }
    }

    if (themeCheckbox) {
        const savedTheme = localStorage.getItem("novaVillaTheme");
        if (savedTheme === "light") {
            themeCheckbox.checked = true;
            updateLogo(true);
        } else {
            themeCheckbox.checked = false;
            updateLogo(false);
        }

        themeCheckbox.addEventListener("change", () => {
            const isLight = themeCheckbox.checked;
            localStorage.setItem("novaVillaTheme", isLight ? "light" : "dark");
            updateLogo(isLight);
        });
    }
});
