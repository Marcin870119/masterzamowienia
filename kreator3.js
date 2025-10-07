function showEditModal(productIndex) {
  try {
    const product = window.products[productIndex];
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
        image: { x: 0.05, y: 0.05, w: 0.9, h: 0.4 },
        name: { x: 0.05, y: 0.5, w: 0.9, h: 0.1 },
        price: { x: 0.05, y: 0.65, w: 0.9, h: 0.1 },
        index: { x: 0.05, y: 0.75, w: 0.9, h: 0.1 },
        ranking: { x: 0.05, y: 0.85, w: 0.9, h: 0.1 },
        barcode: { x: 0.05, y: 0.95, w: 0.9, h: 0.1 }
      }
    };
    const showRanking = document.getElementById('showRanking')?.checked || false;
    const showCena = document.getElementById('showCena')?.checked || false;
    const showLogo = document.getElementById('showLogo')?.checked || false;
    const priceLabel = window.globalLanguage === 'en' ? 'Price' : 'Cena';
    const editForm = document.getElementById('editForm');
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
    document.getElementById('editModal').style.display = 'block';
  } catch (e) {
    console.error('Błąd pokazywania modalu edycji:', e);
    document.getElementById('debug').innerText = "Błąd pokazywania modalu edycji";
  }
}

function saveEdit(productIndex) {
  try {
    const product = window.products[productIndex];
    const editImage = document.getElementById('editImage').files[0];
    if (editImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        window.uploadedImages[product.indeks] = e.target.result;
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
        window.renderCatalog();
      };
      reader.readAsDataURL(editLogo);
    } else if (document.getElementById('editLogoSelect')) {
      const selectedLogo = document.getElementById('editLogoSelect').value;
      window.productEdits[productIndex] = window.productEdits[productIndex] || {};
      window.productEdits[productIndex].logo = selectedLogo ? window.manufacturerLogos[selectedLogo] : null;
      product.producent = selectedLogo || product.producent;
    }
    const editBackgroundTexture = document.getElementById('editBackgroundTexture').files[0];
    if (editBackgroundTexture) {
      const reader = new FileReader();
      reader.onload = (e) => {
        window.productEdits[productIndex] = window.productEdits[productIndex] || {};
        window.productEdits[productIndex].backgroundTexture = e.target.result;
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
        image: { x: 0.05, y: 0.05, w: 0.9, h: 0.4 },
        name: { x: 0.05, y: 0.5, w: 0.9, h: 0.1 },
        price: { x: 0.05, y: 0.65, w: 0.9, h: 0.1 },
        index: { x: 0.05, y: 0.75, w: 0.9, h: 0.1 },
        ranking: { x: 0.05, y: 0.85, w: 0.9, h: 0.1 },
        barcode: { x: 0.05, y: 0.95, w: 0.9, h: 0.1 }
      }
    };
    console.log('Saved Edit for Product Index:', productIndex, window.productEdits[productIndex]);
    window.renderCatalog();
    window.hideEditModal();
  } catch (e) {
    console.error('Błąd zapisywania edycji produktu:', e);
    document.getElementById('debug').innerText = "Błąd zapisywania edycji produktu";
  }
}

function showPageEditModal(pageIndex) {
  try {
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
    document.getElementById('editModal').style.display = 'block';
  } catch (e) {
    console.error('Błąd pokazywania modalu edycji strony:', e);
    document.getElementById('debug').innerText = "Błąd pokazywania modalu edycji strony";
  }
}

function savePageEdit(pageIndex) {
  try {
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
    document.getElementById('debug').innerText = "Błąd zapisywania edycji strony";
  }
}

function showVirtualEditModal(productIndex) {
  try {
    const product = window.products[productIndex];
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
        image: { x: 0.05, y: 0.05, w: 0.9, h: 0.4 },
        name: { x: 0.05, y: 0.5, w: 0.9, h: 0.1 },
        price: { x: 0.05, y: 0.65, w: 0.9, h: 0.1 },
        index: { x: 0.05, y: 0.75, w: 0.9, h: 0.1 },
        ranking: { x: 0.05, y: 0.85, w: 0.9, h: 0.1 },
        barcode: { x: 0.05, y: 0.95, w: 0.9, h: 0.1 }
      }
    };
    const modal = document.getElementById('virtualEditModal');
    modal.innerHTML = `
      <div class="modal-content" style="width: 560px; height: 700px; padding: 20px; display: flex; flex-direction: column; align-items: center;">
        <span class="close" onclick="window.hideEditModal()">&times;</span>
        <h3>Edytuj produkt wizualnie</h3>
        <div style="position: relative; width: 280px; height: 350px; border: 1px solid #ccc; margin: 20px auto;">
          <canvas id="virtualEditCanvas" width="280" height="350"></canvas>
          <div id="editPanel" style="position: absolute; top: 10px; right: 10px; background: white; padding: 10px; border: 1px solid #ccc; display: none;">
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
          <button id="saveVirtualEdit" style="position: absolute; bottom: 10px; right: 10px;">Zapisz</button>
        </div>
      </div>
    `;
    modal.style.display = 'block';
    const canvas = new fabric.Canvas('virtualEditCanvas');
    const canvasWidth = 280;
    const canvasHeight = 350;

    if (edit.backgroundTexture) {
      try {
        fabric.Image.fromURL(edit.backgroundTexture, (bgImg) => {
          bgImg.scaleToWidth(canvasWidth);
          bgImg.set({ opacity: edit.backgroundOpacity || 1.0 });
          canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas));
        }, { crossOrigin: 'anonymous' });
      } catch (e) {
        console.error('Błąd ładowania tekstury tła w podglądzie:', e);
        document.getElementById('debug').innerText = "Błąd ładowania tekstury tła w podglądzie";
      }
    }

    const layout = edit.layout || {};
    const showRanking = document.getElementById('showRanking')?.checked || false;
    const showCena = document.getElementById('showCena')?.checked || false;
    const showEan = document.getElementById('showEan')?.checked || false;
    const priceLabel = window.globalLanguage === 'en' ? 'PRICE' : 'CENA';

    try {
      fabric.Image.fromURL(window.uploadedImages[product.indeks] || product.img, (img) => {
        const layoutImg = layout.image || { x: 0.05, y: 0.05, w: 0.9, h: 0.4 };
        const maxW = canvasWidth - 40;
        const maxH = canvasHeight * 0.4;
        let scale = Math.min(maxW / img.width, maxH / img.height);
        let w = img.width * scale;
        let h = img.height * scale;
        img.set({
          left: layoutImg.x * canvasWidth + (canvasWidth - w) / 2,
          top: layoutImg.y * canvasHeight,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          id: 'image'
        });
        canvas.add(img);
      }, { crossOrigin: 'anonymous' });
    } catch (e) {
      console.error('Błąd ładowania obrazu produktu w podglądzie:', e);
      document.getElementById('debug').innerText = "Błąd ładowania obrazu produktu w podglądzie";
    }

    const borderRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: canvasHeight,
      fill: 'transparent',
      stroke: edit.borderColor || '#000000',
      strokeWidth: 2,
      strokeDashArray: edit.borderStyle === 'dashed' ? [5, 5] : edit.borderStyle === 'dotted' ? [2, 2] : null,
      rx: 5,
      ry: 5,
      selectable: false
    });
    canvas.add(borderRect);

    const layoutName = layout.name || { x: 0.05, y: 0.5, w: 0.9, h: 0.1 };
    const nazwaText = new fabric.Text(product.nazwa || 'Brak nazwy', {
      left: layoutName.x * canvasWidth,
      top: layoutName.y * canvasHeight,
      fontSize: 11,
      fill: edit.nazwaFontColor,
      fontFamily: edit.nazwaFont,
      selectable: true,
      id: 'name'
    });
    canvas.add(nazwaText);

    const layoutIndex = layout.index || { x: 0.05, y: 0.75, w: 0.9, h: 0.1 };
    const indeksText = new fabric.Text(`Indeks: ${product.indeks || '-'}`, {
      left: layoutIndex.x * canvasWidth,
      top: layoutIndex.y * canvasHeight,
      fontSize: 9,
      fill: edit.indeksFontColor,
      fontFamily: edit.indeksFont,
      selectable: true,
      id: 'index'
    });
    canvas.add(indeksText);

    let rankingText;
    if (showRanking && product.ranking) {
      const layoutRanking = layout.ranking || { x: 0.05, y: 0.85, w: 0.9, h: 0.1 };
      rankingText = new fabric.Text(`RANKING: ${product.ranking}`, {
        left: layoutRanking.x * canvasWidth,
        top: layoutRanking.y * canvasHeight,
        fontSize: 9,
        fill: edit.rankingFontColor,
        fontFamily: edit.rankingFont,
        selectable: true,
        id: 'ranking'
      });
      canvas.add(rankingText);
    }

    let cenaText;
    if (showCena && product.cena) {
      const layoutPrice = layout.price || { x: 0.05, y: 0.65, w: 0.9, h: 0.1 };
      cenaText = new fabric.Text(`${priceLabel}: ${product.cena} ${(edit.priceCurrency || window.globalCurrency) === 'EUR' ? '€' : '£'}`, {
        left: layoutPrice.x * canvasWidth,
        top: layoutPrice.y * canvasHeight,
        fontSize: edit.priceFontSize === 'small' ? 12 : edit.priceFontSize === 'medium' ? 14 : 16,
        fill: edit.cenaFontColor,
        fontFamily: edit.cenaFont,
        selectable: true,
        id: 'price'
      });
      canvas.add(cenaText);
    }

    if (showEan && product.ean && product.barcode) {
      try {
        const layoutBarcode = layout.barcode || { x: 0.05, y: 0.95, w: 0.9, h: 0.1 };
        fabric.Image.fromURL(product.barcode, (barcodeImg) => {
          barcodeImg.scaleToWidth(canvasWidth * layoutBarcode.w);
          barcodeImg.set({
            left: layoutBarcode.x * canvasWidth,
            top: layoutBarcode.y * canvasHeight,
            selectable: true,
            id: 'barcode'
          });
          canvas.add(barcodeImg);
        }, { crossOrigin: 'anonymous' });
      } catch (e) {
        console.error('Błąd ładowania kodu kreskowego w podglądzie:', e);
        document.getElementById('debug').innerText = "Błąd ładowania kodu kreskowego w podglądzie";
      }
    }

    canvas.on('object:selected', (e) => {
      const obj = e.target;
      document.getElementById('editPanel').style.display = 'block';
      document.getElementById('fontSelect').value = obj.fontFamily || 'Arial';
      document.getElementById('colorSelect').value = obj.fill || '#000000';
      document.getElementById('sizeSelect').value = obj.fontSize === 12 ? 'small' : obj.fontSize === 14 ? 'medium' : 'large';
      document.getElementById('borderStyleSelect').value = edit.borderStyle || 'solid';
      document.getElementById('borderColorSelect').value = edit.borderColor || '#000000';
      document.getElementById('backgroundOpacitySelect').value = edit.backgroundOpacity || 1.0;
      window.applyTextEdit = function() {
        try {
          if (obj.type === 'text') {
            obj.set({
              fontFamily: document.getElementById('fontSelect').value,
              fill: document.getElementById('colorSelect').value,
              fontSize: document.getElementById('sizeSelect').value === 'small' ? 12 : document.getElementById('sizeSelect').value === 'medium' ? 14 : 16
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
                bgImg.scaleToWidth(canvasWidth);
                bgImg.set({ opacity: backgroundOpacity });
                canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas));
                edit.backgroundTexture = e.target.result;
                edit.backgroundOpacity = backgroundOpacity;
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
        } catch (e) {
          console.error('Błąd stosowania edycji tekstu:', e);
          document.getElementById('debug').innerText = "Błąd stosowania edycji tekstu";
        }
      };
    });

    canvas.on('object:moving', (e) => {
      const obj = e.target;
      console.log('Przesunięto:', obj.id, 'x:', obj.left / canvasWidth, 'y:', obj.top / canvasHeight);
    });

    document.getElementById('saveVirtualEdit').onclick = () => {
      try {
        const objects = canvas.getObjects();
        const newLayout = {
          image: edit.layout?.image || { x: 0.05, y: 0.05, w: 0.9, h: 0.4 },
          name: edit.layout?.name || { x: 0.05, y: 0.5, w: 0.9, h: 0.1 },
          price: edit.layout?.price || { x: 0.05, y: 0.65, w: 0.9, h: 0.1 },
          index: edit.layout?.index || { x: 0.05, y: 0.75, w: 0.9, h: 0.1 },
          ranking: edit.layout?.ranking || { x: 0.05, y: 0.85, w: 0.9, h: 0.1 },
          barcode: edit.layout?.barcode || { x: 0.05, y: 0.95, w: 0.9, h: 0.1 }
        };
        objects.forEach(obj => {
          if (obj.id) {
            newLayout[obj.id] = {
              x: Math.max(0, Math.min(obj.left / canvasWidth, 0.95)),
              y: Math.max(0, Math.min(obj.top / canvasHeight, 0.95)),
              w: Math.max(0.1, Math.min((obj.width * obj.scaleX) / canvasWidth, 0.9)),
              h: Math.max(0.05, Math.min((obj.height * obj.scaleY) / canvasHeight, 0.4))
            };
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
        canvas.dispose();
        modal.style.display = 'none';
        window.renderCatalog();
        window.previewPDF();
      } catch (e) {
        console.error('Błąd zapisywania wirtualnej edycji:', e);
        document.getElementById('debug').innerText = "Błąd zapisywania wirtualnej edycji";
      }
    };
  } catch (e) {
    console.error('Błąd pokazywania modalu edycji wirtualnej:', e);
    document.getElementById('debug').innerText = "Błąd pokazywania modalu edycji wirtualnej";
  }
}

function hideEditModal() {
  try {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('virtualEditModal').style.display = 'none';
  } catch (e) {
    console.error('Błąd ukrywania modalu edycji:', e);
    document.getElementById('debug').innerText = "Błąd ukrywania modalu edycji";
  }
}

window.showEditModal = showEditModal;
window.saveEdit = saveEdit;
window.showPageEditModal = showPageEditModal;
window.savePageEdit = savePageEdit;
window.showVirtualEditModal = showVirtualEditModal;
window.hideEditModal = hideEditModal;
window.applyTextEdit = window.applyTextEdit || function() {};
