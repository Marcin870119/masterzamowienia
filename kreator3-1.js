console.log('kreator3-1.js załadowany');

function showVirtualEditModal(productIndex) {
  try {
    console.log(`showVirtualEditModal wywołany dla produktu: ${productIndex}`);
    const modal = document.getElementById('virtualEditModal');
    if (!modal) {
      console.error('Nie znaleziono elementu virtualEditModal');
      document.getElementById('debug').innerText = "Błąd: Brak modalu edycji wirtualnej";
      return;
    }

    const product = window.products[productIndex] || {
      nazwa: 'Brak nazwy',
      indeks: 'Brak indeksu',
      cena: '',
      ranking: '',
      img: 'https://dummyimage.com/120x84/eee/000&text=brak',
      producent: '',
      ean: '',
      barcode: ''
    };

    const edit = window.productEdits[productIndex] || {
      nazwaFont: 'Arial',
      nazwaFontColor: '#000000',
      nazwaFontSize: 'medium',
      indeksFont: 'Arial',
      indeksFontColor: '#000000',
      indeksFontSize: 'medium',
      rankingFont: 'Arial',
      rankingFontColor: '#000000',
      rankingFontSize: 'medium',
      cenaFont: 'Arial',
      cenaFontColor: '#000000',
      cenaFontSize: 'medium',
      priceCurrency: window.globalCurrency || 'EUR',
      borderStyle: 'solid',
      borderColor: '#000000',
      backgroundTexture: null,
      backgroundOpacity: 1.0,
      layout: {
        image: { x: 0.05, y: 0.05, w: 0.9, h: 0.4, scaleX: 1, scaleY: 1 },
        name: { x: 0.5, y: 0.5, w: 0.9, h: 0.1 },
        price: { x: 0.5, y: 0.65, w: 0.9, h: 0.1 },
        index: { x: 0.5, y: 0.75, w: 0.9, h: 0.1 },
        ranking: { x: 0.5, y: 0.85, w: 0.9, h: 0.1 },
        barcode: { x: 0.05, y: 0.85, w: 0.8571, h: 0.1143, scaleX: 1, scaleY: 1, rotation: 0 },
        logo: { x: 0.05, y: 0.55, w: 0.3, h: 0.1, scaleX: 1, scaleY: 1 }
      }
    };

    console.log('Tworzenie zawartości modalu');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="window.hideEditModal()">&times;</span>
        <h3>Edytuj produkt wizualnie</h3>
        <div class="canvas-container">
          <canvas id="virtualEditCanvas" width="350" height="400"></canvas>
          <div id="editPanel" style="position: absolute; top: 10px; right: -250px; background: white; padding: 15px; border: 1px solid #ccc; border-radius: 8px; display: none;">
            <div class="edit-field">
              <label>Czcionka:</label>
              <select id="fontSelect">
                <option value="Arial" ${edit.nazwaFont === 'Arial' ? 'selected' : ''}>Arial</option>
                <option value="Helvetica" ${edit.nazwaFont === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
                <option value="Times" ${edit.nazwaFont === 'Times' ? 'selected' : ''}>Times New Roman</option>
              </select>
            </div>
            <div class="edit-field">
              <label>Kolor:</label>
              <input type="color" id="colorSelect" value="${edit.nazwaFontColor}">
            </div>
            <div class="edit-field">
              <label>Rozmiar tekstu:</label>
              <select id="sizeSelect">
                <option value="small" ${edit.nazwaFontSize === 'small' ? 'selected' : ''}>Mały</option>
                <option value="medium" ${edit.nazwaFontSize === 'medium' ? 'selected' : ''}>Średni</option>
                <option value="large" ${edit.nazwaFontSize === 'large' ? 'selected' : ''}>Duży</option>
              </select>
            </div>
            <div class="edit-field">
              <label>Styl obramowania:</label>
              <select id="borderStyleSelect">
                <option value="solid" ${edit.borderStyle === 'solid' ? 'selected' : ''}>Pełna linia</option>
                <option value="dashed" ${edit.borderStyle === 'dashed' ? 'selected' : ''}>Kreskowana</option>
                <option value="dotted" ${edit.borderStyle === 'dotted' ? 'selected' : ''}>Kropkowana</option>
              </select>
            </div>
            <div class="edit-field">
              <label>Kolor obramowania:</label>
              <input type="color" id="borderColorSelect" value="${edit.borderColor || '#000000'}">
            </div>
            <div class="edit-field">
              <label>Tekstura tła:</label>
              <input type="file" id="backgroundTextureSelect" accept="image/*">
            </div>
            <div class="edit-field">
              <label>Przezroczystość tła:</label>
              <input type="range" id="backgroundOpacitySelect" min="0.1" max="1.0" step="0.1" value="${edit.backgroundOpacity || 1.0}">
            </div>
            <div class="edit-field">
              <button onclick="window.applyTextEdit()" class="btn-primary">Zastosuj</button>
            </div>
          </div>
          <div class="edit-field" style="flex-direction: row; gap: 15px; position: absolute; bottom: -50px; right: 0;">
            <button id="saveVirtualEdit" class="btn-primary">Zapisz</button>
            <button onclick="window.hideEditModal()" class="btn-secondary">Anuluj</button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'block';
    const canvas = new fabric.Canvas('virtualEditCanvas', { width: 350, height: 400 });
    const cw = 350, ch = 400, margin = 20;
    const contentW = cw - margin * 2, contentH = ch - margin * 2;
    const priceLabel = window.globalLanguage === 'en' ? 'PRICE' : 'CENA';

    console.log('Inicjalizacja kanwy zakończona');

    if (edit.backgroundTexture) {
      fabric.Image.fromURL(edit.backgroundTexture, (bgImg) => {
        bgImg.scaleToWidth(contentW);
        bgImg.set({ left: margin, top: margin, opacity: edit.backgroundOpacity });
        canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas));
      }, { crossOrigin: 'anonymous' });
    }

    const borderRect = new fabric.Rect({
      left: margin,
      top: margin,
      width: contentW,
      height: contentH,
      fill: 'transparent',
      stroke: edit.borderColor || '#000000',
      strokeWidth: 2,
      strokeDashArray: edit.borderStyle === 'dashed' ? [5, 5] : edit.borderStyle === 'dotted' ? [2, 2] : null,
      rx: 5,
      ry: 5,
      selectable: false
    });
    canvas.add(borderRect);
    console.log('Tworzenie elementów kanwy');

    // Obraz produktu
    const imageUrl = window.uploadedImages[product.indeks] || product.img || 'https://dummyimage.com/120x84/eee/000&text=brak';
    fabric.Image.fromURL(imageUrl, (img) => {
      const layoutImg = edit.layout.image;
      const maxW = contentW * layoutImg.w;
      const maxH = contentH * layoutImg.h;
      const scale = Math.min(maxW / img.width, maxH / img.height) * layoutImg.scaleX;
      img.set({
        left: margin + layoutImg.x * contentW,
        top: margin + layoutImg.y * contentH,
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        id: 'image',
        hasBorders: true,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        originX: 'left'
      });
      canvas.add(img);
    }, { crossOrigin: 'anonymous' });

    // Logo producenta
    if (document.getElementById('showLogo')?.checked && (edit.logo || (product.producent && window.manufacturerLogos[product.producent]))) {
      const logoUrl = edit.logo || window.manufacturerLogos[product.producent];
      fabric.Image.fromURL(logoUrl, (logoImg) => {
        const layoutLogo = edit.layout.logo;
        const maxLogoW = contentW * layoutLogo.w;
        const maxLogoH = contentH * layoutLogo.h;
        const scale = Math.min(maxLogoW / logoImg.width, maxLogoH / logoImg.height) * layoutLogo.scaleX;
        logoImg.set({
          left: margin + layoutLogo.x * contentW,
          top: margin + layoutLogo.y * contentH,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          id: 'logo',
          hasBorders: true,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false,
          originX: 'left'
        });
        canvas.add(logoImg);
      }, { crossOrigin: 'anonymous' });
    }

    // Nazwa produktu
    const layoutName = edit.layout.name;
    const maxNameW = contentW * layoutName.w;
    const nazwaFontSize = edit.nazwaFontSize === 'small' ? 12 : edit.nazwaFontSize === 'large' ? 16 : 14;
    const wrappedName = window.wrapText(product.nazwa, maxNameW, nazwaFontSize, edit.nazwaFont, canvas);
    const nazwaText = new fabric.Text(wrappedName, {
      left: margin + layoutName.x * contentW,
      top: margin + layoutName.y * contentH,
      fontSize: nazwaFontSize,
      fill: edit.nazwaFontColor,
      fontFamily: edit.nazwaFont,
      width: maxNameW,
      textAlign: 'center',
      selectable: true,
      id: 'name',
      originX: 'center',
      lockScalingX: true,
      lockScalingY: true
    });
    canvas.add(nazwaText);

    // Indeks
    const layoutIndex = edit.layout.index;
    const maxIndexW = contentW * layoutIndex.w;
    const indeksFontSize = edit.indeksFontSize === 'small' ? 10 : edit.indeksFontSize === 'large' ? 14 : 12;
    const wrappedIndex = window.wrapText(`Indeks: ${product.indeks}`, maxIndexW, indeksFontSize, edit.indeksFont, canvas);
    const indeksText = new fabric.Text(wrappedIndex, {
      left: margin + layoutIndex.x * contentW,
      top: margin + layoutIndex.y * contentH,
      fontSize: indeksFontSize,
      fill: edit.indeksFontColor,
      fontFamily: edit.indeksFont,
      width: maxIndexW,
      textAlign: 'center',
      selectable: true,
      id: 'index',
      originX: 'center',
      lockScalingX: true,
      lockScalingY: true
    });
    canvas.add(indeksText);

    // Cena
    let cenaText;
    if (document.getElementById('showCena')?.checked && product.cena) {
      const layoutPrice = edit.layout.price;
      const maxPriceW = contentW * layoutPrice.w;
      const cenaFontSize = edit.cenaFontSize === 'small' ? 12 : edit.cenaFontSize === 'large' ? 16 : 14;
      const wrappedPrice = window.wrapText(`${priceLabel}: ${product.cena} ${(edit.priceCurrency || window.globalCurrency) === 'EUR' ? '€' : '£'}`, maxPriceW, cenaFontSize, edit.cenaFont, canvas);
      cenaText = new fabric.Text(wrappedPrice, {
        left: margin + layoutPrice.x * contentW,
        top: margin + layoutPrice.y * contentH,
        fontSize: cenaFontSize,
        fill: edit.cenaFontColor,
        fontFamily: edit.cenaFont,
        width: maxPriceW,
        textAlign: 'center',
        selectable: true,
        id: 'price',
        originX: 'center',
        lockScalingX: true,
        lockScalingY: true
      });
      canvas.add(cenaText);
    }

    // Ranking
    let rankingText;
    if (document.getElementById('showRanking')?.checked && product.ranking) {
      const layoutRanking = edit.layout.ranking;
      const maxRankingW = contentW * layoutRanking.w;
      const rankingFontSize = edit.rankingFontSize === 'small' ? 10 : edit.rankingFontSize === 'large' ? 14 : 12;
      const wrappedRanking = window.wrapText(`RANKING: ${product.ranking}`, maxRankingW, rankingFontSize, edit.rankingFont, canvas);
      rankingText = new fabric.Text(wrappedRanking, {
        left: margin + layoutRanking.x * contentW,
        top: margin + layoutRanking.y * contentH,
        fontSize: rankingFontSize,
        fill: edit.rankingFontColor,
        fontFamily: edit.rankingFont,
        width: maxRankingW,
        textAlign: 'center',
        selectable: true,
        id: 'ranking',
        originX: 'center',
        lockScalingX: true,
        lockScalingY: true
      });
      canvas.add(rankingText);
    }

    // Kod kreskowy
    if (document.getElementById('showEan')?.checked && product.barcode) {
      const layoutBarcode = edit.layout.barcode;
      fabric.Image.fromURL(product.barcode, (barcodeImg) => {
        const maxBarcodeW = contentW * layoutBarcode.w;
        const maxBarcodeH = contentH * layoutBarcode.h;
        const scale = Math.min(maxBarcodeW / barcodeImg.width, maxBarcodeH / barcodeImg.height);
        barcodeImg.set({
          left: margin + layoutBarcode.x * contentW,
          top: margin + layoutBarcode.y * contentH,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          id: 'barcode',
          originX: 'left'
        });
        canvas.add(barcodeImg);
      }, { crossOrigin: 'anonymous' });
    }

    // Zdarzenia Fabric.js
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      const objW = obj.getScaledWidth();
      const objH = obj.getScaledHeight();
      const minLeft = margin;
      const maxLeft = margin + contentW - objW;
      const minTop = margin;
      const maxTop = margin + contentH - objH;
      obj.left = Math.max(minLeft, Math.min(obj.left, maxLeft));
      obj.top = Math.max(minTop, Math.min(obj.top, maxTop));
      if (obj.id === 'name' || obj.id === 'index' || obj.id === 'price' || obj.id === 'ranking') {
        obj.left = margin + contentW / 2;
      }
      obj.__modified = true;
    });

    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      if (['image', 'logo', 'barcode'].includes(obj.id)) {
        const maxW = contentW * (obj.id === 'image' ? 0.9 : obj.id === 'logo' ? 0.3 : 0.8571);
        const maxH = contentH * (obj.id === 'image' ? 0.4 : obj.id === 'logo' ? 0.1 : 0.1143);
        const newScale = Math.min(maxW / obj.width, maxH / obj.height);
        if (obj.getScaledWidth() > maxW || obj.getScaledHeight() > maxH) {
          obj.scaleX = newScale;
          obj.scaleY = newScale;
        }
        obj.__modified = true;
      }
    });

    canvas.on('object:rotating', (e) => {
      const obj = e.target;
      if (['barcode', 'image', 'logo'].includes(obj.id)) {
        obj.__modified = true;
      }
    });

    canvas.on('object:selected', (e) => {
      const obj = e.target;
      const editPanel = document.getElementById('editPanel');
      editPanel.style.display = obj.type === 'text' ? 'block' : 'none';

      if (obj.type === 'text') {
        document.getElementById('fontSelect').value = obj.fontFamily || 'Arial';
        document.getElementById('colorSelect').value = obj.fill || '#000000';
        const key = obj.id === 'name' ? 'nazwaFontSize' : obj.id === 'index' ? 'indeksFontSize' : obj.id === 'ranking' ? 'rankingFontSize' : 'cenaFontSize';
        document.getElementById('sizeSelect').value = edit[key] || (obj.fontSize <= 10 ? 'small' : obj.fontSize >= 16 ? 'large' : 'medium');
      }

      window.applyTextEdit = function () {
        try {
          if (obj.type === 'text') {
            const layoutKey = obj.id;
            const maxW = contentW * (edit.layout[layoutKey]?.w || 0.9);
            const fontSizeSel = document.getElementById('sizeSelect').value;
            const fontSize = fontSizeSel === 'small' ? 12 : fontSizeSel === 'large' ? 16 : 14;
            const fontFamily = document.getElementById('fontSelect').value;
            const fill = document.getElementById('colorSelect').value;
            let textContent = obj.text;
            if (layoutKey === 'name') textContent = product.nazwa;
            else if (layoutKey === 'index') textContent = `Indeks: ${product.indeks}`;
            else if (layoutKey === 'ranking') textContent = `RANKING: ${product.ranking}`;
            else if (layoutKey === 'price') textContent = `${priceLabel}: ${product.cena} ${(edit.priceCurrency || window.globalCurrency) === 'EUR' ? '€' : '£'}`;
            const wrapped = window.wrapText(textContent, maxW, fontSize, fontFamily, canvas);
            obj.set({ fontFamily, fill, fontSize, text: wrapped, width: maxW, textAlign: 'center' });
            canvas.renderAll();
          }
          const borderStyle = document.getElementById('borderStyleSelect').value;
          const borderColor = document.getElementById('borderColorSelect').value;
          const opacity = parseFloat(document.getElementById('backgroundOpacitySelect').value);
          borderRect.set({
            stroke: borderColor,
            strokeDashArray: borderStyle === 'dashed' ? [5, 5] : borderStyle === 'dotted' ? [2, 2] : null
          });
          edit.borderStyle = borderStyle;
          edit.borderColor = borderColor;
          edit.backgroundOpacity = opacity;
          canvas.renderAll();
        } catch (err) {
          console.error('Błąd edycji tekstu:', err);
        }
      };
    });

    // Zapisz zmiany
    document.getElementById('saveVirtualEdit').onclick = () => {
      try {
        const active = canvas._activeObject;
        const newLayout = JSON.parse(JSON.stringify(edit.layout));
        canvas.getObjects().forEach(obj => {
          if (obj.id && obj.__modified) {
            const objW = obj.getScaledWidth();
            const objH = obj.getScaledHeight();
            newLayout[obj.id] = {
              x: (obj.left - margin) / contentW,
              y: (obj.top - margin) / contentH,
              w: newLayout[obj.id]?.w || 0.3,
              h: newLayout[obj.id]?.h || 0.1,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              ...(obj.id === 'barcode' ? { rotation: obj.angle } : {})
            };
          }
        });
        window.productEdits[productIndex] = {
          ...edit,
          layout: newLayout
        };
        console.log('Zapisano layout:', newLayout);
        canvas.dispose();
        modal.style.display = 'none';
        window.renderCatalog();
        window.previewPDF();
      } catch (err) {
        console.error('Błąd zapisu edycji:', err);
      }
    };

    console.log('showVirtualEditModal zakończony');
  } catch (err) {
    console.error('Błąd pokazywania modalu edycji wirtualnej:', err);
  }
}

window.showVirtualEditModal = showVirtualEditModal;
window.applyTextEdit = window.applyTextEdit || function() {};
console.log('kreator3-1.js funkcje przypisane do window');
