document.addEventListener("DOMContentLoaded", () => {
    const cartKey = "shoppingCart";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const cartItemsElement = document.getElementById("cart-items");
    const notificationAdd = document.getElementById("cart-notification");
    const notificationDel = document.getElementById("cart-notification-del");

    const updateCart = () => {
        cartItemsElement.innerHTML = cart.map((item, index) => `
            <li>
                <div class="cart-item-content">
                    <img src="${item.jpg || "path/to/default-image.jpg"}" alt="${item.name}" style="width: 50px; height: auto; margin-right: 10px;">
                    <span>${item.name} - ${item.price}</span>
                    <div class="remove-item" data-index="${index}">×</div>
                </div>
            </li>
        `).join("");

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

    document.getElementById("cart-button").addEventListener("click", () => {
        document.getElementById("cart").style.display = "block";
    });

    document.querySelector("#cart .close").addEventListener("click", () => {
        document.getElementById("cart").style.display = "none";
    });

    document.getElementById('checkout').addEventListener('click', () => {
        window.location.href = 'order.html';
    });

    updateCart();
});