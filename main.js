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
    cashBackLabel.style.cssText = `display: block; margin: 10px 0 5px; font-weight: normal;`;
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
    competitorPriceLabel.style.cssText = `display: block; margin: 5px 0 5px 2px; font-weight: normal;`; // Bliżej lewej krawędzi
    const competitorPriceCheckbox = document.createElement('input');
    competitorPriceCheckbox.type = 'checkbox';
    competitorPriceCheckbox.checked = showCompetitorPrice;
    competitorPriceCheckbox.style.cssText = `margin-left: 2px;`; // Bliżej lewej krawędzi
    competitorPriceCheckbox.onchange = () => {
        showCompetitorPrice = competitorPriceCheckbox.checked;
        updatePrices();
    };

    // Dodanie nowej opcji do wyświetlania stanów magazynowych
    const stockInfoLabel = document.createElement('label');
    stockInfoLabel.innerText = 'Show Stock Info:';
    stockInfoLabel.style.cssText = `display: block; margin: 5px 0 5px 2px; font-weight: normal;`; // Bliżej lewej krawędzi
    const stockInfoCheckbox = document.createElement('input');
    stockInfoCheckbox.type = 'checkbox';
    stockInfoCheckbox.checked = showStockInfo;
    stockInfoCheckbox.style.cssText = `margin-left: 2px;`; // Bliżej lewej krawędzi
    stockInfoCheckbox.onchange = () => {
        showStockInfo = stockInfoCheckbox.checked;
        updatePrices();
    };

    sidebar.appendChild(discountInfo);
    sidebar.appendChild(discountLabel);
    sidebar.appendChild(discountInput);
    sidebar.appendChild(cashBackLabel);
    sidebar.appendChild(cashBackInput);
    sidebar.appendChild(competitorPriceLabel);
    sidebar.appendChild(competitorPriceCheckbox);
    sidebar.appendChild(stockInfoLabel);
    sidebar.appendChild(stockInfoCheckbox);
    document.body.appendChild(sidebar);
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
                } else if (country === 'bulgaria' || country === 'romania') {
                    imageUrl = `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-bulgaria/${product['INDEKS']}.jpg`;
                } else if (country === 'ukraine') {
                    imageUrl = `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-ukraina/${product['INDEKS']}.jpg`;
                }
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
                    if (showStockInfo) {
                        detailsHTML += `<div class="stock-info-display" style="margin-top: 5px; font-size: 12px; color: #666;">Stock: ${product['Stany magazynowe'] || 'N/A'}</div>`;
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
            });
            if (country === activeTab) {
                switchTab(activeTab);
            }
        })
        .catch(error => console.error(`Error loading data for ${country}:`, error));
}

function applyFilters() {
    const searchBar = document.getElementById('search-bar');
    if (!searchBar) {
        console.error("Search bar not found!");
        return;
    }
    const searchInput = searchBar.querySelector('input');
    const categoryFilter = searchBar.querySelector('select');
    const rankingFilter = searchBar.querySelector('#ranking-filter');
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
