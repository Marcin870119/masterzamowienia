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
            console.log("Fetch response for", country, ":", response.status, "URL:", url);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${url}`);
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
            if (!productList) {
                console.error(`Product list not found for ${country}`);
                return;
            }
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
                    `;
                    productElement.appendChild(controls);
                    productList.appendChild(productElement);
                };
                imgTest.onerror = () => {
                    console.warn(`Skipped index ${product['INDEKS']} due to missing photo: ${imageUrl}`);
                };
            });
            if (country === activeTab) {
                setTimeout(() => {
                    if (typeof applyFilters === 'function') {
                        applyFilters();
                    }
                }, 100); // Opóźnienie dla synchronizacji z DOM
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
    const productList = document.getElementById(`product-list-${activeTab}`);
    if (!productList) {
        console.error("Active product list not found!");
        return;
    }
    let products = Array.from(productList.querySelectorAll('.product'));

    // Debugowanie danych
    console.log("Applying filters for", activeTab, "Products length:", products.length, "Data length:", productsData[activeTab].length);

    // Sortowanie według rankingu
    if (sortOrder && productsData[activeTab].length > 0) {
        products.sort((a, b) => {
            const rankA = parseInt(productsData[activeTab][a.dataset.index]?.Ranking) || 0;
            const rankB = parseInt(productsData[activeTab][b.dataset.index]?.Ranking) || 0;
            console.log("Sorting:", a.dataset.index, rankA, b.dataset.index, rankB); // Debug
            return sortOrder === 'desc' ? rankB - rankA : rankA - rankB;
        });
        products.forEach(product => productList.appendChild(product)); // Ponowne renderowanie po sortowaniu
    }

    // Filtrowanie
    products.forEach(product => {
        const productName = product.querySelector('.product-name')?.textContent.toLowerCase() || '';
        const productCode = product.querySelector('.product-code')?.textContent.toLowerCase() || '';
        const productIndex = product.dataset.index;
        const productCategory = productsData[activeTab][productIndex]?.Kategoria?.toLowerCase() || '';
        const nameWords = productName.split(/\s+/);
        const normalizedSelectedCategory = selectedCategory.toLowerCase().replace(/-/g, ' ');
        const normalizedProductCategory = productCategory.replace(/-/g, ' ');

        console.log("Filter Debug - Index:", productIndex, "Category:", productCategory, "Selected:", selectedCategory); // Debug

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
    });
}
