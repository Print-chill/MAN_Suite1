document.addEventListener("DOMContentLoaded", () => {
    const cartKey = "shoppingCart";
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const cartItemsElement = document.getElementById("cart-items");
    const cartHeader = document.getElementById("cart-header");
    const submitBtn = document.getElementById("submit-btn");
    const consentCheckbox = document.getElementById("consent-checkbox");
    const telegramInput = document.getElementById("telegram");

    const modal = document.getElementById("custom-modal");
    const modalMessage = document.getElementById("modal-message");

    const showModal = (message, isSuccess = false) => {
        modalMessage.textContent = message;
        modal.classList.add("visible");

        if (isSuccess) {
            modalMessage.style.color = "green";
        } else {
            modalMessage.style.color = "red";
        }

        setTimeout(() => {
            modal.classList.remove("visible");
        }, 3000);
    };

    const updateCart = () => {
        cartItemsElement.innerHTML = cart.length === 0
            ? "<p>Ваш кошик порожній.</p>"
            : cart.map((item, index) => `
                <li class="cart-item">
                    <img src="${item.jpg}" alt="${item.name}" class="cart-img">
                    <div class="cart-info">
                        <span class="cart-name">${item.name}</span>
                        <span class="cart-price">${item.price}</span>
                        <label>Кількість:</label>
                        <input type="number" class="quantity" data-index="${index}" value="1" min="1">
                        <label>Додаткове фото:</label>
                        <input type="file" class="photo" data-index="${index}" accept="image/*">
                    </div>
                    <div class="remove-item" data-index="${index}">×</div>
                </li>
            `).join("");
    };

    updateCart();

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-item")) {
            const index = event.target.dataset.index;
            cart.splice(index, 1);
            localStorage.setItem(cartKey, JSON.stringify(cart));
            updateCart();
        }
    });

    cartHeader.addEventListener("click", () => {
        const arrow = cartHeader.querySelector(".arrow");
        cartItemsElement.style.display = cartItemsElement.style.display === "none" ? "block" : "none";
        arrow.textContent = cartItemsElement.style.display === "block" ? "❌" : "⬇️";
    });

    telegramInput.addEventListener("input", () => {
        if (!telegramInput.value.startsWith("@")) {
            telegramInput.value = "@" + telegramInput.value.replace(/^@+/, "");
        }
    });

    const updateButtonState = () => {
        submitBtn.disabled = !consentCheckbox.checked;
        submitBtn.style.backgroundColor = consentCheckbox.checked ? "#007bff" : "gray";
        submitBtn.style.cursor = consentCheckbox.checked ? "pointer" : "not-allowed";
    };
    consentCheckbox.addEventListener("change", updateButtonState);
    updateButtonState();

    submitBtn.addEventListener("click", async () => {
        const requiredFields = document.querySelectorAll("input[required], select[required]");
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add("error");

                field.addEventListener("input", () => {
                    if (field.value.trim()) {
                        field.classList.remove("error");
                    }
                }, { once: true });
            }
        });

        if (!isValid) {
            showModal("⚠ Заповніть всі обов’язкові поля перед відправкою замовлення!");
            return;
        }

        const botToken = '7609021461:AAGc8uPCQMjSleXxVopUCNfqPLmF5OSt2ds';
        const chatId = '-1002479073400';
        const apiUrl = `https://api.telegram.org/bot${botToken}`;

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const telegram = document.getElementById("telegram").value.trim();
        const paymentMethod = document.getElementById('payment-method').value;
        const deliveryType = document.getElementById('delivery-type').value;
        const receiverName = document.getElementById("receiver-name").value.trim();
        const receiverPhone = document.getElementById("receiver-phone").value.trim();

        let deliveryAddress = "";
        if (deliveryType === "courier") {
            const city = document.getElementById("courier-city").value.trim();
            const street = document.getElementById("courier-street").value.trim();
            const apartment = document.getElementById("courier-apartment").value.trim();
            deliveryAddress = `Кур'єрська доставка: ${city}, ${street}${apartment ? `, кв. ${apartment}` : ""}`;
        } else if (deliveryType === "branch") {
            const city = document.getElementById("branch-city").value.trim();
            const branchSelect = document.getElementById("branch-select");
            const branchDescription = branchSelect.options[branchSelect.selectedIndex]?.textContent || "Невідоме відділення";
            deliveryAddress = `Відділення: ${city}, ${branchDescription}`;
        } else if (deliveryType === "locker") {
            const city = document.getElementById("locker-city").value.trim();
            const lockerSelect = document.getElementById("locker-select");
            const lockerDescription = lockerSelect.options[lockerSelect.selectedIndex]?.textContent || "Невідомий поштомат";
            deliveryAddress = `Поштомат: ${city}, ${lockerDescription}`;
        }

        const orderDetails = Array.from(document.querySelectorAll("#cart-items .cart-item")).map((item, index) => ({
            name: cart[index].name,
            quantity: item.querySelector(".quantity").value,
            size: item.querySelector(".size")?.value || "Не вказано",
            photoUrl: item.querySelector(".cart-img")?.src, // URL фото товару
            attachedFile: item.querySelector(".photo")?.files[0] // Файл, який прикріпив користувач
        }));

        const messageText = `
🛒 *Нове замовлення:*
- Ім'я: ${name}
- Email: ${email}
- Telegram: ${telegram}
- Доставка: ${deliveryType}
- Адреса: ${deliveryAddress}
- Одержувач: ${receiverName}, ${receiverPhone}
- Оплата: ${paymentMethod}
- Товари:
${orderDetails.map(item => `${item.name} (кількість: ${item.quantity}, розмір: ${item.size})`).join("\n")}
    `;

        try {
            // 1️⃣ Відправляємо текстове повідомлення
            await fetch(`${apiUrl}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: messageText, parse_mode: 'Markdown' })
            });

            // 2️⃣ Відправляємо основне фото товару та прикріплений файл (якщо є)
            for (const item of orderDetails) {
                // Відправляємо основне фото товару
                if (item.photoUrl) {
                    await fetch(`${apiUrl}/sendPhoto`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            photo: item.photoUrl, // Відправляємо URL фото товару
                            caption: `${item.name} (основне фото)`
                        })
                    });
                }

                // Відправляємо прикріплений файл (якщо є)
                if (item.attachedFile) {
                    const formData = new FormData();
                    formData.append("chat_id", chatId);
                    formData.append("photo", item.attachedFile); // Відправляємо прикріплений файл
                    formData.append("caption", `${item.name} (додаткове фото)`);

                    await fetch(`${apiUrl}/sendPhoto`, {
                        method: 'POST',
                        body: formData
                    });
                }
            }

            showModal("✅ Замовлення успішно надіслано!", true);
        } catch (error) {
            console.error('Помилка:', error);
            showModal("❌ Помилка при надсиланні замовлення.");
        }
    });
});
