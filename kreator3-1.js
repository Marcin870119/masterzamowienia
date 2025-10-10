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
    console.log('virtualEditModal znaleziony:', modal);
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
    console.log('Dane produktu:', product);
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
        image: { left: 30, top: 20, scaleX: 1, scaleY: 1 },
        name: { left: 175, top: 200, width: 315 },
        price: { left: 175, top: 260, width: 315 },
        index: { left: 175, top: 300, width: 315 },
        ranking: { left: 175, top: 340, width: 315 },
        barcode: { left: 30, top: 340, scaleX: 1, scaleY: 1, rotation: 0 },
        logo: { left: 30, top: 220, scaleX: 1, scaleY: 1 }
      }
    };
    console.log('Tworzenie zawartości modalu dla produktu:', productIndex);
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
      width: 350,
      height: 400
    });
    console.log('Kanwa Fabric.js zainicjalizowana');
    const canvasWidth = 350;
    const canvasHeight = 400;
    const borderMargin = 20;
    const contentWidth = canvasWidth - borderMargin * 2;
    const contentHeight = canvasHeight - borderMargin * 2;
    console.log('Ładowanie tekstury tła');
    if (edit.backgroundTexture) {
      try {
        fabric.Image.fromURL(edit.backgroundTexture, (bgImg) => {
          if (!bgImg) {
            console.error('Nie udało się załadować tekstury tła:', edit.backgroundTexture);
            document.getElementById('debug').innerText = "Błąd: Nie udało się załadować tekstury tła";
            return;
          }
          bgImg.scaleToWidth(contentWidth);
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
        document.getElementById('debug').innerText = `Błąd ładowania tekstury tła w podglądzie: ${e.message}`);
      }
    }
    const originalLayout = JSON.parse(JSON.stringify(edit.layout || {}));
    const showRanking = document.getElementById('showRanking')?.checked || false;
    const showCena = document.getElementById('showCena')?.checked || false;
    const showEan = document.getElementById('showEan')?.checked || false;
    const showLogo = document.getElementById('showLogo')?.checked || false;
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
        const layoutImg = edit.layout.image || { left: 30, top: 20, scaleX: 1, scaleY: 1 };
        img.set({
          left: layoutImg.left,
          top: layoutImg.top,
          scaleX: layoutImg.scaleX,
          scaleY: layoutImg.scaleY,
          selectable: true,
          id: 'image',
          hasBorders: true,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false,
          originX: 'left'
        });
        img.__modified = false;
        canvas.add(img);
        console.log('Obraz produktu załadowany:', imageUrl, { left: img.left, top: img.top, scaleX: img.scaleX, scaleY: img.scaleY });
      }, { crossOrigin: 'anonymous' });
    } catch (e) {
      console.error('Błąd ładowania obrazu produktu w podglądzie:', e);
      document.getElementById('debug').innerText = `Błąd ładowania obrazu produktu w podglądzie: ${e.message}`);
    }
    let logoImgInstance;
    if (showLogo && (edit.logo || (product.producent && window.manufacturerLogos[product.producent]))) {
      console.log('Ładowanie logo');
      const logoUrl = edit.logo || window.manufacturerLogos[product.producent] || 'https://dummyimage.com/80x40/eee/000&text=brak';
      try {
        fabric.Image.fromURL(logoUrl, (logoImg) => {
          if (!logoImg) {
            console.error('Nie udało się załadować logo:', logoUrl);
            document.getElementById('debug').innerText = "Błąd: Nie udało się załadować logo";
            return;
          }
          const layoutLogo = edit.layout.logo || { left: 30, top: 220, scaleX: 1, scaleY: 1 };
          logoImg.set({
            left: layoutLogo.left,
            top: layoutLogo.top,
            scaleX: layoutLogo.scaleX,
            scaleY: layoutLogo.scaleY,
            selectable: true,
            id: 'logo',
            hasBorders: true,
            lockScalingX: false,
            lockScalingY: false,
            lockRotation: false,
            originX: 'left'
          });
          logoImg.__modified = false;
          canvas.add(logoImg);
          logoImgInstance = logoImg;
          console.log('Logo dodane:', logoUrl, { left: logoImg.left, top: logoImg.top, scaleX: logoImg.scaleX, scaleY: logoImg.scaleY });
        }, { crossOrigin: 'anonymous' });
      } catch (e) {
        console.error('Błąd ładowania logo w podglądzie:', e);
        document.getElementById('debug').innerText = `Błąd ładowania logo w podglądzie: ${e.message}`);
      }
    }
    console.log('Tworzenie ramki');
    const borderRect = new fabric.Rect({
      left: borderMargin,
      top: borderMargin,
      width: contentWidth,
      height: contentHeight,
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
    const layoutName = edit.layout.name || { left: 175, top: 200, width: 315 };
    const maxNameWidth = layoutName.width || 315;
    const nazwaFontSize = edit.nazwaFontSize === 'small' ? 12 : edit.nazwaFontSize === 'large' ? 16 : 14;
    const wrappedName = window.wrapText(product.nazwa || 'Brak nazwy', maxNameWidth, nazwaFontSize, edit.nazwaFont, canvas);
    const nazwaText = new fabric.Text(wrappedName, {
      left: layoutName.left,
      top: layoutName.top,
      fontSize: nazwaFontSize,
      fill: edit.nazwaFontColor,
      fontFamily: edit.nazwaFont,
      width: maxNameWidth,
      textAlign: 'center',
      selectable: true,
      id: 'name',
      hasBorders: true,
      lockScalingX: true,
      lockScalingY: true,
      originX: 'center',
      lockMovementX: true,
      lockMovementY: false
    });
    canvas.add(nazwaText);
    console.log('Tekst nazwy dodany:', wrappedName, `fontSize: ${nazwaFontSize}`);
    console.log('Tworzenie tekstu indeksu');
    const layoutIndex = edit.layout.index || { left: 175, top: 300, width: 315 };
    const maxIndexWidth = layoutIndex.width || 315;
    const indeksFontSize = edit.indeksFontSize === 'small' ? 10 : edit.indeksFontSize === 'large' ? 14 : 12;
    const wrappedIndex = window.wrapText(`Indeks: ${product.indeks || '-'}`, maxIndexWidth, indeksFontSize, edit.indeksFont, canvas);
    const indeksText = new fabric.Text(wrappedIndex, {
      left: layoutIndex.left,
      top: layoutIndex.top,
      fontSize: indeksFontSize,
      fill: edit.indeksFontColor,
      fontFamily: edit.indeksFont,
      width: maxIndexWidth,
      textAlign: 'center',
      selectable: true,
      id: 'index',
      hasBorders: true,
      lockScalingX: true,
      lockScalingY: true,
      originX: 'center',
      lockMovementX: true,
      lockMovementY: false
    });
    canvas.add(indeksText);
    console.log('Tekst indeksu dodany:', wrappedIndex, `fontSize: ${indeksFontSize}`);
    let rankingText;
    if (showRanking && product.ranking) {
      console.log('Tworzenie tekstu rankingu');
      const layoutRanking = edit.layout.ranking || { left: 175, top: 340, width: 315 };
      const maxRankingWidth = layoutRanking.width || 315;
      const rankingFontSize = edit.rankingFontSize === 'small' ? 10 : edit.rankingFontSize === 'large' ? 14 : 12;
      const wrappedRanking = window.wrapText(`RANKING: ${product.ranking}`, maxRankingWidth, rankingFontSize, edit.rankingFont, canvas);
      rankingText = new fabric.Text(wrappedRanking, {
        left: layoutRanking.left,
        top: layoutRanking.top,
        fontSize: rankingFontSize,
        fill: edit.rankingFontColor,
        fontFamily: edit.rankingFont,
        width: maxRankingWidth,
        textAlign: 'center',
        selectable: true,
        id: 'ranking',
        hasBorders: true,
        lockScalingX: true,
        lockScalingY: true,
        originX: 'center',
        lockMovementX: true,
        lockMovementY: false
      });
      canvas.add(rankingText);
      console.log('Tekst rankingu dodany:', wrappedRanking, `fontSize: ${rankingFontSize}`);
    }
    let cenaText;
    if (showCena && product.cena) {
      console.log('Tworzenie tekstu ceny');
      const layoutPrice = edit.layout.price || { left: 175, top: 260, width: 315 };
      const maxPriceWidth = layoutPrice.width || 315;
      const cenaFontSize = edit.cenaFontSize === 'small' ? 12 : edit.cenaFontSize === 'large' ? 16 : 14;
      const wrappedPrice = window.wrapText(`${priceLabel}: ${product.cena} ${(edit.priceCurrency || window.globalCurrency) === 'EUR' ? '€' : '£'}`, maxPriceWidth, cenaFontSize, edit.cenaFont, canvas);
      cenaText = new fabric.Text(wrappedPrice, {
        left: layoutPrice.left,
        top: layoutPrice.top,
        fontSize: cenaFontSize,
        fill: edit.cenaFontColor,
        fontFamily: edit.cenaFont,
        width: maxPriceWidth,
        textAlign: 'center',
        selectable: true,
        id: 'price',
        hasBorders: true,
        lockScalingX: true,
        lockScalingY: true,
        originX: 'center',
        lockMovementX: true,
        lockMovementY: false
      });
      canvas.add(cenaText);
      console.log('Tekst ceny dodany:', wrappedPrice, `fontSize: ${cenaFontSize}`);
    }
    let barcodeImgInstance;
    if (showEan && product.ean && product.barcode) {
      console.log('Ładowanie kodu kreskowego');
      try {
        fabric.Image.fromURL(product.barcode, (barcodeImg) => {
          if (!barcodeImg) {
            console.error('Nie udało się załadować kodu kreskowego:', product.barcode);
            document.getElementById('debug').innerText = "Błąd: Nie udało się załadować kodu kreskowego";
            return;
          }
          const layoutBarcode = edit.layout.barcode || { left: 30, top: 340, scaleX: 1, scaleY: 1, rotation: 0 };
          barcodeImg.set({
            left: layoutBarcode.left,
            top: layoutBarcode.top,
            scaleX: layoutBarcode.scaleX,
            scaleY: layoutBarcode.scaleY,
            angle: layoutBarcode.rotation || 0,
            selectable: true,
            id: 'barcode',
            hasBorders: true,
            lockScalingX: false,
            lockScalingY: false,
            lockRotation: false,
            originX: 'left'
          });
          barcodeImg.__modified = false;
          canvas.add(barcodeImg);
          barcodeImgInstance = barcodeImg;
          console.log('Kod kreskowy dodany:', { left: barcodeImg.left, top: barcodeImg.top, scaleX: barcodeImg.scaleX, scaleY: barcodeImg.scaleY, angle: barcodeImg.angle });
        }, { crossOrigin: 'anonymous' });
      } catch (e) {
        console.error('Błąd ładowania kodu kreskowego w podglądzie:', e);
        document.getElementById('debug').innerText = `Błąd ładowania kodu kreskowego w podglądzie: ${e.message}`);
      }
    }
    console.log('Dodawanie zdarzenia object:moving');
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      const objWidth = obj.id === 'image' || obj.id === 'barcode' || obj.id === 'logo' ? obj.getScaledWidth() : obj.width;
      const objHeight = obj.id === 'image' || obj.id === 'barcode' || obj.id === 'logo' ? obj.getScaledHeight() : obj.height;
      if (obj.type === 'text') {
        const minTop = borderMargin;
        const maxTop = borderMargin + contentHeight - objHeight;
        obj.set({
          left: borderMargin + contentWidth / 2,
          top: Math.max(minTop, Math.min(obj.top, maxTop))
        });
      } else {
        const minTop = borderMargin;
        const maxTop = borderMargin + contentHeight - objHeight;
        const minLeft = borderMargin;
        const maxLeft = borderMargin + contentWidth - objWidth;
        obj.set({
          left: Math.max(minLeft, Math.min(obj.left, maxLeft)),
          top: Math.max(minTop, Math.min(obj.top, maxTop))
        });
      }
      obj.__modified = true;
      console.log(`Przesunięto: ${obj.id}, left: ${obj.left}, top: ${obj.top}, scaleX: ${obj.scaleX}, scaleY: ${obj.scaleY}, angle: ${obj.angle || 0}`);
    });
    console.log('Dodawanie zdarzenia object:scaling');
    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      if (obj.id !== 'name' && obj.id !== 'index' && obj.id !== 'price' && obj.id !== 'ranking') {
        if (obj.id === 'image' || obj.id === 'logo' || (obj.id === 'barcode' && !obj.__modified)) {
          const maxW = contentWidth * (obj.id === 'image' ? 0.9 : obj.id === 'barcode' ? 0.8571 : 0.3);
          const maxH = contentHeight * (obj.id === 'image' ? 0.4 : obj.id === 'barcode' ? 0.1143 : 0.1);
          const objWidth = obj.getScaledWidth();
          const objHeight = obj.getScaledHeight();
          if (objWidth > maxW || objHeight > maxH) {
            const scale = Math.min(maxW / obj.width, maxH / obj.height);
            obj.set({
              scaleX: scale,
              scaleY: scale
            });
          }
          const minLeft = borderMargin;
          const maxLeft = borderMargin + contentWidth - objWidth;
          const minTop = borderMargin;
          const maxTop = borderMargin + contentHeight - objHeight;
          obj.set({
            left: Math.max(minLeft, Math.min(obj.left, maxLeft)),
            top: Math.max(minTop, Math.min(obj.top, maxTop))
          });
          obj.__modified = true;
          console.log(`Skalowano: ${obj.id}, scaleX: ${obj.scaleX}, scaleY: ${obj.scaleY}, width: ${objWidth}, height: ${objHeight}, angle: ${obj.angle || 0}`);
        }
      }
    });
    console.log('Dodawanie zdarzenia object:rotating');
    canvas.on('object:rotating', (e) => {
      const obj = e.target;
      if (obj.id === 'barcode' || obj.id === 'image' || obj.id === 'logo') {
        obj.__modified = true;
        console.log(`Obrócono: ${obj.id}, angle: ${obj.angle}`);
      }
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
      editPanel.style.display = obj.type === 'text' ? 'block' : 'none';
      console.log('editPanel wyświetlony:', editPanel);
      if (obj.type === 'text') {
        document.getElementById('fontSelect').value = obj.fontFamily || 'Arial';
        document.getElementById('colorSelect').value = obj.fill || '#000000';
        const fontSizeKey = obj.id === 'name' ? 'nazwaFontSize' : obj.id === 'index' ? 'indeksFontSize' : obj.id === 'ranking' ? 'rankingFontSize' : 'cenaFontSize';
        document.getElementById('sizeSelect').value = edit[fontSizeKey] || (obj.fontSize <= 10 ? 'small' : obj.fontSize >= 16 ? 'large' : 'medium');
      }
      document.getElementById('borderStyleSelect').value = edit.borderStyle || 'solid';
      document.getElementById('borderColorSelect').value = edit.borderColor || '#000000';
      document.getElementById('backgroundOpacitySelect').value = edit.backgroundOpacity || 1.0;
      console.log(`Panel edycji wyświetlony dla obiektu: ${obj.id}`);
      window.applyTextEdit = function() {
        try {
          console.log('applyTextEdit wywołany');
          if (obj.type === 'text') {
            const layoutKey = obj.id;
            const maxWidth = contentWidth * (edit.layout[layoutKey]?.width / contentWidth || 0.9);
            const fontSize = document.getElementById('sizeSelect').value === 'small' ? (layoutKey === 'name' || layoutKey === 'price' ? 12 : 10) :
                            document.getElementById('sizeSelect').value === 'large' ? (layoutKey === 'name' || layoutKey === 'price' ? 16 : 14) :
                            (layoutKey === 'name' || layoutKey === 'price' ? 14 : 12);
            const fontFamily = document.getElementById('fontSelect').value;
            const fill = document.getElementById('colorSelect').value;
            let textContent = obj.text;
            if (layoutKey === 'name') {
              textContent = product.nazwa || 'Brak nazwy';
            } else if (layoutKey === 'index') {
              textContent = `Indeks: ${product.indeks || '-'}`;
            } else if (layoutKey === 'ranking') {
              textContent = `RANKING: ${product.ranking || ''}`;
            } else if (layoutKey === 'price') {
              textContent = `${priceLabel}: ${product.cena} ${(edit.priceCurrency || window.globalCurrency) === 'EUR' ? '€' : '£'}`;
            }
            const wrappedText = window.wrapText(textContent, maxWidth, fontSize, fontFamily, canvas);
            obj.set({
              fontFamily: fontFamily,
              fill: fill,
              fontSize: fontSize,
              text: wrappedText,
              width: maxWidth,
              textAlign: 'center'
            });
            canvas.renderAll();
            console.log(`Zastosowano edycję tekstu dla ${layoutKey}: fontSize=${fontSize}`);
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
                bgImg.scaleToWidth(contentWidth);
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
          document.getElementById('debug').innerText = `Błąd stosowania edycji tekstu: ${e.message}`);
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
        const activeObject = canvas._activeObject;
        const newLayout = JSON.parse(JSON.stringify(originalLayout)); // Kopia oryginalnego layoutu
        if (activeObject && activeObject.id && activeObject.__modified) {
          newLayout[activeObject.id] = {
            left: activeObject.left,
            top: activeObject.top,
            ...(activeObject.id === 'image' || activeObject.id === 'logo' || (activeObject.id === 'barcode' && activeObject.__modified) ? { scaleX: activeObject.scaleX, scaleY: activeObject.scaleY } : {}),
            ...(activeObject.id === 'name' || activeObject.id === 'price' || activeObject.id === 'index' || activeObject.id === 'ranking' ? { width: activeObject.width } : {}),
            ...(activeObject.id === 'barcode' ? { rotation: activeObject.angle || (originalLayout[activeObject.id]?.rotation || 0) } : {})
          };
          console.log(`Zapisano pozycję dla ${activeObject.id}:`, newLayout[activeObject.id]);
        }
        window.productEdits[productIndex] = {
          ...window.productEdits[productIndex],
          nazwaFont: nazwaText.fontFamily || edit.nazwaFont,
          nazwaFontColor: nazwaText.fill || edit.nazwaFontColor,
          nazwaFontSize: edit.nazwaFontSize || (nazwaText.fontSize <= 12 ? 'small' : nazwaText.fontSize >= 16 ? 'large' : 'medium'),
          indeksFont: indeksText.fontFamily || edit.indeksFont,
          indeksFontColor: indeksText.fill || edit.indeksFontColor,
          indeksFontSize: edit.indeksFontSize || (indeksText.fontSize <= 10 ? 'small' : indeksText.fontSize >= 14 ? 'large' : 'medium'),
          rankingFont: rankingText ? rankingText.fontFamily || edit.rankingFont : edit.rankingFont,
          rankingFontColor: rankingText ? rankingText.fill || edit.rankingFontColor : edit.rankingFontColor,
          rankingFontSize: edit.rankingFontSize || (rankingText && rankingText.fontSize <= 10 ? 'small' : rankingText && rankingText.fontSize >= 14 ? 'large' : 'medium'),
          cenaFont: cenaText ? cenaText.fontFamily || edit.cenaFont : edit.cenaFont,
          cenaFontColor: cenaText ? cenaText.fill || edit.cenaFontColor : edit.cenaFontColor,
          cenaFontSize: edit.cenaFontSize || (cenaText && cenaText.fontSize <= 12 ? 'small' : cenaText && cenaText.fontSize >= 16 ? 'large' : 'medium'),
          priceCurrency: edit.priceCurrency || window.globalCurrency || 'EUR',
          borderStyle: edit.borderStyle || 'solid',
          borderColor: edit.borderColor || '#000000',
          backgroundTexture: edit.backgroundTexture || null,
          backgroundOpacity: edit.backgroundOpacity || 1.0,
          logo: edit.logo || (product.producent && window.manufacturerLogos[product.producent]) || null,
          layout: newLayout
        };
        console.log('Zapisano wirtualną edycję dla produktu:', productIndex, window.productEdits[productIndex]);
        console.log('Zapisane pozycje layoutu:', newLayout);
        canvas.dispose();
        modal.style.display = 'none';
        window.renderCatalog();
        window.previewPDF();
      } catch (e) {
        console.error('Błąd zapisywania wirtualnej edycji:', e);
        document.getElementById('debug').innerText = `Błąd zapisywania wirtualnej edycji: ${e.message}`);
      }
    };
    console.log('showVirtualEditModal zakończony');
  } catch (e) {
    console.error('Błąd pokazywania modalu edycji wirtualnej:', e);
    document.getElementById('debug').innerText = `Błąd pokazywania modalu edycji wirtualnej: ${e.message}`);
  }
}
window.showVirtualEditModal = showVirtualEditModal;
window.applyTextEdit = window.applyTextEdit || function() {};
console.log('kreator3-1.js funkcje przypisane do window');
