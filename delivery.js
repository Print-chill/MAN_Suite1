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

    // Автодоповнення міст
    function fetchCities(inputField, listElement) {
        inputField.addEventListener("input", function () {
            let query = this.value.trim();
            if (query.length < 2) return;

            fetch("https://api.novaposhta.ua/v2.0/json/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: novaPoshtaApiKey,
                    modelName: "Address",
                    calledMethod: "getCities",
                    methodProperties: { FindByString: query }
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Cities API Response:", data);
                listElement.innerHTML = "";

                if (data.success && data.data.length > 0) {
                    data.data.forEach(city => {
                        let option = document.createElement("option");
                        option.value = city.Description;
                        listElement.appendChild(option);
                    });
                }
            })
            .catch(error => console.error("Помилка API Нової Пошти (міста):", error));
        });
    }

    fetchCities(document.getElementById("branch-city"), document.getElementById("branch-city-list"));
    fetchCities(document.getElementById("locker-city"), document.getElementById("locker-city-list"));

    function fetchWarehouses(cityField, selectField, warehouseType) {
        cityField.addEventListener("input", function () {
            let city = this.value.trim();
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
                console.log("Warehouses API Response:", data);
                selectField.innerHTML = '<option value="">Оберіть варіант</option>';

                if (data.success && data.data.length > 0) {
                    data.data.forEach(option => {
                        if (
                            (warehouseType === "branch" && (option.TypeOfWarehouse === "1" || option.CategoryOfWarehouse === "Branch")) ||
                            (warehouseType === "locker" && option.TypeOfWarehouse === "2")
                        ) {
                            let opt = document.createElement("option");
                            opt.value = option.Description; // 🔥 Передаємо не Ref, а назву відділення/поштомату
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
            .catch(error => console.error("Помилка API Нової Пошти (відділення/поштомати):", error));
        });
    }

    fetchWarehouses(document.getElementById("branch-city"), document.getElementById("branch-select"), "branch");
    fetchWarehouses(document.getElementById("locker-city"), document.getElementById("locker-select"), "locker");
});
