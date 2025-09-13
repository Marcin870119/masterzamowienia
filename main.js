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
// Funkcja aktualizująca ceny na stronie
function updatePrices() {
    ['lithuania', 'bulgaria', 'ukraine', 'romania'].forEach(country => {
        if (productsData[country].length > 0) {
            loadProducts(country); // Ponowne załadowanie z nowym rabatem
        }
    });
    if (activeTab === 'cart') {
        updateCart();
    }
    calculateTotal();
    updateCartInfo();
    updateDiscountInfo();
}
// Funkcja zapisująca koszyk do pliku CSV
function saveCartToCSV() {
    const storeName = document.getElementById('store-name').value || 'Unknown_Store';
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Store Name,' + storeName + '\n\n';
   
    for (let country in productsData) {
        let countryTotal = 0;
        let hasItems = false;
        csvContent += `${country.charAt(0).toUpperCase() + country.slice(1)},\n`;
        csvContent += 'Index,Name,Quantity,Unit Price (GBP),Total (GBP)\n';
        productsData[country].forEach((product, index) => {
            if (product.quantity > 0) {
                hasItems = true;
                const price = applyDiscount(parseFloat(product['CENA']) || 0, index, country);
                const total = price * parseFloat(product['OPAKOWANIE'] || 1) * product.quantity;
                csvContent += `${product.INDEKS},${product['NAZWA'].replace(/,/g, '')},${product.quantity},${price.toFixed(2)},${total.toFixed(2)}\n`;
                countryTotal += total;
            }
        });
        if (hasItems) {
            csvContent += `Total for ${country.charAt(0).toUpperCase() + country.slice(1)},${countryTotal.toFixed(2)} GBP\n\n`;
        } else {
            csvContent += 'No items in cart for this category,\n\n';
        }
    }
    const totalValue = (categoryTotals.lithuania + categoryTotals.bulgaria + categoryTotals.ukraine + categoryTotals.romania).toFixed(2);
    csvContent += `Total Order Value,${totalValue} GBP\n`;
    csvContent += `Discount,${discountPercentage}%\n`;
    csvContent += `Cash Back,${customCashBackPercentage}%\n`;
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
// Funkcja zapisująca koszyk do pliku XLS (indeks, nazwa, ilosci, cena)
function saveCartToXLS() {
    const storeName = document.getElementById('store-name').value || 'Unknown_Store';
    const workbook = XLSX.utils.book_new();
    const ws_data = [['Store Name', storeName], ['']];
    // Nagłówki dla produktów
    ws_data.push(['Index', 'Name', 'Quantity', 'Unit Price (GBP)']);
    // Dodaj dane tylko dla produktów w koszyku
    for (let country in productsData) {
        productsData[country].forEach((product, index) => {
            if (product.quantity > 0) {
                const price = applyDiscount(parseFloat(product['CENA']) || 0, index, country);
                ws_data.push([product.INDEKS, product['NAZWA'], product.quantity, price.toFixed(2)]);
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
        } else {
            delete customPrices[`${country}-${index}`]; // Usunięcie ceny, jeśli jest nieprawidłowa
        }
        updatePrices();
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
        font-size: 12px;
    `;
    const discountInfo = document.createElement('div');
    discountInfo.id = 'discountInfo';
    discountInfo.style.cssText = `margin-bottom: 10px; font-weight: bold; color: #333;`;
    updateDiscountInfo();
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
        customCashBackPercentage = parseFloat(cashBackInput.value) || 0;
        if (customCashBackPercentage < 0) customCashBackPercentage = 0;
        if (customCashBackPercentage > 100) customCashBackPercentage = 100;
        updatePrices();
        updateDiscountInfo();
    };
    const competitorPriceLabel = document.createElement('label');
    competitorPriceLabel.innerText = 'Show Competitor Price:';
    competitorPriceLabel.style.cssText = `display: block; margin: 5px 0 5px 5px; font-weight: normal;`; // Dodano margines z lewej dla labela
    const competitorPriceCheckbox = document.createElement('input');
    competitorPriceCheckbox.type = 'checkbox';
    competitorPriceCheckbox.checked = showCompetitorPrice;
    competitorPriceCheckbox.style.cssText = `margin-left: 5px;`; // Dodano margines z lewej dla checkboxa
    competitorPriceCheckbox.onchange = () => {
        showCompetitorPrice = competitorPriceCheckbox.checked;
        updatePrices();
    };
    sidebar.appendChild(discountInfo);
    sidebar.appendChild(discountLabel);
    sidebar.appendChild(discountInput);
    sidebar.appendChild(cashBackLabel);
    sidebar.appendChild(cashBackInput);
    sidebar.appendChild(competitorPriceLabel);
    sidebar.appendChild(competitorPriceCheckbox);
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
    searchBarContainer.id = 'search-bar';
    searchBarContainer.style.cssText = `
        width: 100%;
        max-width: 900px;
        margin: 10px auto 0;
        padding: 10px;
        background-color: #f1f1f1;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        z-index: 900;
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
    `;
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
        min-width: 150px;
    `;
    const categoryFilter = document.createElement('select');
    categoryFilter.style.cssText = `
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
        min-width: 120px;
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
    const rankingFilter = document.createElement('select');
    rankingFilter.id = 'ranking-filter';
    rankingFilter.style.cssText = `
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
        min-width: 150px;
    `;
    const rankingOptions = [
        { value: '', text: 'Sort by Ranking' },
        { value: 'desc', text: 'Highest to Lowest' },
        { value: 'asc', text: 'Lowest to Highest' }
    ];
    rankingOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.text = option.text;
        rankingFilter.appendChild(optionElement);
    });
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
        min-width: 100px;
    `;
    clearFiltersButton.onmouseover = () => clearFiltersButton.style.backgroundColor = '#5a6268';
    clearFiltersButton.onmouseout = () => clearFiltersButton.style.backgroundColor = '#6c757d';
    clearFiltersButton.onclick = () => {
        searchInput.value = '';
        categoryFilter.value = '';
        rankingFilter.value = '';
        applyFilters();
    };
    searchBarContainer.appendChild(searchInput);
    searchBarContainer.appendChild(categoryFilter);
    searchBarContainer.appendChild(rankingFilter);
    searchBarContainer.appendChild(clearFiltersButton);
    const bannerContainer = document.querySelector('.banner-container');
    if (bannerContainer) {
        bannerContainer.parentNode.insertBefore(searchBarContainer, bannerContainer.nextSibling);
    } else {
        console.error("Banner container element not found for search bar placement!");
    }
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;
        const sortOrder = rankingFilter.value;
        const productLists = document.querySelectorAll('.product-list.active .product');
        let products = Array.from(productLists);
     
        // Sortowanie według rankingu, jeśli wybrano
        if (sortOrder) {
            products.sort((a, b) => {
                const rankA = parseInt(productsData[activeTab][a.dataset.index]?.Ranking) || 0;
                const rankB = parseInt(productsData[activeTab][b.dataset.index]?.Ranking) || 0;
                return sortOrder === 'desc' ? rankB - rankA : rankA - rankB;
            });
            const productList = document.getElementById(`product-list-${activeTab}`);
            products.forEach(product => productList.appendChild(product));
        }
        productLists.forEach(product => {
            const productName = product.querySelector('.product-name').textContent.toLowerCase();
            const productCode = product.querySelector('.product-code').textContent.toLowerCase();
            const productCategory = productsData[activeTab][product.dataset.index]?.Kategoria?.toLowerCase() || '';
            const nameWords = productName.split(/\s+/);
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
    }
    searchInput.oninput = applyFilters;
    categoryFilter.onchange = applyFilters;
    rankingFilter.onchange = applyFilters;
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
function loadProducts(country) {
    console.log("Loading data for:", country);
    let url = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/produktyjson.json';
    if (country === 'lithuania') {
        url = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/LITWA.json';
    } else if (country === 'bulgaria' || country === 'romania') {
        url = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/BLUGARIA.json';
    } else if (country === 'ukraine') {
        url = 'https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/UKRAINA.json';
    }
    return fetch(url)
        .then(response => {
            console.log("Fetch response for", country, ":", response.status);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Data loaded for", country, ":", data);
            if (productsData[country].length > 0) {
                data = data.map((product, index) => {
                    if (productsData[country][index] && productsData[country][index].quantity) {
                        return { ...product, quantity: productsData[country][index].quantity, dataset: { index } };
                    }
                    return { ...product, quantity: 0, dataset: { index } };
                });
            } else {
                productsData[country] = data.map((product, index) => ({ ...product, quantity: 0, dataset: { index } }));
            }
            const productList = document.getElementById(`product-list-${country}`);
            productList.innerHTML = '';
            data.forEach((product, index) => {
                const productElement = document.createElement("div");
                productElement.classList.add("product");
                productElement.dataset.index = index;
                const originalPrice = parseFloat(product['CENA']) || 0;
                const discountedPrice = applyDiscount(originalPrice, index, country);
                let imageUrl = '';
                if (country === 'lithuania') {
                    imageUrl = `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-litwa/${product['INDEKS']}.jpg`;
                    const imgTest = new Image();
                    imgTest.src = imageUrl;
                    imgTest.onload = () => {
                        let competitorPriceColor = '';
                        if (product['Cena konkurencji'] && originalPrice) {
                            if (parseFloat(product['Cena konkurencji']) < originalPrice) {
                                competitorPriceColor = 'color: red;';
                            } else if (parseFloat(product['Cena konkurencji']) > originalPrice) {
                                competitorPriceColor = 'color: green;';
                            }
                        }
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.alt = "Photo";
                        img.style.cssText = 'max-width: 100px; width: 100%; height: auto; position: relative; z-index: 0;';
                        if (window.innerWidth <= 600) {
                            img.onclick = function() {
                                this.classList.toggle('enlarged');
                            };
                        } else {
                            productElement.style.minWidth = '350px';
                            productElement.style.padding = '10px';
                            const details = productElement.querySelector('.product-details');
                            if (details) {
                                details.style.fontSize = '14px';
                            }
                        }
                        productElement.appendChild(img);
                        const details = document.createElement('div');
                        details.classList.add('product-details');
                        const customPrice = customPrices[`${country}-${index}`];
                        const priceDisplay = customPrice !== undefined && customPrice !== null && !isNaN(customPrice)
                            ? `${discountedPrice.toFixed(2)} GBP (Custom)`
                            : `${discountedPrice.toFixed(2)} GBP (Original: ${originalPrice.toFixed(2)} GBP)`;
                        let detailsHTML = `
                            <div class="product-code">Index: ${product['INDEKS']}</div>
                            <div class="product-name">${product['NAZWA']}</div>
                            <div class="pack-info">Pack: ${product['OPAKOWANIE']}</div>
                            <div class="price">${priceDisplay}</div>
                            <button onclick="showPriceDialog('${country}', ${index}, ${originalPrice})" style="margin-top: 5px; margin-right: 5px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Set Custom Price</button>
                            <button onclick="resetCustomPrice('${country}', ${index})" style="margin-top: 5px; padding: 5px 10px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Reset Custom Price</button>
                        `;
                        if (showCompetitorPrice) {
                            detailsHTML += `<div class="competitor-price" style="${competitorPriceColor}">Competitor Price: ${product['Cena konkurencji'] || 'N/A'} GBP</div>`;
                        }
                        details.innerHTML = detailsHTML;
                        productElement.appendChild(details);
                        const controls = document.createElement('div');
                        controls.classList.add('quantity-controls');
                        controls.innerHTML = `
                            <button onclick="changeQuantity('${country}', ${index}, -1)">-</button>
                            <input type="number" id="quantity-${country}-${index}" value="${product.quantity || 0}" readonly>
                            <button onclick="changeQuantity('${country}', ${index}, 1)">+</button>
                            <span class="stock-info" style="margin-left: 10px; font-size: 12px; color: #666;">Stany magazynowe: ${product['Stany magazynowe'] || 'N/A'}</span>
                        `;
                        productElement.appendChild(controls);
                        productList.appendChild(productElement);
                    };
                    imgTest.onerror = () => {
                        console.warn(`Skipped index ${product['INDEKS']} due to missing photo: ${imageUrl}`);
                    };
                } else if (country === 'bulgaria' || country === 'romania') {
                    imageUrl = `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-bulgaria/${product['INDEKS']}.jpg`;
                    const imgTest = new Image();
                    imgTest.src = imageUrl;
                    imgTest.onload = () => {
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.alt = "Photo";
                        img.style.cssText = 'max-width: 100px; width: 100%; height: auto; position: relative;';
                        if (window.innerWidth <= 600) {
                            img.onclick = function() {
                                this.classList.toggle('enlarged');
                            };
                        } else {
                            productElement.style.minWidth = '350px';
                            productElement.style.padding = '10px';
                            const details = productElement.querySelector('.product-details');
                            if (details) {
                                details.style.fontSize = '14px';
                            }
                        }
                        productElement.appendChild(img);
                        const details = document.createElement('div');
                        details.classList.add('product-details');
                        const customPrice = customPrices[`${country}-${index}`];
                        const priceDisplay = customPrice !== undefined && customPrice !== null && !isNaN(customPrice)
                            ? `${discountedPrice.toFixed(2)} GBP (Custom)`
                            : `${discountedPrice.toFixed(2)} GBP (Original: ${originalPrice.toFixed(2)} GBP)`;
                        details.innerHTML = `
                            <div class="product-code">Index: ${product['INDEKS']}</div>
                            <div class="product-name">${product['NAZWA']}</div>
                            <div class="pack-info">Pack: ${product['OPAKOWANIE']}</div>
                            <div class="price">${priceDisplay}</div>
                            <button onclick="showPriceDialog('${country}', ${index}, ${originalPrice})" style="margin-top: 5px; margin-right: 5px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Set Custom Price</button>
                            <button onclick="resetCustomPrice('${country}', ${index})" style="margin-top: 5px; padding: 5px 10px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Reset Custom Price</button>
                        `;
                        productElement.appendChild(details);
                        const controls = document.createElement('div');
                        controls.classList.add('quantity-controls');
                        controls.innerHTML = `
                            <button onclick="changeQuantity('${country}', ${index}, -1)">-</button>
                            <input type="number" id="quantity-${country}-${index}" value="${product.quantity || 0}" readonly>
                            <button onclick="changeQuantity('${country}', ${index}, 1)">+</button>
                            <span class="stock-info" style="margin-left: 10px; font-size: 12px; color: #666;">Stany magazynowe: ${product['Stany magazynowe'] || 'N/A'}</span>
                        `;
                        productElement.appendChild(controls);
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
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.alt = "Photo";
                        img.style.cssText = 'max-width: 100px; width: 100%; height: auto; position: relative;';
                        if (window.innerWidth <= 600) {
                            img.onclick = function() {
                                this.classList.toggle('enlarged');
                            };
                        } else {
                            productElement.style.minWidth = '350px';
                            productElement.style.padding = '10px';
                            const details = productElement.querySelector('.product-details');
                            if (details) {
                                details.style.fontSize = '14px';
                            }
                        }
                        productElement.appendChild(img);
                        const details = document.createElement('div');
                        details.classList.add('product-details');
                        const customPrice = customPrices[`${country}-${index}`];
                        const priceDisplay = customPrice !== undefined && customPrice !== null && !isNaN(customPrice)
                            ? `${discountedPrice.toFixed(2)} GBP (Custom)`
                            : `${discountedPrice.toFixed(2)} GBP (Original: ${originalPrice.toFixed(2)} GBP)`;
                        details.innerHTML = `
                            <div class="product-code">Index: ${product['INDEKS']}</div>
                            <div class="product-name">${product['NAZWA']}</div>
                            <div class="pack-info">Pack: ${product['OPAKOWANIE']}</div>
                            <div class="price">${priceDisplay}</div>
                            <button onclick="showPriceDialog('${country}', ${index}, ${originalPrice})" style="margin-top: 5px; margin-right: 5px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Set Custom Price</button>
                            <button onclick="resetCustomPrice('${country}', ${index})" style="margin-top: 5px; padding: 5px 10px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Reset Custom Price</button>
                        `;
                        productElement.appendChild(details);
                        const controls = document.createElement('div');
                        controls.classList.add('quantity-controls');
                        controls.innerHTML = `
                            <button onclick="changeQuantity('${country}', ${index}, -1)">-</button>
                            <input type="number" id="quantity-${country}-${index}" value="${product.quantity || 0}" readonly>
                            <button onclick="changeQuantity('${country}', ${index}, 1)">+</button>
                            <span class="stock-info" style="margin-left: 10px; font-size: 12px; color: #666;">Stany magazynowe: ${product['Stany magazynowe'] || 'N/A'}</span>
                        `;
                        productElement.appendChild(controls);
                        productList.appendChild(productElement);
                    };
                    imgTest.onerror = () => {
                        console.warn(`Skipped index ${product['INDEKS']} due to missing photo: ${imageUrl}`);
                    };
                }
            });
            calculateTotal();
            updateCartInfo();
            if (country === activeTab) {
                switchTab(activeTab);
            }
        })
        .catch(error => console.error(`Error loading data for ${country}:`, error));
}
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
        // Wywołanie applyFilters, aby upewnić się, że filtry są zresetowane
        const applyFilters = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const selectedCategory = categoryFilter.value;
            productLists.forEach(product => {
                const productName = product.querySelector('.product-name').textContent.toLowerCase();
                const productCode = product.querySelector('.product-code').textContent.toLowerCase();
                const productCategory = productsData[activeTab][product.dataset.index]?.Kategoria?.toLowerCase() || '';
                const nameWords = productName.split(/\s+/);
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
        applyFilters();
    }
    if (country === 'cart') {
        updateCart();
    } else if (productsData[country].length === 0) {
        loadProducts(country);
    } else {
        calculateTotal();
        updateCartInfo();
    }
    // Upewnienie się, że koszyk jest aktualizowany po przełączeniu
    if (document.getElementById('product-list-cart')) {
        updateCart();
    }
    updateCartInfo();
}
function changeQuantity(country, index, change) {
    const input = document.getElementById(`quantity-${country}-${index}`);
    let currentQuantity = parseInt(input.value) || 0;
    if (currentQuantity + change >= 0) {
        currentQuantity += change;
        input.value = currentQuantity;
        productsData[country][index].quantity = currentQuantity;
        // Aktualizacja koszyka za każdym razem, gdy zmienia się ilość
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
                        <span class="stock-info" style="margin-left: 10px; font-size: 12px; color: #666;">Stany magazynowe: ${product['Stany magazynowe'] || 'N/A'}</span>
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
    // Ładowanie danych dla Litwy jako pierwszej
    await loadProducts('lithuania');
    // Ładowanie pozostałych krajów w tle
    await Promise.all(['bulgaria', 'ukraine', 'romania'].map(country => loadProducts(country)));
    switchTab('lithuania'); // Wyraźnie przełącz na Litwę po załadowaniu
    loadCartState();
    updateBanner();
    updateCartInfo();
};
