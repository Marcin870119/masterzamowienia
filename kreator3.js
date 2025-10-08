console.log('kreator3.js załadowany');

// Funkcja pomocnicza do zawijania tekstu
function wrapText(text, maxWidth, fontSize, fontFamily, canvas) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';
  const tempText = new fabric.Text('', { fontSize, fontFamily });
  canvas.add(tempText);

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    tempText.set({ text: testLine });
    const width = tempText.getScaledWidth();
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  canvas.remove(tempText);
  return lines.join('\n');
}

function showEditModal(productIndex) {
  try {
    console.log('showEditModal wywołany dla produktu:', productIndex);
    const product = window.products[productIndex];
    if (!product) {
      console.error('Produkt nie istnieje dla indeksu:', productIndex);
      document.getElementById('debug').innerText = "Błąd: Produkt nie istnieje";
      return;
    }
    const edit = window.productEdits[productIndex] || {
      nazwaFont: 'Arial',
      nazwaFontColor: '#000000',
      indeksFont: 'Arial',
      indeksFontColor: '#000000',
      rankingFont: 'Arial',
      rankingFontColor: '#000000',
      cenaFont: 'Arial',
      cenaFontColor: '#000000',
      priceCurrency: window.globalCurrency,
      priceFontSize: 'medium',
      logo: null,
      borderStyle: 'solid',
      borderColor: '#000000',
      backgroundTexture: null,
      backgroundOpacity: 1.0,
      pageBackgroundGradient: 'none',
      pageBackgroundOpacity: 1.0,
      layout: {
        image: { x: 0.0714, y: 0.0143, w: 0.8571, h: 0.4 },
        name: { x: 0.05, y: 0.5, w: 0.9, h: 0.1 },
        price: { x: 0.05, y: 0.65, w: 0.9, h: 0.1 },
        index: { x: 0.05, y: 0.75, w: 0.9, h: 0.1 },
        ranking: { x: 0.05, y: 0.85, w: 0.9, h: 0.1 },
        barcode: { x: 0.0714, y: 0.85, w: 0.8571, h: 0.1143 }
      }
    };
    const showRanking = document.getElementById('showRanking')?.checked || false;
    const showCena = document.getElementById('showCena')?.checked || false;
    const showLogo = document.getElementById('showLogo')?.checked || false;
    const priceLabel = window.globalLanguage === 'en' ? 'Price' : 'Cena';
    const editForm = document.getElementById('editForm');
    if (!editForm) {
      console.error('Nie znaleziono elementu editForm');
      document.getElementById('debug').innerText = "Błąd: Brak elementu formularza edycji";
      return;
    }
    editForm.innerHTML = `
      <div class="edit-field">
        <label>Zdjęcie:</label>
        <img src="${window.uploadedImages[product.indeks] || product.img || 'https://dummyimage.com/120x84/eee/000&text=brak'}" style="width:100px;height:100px;object-fit:contain;margin-bottom:10px;">
        <input type="file" id="editImage" accept="image/*">
      </div>
      <div class="edit-field">
        <label>Nazwa:</label>
        <input type="text" id="editNazwa" value="${product.nazwa || ''}">
        <select id="editNazwaFont">
          <option value="Arial" ${edit.nazwaFont === 'Arial' ? 'selected' : ''}>Arial</option>
          <option value="Helvetica" ${edit.nazwaFont === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
          <option value="Times" ${edit.nazwaFont === 'Times' ? 'selected' : ''}>Times New Roman</option>
        </select>
        <input type="color" id="editNazwaColor" value="${edit.nazwaFontColor}">
      </div>
      <div class="edit-field">
        <label>Indeks:</label>
        <input type="text" id="editIndeks" value="${product.indeks || ''}">
        <select id="editIndeksFont">
          <option value="Arial" ${edit.indeksFont === 'Arial' ? 'selected' : ''}>Arial</option>
          <option value="Helvetica" ${edit.indeksFont === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
          <option value="Times" ${edit.indeksFont === 'Times' ? 'selected' : ''}>Times New Roman</option>
        </select>
        <input type="color" id="editIndeksColor" value="${edit.indeksFontColor}">
      </div>
      ${showRanking ? `
        <div class="edit-field">
          <label>Ranking:</label>
          <input type="text" id="editRanking" value="${product.ranking || ''}">
          <select id="editRankingFont">
            <option value="Arial" ${edit.rankingFont === 'Arial' ? 'selected' : ''}>Arial</option>
            <option value="Helvetica" ${edit.rankingFont === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
            <option value="Times" ${edit.rankingFont === 'Times' ? 'selected' : ''}>Times New Roman</option>
          </select>
          <input type="color" id="editRankingColor" value="${edit.rankingFontColor}">
        </div>
      ` : ''}
      ${showCena ? `
        <div class="edit-field">
          <label>${priceLabel}:</label>
          <input type="text" id="editCena" value="${product.cena || ''}">
          <select id="editCenaFont">
            <option value="Arial" ${edit.cenaFont === 'Arial' ? 'selected' : ''}>Arial</option>
            <option value="Helvetica" ${edit.cenaFont === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
            <option value="Times" ${edit.cenaFont === 'Times' ? 'selected' : ''}>Times New Roman</option>
          </select>
          <input type="color" id="editCenaColor" value="${edit.cenaFontColor}">
          <select id="editCenaCurrency">
            <option value="EUR" ${edit.priceCurrency === 'EUR' ? 'selected' : ''}>€ (EUR)</option>
            <option value="GBP" ${edit.priceCurrency === 'GBP' ? 'selected' : ''}>£ (GBP)</option>
          </select>
          <select id="editCenaFontSize">
            <option value="small" ${edit.priceFontSize === 'small' ? 'selected' : ''}>Mały</option>
            <option value="medium" ${edit.priceFontSize === 'medium' ? 'selected' : ''}>Średni</option>
            <option value="large" ${edit.priceFontSize === 'large' ? 'selected' : ''}>Duży</option>
          </select>
        </div>
      ` : ''}
      ${showLogo ? `
        <div class="edit-field">
          <label>Logo:</label>
          <img src="${edit.logo || (product.producent && window.manufacturerLogos[product.producent]) || 'https://dummyimage.com/80x40/eee/000&text=brak'}" style="width:80px;height:40px;object-fit:contain;margin-bottom:10px;">
          <select id="editLogoSelect">
            <option value="">Brak logo</option>
            ${Object.keys(window.manufacturerLogos).map(name => `<option value="${name}" ${product.producent === name ? 'selected' : ''}>${name}</option>`).join('')}
          </select>
          <input type="file" id="editLogo" accept="image/*">
        </div>
      ` : ''}
      <div class="edit-field">
        <label>Styl obramowania:</label>
        <select id="editBorderStyle">
          <option value="solid" ${edit.borderStyle === 'solid' ? 'selected' : ''}>Pełna linia</option>
          <option value="dashed" ${edit.borderStyle === 'dashed' ? 'selected' : ''}>Kreskowana</option>
          <option value="dotted" ${edit.borderStyle === 'dotted' ? 'selected' : ''}>Kropkowana</option>
        </select>
      </div>
      <div class="edit-field">
        <label>Kolor obramowania:</label>
        <input type="color" id="editBorderColor" value="${edit.borderColor || '#000000'}">
      </div>
      <div class="edit-field">
        <label>Tekstura tła:</label>
        <input type="file" id="editBackgroundTexture" accept="image/*">
        <label>Przezroczystość:</label>
        <input type="range" id="editBackgroundOpacity" min="0.1" max="1.0" step="0.1" value="${edit.backgroundOpacity || 1.0}">
      </div>
      <div class="edit-field">
        <label>Gradient tła strony:</label>
        <select id="editPageBackgroundGradient">
          <option value="none" ${edit.pageBackgroundGradient === 'none' ? 'selected' : ''}>Brak</option>
          <option value="blue" ${edit.pageBackgroundGradient === 'blue' ? 'selected' : ''}>Niebieski</option>
          <option value="green" ${edit.pageBackgroundGradient === 'green' ? 'selected' : ''}>Zielony</option>
          <option value="gray" ${edit.pageBackgroundGradient === 'gray' ? 'selected' : ''}>Szary</option>
          <option value="red" ${edit.pageBackgroundGradient === 'red' ? 'selected' : ''}>Czerwony</option>
          <option value="purple" ${edit.pageBackgroundGradient === 'purple' ? 'selected' : ''}>Fioletowy</option>
          <option value="orange" ${edit.pageBackgroundGradient === 'orange' ? 'selected' : ''}>Pomarańczowy</option>
        </select>
        <label>Przezroczystość tła:</label>
        <input type="range" id="editPageBackgroundOpacity" min="0.1" max="1.0" step="0.1" value="${edit.pageBackgroundOpacity || 1.0}">
      </div>
      <button onclick="window.saveEdit(${productIndex})" class="btn-primary">Zapisz</button>
    `;
    const editModal = document.getElementById('editModal');
    if (!editModal) {
      console.error('Nie znaleziono elementu editModal');
      document.getElementById('debug').innerText = "Błąd: Brak modalu edycji";
      return;
    }
    editModal.style.display = 'block';
    console.log('editModal wyświetlony dla produktu:', productIndex);
  } catch (e) {
    console.error('Błąd pokazywania modalu edycji:', e);
    document.getElementById('debug').innerText = "Błąd pokazywania modalu edycji: " + e.message;
  }
}

function saveEdit(productIndex) {
  try {
    console.log('saveEdit wywołany dla produktu:', productIndex);
    const product = window.products[productIndex];
    if (!product) {
      console.error('Produkt nie istnieje dla indeksu:', productIndex);
      document.getElementById('debug').innerText = "Błąd: Produkt nie istnieje";
      return;
    }
    const editImage = document.getElementById('editImage').files[0];
    if (editImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        window.uploadedImages[product.indeks] = e.target.result;
        console.log('Załadowano nowe zdjęcie dla produktu:', product.indeks);
        window.renderCatalog();
      };
      reader.readAsDataURL(editImage);
    }
    const editLogo = document.getElementById('editLogo')?.files[0];
    if (editLogo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        window.productEdits[productIndex] = window.productEdits[productIndex] || {};
        window.productEdits[productIndex].logo = e.target.result;
        console.log('Załadowano nowe logo dla produktu:', productIndex);
        window.renderCatalog();
      };
      reader.readAsDataURL(editLogo);
    } else if (document.getElementById('editLogoSelect')) {
      const selectedLogo = document.getElementById('editLogoSelect').value;
      window.productEdits[productIndex] = window.productEdits[productIndex] || {};
      window.productEdits[productIndex].logo = selectedLogo ? window.manufacturerLogos[selectedLogo] : null;
      product.producent = selectedLogo || product.producent;
      console.log('Wybrano logo z listy dla produktu:', productIndex, selectedLogo);
    }
    const editBackgroundTexture = document.getElementById('editBackgroundTexture').files[0];
    if (editBackgroundTexture) {
      const reader = new FileReader();
      reader.onload = (e) => {
        window.productEdits[productIndex] = window.productEdits[productIndex] || {};
        window.productEdits[productIndex].backgroundTexture = e.target.result;
        console.log('Załadowano nową teksturę tła dla produktu:', productIndex);
        window.renderCatalog();
      };
      reader.readAsDataURL(editBackgroundTexture);
    } else {
      window.productEdits[productIndex] = window.productEdits[productIndex] || {};
      window.productEdits[productIndex].backgroundTexture = null;
    }
    product.nazwa = document.getElementById('editNazwa').value;
    product.indeks = document.getElementById('editIndeks').value;
    if (document.getElementById('showRanking')?.checked) {
      product.ranking = document.getElementById('editRanking')?.value || '';
    }
    if (document.getElementById('showCena')?.checked) {
      product.cena = document.getElementById('editCena')?.value || '';
    }
    window.productEdits[productIndex] = {
      nazwaFont: document.getElementById('editNazwaFont').value || 'Arial',
      nazwaFontColor: document.getElementById('editNazwaColor').value || '#000000',
      indeksFont: document.getElementById('editIndeksFont').value || 'Arial',
      indeksFontColor: document.getElementById('editIndeksColor').value || '#000000',
      rankingFont: document.getElementById('editRankingFont')?.value || 'Arial',
      rankingFontColor: document.getElementById('editRankingColor')?.value || '#000000',
      cenaFont: document.getElementById('editCenaFont')?.value || 'Arial',
      cenaFontColor: document.getElementById('editCenaColor')?.value || '#000000',
      priceCurrency: document.getElementById('editCenaCurrency')?.value || window.globalCurrency,
      priceFontSize: document.getElementById('editCenaFontSize')?.value || 'medium',
      logo: window.productEdits[productIndex]?.logo || null,
      borderStyle: document.getElementById('editBorderStyle').value || 'solid',
      borderColor: document.getElementById('editBorderColor').value || '#000000',
      backgroundTexture: window.productEdits[productIndex]?.backgroundTexture || null,
      backgroundOpacity: parseFloat(document.getElementById('editBackgroundOpacity').value) || 1.0,
      pageBackgroundGradient: document.getElementById('editPageBackgroundGradient').value || 'none',
      pageBackgroundOpacity: parseFloat(document.getElementById('editPageBackgroundOpacity').value) || 1.0,
      layout: window.productEdits[productIndex]?.layout || {
        image: { x: 0.0714, y: 0.0143, w: 0.8571, h: 0.4 },
        name: { x: 0.05, y: 0.5, w: 0.9, h: 0.1 },
        price: { x: 0.05, y: 0.65, w: 0.9, h: 0.1 },
        index: { x: 0.05, y: 0.75, w: 0.9, h: 0.1 },
        ranking: { x: 0.05, y: 0.85, w: 0.9, h: 0.1 },
        barcode: { x: 0.0714, y: 0.85, w: 0.8571, h: 0.1143 }
      }
    };
    console.log('Saved Edit for Product Index:', productIndex, window.productEdits[productIndex]);
    window.renderCatalog();
    window.hideEditModal();
  } catch (e) {
    console.error('Błąd zapisywania edycji produktu:', e);
    document.getElementById('debug').innerText = "Błąd zapisywania edycji produktu: " + e.message;
  }
}

function showPageEditModal(pageIndex) {
  try {
    console.log('showPageEditModal wywołany dla strony:', pageIndex);
    const edit = window.pageEdits[pageIndex] || {
      nazwaFont: 'Arial',
      nazwaFontColor: '#000000',
      indeksFont: 'Arial',
      indeksFontColor: '#000000',
      rankingFont: 'Arial',
      rankingFontColor: '#000000',
      cenaFont: 'Arial',
      cenaFontColor: '#000000',
      priceCurrency: window.globalCurrency,
      showPriceLabel: true,
      pageBackgroundGradient: 'none',
      pageBackgroundOpacity: 1.0
    };
    const editForm = document.getElementById('editForm');
    if (!editForm) {
      console.error('Nie znaleziono elementu editForm');
      document.getElementById('debug').innerText = "Błąd: Brak elementu formularza edycji";
      return;
    }
    const layout = document.getElementById('layoutSelect').value || "16";
    let itemsPerPage;
    if (layout === "1") itemsPerPage = 1;
    else if (layout === "2") itemsPerPage = 2;
    else if (layout === "4") itemsPerPage = 4;
    else if (layout === "8") itemsPerPage = 8;
    else if (layout === "16") itemsPerPage = 16;
    else if (layout === "4-2-4") itemsPerPage = 10;
    const totalPages = Math.ceil(window.products.length / itemsPerPage) || 1;
    editForm.innerHTML = `
      <div class="edit-field">
        <label>Wybierz stronę:</label>
        <select id="editPageSelect">
          ${Array.from({ length: totalPages }, (_, i) => `<option value="${i}" ${i === pageIndex ? 'selected' : ''}>Strona ${i + 1}</option>`)}
        </select>
      </div>
      <div class="edit-field">
        <label>Czcionka nazwy:</label>
        <select id="editNazwaFont">
          <option value="Arial" ${edit.nazwaFont === 'Arial' ? 'selected' : ''}>Arial</option>
          <option value="Helvetica" ${edit.nazwaFont === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
          <option value="Times" ${edit.nazwaFont === 'Times' ? 'selected' : ''}>Times New Roman</option>
        </select>
        <input type="color" id="editNazwaColor" value="${edit.nazwaFontColor}">
      </div>
      <div class="edit-field">
        <label>Czcionka indeksu:</label>
        <select id="editIndeksFont">
          <option value="Arial" ${edit.indeksFont === 'Arial' ? 'selected' : ''}>Arial</option>
          <option value="Helvetica" ${edit.indeksFont === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
          <option value="Times" ${edit.indeksFont === 'Times' ? 'selected' : ''}>Times New Roman</option>
        </select>
        <input type="color" id="editIndeksColor" value="${edit.indeksFontColor}">
      </div>
      <div class="edit-field">
        <label>Czcionka rankingu:</label>
        <select id="editRankingFont">
          <option value="Arial" ${edit.rankingFont === 'Arial' ? 'selected' : ''}>Arial</option>
          <option value="Helvetica" ${edit.rankingFont === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
          <option value="Times" ${edit.rankingFont === 'Times' ? 'selected' : ''}>Times New Roman</option>
        </select>
        <input type="color" id="editRankingColor" value="${edit.rankingFontColor}">
      </div>
      <div class="edit-field">
        <label>Czcionka ceny:</label>
        <select id="editCenaFont">
          <option value="Arial" ${edit.cenaFont === 'Arial' ? 'selected' : ''}>Arial</option>
          <option value="Helvetica" ${edit.cenaFont === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
          <option value="Times" ${edit.cenaFont === 'Times' ? 'selected' : ''}>Times New Roman</option>
        </select>
        <input type="color" id="editCenaColor" value="${edit.cenaFontColor}">
      </div>
      <div class="edit-field">
        <label>Waluta:</label>
        <select id="editCenaCurrency">
          <option value="EUR" ${edit.priceCurrency === 'EUR' ? 'selected' : ''}>€ (EUR)</option>
          <option value="GBP" ${edit.priceCurrency === 'GBP' ? 'selected' : ''}>£ (GBP)</option>
        </select>
      </div>
      <div class="edit-field">
        <label>Format ceny:</label>
        <label><input type="radio" name="priceFormat" value="true" ${edit.showPriceLabel ? 'checked' : ''}> Price: 1.45</label>
        <label><input type="radio" name="priceFormat" value="false" ${!edit.showPriceLabel ? 'checked' : ''}> 1.45</label>
      </div>
      <div class="edit-field">
        <label>Gradient tła strony:</label>
        <select id="editPageBackgroundGradient">
          <option value="none" ${edit.pageBackgroundGradient === 'none' ? 'selected' : ''}>Brak</option>
          <option value="blue" ${edit.pageBackgroundGradient === 'blue' ? 'selected' : ''}>Niebieski</option>
          <option value="green" ${edit.pageBackgroundGradient === 'green' ? 'selected' : ''}>Zielony</option>
          <option value="gray" ${edit.pageBackgroundGradient === 'gray' ? 'selected' : ''}>Szary</option>
          <option value="red" ${edit.pageBackgroundGradient === 'red' ? 'selected' : ''}>Czerwony</option>
          <option value="purple" ${edit.pageBackgroundGradient === 'purple' ? 'selected' : ''}>Fioletowy</option>
          <option value="orange" ${edit.pageBackgroundGradient === 'orange' ? 'selected' : ''}>Pomarańczowy</option>
        </select>
        <label>Przezroczystość tła:</label>
        <input type="range" id="editPageBackgroundOpacity" min="0.1" max="1.0" step="0.1" value="${edit.pageBackgroundOpacity || 1.0}">
      </div>
      <button onclick="window.savePageEdit(${pageIndex})" class="btn-primary">Zapisz</button>
    `;
    const editModal = document.getElementById('editModal');
    if (!editModal) {
      console.error('Nie znaleziono elementu editModal');
      document.getElementById('debug').innerText = "Błąd: Brak modalu edycji";
      return;
    }
    editModal.style.display = 'block';
    console.log('editModal wyświetlony dla strony:', pageIndex);
  } catch (e) {
    console.error('Błąd pokazywania modalu edycji strony:', e);
    document.getElementById('debug').innerText = "Błąd pokazywania modalu edycji strony: " + e.message;
  }
}

function savePageEdit(pageIndex) {
  try {
    console.log('savePageEdit wywołany dla strony:', pageIndex);
    const newPageIndex = parseInt(document.getElementById('editPageSelect').value);
    window.pageEdits[newPageIndex] = {
      nazwaFont: document.getElementById('editNazwaFont').value,
      nazwaFontColor: document.getElementById('editNazwaColor').value,
      indeksFont: document.getElement
