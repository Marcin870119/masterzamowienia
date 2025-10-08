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
        name: { x: 0.0714, y: 0.4714, w: 0.8571, h: 0.0514 },
        price: { x: 0.0714, y: 0.6571, w: 0.8571, h: 0.0514 },
        index: { x: 0.0714, y: 0.7429, w: 0.8571, h: 0.0514 },
        ranking: { x: 0.0714, y: 0.8286, w: 0.8571, h: 0.0514 },
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
        name: { x: 0.0714, y: 0.4714, w: 0.8571, h: 0.0514 },
        price: { x: 0.0714, y: 0.6571, w: 0.8571, h: 0.0514 },
        index: { x: 0.0714, y: 0.7429, w: 0.8571, h: 0.0514 },
        ranking: { x: 0.0714, y: 0.8286, w: 0.8571, h: 0.0514 },
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
      indeksFont: document.getElementById('editIndeksFont').value,
      indeksFontColor: document.getElementById('editIndeksColor').value,
      rankingFont: document.getElementById('editRankingFont').value,
      rankingFontColor: document.getElementById('editRankingColor').value,
      cenaFont: document.getElementById('editCenaFont').value,
      cenaFontColor: document.getElementById('editCenaColor').value,
      priceCurrency: document.getElementById('editCenaCurrency').value,
      showPriceLabel: document.querySelector('input[name="priceFormat"]:checked').value === 'true',
      pageBackgroundGradient: document.getElementById('editPageBackgroundGradient').value || 'none',
      pageBackgroundOpacity: parseFloat(document.getElementById('editPageBackgroundOpacity').value) || 1.0
    };
    console.log('Saved Page Edit for Page Index:', newPageIndex, window.pageEdits[newPageIndex]);
    window.renderCatalog();
    window.hideEditModal();
  } catch (e) {
    console.error('Błąd zapisywania edycji strony:', e);
    document.getElementById('debug').innerText = "Błąd zapisywania edycji strony: " + e.message;
  }
}

function showVirtualEditModal(productIndex) {
  try {
    console.log('showVirtualEditModal wywołany dla produktu:', productIndex);
    const modal = document.getElementById('virtualEditModal');
    if (!modal) {
      console.error('Nie znaleziono elementu virtualEditModal');
      document.getElementById('debug').innerText = "Błąd: Brak modalu edycji wirtualnej";
      return;
    }
    console.log('virtualEditModal znaleziony:', modal);
    const product = window.products[productIndex];
    if (!product) {
      console.error('Produkt nie istnieje dla indeksu:', productIndex);
      document.getElementById('debug').innerText = "Błąd: Produkt nie istnieje";
      return;
    }
    console.log('Produkt:', product);
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
      borderStyle: 'solid',
      borderColor: '#000000',
      backgroundTexture: null,
      backgroundOpacity: 1.0,
      layout: {
        image: { x: 0.0714, y: 0.0143, w: 0.8571, h: 0.4 },
        name: { x: 0.0714, y: 0.4714, w: 0.8571, h: 0.0514 },
        price: { x: 0.0714, y: 0.6571, w: 0.8571, h: 0.0514 },
        index: { x: 0.0714, y: 0.7429, w: 0.8571, h: 0.0514 },
        ranking: { x: 0.0714, y: 0.8286, w: 0.8571, h: 0.0514 },
        barcode: { x: 0.0714, y: 0.85, w: 0.8571, h: 0.1143 }
      }
    };
    console.log('Tworzenie zawartości modalu dla produktu:', productIndex);
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="window.hideEditModal()">&times;</span>
        <h3>Edytuj produkt wizualnie</h3>
        <div class="canvas-container">
          <canvas id="virtualEditCanvas" width="280" height="350"></canvas>
          <div id="editPanel" style="position: absolute; top: 10px; right: -200px; background: white; padding: 10px; border: 1px solid #ccc; display: none;">
            <select id="fontSelect">
              <option value="Arial" ${edit.nazwaFont === 'Arial' ? 'selected' : ''}>Arial</option>
              <option value="Helvetica" ${edit.nazwaFont === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
              <option value="Times" ${edit.nazwaFont === 'Times' ? 'selected' : ''}>Times New Roman</option>
            </select>
            <input type="color" id="colorSelect" value="${edit.nazwaFontColor}">
            <select id="sizeSelect">
              <option value="small" ${edit.priceFontSize === 'small' ? 'selected' : ''}>Mały</option>
              <option value="medium" ${edit.priceFontSize === 'medium' ? 'selected' : ''}>Średni</option>
              <option value="large" ${edit.priceFontSize === 'large' ? 'selected' : ''}>Duży</option>
            </select>
            <select id="borderStyleSelect">
              <option value="solid" ${edit.borderStyle === 'solid' ? 'selected' : ''}>Pełna linia</option>
              <option value="dashed" ${edit.borderStyle === 'dashed' ? 'selected' : ''}>Kreskowana</option>
              <option value="dotted" ${edit.borderStyle === 'dotted' ? 'selected' : ''}>Kropkowana</option>
            </select>
            <input type="color" id="borderColorSelect" value="${edit.borderColor || '#000000'}">
            <input type="file" id="backgroundTextureSelect" accept="image/*">
            <label>Przezroczystość tła:</label>
            <input type="range" id="backgroundOpacitySelect" min="0.1" max="1.0" step="0.1" value="${edit.backgroundOpacity || 1.0}">
            <button onclick="window.applyTextEdit()">Zastosuj</button>
          </div>
          <button id="saveVirtualEdit" style="position: absolute; bottom: -40px; right: 0;">Zapisz</button>
        </div>
      </div>
    `;
    console.log('Modal HTML ustawiony');
    modal.style.display = 'block';
    console.log('Modal ustawiony na display: block');
    const canvasElement = document.getElementById('virtualEditCanvas');
    if (!canvasElement) {
      console.error('Nie znaleziono elementu virtualEditCanvas');
      document.getElementById('debug').innerText = "Błąd: Brak elementu canvas";
      return;
    }
    console.log('virtualEditCanvas znaleziony:', canvasElement);
    if (!window.fabric) {
      console.error('Biblioteka Fabric.js nie jest załadowana');
      document.getElementById('debug').innerText = "Błąd: Biblioteka Fabric.js nie jest załadowana";
      return;
    }
    console.log('Inicjalizacja kanwy Fabric.js');
    const canvas = new fabric.Canvas('virtualEditCanvas', {
      width: 280,
      height: 350
    });
    console.log('Kanwa Fabric.js zainicjalizowana');
    const canvasWidth = 280;
    const canvasHeight = 350;
    const borderMargin = 20; // Margines ramki (1x 20 pt w PDF)

    console.log('Ładowanie tekstury tła');
    if (edit.backgroundTexture) {
      try {
        fabric.Image.fromURL(edit.backgroundTexture, (bgImg) => {
          if (!bgImg) {
            console.error('Nie udało się załadować tekstury tła:', edit.backgroundTexture);
            document.getElementById('debug').innerText = "Błąd: Nie udało się załadować tekstury tła";
            return;
          }
          bgImg.scaleToWidth(canvasWidth - borderMargin * 2);
          bgImg.set({
            left: borderMargin,
            top: borderMargin,
            opacity: edit.backgroundOpacity || 1.0
          });
          canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas));
          console.log('Tekstura tła załadowana');
        }, { crossOrigin: 'anonymous' });
      } catch (e) {
        console.error('Błąd ładowania tekstury tła w podglądzie:', e);
        document.getElementById('debug').innerText = "Błąd ładowania tekstury tła w podglądzie: " + e.message;
      }
    }

    const layout = edit.layout || {};
    const showRanking = document.getElementById('showRanking')?.checked || false;
    const showCena = document.getElementById('showCena')?.checked || false;
    const showEan = document.getElementById('showEan')?.checked || false;
    const priceLabel = window.globalLanguage === 'en' ? 'PRICE' : 'CENA';

    console.log('Ładowanie obrazu produktu');
    const imageUrl = window.uploadedImages[product.indeks] || product.img || 'https://dummyimage.com/120x84/eee/000&text=brak';
    try {
      fabric.Image.fromURL(imageUrl, (img) => {
        if (!img) {
          console.error('Nie udało się załadować obrazu produktu:', imageUrl);
          document.getElementById('debug').innerText = "Błąd: Nie udało się załadować obrazu produktu";
          return;
        }
        const layoutImg = layout.image || { x: 0.0714, y: 0.0143, w: 0.8571, h: 0.4 };
        const maxW = (canvasWidth - borderMargin * 2) * layoutImg.w;
        const maxH = (canvasHeight - borderMargin * 2) * layoutImg.h;
        let scale = Math.min(maxW / img.width, maxH / img.height);
        img.set({
          left: borderMargin + layoutImg.x * (canvasWidth - borderMargin * 2),
          top: borderMargin + layoutImg.y * (canvasHeight - borderMargin * 2),
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          id: 'image',
          hasBorders: true,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: true
        });
        canvas.add(img);
        console.log('Obraz produktu załadowany:', imageUrl);
      }, { crossOrigin: 'anonymous' });
    } catch (e) {
      console.error('Błąd ładowania obrazu produktu w podglądzie:', e);
      document.getElementById('debug').innerText = "Błąd ładowania obrazu produktu w podglądzie: " + e.message;
    }

    console.log('Tworzenie ramki');
    const borderRect = new fabric.Rect({
      left: borderMargin,
      top: borderMargin,
      width: canvasWidth - borderMargin * 2,
      height: canvasHeight - borderMargin * 2,
      fill: 'transparent',
      stroke: edit.borderColor || '#000000',
      strokeWidth: 2,
      strokeDashArray: edit.borderStyle === 'dashed' ? [5, 5] : edit.borderStyle === 'dotted' ? [2, 2] : null,
      rx: 5,
      ry: 5,
      selectable: false
    });
    canvas.add(borderRect);
    console.log('Ramka dodana');

    console.log('Tworzenie tekstu nazwy');
    const layoutName = layout.name || { x: 0.0714, y: 0.4714, w: 0.8571, h: 0.0514 };
    const maxNameWidth = (canvasWidth - borderMargin * 2) * layoutName.w; // 206 pikseli
    const wrappedName = wrapText(product.nazwa || 'Brak nazwy', maxNameWidth, 11, edit.nazwaFont, canvas);
    const nazwaText = new fabric.Text(wrappedName, {
      left: borderMargin + layoutName.x * (canvasWidth - borderMargin * 2),
      top: borderMargin + layoutName.y * (canvasHeight - borderMargin * 2),
      fontSize: 11,
      fill: edit.nazwaFontColor,
      fontFamily: edit.nazwaFont,
      width: maxNameWidth,
      textAlign: 'center', // Centrowanie tekstu
      selectable: true,
      id: 'name',
      hasBorders: true
    });
    canvas.add(nazwaText);
    console.log('Tekst nazwy dodany:', wrappedName);

    console.log('Tworzenie tekstu indeksu');
    const layoutIndex = layout.index || { x: 0.0714, y: 0.7429, w: 0.8571, h: 0.0514 };
    const maxIndexWidth = (canvasWidth - borderMargin * 2) * layoutIndex.w; // 206 pikseli
    const wrappedIndex = wrapText(`Indeks: ${product.indeks || '-'}`, maxIndexWidth, 9, edit.indeksFont, canvas);
    const indeksText = new fabric.Text(wrappedIndex, {
      left: borderMargin + layoutIndex.x * (canvasWidth - borderMargin * 2),
      top: borderMargin + layoutIndex.y * (canvasHeight - borderMargin * 2),
      fontSize: 9,
      fill: edit.indeksFontColor,
      fontFamily: edit.indeksFont,
      width: maxIndexWidth,
      textAlign: 'center', // Centrowanie tekstu
      selectable: true,
      id: 'index',
      hasBorders: true
    });
    canvas.add(indeksText);
    console.log('Tekst indeksu dodany:', wrappedIndex);

    let rankingText;
    if (showRanking && product.ranking) {
      console.log('Tworzenie tekstu rankingu');
      const layoutRanking = layout.ranking || { x: 0.0714, y: 0.8286, w: 0.8571, h: 0.0514 };
      const maxRankingWidth = (canvasWidth - borderMargin * 2) * layoutRanking.w; // 206 pikseli
      const wrappedRanking = wrapText(`RANKING: ${product.ranking}`, maxRankingWidth, 9, edit.rankingFont, canvas);
      rankingText = new fabric.Text(wrappedRanking, {
        left: borderMargin + layoutRanking.x * (canvasWidth - borderMargin * 2),
        top: borderMargin + layoutRanking.y * (canvasHeight - borderMargin * 2),
        fontSize: 9,
        fill: edit.rankingFontColor,
        fontFamily: edit.rankingFont,
        width: maxRankingWidth,
        textAlign: 'center', // Centrowanie tekstu
        selectable: true,
        id: 'ranking',
        hasBorders: true
      });
      canvas.add(rankingText);
      console.log('Tekst rankingu dodany:', wrappedRanking);
    }

    let cenaText;
    if (showCena && product.cena) {
      console.log('Tworzenie tekstu ceny');
      const layoutPrice = layout.price || { x: 0.0714, y: 0.6571, w: 0.8571, h: 0.0514 };
      const maxPriceWidth = (canvasWidth - borderMargin * 2) * layoutPrice.w; // 206 pikseli
      const wrappedPrice = wrapText(`${priceLabel}: ${product.cena} ${(edit.priceCurrency || window.globalCurrency) === 'EUR' ? '€' : '£'}`, maxPriceWidth, edit.priceFontSize === 'small' ? 12 : edit.priceFontSize === 'medium' ? 14 : 16, edit.cenaFont, canvas);
      cenaText = new fabric.Text(wrappedPrice, {
        left: borderMargin + layoutPrice.x * (canvasWidth - borderMargin * 2),
        top: borderMargin + layoutPrice.y * (canvasHeight - borderMargin * 2),
        fontSize: edit.priceFontSize === 'small' ? 12 : edit.priceFontSize === 'medium' ? 14 : 16,
        fill: edit.cenaFontColor,
        fontFamily: edit.cenaFont,
        width: maxPriceWidth,
        textAlign: 'center', // Centrowanie tekstu
        selectable: true,
        id: 'price',
        hasBorders: true
      });
      canvas.add(cenaText);
      console.log('Tekst ceny dodany:', wrappedPrice);
    }

    if (showEan && product.ean && product.barcode) {
      console.log('Ładowanie kodu kreskowego');
      try {
        fabric.Image.fromURL(product.barcode, (barcodeImg) => {
          if (!barcodeImg) {
            console.error('Nie udało się załadować kodu kreskowego:', product.barcode);
            document.getElementById('debug').innerText = "Błąd: Nie udało się załadować kodu kreskowego";
            return;
          }
          const layoutBarcode = layout.barcode || { x: 0.0714, y: 0.85, w: 0.8571, h: 0.1143 };
          const maxBarcodeWidth = (canvasWidth - borderMargin * 2) * layoutBarcode.w;
          const maxBarcodeHeight = (canvasHeight - borderMargin * 2) * layoutBarcode.h;
          let scale = Math.min(maxBarcodeWidth / barcodeImg.width, maxBarcodeHeight / barcodeImg.height);
          barcodeImg.set({
            left: borderMargin + layoutBarcode.x * (canvasWidth - borderMargin * 2),
            top: borderMargin + layoutBarcode.y * (canvasHeight - borderMargin * 2),
            scaleX: scale,
            scaleY: scale,
            selectable: true,
            id: 'barcode',
            hasBorders: true,
            lockScalingX: false,
            lockScalingY: false,
            lockRotation: true
          });
          canvas.add(barcodeImg);
          console.log('Kod kreskowy dodany, pozycja:', { left: barcodeImg.left, top: barcodeImg.top, width: barcodeImg.width * scale, height: barcodeImg.height * scale });
        }, { crossOrigin: 'anonymous' });
      } catch (e) {
        console.error('Błąd ładowania kodu kreskowego w podglądzie:', e);
        document.getElementById('debug').innerText = "Błąd ładowania kodu kreskowego w podglądzie: " + e.message;
      }
    }

    console.log('Dodawanie zdarzenia object:moving');
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      const objWidth = obj.width * obj.scaleX;
      const objHeight = obj.height * obj.scaleY;
      const maxLeft = canvasWidth - borderMargin - objWidth;
      const maxTop = canvasHeight - borderMargin - objHeight;
      obj.set({
        left: Math.max(borderMargin, Math.min(obj.left, maxLeft)),
        top: Math.max(borderMargin, Math.min(obj.top, maxTop))
      });
      console.log('Przesunięto:', obj.id, 'x:', (obj.left - borderMargin) / (canvasWidth - borderMargin * 2), 'y:', (obj.top - borderMargin) / (canvasHeight - borderMargin * 2), 'width:', objWidth, 'height:', objHeight);
    });

    console.log('Dodawanie zdarzenia object:selected');
    canvas.on('object:selected', (e) => {
      const obj = e.target;
      const editPanel = document.getElementById('editPanel');
      if (!editPanel) {
        console.error('Nie znaleziono elementu editPanel');
        document.getElementById('debug').innerText = "Błąd: Brak panelu edycji";
        return;
      }
      editPanel.style.display = 'block';
      console.log('editPanel wyświetlony:', editPanel);
      document.getElementById('fontSelect').value = obj.fontFamily || 'Arial';
      document.getElementById('colorSelect').value = obj.fill || '#000000';
      document.getElementById('sizeSelect').value = obj.fontSize === 12 ? 'small' : obj.fontSize === 14 ? 'medium' : 'large';
      document.getElementById('borderStyleSelect').value = edit.borderStyle || 'solid';
      document.getElementById('borderColorSelect').value = edit.borderColor || '#000000';
      document.getElementById('backgroundOpacitySelect').value = edit.backgroundOpacity || 1.0;
      console.log('Panel edycji wyświetlony dla obiektu:', obj.id);
      window.applyTextEdit = function() {
        try {
          console.log('applyTextEdit wywołany');
          if (obj.type === 'text') {
            const maxWidth = (canvasWidth - borderMargin * 2) * (layout[obj.id]?.w || 0.8571);
            const wrappedText = wrapText(obj.text, maxWidth, document.getElementById('sizeSelect').value === 'small' ? 12 : document.getElementById('sizeSelect').value === 'medium' ? 14 : 16, document.getElementById('fontSelect').value, canvas);
            obj.set({
              fontFamily: document.getElementById('fontSelect').value,
              fill: document.getElementById('colorSelect').value,
              fontSize: document.getElementById('sizeSelect').value === 'small' ? 12 : document.getElementById('sizeSelect').value === 'medium' ? 14 : 16,
              text: wrappedText,
              width: maxWidth,
              textAlign: 'center' // Centrowanie tekstu
            });
          }
          const borderStyle = document.getElementById('borderStyleSelect').value;
          const borderColor = document.getElementById('borderColorSelect').value;
          const backgroundOpacity = parseFloat(document.getElementById('backgroundOpacitySelect').value);
          const backgroundTextureInput = document.getElementById('backgroundTextureSelect').files[0];
          if (backgroundTextureInput) {
            const reader = new FileReader();
            reader.onload = (e) => {
              fabric.Image.fromURL(e.target.result, (bgImg) => {
                if (!bgImg) {
                  console.error('Nie udało się załadować nowej tekstury tła');
                  document.getElementById('debug').innerText = "Błąd: Nie udało się załadować nowej tekstury tła";
                  return;
                }
                bgImg.scaleToWidth(canvasWidth - borderMargin * 2);
                bgImg.set({ left: borderMargin, top: borderMargin, opacity: backgroundOpacity });
                canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas));
                edit.backgroundTexture = e.target.result;
                edit.backgroundOpacity = backgroundOpacity;
                console.log('Nowa tekstura tła załadowana');
              }, { crossOrigin: 'anonymous' });
            };
            reader.readAsDataURL(backgroundTextureInput);
          }
          borderRect.set({
            stroke: borderColor,
            strokeDashArray: borderStyle === 'dashed' ? [5, 5] : borderStyle === 'dotted' ? [2, 2] : null
          });
          edit.borderStyle = borderStyle;
          edit.borderColor = borderColor;
          edit.backgroundOpacity = backgroundOpacity;
          canvas.renderAll();
          console.log('Zastosowano edycję tekstu');
        } catch (e) {
          console.error('Błąd stosowania edycji tekstu:', e);
          document.getElementById('debug').innerText = "Błąd stosowania edycji tekstu: " + e.message;
        }
      };
    });

    console.log('Dodawanie zdarzenia dla przycisku saveVirtualEdit');
    const saveButton = document.getElementById('saveVirtualEdit');
    if (!saveButton) {
      console.error('Nie znaleziono elementu saveVirtualEdit');
      document.getElementById('debug').innerText = "Błąd: Brak przycisku zapisu";
      return;
    }
    saveButton.onclick = () => {
      try {
        console.log('saveVirtualEdit wywołany');
        const objects = canvas.getObjects();
        const newLayout = {
          image: edit.layout?.image || { x: 0.0714, y: 0.0143, w: 0.8571, h: 0.4 },
          name: edit.layout?.name || { x: 0.0714, y: 0.4714, w: 0.8571, h: 0.0514 },
          price: edit.layout?.price || { x: 0.0714, y: 0.6571, w: 0.8571, h: 0.0514 },
          index: edit.layout?.index || { x: 0.0714, y: 0.7429, w: 0.8571, h: 0.0514 },
          ranking: edit.layout?.ranking || { x: 0.0714, y: 0.8286, w: 0.8571, h: 0.0514 },
          barcode: edit.layout?.barcode || { x: 0.0714, y: 0.85, w: 0.8571, h: 0.1143 }
        };
        objects.forEach(obj => {
          if (obj.id) {
            const objWidth = obj.width * obj.scaleX;
            const objHeight = obj.height * obj.scaleY;
            newLayout[obj.id] = {
              x: Math.max(0, Math.min((obj.left - borderMargin) / (canvasWidth - borderMargin * 2), 0.9286)),
              y: Math.max(0, Math.min((obj.top - borderMargin) / (canvasHeight - borderMargin * 2), 0.8857)),
              w: Math.max(0.1, Math.min(objWidth / (canvasWidth - borderMargin * 2), 0.8571)),
              h: Math.max(0.05, Math.min(objHeight / (canvasHeight - borderMargin * 2), 0.4))
            };
            console.log(`Zapisano pozycję dla ${obj.id}:`, newLayout[obj.id]);
          }
        });
        window.productEdits[productIndex] = {
          ...window.productEdits[productIndex],
          nazwaFont: nazwaText.fontFamily || edit.nazwaFont,
          nazwaFontColor: nazwaText.fill || edit.nazwaFontColor,
          indeksFont: indeksText.fontFamily || edit.indeksFont,
          indeksFontColor: indeksText.fill || edit.indeksFontColor,
          rankingFont: rankingText ? rankingText.fontFamily || edit.rankingFont : edit.rankingFont,
          rankingFontColor: rankingText ? rankingText.fill || edit.rankingFontColor : edit.rankingFontColor,
          cenaFont: cenaText ? cenaText.fontFamily || edit.cenaFont : edit.cenaFont,
          cenaFontColor: cenaText ? cenaText.fill || edit.cenaFontColor : edit.cenaFontColor,
          priceFontSize: cenaText ? (cenaText.fontSize === 12 ? 'small' : cenaText.fontSize === 14 ? 'medium' : 'large') : edit.priceFontSize,
          borderStyle: edit.borderStyle || 'solid',
          borderColor: edit.borderColor || '#000000',
          backgroundTexture: edit.backgroundTexture || null,
          backgroundOpacity: edit.backgroundOpacity || 1.0,
          layout: newLayout
        };
        console.log('Saved Virtual Edit for Product Index:', productIndex, window.productEdits[productIndex]);
        console.log('Zapisane pozycje layoutu:', newLayout);
        canvas.dispose();
        modal.style.display = 'none';
        window.renderCatalog();
        window.previewPDF();
      } catch (e) {
        console.error('Błąd zapisywania wirtualnej edycji:', e);
        document.getElementById('debug').innerText = "Błąd zapisywania wirtualnej edycji: " + e.message;
      }
    };
    console.log('showVirtualEditModal zakończony');
  } catch (e) {
    console.error('Błąd pokazywania modalu edycji wirtualnej:', e);
    document.getElementById('debug').innerText = "Błąd pokazywania modalu edycji wirtualnej: " + e.message;
  }
}

function hideEditModal() {
  try {
    console.log('hideEditModal wywołany');
    const editModal = document.getElementById('editModal');
    const virtualEditModal = document.getElementById('virtualEditModal');
    if (editModal) editModal.style.display = 'none';
    if (virtualEditModal) virtualEditModal.style.display = 'none';
    console.log('Modale ukryte');
  } catch (e) {
    console.error('Błąd ukrywania modalu edycji:', e);
    document.getElementById('debug').innerText = "Błąd ukrywania modalu edycji: " + e.message;
  }
}

window.showEditModal = showEditModal;
window.saveEdit = saveEdit;
window.showPageEditModal = showPageEditModal;
window.savePageEdit = savePageEdit;
window.showVirtualEditModal = showVirtualEditModal;
window.hideEditModal = hideEditModal;
window.applyTextEdit = window.applyTextEdit || function() {};

console.log('kreator3.js funkcje przypisane do window');
