document.addEventListener("DOMContentLoaded", () => {
    const categoriesBtn = document.getElementById("categories-btn");
    const categoriesMenu = document.getElementById("categories-menu");
    const categoryOptions = document.querySelectorAll(".category-option");
    const partnerItems = document.querySelectorAll(".partner-item");


    if (categoriesBtn && categoriesMenu) {
        categoriesBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            categoriesMenu.classList.toggle("active");
        });

        document.addEventListener("click", () => {
            categoriesMenu.classList.remove("active");
        });
    }


    categoryOptions.forEach(option => {
        option.addEventListener("click", (e) => {
            e.stopPropagation();

            categoryOptions.forEach(opt => opt.classList.remove("selected"));
            option.classList.add("selected");

            const selectedCategory = option.getAttribute("data-category");

            if (selectedCategory === "all") {
                categoriesBtn.textContent = "Catégories";
            } else {
                categoriesBtn.textContent = option.textContent;
            }


            partnerItems.forEach(item => {
                const partnerTag = item.querySelector(".partner-tag").textContent.trim();

                if (selectedCategory === "all" || partnerTag === selectedCategory) {
                    item.style.display = "flex";
                    item.classList.add("fade-in");
                } else {
                    item.style.display = "none";
                    item.classList.remove("fade-in");
                }
            });


            categoriesMenu.classList.remove("active");
        });
    });
});
