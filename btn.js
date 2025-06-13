document.addEventListener("DOMContentLoaded", () => {
    const cartKey = "shoppingCart";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const cartItemsElement = document.getElementById("cart-items");
    const notificationAdd = document.getElementById("cart-notification");
    const notificationDel = document.getElementById("cart-notification-del");
    const checkoutButton = document.getElementById("checkout");
    const productsContainer = document.getElementById("products-container");

    // Function to render products with article numbers
    const renderProducts = () => {
        if (!productsContainer) return;
        productsContainer.innerHTML = ''; // Clear existing content
        const products = document.querySelectorAll("#products-container .product") || [];
        products.forEach(product => {
            const name = product.querySelector("h3")?.innerText || "";
            const price = product.querySelector("p")?.innerText || "";
            const imgSrc = product.querySelector("img")?.src || "";
            const filename = imgSrc.split('/').pop(); // Get the last part of the URL (e.g., "1.webp")
            const number = filename.split('.')[0]; // Get the number before the extension (e.g., "1")
            const article = number && !isNaN(number) ? String(parseInt(number, 10)).padStart(4, '0') : "N/A";
            productsContainer.innerHTML += `
                <div class="product">
                    <img src="${imgSrc}" alt="${name}">
                    <h3>${name}</h3>
                    ${name.includes("Щоденник") ? `<p class="article">Артикул: ${article}</p>` : ''}
                    <p>${price}</p>
                    <button class="add-to-cart">Додати в кошик</button>
                </div>
            `;
        });
    };

    const updateCart = () => {
        if (cart.length === 0) {
            cartItemsElement.innerHTML = `<li style="text-align: center; color: #888;">Кошик порожній</li>`;
            checkoutButton.disabled = true;
            checkoutButton.style.backgroundColor = "#ccc"; // Сірий колір для неактивної кнопки
            checkoutButton.style.cursor = "not-allowed"; // Заборона натискання
        } else {
            cartItemsElement.innerHTML = cart.map((item, index) => `
                <li>
                    <div class="cart-item-content">
                        <img src="${item.jpg || "path/to/default-image.jpg"}" alt="${item.name}" style="width: 50px; height: auto; margin-right: 10px;">
                        <span>${item.name}${item.article ? ` (Артикул: ${item.article})` : ''} - ${item.price}</span>
                        <div class="remove-item" data-index="${index}">×</div>
                    </div>
                </li>
            `).join("");

            checkoutButton.disabled = false;
            checkoutButton.style.backgroundColor = "#00b894"; // Зелений колір для активної кнопки
            checkoutButton.style.cursor = "pointer"; // Дозвіл натискання
        }

        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", () => {
                cart.splice(button.dataset.index, 1);
                saveCart();
                updateCart();
                showNotification(notificationDel);
            });
        });
    };

    const saveCart = () => localStorage.setItem(cartKey, JSON.stringify(cart));

    const showNotification = (notificationElement) => {
        notificationElement.classList.add("show");
        setTimeout(() => notificationElement.classList.remove("show"), 3000);
    };

    // Render products on page load
    renderProducts();

    document.getElementById("products-container").addEventListener("click", (event) => {
        if (event.target.classList.contains("add-to-cart")) {
            const productElement = event.target.closest(".product");
            const product = {
                name: productElement.querySelector("h3").innerText,
                price: productElement.querySelector("p").innerText,
                jpg: productElement.querySelector("img").src,
            };
            // Assign article number based on image filename for notebooks
            if (product.name.includes("Щоденник")) {
                const filename = product.jpg.split('/').pop(); // Get the last part of the URL (e.g., "1.webp")
                const number = filename.split('.')[0]; // Get the number before the extension (e.g., "1")
                if (number && !isNaN(number)) {
                    product.article = String(parseInt(number, 10)).padStart(4, '0'); // Convert to 0001, 0002, etc.
                } else {
                    alert("Вибачте, артикул для цього щоденника не визначено (неправильна назва файлу)!");
                    return; // Don’t add to cart if filename doesn’t contain a valid number
                }
            }
            cart.push(product);
            saveCart();
            updateCart();
            showNotification(notificationAdd);
        }
    });

    // Обробник для кнопки кошика (кнопка в правому нижньому куті)
    document.getElementById("cart-button-mobile").addEventListener("click", () => {
        document.getElementById("cart").style.display = "block";
    });

    document.getElementById("cart-button").addEventListener("click", () => {
        document.getElementById("cart").style.display = "block";
    });

    document.querySelector("#cart .close").addEventListener("click", () => {
        document.getElementById("cart").style.display = "none";
    });

    document.getElementById('checkout').addEventListener('click', () => {
        if (cart.length > 0) {
            window.location.href = 'order.html';
        }
    });

    updateCart();
});