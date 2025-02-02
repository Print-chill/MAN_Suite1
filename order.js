document.addEventListener("DOMContentLoaded", function () {
    const cartKey = "shoppingCart";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const cartItemsElement = document.getElementById("cart-items");

    function saveCart() {
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }

    function updateCart() {
        cartItemsElement.innerHTML = ""; // Очищуємо список
        if (cart.length === 0) {
            cartItemsElement.innerHTML = "<p>Ваш кошик порожній.</p>";
            return;
        }

        cart.forEach((item, index) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <div class="cart-item-content">
                    <img src="${item.jpg}" alt="${item.name}" style="width: 100px; height: auto; margin-right: 10px;">
                    <span>${item.name} - ${item.price}</span>
                    <br>
                    <label>Кількість:</label>
                    <input type="number" class="quantity" data-index="${index}" value="1" min="1">
                    <br>
                    <label>Розмір:</label>
                    <input type="text" class="size" data-index="${index}" placeholder="Введіть розмір (якщо потрібно)">
                    <br>
                    <label>Фото:</label>
                    <input type="file" class="photo" data-index="${index}" accept="image/*">
                    <br>
                    <div class="remove-item" data-index="${index}">x</div>
                </div>
            `;
            cartItemsElement.appendChild(listItem);
        });
    }

    // Делегування подій для видалення товарів
    cartItemsElement.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-item")) {
            const index = parseInt(event.target.getAttribute("data-index"));
            cart.splice(index, 1); // Видаляємо товар
            saveCart(); // Зберігаємо зміни
            updateCart(); // Оновлюємо відображення
        }
    });

    updateCart();

    document.getElementById('submit-btn').addEventListener('click', function () {
        const botToken = '7609021461:AAGc8uPCQMjSleXxVopUCNfqPLmF5OSt2ds'; // Ваш токен
        const chatId = '-1002479073400'; // Ваш Chat ID
        const apiUrl = `https://api.telegram.org/bot${botToken}`;
    
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const telegram = document.getElementById('telegram').value.trim();
        const address = document.getElementById('address').value.trim();
        const paymentMethod = document.getElementById('payment-method').value;

        if (!name || !email || !telegram || !address) {
            alert('Будь ласка, заповніть всі обов’язкові поля!');
            return;
        }

        let orderDetails = [];
        document.querySelectorAll("#cart-items .cart-item-content").forEach((item, index) => {
            const quantity = item.querySelector(".quantity").value;
            const size = item.querySelector(".size").value || "Не вказано";
            const photo = item.querySelector(".photo").files[0];

            orderDetails.push({
                name: cart[index].name,
                quantity,
                size,
                photo
            });
        });

        const messageText = `
        🛒 *Нове замовлення:*
        - Ім'я: ${name}
        - Email: ${email}
        - Telegram: @${telegram}
        - Адреса доставки: ${address}
        - Метод оплати: ${paymentMethod}
        - Товари:
        ${orderDetails.map(item => `${item.name} (кількість: ${item.quantity}, розмір: ${item.size})`).join("\n")}
        `;

        // Надсилання текстового повідомлення
        fetch(`${apiUrl}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText,
                parse_mode: 'Markdown'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                // Надсилання фото кожного товару
                orderDetails.forEach(item => { 
                    if (item.photo) {
                        const formData = new FormData();
                        formData.append('chat_id', chatId);
                        formData.append('photo', item.photo);
                        formData.append('caption', `${item.name} - Кількість: ${item.quantity}, Розмір: ${item.size}`);
                        
                        fetch(`${apiUrl}/sendPhoto`, {
                            method: 'POST',
                            body: formData
                        });
                    }
                });

                alert('Замовлення успішно надіслано!');
            } else {
                alert('Не вдалося надіслати замовлення.');
            }
        })
        .catch(error => console.error('Помилка:', error));
    });
});
