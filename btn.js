document.addEventListener("DOMContentLoaded", () => {
    const cartKey = "shoppingCart";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const cartItemsElement = document.getElementById("cart-items");
    const notificationAdd = document.getElementById("cart-notification");
    const notificationDel = document.getElementById("cart-notification-del");
    const checkoutButton = document.getElementById("checkout");

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
                        <span>${item.name} - ${item.price}</span>
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

    document.getElementById("products-container").addEventListener("click", (event) => {
        if (event.target.classList.contains("add-to-cart")) {
            const productElement = event.target.closest(".product");
            const product = {
                name: productElement.querySelector("h3").innerText,
                price: productElement.querySelector("p").innerText,
                jpg: productElement.querySelector("img").src,
            };
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