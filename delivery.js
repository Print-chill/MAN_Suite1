document.addEventListener("DOMContentLoaded", function () {
    const deliveryType = document.getElementById("delivery-type");
    const courierFields = document.getElementById("courier-fields");
    const branchFields = document.getElementById("branch-fields");
    const lockerFields = document.getElementById("locker-fields");

    const novaPoshtaApiKey = "7cc0146a6b28d5d2806080777f14bd00"; // 🔥 Реальний API-ключ Нової Пошти

    deliveryType.addEventListener("change", function () {
        courierFields.classList.add("hidden");
        branchFields.classList.add("hidden");
        lockerFields.classList.add("hidden");

        if (this.value === "courier") {
            courierFields.classList.remove("hidden");
        } else if (this.value === "branch") {
            branchFields.classList.remove("hidden");
        } else if (this.value === "locker") {
            lockerFields.classList.remove("hidden");
        }
    });

    function fetchWarehouses(cityField, selectField, warehouseType) {
        cityField.addEventListener("input", function () {
            let city = this.value.trim();
            if (city.length < 2) return; // 🔥 Мінімальна кількість символів для пошуку - 2

            fetch("https://api.novaposhta.ua/v2.0/json/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: novaPoshtaApiKey,
                    modelName: "Address",
                    calledMethod: "getWarehouses",
                    methodProperties: {
                        CityName: city
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("API Response:", data); // 🔥 Логування відповіді API для перевірки

                selectField.innerHTML = '<option value="">Оберіть варіант</option>';
                if (data.success && data.data.length > 0) {
                    data.data.forEach(option => {
                        // 🔥 Фільтрація відділень/поштоматів
                        if (
                            (warehouseType === "branch" && (option.TypeOfWarehouse === "1" || option.CategoryOfWarehouse === "Branch")) ||
                            (warehouseType === "locker" && option.TypeOfWarehouse === "2")
                        ) {
                            let opt = document.createElement("option");
                            opt.value = option.Ref;
                            opt.textContent = option.Description;
                            selectField.appendChild(opt);
                        }
                    });

                    if (selectField.options.length === 1) {
                        selectField.innerHTML = '<option value="">Немає результатів</option>';
                    }
                } else {
                    selectField.innerHTML = '<option value="">Немає результатів</option>';
                }
            })
            .catch(error => console.error("Помилка API Нової Пошти:", error));
        });
    }

    // Виклик функції для відділень (фільтруємо тільки відділення та пункти видачі)
    fetchWarehouses(document.getElementById("branch-city"), document.getElementById("branch-select"), "branch");

    // Виклик функції для поштоматів (фільтруємо тільки поштомати)
    fetchWarehouses(document.getElementById("locker-city"), document.getElementById("locker-select"), "locker");
});
