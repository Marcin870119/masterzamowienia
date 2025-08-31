
var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};
function filledCell(cell) {
    return cell !== '' && cell != null;
}
function loadFileData(filename) {
    if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
        try {
            var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
            var filteredData = jsonData.filter(row => row.some(filledCell));
            var headerRowIndex = filteredData.findIndex((row, index) =>
                row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
            );
            if (headerRowIndex === -1 || headerRowIndex > 25) {
                headerRowIndex = 0;
            }
            var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex));
            csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
            return csv;
        } catch (e) {
            console.error(e);
            return "";
        }
    }
    return gk_fileData[filename] || "";
}
let productsData = {
    lithuania: [],
    bulgaria: [],
    ukraine: []
};
let activeTab = 'lithuania';
let categoryTotals = {
    lithuania: 0,
    bulgaria: 0,
    ukraine: 0
};
let discountPercentage = 0; // Przechowuje rabat w procentach
let customCashBackPercentage = 2; // Domyślna wartość 2%, może być zmieniona przez użytkownika
// Funkcja obliczająca cenę z rabatem z precyzyjnym zaokrągleniem
function applyDiscount(price) {
    return Number((price * (1 - discountPercentage / 100)).toFixed(2));
}
// Funkcja aktualizująca ceny na stronie
function updatePrices() {
    if (productsData['lithuania'].length > 0) {
        loadProducts('lithuania');
    }
    if (activeTab === 'cart') {
        updateCart();
    }
    calculateTotal();
    updateCartInfo();
    updateDiscountInfo(); // Aktualizacja informacji w pasku bocznym
}
// Funkcja wyświetlająca modalne okno początkowe
function showInitialDialog() {
    // Tworzenie elementu modalnego
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        overflow: auto;
    `;
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        padding: 15px;
        border-radius: 5px;
        width: 300px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        font-family: Arial, sans-serif;
        font-size: 14px; /* Mniejsza czcionka */
        color: #333;
        margin-top: 20px;
    `;
    const closeButton = document.createElement('button');
    closeButton.innerText = '×'; // Zmiana na mniejszy krzyżyk
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 20px;
        height: 20px;
        border: none;
        background-color: #ccc;
        color: #fff;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.3s;
    `;
    closeButton.onmouseover = () => closeButton.style.backgroundColor = '#999';
    closeButton.onmouseout = () => closeButton.style.backgroundColor = '#ccc';
    closeButton.onclick = () => document.body.removeChild(modal);
    const discountLabel = document.createElement('label');
    discountLabel.innerText = 'Discount (%): ';
    discountLabel.style.cssText = `display: block; margin: 10px 0 5px; font-weight: normal;`;
    const discountInput = document.createElement('input');
    discountInput.type = 'number';
    discountInput.value = discountPercentage;
    discountInput.style.cssText = `width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;`;
    discountInput.min = 0;
    discountInput.max = 100;
    const cashBackLabel = document.createElement('label');
    cashBackLabel.innerText = 'Cash Back (%): ';
    cashBackLabel.style.cssText = `display: block; margin: 10px 0 5px; font-weight: normal;`;
    const cashBackInput = document.createElement('input');
    cashBackInput.type = 'number';
    cashBackInput.value = customCashBackPercentage;
    cashBackInput.style.cssText = `width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;`;
    cashBackInput.min = 0;
    cashBackInput.max = 100;
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `margin-top: 15px; text-align: right;`;
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.style.cssText = `padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; font-size: 14px;`;
    saveButton.onmouseover = () => saveButton.style.backgroundColor = '#0056b3';
    saveButton.onmouseout = () => saveButton.style.backgroundColor = '#007bff';
    saveButton.onclick = () => {
        discountPercentage = parseFloat(discountInput.value) || 0;
        customCashBackPercentage = parseFloat(cashBackInput.value) || 2;
        if (discountPercentage < 0) discountPercentage = 0;
        if (discountPercentage > 100) discountPercentage = 100;
        if (customCashBackPercentage < 0) customCashBackPercentage = 0;
        if (customCashBackPercentage > 100) customCashBackPercentage = 100;
        updatePrices();
        document.body.removeChild(modal);
    };
    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.style.cssText = `padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;`;
    cancelButton.onmouseover = () => cancelButton.style.backgroundColor = '#5a6268';
    cancelButton.onmouseout = () => cancelButton.style.backgroundColor = '#6c757d';
    cancelButton.onclick = () => document.body.removeChild(modal);
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);
    modalContent.appendChild(closeButton);
    modalContent.appendChild(discountLabel);
    modalContent.appendChild(discountInput);
    modalContent.appendChild(cashBackLabel);
    modalContent.appendChild(cashBackInput);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}
// Tworzenie stałego panelu po lewej stronie
function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 100px;
        height: 100%;
        background-color: #f8f8f8;
        padding: 15px;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        font-family: Arial, sans-serif;
        font-size: 12px; /* Mniejsza czcionka */
    `;
    const discountInfo = document.createElement('div');
    discountInfo.id = 'discountInfo';
    discountInfo.style.cssText = `margin-bottom: 10px; font-weight: bold; color: #333;`;
    updateDiscountInfo(); // Inicjalna aktualizacja informacji
    const discountLabel = document.createElement('label');
    discountLabel.innerText = 'Discount (%): ';
    discountLabel.style.cssText = `display: block; margin: 5px 0; font-weight: normal;`;
    const discountInput = document.createElement('input');
    discountInput.type = 'number';
    discountInput.value = discountPercentage;
    discountInput.style.cssText = `width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;`;
    discountInput.min = 0;
    discountInput.max = 100;
    discountInput.onchange = () => {
        discountPercentage = parseFloat(discountInput.value) || 0;
        if (discountPercentage < 0) discountPercentage = 0;
        if (discountPercentage > 100) discountPercentage = 100;
        updatePrices();
        updateDiscountInfo();
    };
    const cashBackLabel = document.createElement('label');
    cashBackLabel.innerText = 'Cash Back (%): ';
    cashBackLabel.style.cssText = `display: block; margin: 5px 0; font-weight: normal;`;
    const cashBackInput = document.createElement('input');
    cashBackInput.type = 'number';
    cashBackInput.value = customCashBackPercentage;
    cashBackInput.style.cssText = `width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;`;
    cashBackInput.min = 0;
    cashBackInput.max = 100;
    cashBackInput.onchange = () => {
        customCashBackPercentage = parseFloat(cashBackInput.value) || 2;
        if (customCashBackPercentage < 0) customCashBackPercentage = 0;
        if (customCashBackPercentage > 100) customCashBackPercentage = 100;
        updatePrices();
        updateDiscountInfo();
    };
    sidebar.appendChild(discountInfo);
    sidebar.appendChild(discountLabel);
    sidebar.appendChild(discountInput);
    sidebar.appendChild(cashBackLabel);
    sidebar.appendChild(cashBackInput);
    document.body.appendChild(sidebar);
}
// Funkcja aktualizująca informację o rabatach w pasku bocznym
function updateDiscountInfo() {
    const discountInfo = document.getElementById('discountInfo');
    if (discountInfo) {
        discountInfo.innerText = `Discount: ${discountPercentage}%, Cash Back: ${customCashBackPercentage}%`;
    } else {
        console.error("Element discountInfo not found!");
    }
}
// Funkcja tworząca i obsługująca pasek wyszukiwania oraz filtr pod banerem
function createSearchBar() {
    const searchBarContainer = document.createElement('div');
    searchBarContainer.style.cssText = `
        width: 100%;
        max-width: 900px; /* Dopasowanie do max-width body minus marginesy */
        margin: 10px auto 0; /* Wyśrodkowanie i margines od góry pod banerem */
        padding: 10px;
        background-color: #f1f1f1;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        z-index: 900;
        display: flex;
        gap: 10px;
        align-items: center;
    `;

    // Pasek wyszukiwania
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search products...';
    searchInput.style.cssText = `
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
    `;

    // Filtr kategorii
    const categoryFilter = document.createElement('select');
    categoryFilter.style.cssText = `
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
    `;
    const filterOptions = [
        { value: '', text: 'All Categories' },
        { value: 'Słodycze', text: 'Słodycze' },
        { value: 'Kuchnia dania gotowe', text: 'Kuchnia dania gotowe' },
        { value: 'Dodatki do potraw', text: 'Dodatki do potraw' },
        { value: 'Przetwory owocowo-warzywne', text: 'Przetwory owocowo-warzywne' }
    ];
    filterOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.text = option.text;
        categoryFilter.appendChild(optionElement);
    });

    // Przycisk Wyczyść filtry
    const clearFiltersButton = document.createElement('button');
    clearFiltersButton.innerText = 'Wyczyść filtry';
    clearFiltersButton.style.cssText = `
        padding: 8px 15px;
        background-color: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s;
    `;
    clearFiltersButton.onmouseover = () => clearFiltersButton.style.backgroundColor = '#5a6268';
    clearFiltersButton.onmouseout = () => clearFiltersButton.style.backgroundColor = '#6c757d';
    clearFiltersButton.onclick = () => {
        searchInput.value = '';
        categoryFilter.value = '';
        const productLists = document.querySelectorAll('.product-list.active .product');
        productLists.forEach(product => {
            product.style.visibility = 'visible';
            product.style.position = 'relative';
        });
    };

    searchBarContainer.appendChild(searchInput);
    searchBarContainer.appendChild(categoryFilter);
    searchBarContainer.appendChild(clearFiltersButton);

    // Wstawienie paska wyszukiwania i filtrów pod kontenerem banera
    const bannerContainer = document.querySelector('.banner-container');
    if (bannerContainer) {
        bannerContainer.parentNode.insertBefore(searchBarContainer, bannerContainer.nextSibling);
    } else {
        console.error("Banner container element not found for search bar placement!");
    }

    // Obsługa zdarzeń dla wyszukiwania i filtru
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;
        const productLists = document.querySelectorAll('.product-list.active .product');
        productLists.forEach(product => {
            const productName = product.querySelector('.product-name').textContent.toLowerCase();
            const productCode = product.querySelector('.product-code').textContent.toLowerCase();
            const productCategory = productsData[activeTab][product.dataset.index]?.Kategoria?.toLowerCase() || '';
            const nameWords = productName.split(/\s+/);

            // Normalizacja kategorii dla porównania (zamiana myślników na spacje i odwrotnie)
            const normalizedSelectedCategory = selectedCategory.toLowerCase().replace(/-/g, ' ');
            const normalizedProductCategory = productCategory.replace(/-/g, ' ');

            if (searchTerm === '' && selectedCategory === '') {
                product.style.visibility = 'visible';
                product.style.position = 'relative';
            } else {
                const searchMatch = searchTerm === '' || searchTerm.split(/\s+/).every(term =>
                    nameWords.some(word => word.startsWith(term)) || productCode.includes(term)
                );
                const categoryMatch = selectedCategory === '' || normalizedProductCategory === normalizedSelectedCategory;
                if (searchMatch && categoryMatch) {
                    product.style.visibility = 'visible';
                    product.style.position = 'relative';
                } else {
                    product.style.visibility = 'hidden';
                    product.style.position = 'absolute';
                }
            }
        });
    };

    searchInput.oninput = applyFilters;
    categoryFilter.onchange = applyFilters;
}
// Funkcja aktualizująca informację o rabatach w pasku bocznym
function updateDiscountInfo() {
    const discountInfo = document.getElementById('discountInfo');
    if (discountInfo) {
        discountInfo.innerText = `Discount: ${discountPercentage}%, Cash Back: ${customCashBackPercentage}%`;
    } else {
        console.error("Element discountInfo not found!");
    }
}
// Funkcja aktualizująca baner
function updateBanner() {
    const bannerImage = document.getElementById('banner-image');
    if (!bannerImage) {
        console.error("Banner image element not found!");
        return;
    }
    switch (activeTab) {
        case 'lithuania':
            bannerImage.src = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/LITWA BANER.jpg';
            bannerImage.style.display = 'block';
            break;
        case 'bulgaria':
            bannerImage.src = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/bulgaria baner.jpg';
            bannerImage.style.display = 'block';
            break;
        case 'ukraine':
            bannerImage.src = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/ukraina baner.jpg';
            bannerImage.style.display = 'block';
            break;
        case 'cart':
            bannerImage.style.display = 'none';
            break;
        default:
            bannerImage.src = 'https://i.postimg.cc/SNYKPTtw/Tekst-akapitu.jpg';
            bannerImage.style.display = 'block';
    }
}
function updateCartInfo() {
    let totalItems = 0;
    let totalValue = 0;
    for (let country in productsData) {
        productsData[country].forEach(product => {
            if (product.quantity > 0) {
                totalItems += product.quantity;
                totalValue += applyDiscount(product['CENA']) * product['OPAKOWANIE'] * product.quantity;
            }
        });
    }
    totalValue = Number(totalValue.toFixed(2));
    document.getElementById('cart-info').innerText = `Products: ${totalItems} | Value: ${totalValue.toFixed(2)} GBP`;
    updateCashBackInfo(totalValue);
    saveCartState();
}
function updateCashBackInfo(totalValue) {
    const cashBack = Number((totalValue * (customCashBackPercentage / 100)).toFixed(2));
    document.getElementById('cash-back-info').innerText = `Cash Back: ${cashBack.toFixed(2)} GBP`;
}
function saveCartState() {
    localStorage.setItem('productsData', JSON.stringify(productsData));
}
function loadCartState() {
    const savedData = localStorage.getItem('productsData');
    if (savedData) {
        const loadedData = JSON.parse(savedData);
        for (let country in loadedData) {
            if (productsData[country]) {
                loadedData[country].forEach((product, index) => {
                    if (productsData[country][index]) {
                        productsData[country][index].quantity = product.quantity;
                    }
                });
            }
        }
        calculateTotal();
        updateCartInfo();
    }
}
function clearCartState() {
    for (let country in productsData) {
        productsData[country].forEach(product => {
            product.quantity = 0;
        });
    }
    localStorage.removeItem('productsData');
    calculateTotal();
    updateCartInfo();
}
function loadProducts(country) {
    console.log("Loading data for:", country);
    let url = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/produktyjson.json';
    if (country === 'lithuania') {
        url = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/LITWA.json';
    } else if (country === 'bulgaria') {
        url = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/BLUGARIA.json';
    } else if (country === 'ukraine') {
        url = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/UKRAINA.json';
    }
    fetch(url)
        .then(response => {
            console.log("Fetch response for", country, ":", response.status);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Data loaded for", country, ":", data);
            productsData[country] = data.map((product, index) => ({ ...product, quantity: 0, dataset: { index } }));
            const productList = document.getElementById(`product-list-${country}`);
            productList.innerHTML = '';
            data.forEach((product, index) => {
                const productElement = document.createElement("div");
                productElement.classList.add("product");
                productElement.dataset.index = index; // Dodanie indeksu do dataset dla filtrowania
                let imageUrl = '';
                if (country === 'lithuania') {
                    imageUrl = `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-litwa/${product['INDEKS']}.jpg`;
                    const imgTest = new Image();
                    imgTest.src = imageUrl;
                    imgTest.onload = () => {
                        let competitorPriceColor = '';
                        if (product['Cena konkurencji'] && product['CENA']) {
                            if (parseFloat(product['Cena konkurencji']) < parseFloat(product['CENA'])) {
                                competitorPriceColor = 'color: red;';
                            } else if (parseFloat(product['Cena konkurencji']) > parseFloat(product['CENA'])) {
                                competitorPriceColor = 'color: green;';
                            }
                        }
                        const discountedPrice = applyDiscount(product['CENA']);
                        productElement.innerHTML = `
                            <img src="${imageUrl}" alt="Photo" style="position: relative; z-index: 0;">
                            <div class="product-details">
                                <div class="product-code">Index: ${product['INDEKS']}</div>
                                <div class="product-name">${product['NAZWA']}</div>
                                <div class="pack-info">Pack: ${product['OPAKOWANIE']}</div>
                                <div class="price">${discountedPrice.toFixed(2)} GBP (Original: ${product['CENA']} GBP)</div>
                                <div class="competitor-price" style="${competitorPriceColor}">Competitor Price: ${product['Cena konkurencji'] || 'N/A'} GBP</div>
                            </div>
                            <div class="quantity-controls">
                                <button onclick="changeQuantity('${country}', ${index}, -1)">-</button>
                                <input type="number" id="quantity-${country}-${index}" value="0" readonly>
                                <button onclick="changeQuantity('${country}', ${index}, 1)">+</button>
                            </div>
                        `;
                        productList.appendChild(productElement);
                    };
                    imgTest.onerror = () => {
                        console.warn(`Skipped index ${product['INDEKS']} due to missing photo: ${imageUrl}`);
                    };
                } else if (country === 'bulgaria') {
                    imageUrl = `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-bulgaria/${product['INDEKS']}.jpg`;
                    const imgTest = new Image();
                    imgTest.src = imageUrl;
                    imgTest.onload = () => {
                        productElement.innerHTML = `
                            <img src="${imageUrl}" alt="Photo">
                            <div class="product-details">
                                <div class="product-code">Index: ${product['INDEKS']}</div>
                                <div class="product-name">${product['NAZWA']}</div>
                                <div class="pack-info">Pack: ${product['OPAKOWANIE']}</div>
                                <div class="price">${product['CENA']} GBP</div>
                            </div>
                            <div class="quantity-controls">
                                <button onclick="changeQuantity('${country}', ${index}, -1)">-</button>
                                <input type="number" id="quantity-${country}-${index}" value="0" readonly>
                                <button onclick="changeQuantity('${country}', ${index}, 1)">+</button>
                            </div>
                        `;
                        productList.appendChild(productElement);
                    };
                    imgTest.onerror = () => {
                        console.warn(`Skipped index ${product['INDEKS']} due to missing photo: ${imageUrl}`);
                    };
                } else if (country === 'ukraine') {
                    imageUrl = `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-ukraina/${product['INDEKS']}.jpg`;
                    const imgTest = new Image();
                    imgTest.src = imageUrl;
                    imgTest.onload = () => {
                        productElement.innerHTML = `
                            <img src="${imageUrl}" alt="Photo">
                            <div class="product-details">
                                <div class="product-code">Index: ${product['INDEKS']}</div>
                                <div class="product-name">${product['NAZWA']}</div>
                                <div class="pack-info">Pack: ${product['OPAKOWANIE']}</div>
                                <div class="price">${product['CENA']} GBP</div>
                            </div>
                            <div class="quantity-controls">
                                <button onclick="changeQuantity('${country}', ${index}, -1)">-</button>
                                <input type="number" id="quantity-${country}-${index}" value="0" readonly>
                                <button onclick="changeQuantity('${country}', ${index}, 1)">+</button>
                            </div>
                        `;
                        productList.appendChild(productElement);
                    };
                    imgTest.onerror = () => {
                        console.warn(`Skipped index ${product['INDEKS']} due to missing photo: ${imageUrl}`);
                    };
                }
            });
            calculateTotal();
            updateCartInfo();
            // Ręczne wywołanie switchTab po załadowaniu danych dla aktywnej zakładki
            if (country === activeTab) {
                switchTab(activeTab);
            }
        })
        .catch(error => console.error(`Error loading data for ${country}:`, error));
}
// Funkcja przełączania zakładek z inicjalizacją
function switchTab(country) {
    activeTab = country;
    console.log("Switching to tab:", country);
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.product-list').forEach(list => list.classList.remove('active'));
    const selectedTab = document.querySelector(`[onclick="switchTab('${country}')"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    } else {
        console.error("Tab not found:", country);
    }
    const selectedList = document.getElementById(`product-list-${country}`);
    if (selectedList) {
        selectedList.classList.add('active');
    } else {
        console.error("Product list not found for:", country);
    }
    updateBanner(); // Upewnienie się, że baner jest aktualizowany przy każdej zmianie zakładki
    // Resetowanie wyników wyszukiwania i filtru przy przełączaniu zakładki
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        const searchInput = searchBar.querySelector('input');
        const categoryFilter = searchBar.querySelector('select');
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        const productLists = document.querySelectorAll('.product-list .product');
        productLists.forEach(product => {
            product.style.visibility = 'visible';
            product.style.position = 'relative';
        });
    }
    if (country === 'cart') {
        updateCart();
    } else if (productsData[country].length === 0) {
        loadProducts(country);
    } else {
        calculateTotal();
        updateCartInfo();
    }
    updateCartInfo();
}
function changeQuantity(country, index, change) {
    const input = document.getElementById(`quantity-${country}-${index}`);
    let currentQuantity = parseInt(input.value);
    if (currentQuantity + change >= 0) {
        currentQuantity += change;
        input.value = currentQuantity;
        productsData[country][index].quantity = currentQuantity;
        if (activeTab === 'cart') {
            updateCart();
        } else {
            calculateTotal();
            updateCartInfo();
        }
        saveCartState();
    }
}
function updateCart() {
    const cartList = document.getElementById('product-list-cart');
    cartList.innerHTML = '';
    let totalCartValue = 0;
    for (let country in productsData) {
        productsData[country].forEach((product, index) => {
            if (product.quantity > 0) {
                const imageUrl = `${country === 'lithuania' ? 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-litwa/' :
                    country === 'bulgaria' ? 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-bulgaria/' :
                    'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-ukraina/'}${product['INDEKS']}.jpg`;
                const productElement = document.createElement("div");
                productElement.classList.add("product");
                const discountedPrice = applyDiscount(product['CENA']);
                const itemValue = discountedPrice * product['OPAKOWANIE'] * product.quantity;
                productElement.innerHTML = `
                    <img src="${imageUrl}" alt="Photo" style="position: relative; z-index: 0;">
                    <div class="product-details">
                        <div class="product-code">Index: ${product['INDEKS']}</div>
                        <div class="product-name">${product['NAZWA']} (${country.charAt(0).toUpperCase() + country.slice(1)})</div>
                        <div class="pack-info">Pack: ${product['OPAKOWANIE']}</div>
                        <div class="price">${itemValue.toFixed(2)} GBP (Unit: ${discountedPrice.toFixed(2)} GBP)</div>
                    </div>
                    <div class="quantity-controls cart">
                        <button onclick="changeQuantity('${country}', ${index}, -1)">-</button>
                        <input type="number" id="quantity-${country}-${index}" value="${product.quantity}" readonly>
                        <button onclick="changeQuantity('${country}', ${index}, 1)">+</button>
                        <button class="remove-btn" onclick="removeItem('${country}', ${index})">X</button>
                    </div>
                `;
                cartList.appendChild(productElement);
                totalCartValue += itemValue;
                console.log(`Product: ${product['NAZWA']}, Price: ${product['CENA']}, Pack: ${product['OPAKOWANIE']}, Quantity: ${product.quantity}, Item Value: ${itemValue}, Total so far: ${totalCartValue}`);
            }
        });
    }
    document.getElementById("cart-total").innerText = `Cart value: ${totalCartValue.toFixed(2)} GBP`;
    updateCartInfo();
}
function removeItem(country, index) {
    productsData[country][index].quantity = 0;
    if (activeTab === 'cart') {
        updateCart();
    } else {
        calculateTotal();
        updateCartInfo();
    }
    saveCartState();
    // Dodanie aktualizacji ilości w ofercie po usunięciu z koszyka
    if (document.getElementById(`quantity-${country}-${index}`)) {
        document.getElementById(`quantity-${country}-${index}`).value = '0';
    }
}
function calculateTotal() {
    let totalValue = 0;
    let categoryValue = 0;
    let categoryTotalsText = '';
    for (let country in productsData) {
        let countryTotal = 0;
        productsData[country].forEach(product => {
            if (product.quantity > 0) {
                countryTotal += applyDiscount(product['CENA']) * product['OPAKOWANIE'] * product.quantity;
            }
        });
        categoryTotals[country] = Number(countryTotal.toFixed(2));
        if (countryTotal > 0) {
            categoryTotalsText += `${country.charAt(0).toUpperCase() + country.slice(1)}: ${countryTotal.toFixed(2)} GBP\n`;
        }
    }
    categoryValue = categoryTotals[activeTab] || 0;
    document.getElementById("category-totals").innerText = categoryTotalsText.trim();
    document.getElementById("total-value").innerText = `Total order value: ${(categoryTotals.lithuania + categoryTotals.bulgaria + categoryTotals.ukraine).toFixed(2)} GBP`;
}
function submitOrder() {
    const storeName = document.getElementById('store-name').value;
    const email = document.getElementById('email').value;
    if (!email || !storeName) {
        alert("Please fill in all fields.");
        return;
    }
    let orderMessage = `Order for store: ${storeName}\n\n`;
    for (let country in productsData) {
        let countryTotal = 0;
        let hasItems = false;
        orderMessage += `${country.charAt(0).toUpperCase() + country.slice(1)}:\n`;
        orderMessage += "Index\tName\tQuantity\n";
        productsData[country].forEach(product => {
            if (product.quantity > 0) {
                hasItems = true;
                orderMessage += `${product.INDEKS}\t${product['NAZWA']}\t${product.quantity}\n`;
                countryTotal += applyDiscount(product['CENA']) * product['OPAKOWANIE'] * product.quantity;
            }
        });
        if (!hasItems) {
            orderMessage += "No items in cart for this category.\n\n";
        } else {
            orderMessage += `Total for ${country.charAt(0).toUpperCase() + country.slice(1)}: ${countryTotal.toFixed(2)} GBP\n\n`;
        }
    }
    orderMessage += `Total order value: ${(categoryTotals.lithuania + categoryTotals.bulgaria + categoryTotals.ukraine).toFixed(2)} GBP`;
    const formData = new FormData();
    formData.append("email", email);
    formData.append("store-name", storeName);
    formData.append("message", orderMessage);
    console.log("Sending order:", { email, storeName, orderMessage });
    fetch("https://formspree.io/f/xanwzpgj", {
        method: "POST",
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        console.log("Server response:", response.status, response.statusText);
        if (response.ok) {
            alert("Order sent!");
            clearCartState();
        } else {
            throw new Error("Server response error");
        }
    }).catch(error => {
        console.error("Error sending order:", error);
        alert("Error sending order.");
    });
}
// Wywołanie okna dialogowego, stworzenie paska bocznego i paska wyszukiwania z filtrem po załadowaniu strony
window.onload = function() {
    showInitialDialog();
    createSidebar();
    createSearchBar();
    // Automatyczne załadowanie danych dla wszystkich krajów przy starcie
    ['lithuania', 'bulgaria', 'ukraine'].forEach(country => loadProducts(country));
};
loadCartState();
updateBanner();
updateCartInfo();
