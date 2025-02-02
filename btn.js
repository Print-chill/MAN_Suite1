document.addEventListener("DOMContentLoaded", function () {
    const cartKey = "shoppingCart";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const cartItemsElement = document.getElementById("cart-items");
    const notificationAdd = document.getElementById("cart-notification");
    const notificationDel = document.getElementById("cart-notification-del");

    updateCart();

    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function () {
            const productElement = this.closest(".product");
            const productName = productElement.querySelector("h3").innerText;
            const productPrice = productElement.querySelector("p").innerText;
            const productImage = productElement.querySelector("img").src;

            if (!productImage) {
                console.error("Зображення не знайдено для товару:", productName);
                return;
            }

            const product = {
                name: productName,
                price: productPrice,
                jpg: productImage,
            };
            cart.push(product);
            saveCart();
            updateCart();
            showNotification(notificationAdd); // Показати сповіщення про додавання
        });
    });

    function showNotification(notificationElement) {
        notificationElement.classList.add("show"); // Показуємо сповіщення
        setTimeout(() => {
            notificationElement.classList.remove("show"); // Прибираємо через 3 секунди
        }, 3000);
    }

    function updateCart() {
        cartItemsElement.innerHTML = "";

        cart.forEach((item, index) => {
            const imageSrc = item.jpg ? item.jpg : "path/to/default-image.jpg";
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <div class="cart-item-content">
                    <img src="${imageSrc}" alt="${item.name}" style="width: 50px; height: auto; margin-right: 10px;">
                    <span>${item.name} - ${item.price}</span>
                    <div class="remove-item" data-index="${index}">×</div>
                </div>
            `;
            cartItemsElement.appendChild(listItem);
        });

        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", function () {
                const index = parseInt(this.getAttribute("data-index"));
                cart.splice(index, 1);
                saveCart();
                updateCart();
                showNotification(notificationDel); // Показати сповіщення про видалення
            });
        });
    }

    function saveCart() {
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }

    document.getElementById("cart-button").addEventListener("click", function () {
        document.getElementById("cart").style.display = "block";
    });

    document.querySelector("#cart .close").addEventListener("click", function () {
        document.getElementById("cart").style.display = "none";
    });

    document.getElementById('checkout').addEventListener('click', function () {
        window.location.href = 'order.html';
    });

});
