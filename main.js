let productsData = {
    lithuania: [],
    bulgaria: [],
    ukraine: [],
    romania: []
};
let activeTab = 'lithuania';
let categoryTotals = {
    lithuania: 0,
    bulgaria: 0,
    ukraine: 0,
    romania: 0
};
let discountPercentage = 0; // Domyślnie 0%
let customCashBackPercentage = 0; // Domyślnie 0%
let customPrices = {}; // Obiekt przechowujący niestandardowe ceny
let showCompetitorPrice = false; // Domyślnie cena konkurencji ukryta
let showStockInfo = false; // Domyślnie stany magazynowe ukryte
let gk_isXlsx = false;
let gk_xlsxFileLookup = {};
let gk_fileData = {};
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
// Funkcja obliczająca cenę z rabatem lub niestandardową ceną
function applyDiscount(price, productIndex, country) {
    const parsedPrice = parseFloat(price) || 0;
    const customPrice = customPrices[`${country}-${productIndex}`];
    if (customPrice !== undefined && customPrice !== null && !isNaN(customPrice)) {
        return Number(parseFloat(customPrice).toFixed(2));
    }
    return Number((parsedPrice * (1 - discountPercentage / 100)).toFixed(2));
}
// Funkcja resetująca niestandardową cenę
function resetCustomPrice(country, index) {
    delete customPrices[`${country}-${index}`];
    updatePrices();
    saveCartState();
}
// Funkcja aktualizująca ceny na stronie - bez przeskakiwania
function updatePrices() {
    const activeList = document.querySelector('.product-list.active');
    const scrollPosition = activeList ? activeList.scrollTop : 0;
    if (productsData[activeTab].length > 0) {
        loadProducts(activeTab);
    }
    if (activeTab === 'cart') {
        updateCart();
    }
    calculateTotal();
    updateCartInfo();
    updateDiscountInfo();
    setTimeout(() => {
        if (activeList) {
            activeList.scrollTop = scrollPosition;
        }
    }, 50);
}
// Funkcja zapisująca koszyk do pliku CSV w formacie "indeks,nazwa,ilosc,cena"
function saveCartToCSV() {
    let csvContent = 'indeks,nazwa,ilosc,cena\n';
    for (let country in productsData) {
        productsData[country].forEach((product, index) => {
            if (product.quantity > 0) {
                const price = applyDiscount(parseFloat(product['CENA']) || 0, index, country).toFixed(2);
                csvContent += `${product.INDEKS},${product['NAZWA'].replace(/,/g, '')},${product.quantity},${price}\n`;
            }
        });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
    link.setAttribute('download', `order_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// Funkcja zapisująca koszyk do pliku XLS w formacie "indeks,nazwa,ilosc,cena"
function saveCartToXLS() {
    const workbook = XLSX.utils.book_new();
    const ws_data = [['indeks', 'nazwa', 'ilosc', 'cena']];
    for (let country in productsData) {
        productsData[country].forEach((product, index) => {
            if (product.quantity > 0) {
                const price = applyDiscount(parseFloat(product['CENA']) || 0, index, country).toFixed(2);
                ws_data.push([product.INDEKS, product['NAZWA'], product.quantity, price]);
            }
        });
    }
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(workbook, ws, 'Order');
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
    XLSX.writeFile(workbook, `order_${timestamp}.xlsx`);
}
// Funkcja wyświetlająca modalne okno początkowe
function showInitialDialog() {
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
        font-size: 14px;
        color: #333;
        margin-top: 20px;
    `;
    const closeButton = document.createElement('button');
    closeButton.innerText = '×';
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
        customCashBackPercentage = parseFloat(cashBackInput.value) || 0;
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
// Funkcja wyświetlająca okno dialogowe do zmiany ceny produktu (styl jak sidebar)
function showPriceDialog(country, index, originalPrice) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 100px;
        height: 100%;
        background-color: #f8f8f8;
        padding: 15px;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        font-family: Arial, sans-serif;
        font-size: 12px;
    `;
    const priceLabel = document.createElement('label');
    priceLabel.innerText = 'Custom Price (GBP):';
    priceLabel.style.cssText = `display: block; margin: 5px 0; font-weight: normal;`;
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.step = '0.01';
    priceInput.value = customPrices[`${country}-${index}`] || originalPrice;
    priceInput.style.cssText = `width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;`;
    priceInput.min = 0;
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.style.cssText = `width: 100%; padding: 6px; margin-top: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;`;
    saveButton.onmouseover = () => saveButton.style.backgroundColor = '#0056b3';
    saveButton.onmouseout = () => saveButton.style.backgroundColor = '#007bff';
    saveButton.onclick = () => {
        const newPrice = parseFloat(priceInput.value);
        if (newPrice >= 0 && !isNaN(newPrice)) {
            customPrices[`${country}-${index}`] = newPrice;
            updatePrices();
        } else {
            delete customPrices[`${country}-${index}`];
            updatePrices();
        }
        document.body.removeChild(modal);
    };
    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.style.cssText = `width: 100%; padding: 6px; margin-top: 5px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;`;
    cancelButton.onmouseover = () => cancelButton.style.backgroundColor = '#5a6268';
    cancelButton.onmouseout = () => cancelButton.style.backgroundColor = '#6c757d';
    cancelButton.onclick = () => document.body.removeChild(modal);
    modal.appendChild(priceLabel);
    modal.appendChild(priceInput);
    modal.appendChild(saveButton);
    modal.appendChild(cancelButton);
    document.body.appendChild(modal);
}
// Tworzenie stałego panelu po lewej stronie
function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    sidebar.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 200px;
        height: 100%;
        background-color: #f8f8f8;
        padding: 15px;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;
    const discountInfo = document.createElement('div');
    discountInfo.id = 'discountInfo';
    discountInfo.style.cssText = `margin-bottom: 15px; font-weight: bold; color: #333;`;
    updateDiscountInfo();
    const discountLabel = document.createElement('label');
    discountLabel.innerText = 'Discount (%):';
    discountLabel.style.cssText = `display: block; margin-bottom: 5px; font-weight: bold;`;
    const discountInput = document.createElement('input');
    discountInput.type = 'number';
    discountInput.value = discountPercentage;
    discountInput.style.cssText = `width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; margin-bottom: 15px;`;
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
    cashBackLabel.innerText = 'Cash Back (%):';
    cashBackLabel.style.cssText = `display: block; margin-bottom: 5px; font-weight: bold;`;
    const cashBackInput = document.createElement('input');
    cashBackInput.type = 'number';
    cashBackInput.value = customCashBackPercentage;
    cashBackInput.style.cssText = `width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; margin-bottom: 15px;`;
    cashBackInput.min = 0;
    cashBackInput.max = 100;
    cashBackInput.onchange = () => {
        customCashBackPercentage = parseFloat(cashBackInput.value) || 0;
        if (customCashBackPercentage < 0) customCashBackPercentage = 0;
        if (customCashBackPercentage > 100) customCashBackPercentage = 100;
        updatePrices();
        updateDiscountInfo();
    };
    const competitorPriceLabel = document.createElement('label');
    competitorPriceLabel.innerText = 'Show Competitor Price:';
    competitorPriceLabel.style.cssText = `display: block; margin-bottom: 5px; font-weight: bold; text-align: left; padding-left: 0;`;
    const competitorPriceCheckbox = document.createElement('input');
    competitorPriceCheckbox.type = 'checkbox';
    competitorPriceCheckbox.checked = showCompetitorPrice;
    competitorPriceCheckbox.style.cssText = `margin-right: 10px; vertical-align: middle;`;
    competitorPriceCheckbox.onchange = () => {
        showCompetitorPrice = competitorPriceCheckbox.checked;
        ['lithuania', 'bulgaria', 'ukraine', 'romania'].forEach(country => {
            if (productsData[country].length > 0) {
                loadProducts(country);
            }
        });
        if (activeTab !== 'cart') updatePrices();
    };
    competitorPriceLabel.appendChild(competitorPriceCheckbox);
    const stockInfoLabel = document.createElement('label');
    stockInfoLabel.innerText = 'Show Stock Info:';
    stockInfoLabel.style.cssText = `display: block; margin-bottom: 5px; font-weight: bold; text-align: left; padding-left: 0;`;
    const stockInfoCheckbox = document.createElement('input');
    stockInfoCheckbox.type = 'checkbox';
    stockInfoCheckbox.checked = showStockInfo;
    stockInfoCheckbox.style.cssText = `margin-right: 10px; vertical-align: middle;`;
    stockInfoCheckbox.onchange = () => {
        showStockInfo = stockInfoCheckbox.checked;
        ['lithuania', 'bulgaria', 'ukraine', 'romania'].forEach(country => {
            if (productsData[country].length > 0) {
                loadProducts(country);
            }
        });
        if (activeTab !== 'cart') updatePrices();
    };
    stockInfoLabel.appendChild(stockInfoCheckbox);
    sidebar.appendChild(discountInfo);
    sidebar.appendChild(discountLabel);
    sidebar.appendChild(discountInput);
    sidebar.appendChild(cashBackLabel);
    sidebar.appendChild(cashBackInput);
    sidebar.appendChild(competitorPriceLabel);
    sidebar.appendChild(stockInfoLabel);
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
// Funkcja aktualizująca baner
function updateBanner() {
    const bannerImage = document.getElementById('banner-image');
    if (!bannerImage) {
        console.error("Banner image element not found!");
        return;
    }
    switch (activeTab) {
        case 'lithuania':
            bannerImage.src = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/BANER LITWA.jpg';
            bannerImage.style.display = 'block';
            break;
        case 'bulgaria':
            bannerImage.src = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/BLUGARIA BANER.jpg';
            bannerImage.style.display = 'block';
            break;
        case 'ukraine':
            bannerImage.src = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/UKRAINA BANER 2.jpg';
            bannerImage.style.display = 'block';
            break;
        case 'romania':
            bannerImage.src = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/RUMUNIA BANER.jpg';
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
// Funkcja przełączania zakładki z przewinięciem na górę
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
    // Przewinięcie strony na samą górę
    window.scrollTo(0, 0);
    // Zarządzanie widocznością przycisków zapisu
    const saveButtons = document.getElementById('save-buttons');
    if (saveButtons) {
        saveButtons.style.display = country === 'cart' ? 'block' : 'none';
    }
    updateBanner();
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        const searchInput = searchBar.querySelector('input');
        const categoryFilter = searchBar.querySelector('select');
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        const productLists = document.querySelectorAll('.product-list.active .product');
        productLists.forEach(product => {
            product.style.visibility = 'visible';
            product.style.position = 'relative';
        });
        if (typeof applyFilters === 'function') {
            applyFilters();
        }
    }
    if (country === 'cart') {
        updateCart();
    } else if (productsData[country].length === 0) {
        loadProducts(country);
    } else {
        calculateTotal();
        updateCartInfo();
    }
    if (document.getElementById('product-list-cart')) {
        updateCart();
    }
    updateCartInfo();
}
function updateCartInfo() {
    let totalItems = 0;
    let totalValue = 0;
    for (let country in productsData) {
        productsData[country].forEach((product, index) => {
            if (product.quantity > 0) {
                totalItems += product.quantity;
                totalValue += applyDiscount(parseFloat(product['CENA']) || 0, index, country) * parseFloat(product['OPAKOWANIE'] || 1) * product.quantity;
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
    const cartState = {
        productsData,
        customPrices
    };
    localStorage.setItem('cartState', JSON.stringify(cartState));
}
function loadCartState() {
    const savedData = localStorage.getItem('cartState');
    if (savedData) {
        const loadedData = JSON.parse(savedData);
        for (let country in loadedData.productsData) {
            if (productsData[country]) {
                loadedData.productsData[country].forEach((product, index) => {
                    if (productsData[country][index]) {
                        productsData[country][index].quantity = product.quantity || 0;
                    }
                });
            }
        }
        customPrices = loadedData.customPrices || {};
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
    customPrices = {};
    localStorage.removeItem('cartState');
    calculateTotal();
    updateCartInfo();
}
function changeQuantity(country, index, change) {
    const input = document.getElementById(`quantity-${country}-${index}`);
    let currentQuantity = parseInt(input.value) || 0;
    if (currentQuantity + change >= 0) {
        currentQuantity += change;
        input.value = currentQuantity;
        productsData[country][index].quantity = currentQuantity;
        updateCart();
        calculateTotal();
        updateCartInfo();
        saveCartState();
    }
}
function updateCart() {
    const cartList = document.getElementById('product-list-cart');
    if (!cartList) {
        console.error("Cart list element not found!");
        return;
    }
    cartList.innerHTML = '';
    let totalCartValue = 0;
    for (let country in productsData) {
        productsData[country].forEach((product, index) => {
            if (product.quantity > 0) {
                const imageUrl = `${country === 'lithuania' ? 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-litwa/' :
                    country === 'bulgaria' || country === 'romania' ? 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-bulgaria/' :
                    'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-ukraina/'}${product['INDEKS']}.jpg`;
                const productElement = document.createElement("div");
                productElement.classList.add("product");
                const originalPrice = parseFloat(product['CENA']) || 0;
                const discountedPrice = applyDiscount(originalPrice, index, country);
                const itemValue = discountedPrice * parseFloat(product['OPAKOWANIE'] || 1) * product.quantity;
                const customPrice = customPrices[`${country}-${index}`];
                const priceDisplay = customPrice !== undefined && customPrice !== null && !isNaN(customPrice)
                    ? `${discountedPrice.toFixed(2)} GBP (Custom)`
                    : `${discountedPrice.toFixed(2)} GBP (Original: ${originalPrice.toFixed(2)} GBP)`;
                productElement.innerHTML = `
                    <img src="${imageUrl}" alt="Photo" style="position: relative; z-index: 0;">
                    <div class="product-details">
                        <div class="product-code">Index: ${product['INDEKS']}</div>
                        <div class="product-name">${product['NAZWA']} (${country.charAt(0).toUpperCase() + country.slice(1)})</div>
                        <div class="pack-info">Pack: ${product['OPAKOWANIE']}</div>
                        <div class="price">${itemValue.toFixed(2)} GBP (Unit: ${priceDisplay})</div>
                    </div>
                    <div class="quantity-controls cart">
                        <button onclick="changeQuantity('${country}', ${index}, -1)">-</button>
                        <input type="number" id="quantity-${country}-${index}" value="${product.quantity || 0}" readonly>
                        <button onclick="changeQuantity('${country}', ${index}, 1)">+</button>
                    </div>
                `;
                cartList.appendChild(productElement);
                totalCartValue += itemValue;
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
    if (document.getElementById(`quantity-${country}-${index}`)) {
        document.getElementById(`quantity-${country}-${index}`).value = '0';
    }
}
function calculateTotal() {
    let totalValue = 0;
    let categoryTotalsText = '';
    for (let country in productsData) {
        let countryTotal = 0;
        productsData[country].forEach((product, index) => {
            if (product.quantity > 0) {
                countryTotal += applyDiscount(parseFloat(product['CENA']) || 0, index, country) * parseFloat(product['OPAKOWANIE'] || 1) * product.quantity;
            }
        });
        categoryTotals[country] = Number(countryTotal.toFixed(2));
        if (countryTotal > 0) {
            categoryTotalsText += `${country.charAt(0).toUpperCase() + country.slice(1)}: ${countryTotal.toFixed(2)} GBP\n`;
        }
    }
    totalValue = categoryTotals.lithuania + categoryTotals.bulgaria + categoryTotals.ukraine + categoryTotals.romania;
    document.getElementById("category-totals").innerText = categoryTotalsText.trim();
    document.getElementById("total-value").innerText = `Total order value: ${totalValue.toFixed(2)} GBP`;
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
        orderMessage += "Index\tName\tQuantity\tPrice\n";
        productsData[country].forEach((product, index) => {
            if (product.quantity > 0) {
                hasItems = true;
                const price = applyDiscount(parseFloat(product['CENA']) || 0, index, country);
                orderMessage += `${product.INDEKS}\t${product['NAZWA']}\t${product.quantity}\t${price.toFixed(2)} GBP\n`;
                countryTotal += price * parseFloat(product['OPAKOWANIE'] || 1) * product.quantity;
            }
        });
        if (!hasItems) {
            orderMessage += "No items in cart for this category.\n\n";
        } else {
            orderMessage += `Total for ${country.charAt(0).toUpperCase() + country.slice(1)}: ${countryTotal.toFixed(2)} GBP\n\n`;
        }
    }
    orderMessage += `Total order value: ${(categoryTotals.lithuania + categoryTotals.bulgaria + categoryTotals.ukraine + categoryTotals.romania).toFixed(2)} GBP\n`;
    orderMessage += `Discount: ${discountPercentage}%\n`;
    orderMessage += `Cash Back: ${customCashBackPercentage}%`;
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
window.onload = async function() {
    showInitialDialog();
    createSidebar();
    createSearchBar();
    await loadProducts('lithuania');
    await Promise.all(['bulgaria', 'ukraine', 'romania'].map(country => loadProducts(country)));
    switchTab('lithuania');
    loadCartState();
    updateBanner();
    updateCartInfo();
};
