document.addEventListener("DOMContentLoaded", () => {
    const deliveryType = document.getElementById("delivery-type");
    const courierFields = document.getElementById("courier-fields");
    const branchFields = document.getElementById("branch-fields");
    const lockerFields = document.getElementById("locker-fields");
    const receiverInfo = document.getElementById("receiver-info");
    const novaPoshtaApiKey = "7cc0146a6b28d5d2806080777f14bd00";

    deliveryType.addEventListener("change", () => {
        // Приховуємо всі поля
        courierFields.classList.add("hidden");
        branchFields.classList.add("hidden");
        lockerFields.classList.add("hidden");
        receiverInfo.classList.add("hidden");

        // Видаляємо атрибут required з усіх полів
        document.querySelectorAll("#courier-fields input, #branch-fields input, #branch-fields select, #locker-fields input, #locker-fields select, #receiver-info input").forEach(field => {
            field.removeAttribute("required");
        });

        // Показуємо відповідні поля та додаємо атрибут required
        if (deliveryType.value === "courier") {
            courierFields.classList.remove("hidden");
            receiverInfo.classList.remove("hidden");
            document.querySelectorAll("#courier-fields input, #receiver-info input").forEach(field => {
                field.setAttribute("required", true);
            });
        } else if (deliveryType.value === "branch") {
            branchFields.classList.remove("hidden");
            receiverInfo.classList.remove("hidden");
            document.querySelectorAll("#branch-fields input, #branch-fields select, #receiver-info input").forEach(field => {
                field.setAttribute("required", true);
            });
        } else if (deliveryType.value === "locker") {
            lockerFields.classList.remove("hidden");
            receiverInfo.classList.remove("hidden");
            document.querySelectorAll("#locker-fields input, #locker-fields select, #receiver-info input").forEach(field => {
                field.setAttribute("required", true);
            });
        }
    });

    const fetchWarehouses = (cityField, selectField, warehouseType) => {
        cityField.addEventListener("input", () => {
            const city = cityField.value.trim();
            if (city.length < 2) return;

            fetch("https://api.novaposhta.ua/v2.0/json/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: novaPoshtaApiKey,
                    modelName: "Address",
                    calledMethod: "getWarehouses",
                    methodProperties: { CityName: city }
                })
            })
            .then(response => response.json())
            .then(data => {
                selectField.innerHTML = '<option value="">Оберіть варіант</option>';
                if (data.success && data.data.length > 0) {
                    data.data.forEach(option => {
                        if ((warehouseType === "branch" && (option.TypeOfWarehouse === "1" || option.CategoryOfWarehouse === "Branch" || option.CategoryOfWarehouse === "Store" || option.CategoryOfWarehouse === "DropOff")) || (warehouseType === "locker" && (option.TypeOfWarehouse === "2" || option.CategoryOfWarehouse === "Postomat"))) {
                            const opt = document.createElement("option");
                            opt.value = option.Ref;
                            opt.textContent = option.Description;
                            selectField.appendChild(opt);
                        }
                    });

                    if (selectField.options.length === 1) selectField.innerHTML = '<option value="">Немає результатів</option>';
                } else selectField.innerHTML = '<option value="">Немає результатів</option>';
            })
            .catch(error => console.error("Помилка API Нової Пошти:", error));
        });
    };

    fetchWarehouses(document.getElementById("branch-city"), document.getElementById("branch-select"), "branch");
    fetchWarehouses(document.getElementById("locker-city"), document.getElementById("locker-select"), "locker");
});