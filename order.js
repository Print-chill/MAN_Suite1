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
                        <label>Прикріпити фото:</label>
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

        const orderDetails = Array.from(document.querySelectorAll("#cart-items .cart-item")).map((item, index) => ({
            name: cart[index].name,
            quantity: item.querySelector(".quantity").value,
            photoSrc: item.querySelector(".cart-img")?.src
        }));

        const messageText = `
🛒 *Нове замовлення:*
- Ім'я: ${name}
- Email: ${email}
- Telegram: ${telegram}
- Оплата: ${paymentMethod}
- Товари:
${orderDetails.map(item => `${item.name} (кількість: ${item.quantity})`).join("\n")}
        `;

        try {
            await fetch(`${apiUrl}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: messageText, parse_mode: 'Markdown' })
            });

            // Відправка фото товарів
            for (const item of orderDetails) {
                if (item.photoSrc) {
                    await fetch(`${apiUrl}/sendPhoto`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            photo: item.photoSrc,
                            caption: `${item.name} (кількість: ${item.quantity})`
                        })
                    });
                }
            }

            // Відправка прикріплених файлів
            const fileInputs = document.querySelectorAll(".photo");
            for (const input of fileInputs) {
                if (input.files.length > 0) {
                    const formData = new FormData();
                    formData.append('chat_id', chatId);
                    formData.append('photo', input.files[0]);

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
