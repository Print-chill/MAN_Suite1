document.addEventListener("DOMContentLoaded", function () {
    const cartKey = "shoppingCart";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const cartItemsElement = document.getElementById("cart-items");
    const submitBtn = document.getElementById("submit-btn");
    const consentCheckbox = document.getElementById("consent-checkbox");

    function saveCart() {
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }

    function updateCart() {
        cartItemsElement.innerHTML = "";
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

    updateCart();

    // Додаємо @ до Telegram юзернейму, якщо його немає
    const telegramInput = document.getElementById("telegram");
    telegramInput.addEventListener("input", function () {
        if (!this.value.startsWith("@")) {
            this.value = "@" + this.value.replace(/^@+/, "");
        }
    });

    // Переключення стану кнопки при згоді з обробкою даних
    function updateButtonState() {
        submitBtn.disabled = !consentCheckbox.checked;
        submitBtn.style.backgroundColor = consentCheckbox.checked ? "#007bff" : "gray";
        submitBtn.style.cursor = consentCheckbox.checked ? "pointer" : "not-allowed";
    }

    consentCheckbox.addEventListener("change", updateButtonState);
    updateButtonState();

    submitBtn.addEventListener("click", function () {
        const botToken = '7609021461:AAGc8uPCQMjSleXxVopUCNfqPLmF5OSt2ds'; // Ваш токен
        const chatId = '-1002479073400';
        const apiUrl = `https://api.telegram.org/bot${botToken}`;

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const telegram = telegramInput.value.trim();
        const paymentMethod = document.getElementById('payment-method').value;
        const deliveryType = document.getElementById('delivery-type').value;
        let deliveryAddress = "";

        if (deliveryType === "courier") {
            const city = document.getElementById("courier-city").value.trim();
            const street = document.getElementById("courier-street").value.trim();
            const apartment = document.getElementById("courier-apartment").value.trim();
            deliveryAddress = `Кур'єрська доставка: ${city}, ${street}, кв. ${apartment}`;
        } else if (deliveryType === "branch") {
            const city = document.getElementById("branch-city").value.trim();
            const branch = document.getElementById("branch-select").value.trim();
            deliveryAddress = `Відділення: ${city}, ${branch}`;
        } else if (deliveryType === "locker") {
            const city = document.getElementById("locker-city").value.trim();
            const locker = document.getElementById("locker-select").value.trim();
            deliveryAddress = `Поштомат: ${city}, ${locker}`;
        }

        const receiverName = document.getElementById("receiver-name").value.trim();
        const receiverPhone = document.getElementById("receiver-phone").value.trim();

        if (!name || !email || !telegram || !deliveryAddress || !receiverName || !receiverPhone) {
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
        - Telegram: ${telegram}
        - Служба доставки: ${deliveryType}
        - Адреса доставки: ${deliveryAddress}
        - Одержувач: ${receiverName}, ${receiverPhone}
        - Метод оплати: ${paymentMethod}
        - Товари:
        ${orderDetails.map(item => `${item.name} (кількість: ${item.quantity}, розмір: ${item.size})`).join("\n")}
        `;

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
