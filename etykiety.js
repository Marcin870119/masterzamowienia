let currentData = {};
let savedLabels = [];
let editingIndex = -1;
let products = [];
let eanDatabase = {};
let currentPage = 0;
let labelsPerPage = 6;

const countryToFlag = {
  'rumunia': 'ro',
  'ukraina': 'ua',
  'bulgaria': 'bg',
  'litwa': 'lt',
  'polska': 'pl'
};

function updateLabel() {
  currentData = {
    name: document.getElementById('productName').value || 'Product Name',
    price: document.getElementById('price').value || '0.00',
    currency: document.getElementById('currency').value,
    unit: document.getElementById('unit').value,
    promo: document.getElementById('promotion').value || '--',
    color: document.getElementById('color').value,
    flag: document.getElementById('flag').value,
    flagSize: document.getElementById('flagSize').value,
    barcodeValue: document.getElementById('barcodeInput').value,
    priceSize: document.getElementById('priceSize').value,
    priceAlign: document.getElementById('priceAlign').value,
    nameStyle: document.getElementById('nameStyle').value,
    iconCategory: document.getElementById('iconCategory').value,
    iconSize: document.getElementById('iconSize').value
  };

  document.getElementById('labelPrice').innerText = currentData.currency + currentData.price;
  document.getElementById('labelUnit').innerText = currentData.unit;
  document.getElementById('labelName').innerText = currentData.name;
  document.getElementById('labelPromo').innerText = "Special offer: " + currentData.promo;

  // Flaga
  const flagImg = document.getElementById('labelFlag');
  if (!currentData.flag) {
    flagImg.style.display = "none";
  } else {
    flagImg.style.display = "block";
    flagImg.src = `https://flagcdn.com/w80/${currentData.flag}.png`;
    if (currentData.flagSize === "small") { flagImg.style.width = "30px"; flagImg.style.height = "18px"; }
    if (currentData.flagSize === "medium") { flagImg.style.width = "40px"; flagImg.style.height = "24px"; }
    if (currentData.flagSize === "large") { flagImg.style.width = "50px"; flagImg.style.height = "30px"; }
  }

  // Ikona
  const iconImg = document.getElementById('labelIcon');
  if (!currentData.iconCategory) {
    iconImg.style.display = "none";
  } else {
    iconImg.style.display = "block";
    const iconBaseUrl = "https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia%20wektorowe/";
    iconImg.src = `${iconBaseUrl}${currentData.iconCategory}.png`;
    if (currentData.iconSize === "small") { iconImg.style.width = "30px"; iconImg.style.height = "30px"; }
    if (currentData.iconSize === "medium") { iconImg.style.width = "40px"; iconImg.style.height = "40px"; }
    if (currentData.iconSize === "large") { iconImg.style.width = "50px"; iconImg.style.height = "50px"; }
  }

  // Kod kreskowy
  if (currentData.barcodeValue) {
    try {
      JsBarcode("#barcode", currentData.barcodeValue, {
        format: "EAN13",
        lineColor: "#000",
        background: currentData.color,
        width: 2,
        height: 60,
        displayValue: true
      });
    } catch (e) {
      console.error("Invalid barcode value:", currentData.barcodeValue);
      document.getElementById("barcode").innerHTML = "";
    }
  } else {
    document.getElementById("barcode").innerHTML = "";
  }
}

function saveLabel(silent = false) {
  updateLabel();
  if (editingIndex === -1) {
    savedLabels.push({ ...currentData });
  } else {
    savedLabels[editingIndex] = { ...currentData };
  }
  editingIndex = -1;
  document.getElementById('saveButton').innerText = 'Save Label';
  toggleButtons(false);
  if (!silent) {
    renderSavedLabels();
    clearForm();
  }
}

function addNewLabel() {
  clearForm();
  editingIndex = -1;
  document.getElementById('saveButton').innerText = 'Save Label';
  toggleButtons(false);
}

function editLabel(globalIndex) {
  currentData = { ...savedLabels[globalIndex] };
  loadForm(currentData);
  updateLabel();
  editingIndex = globalIndex;
  document.getElementById('saveButton').innerText = 'Save Changes';
  toggleButtons(true);
}

function deleteLabel(globalIndex) {
  if (confirm("Are you sure you want to delete this label?")) {
    savedLabels.splice(globalIndex, 1);
    renderSavedLabels();
    if (editingIndex === globalIndex) {
      clearForm();
      editingIndex = -1;
      document.getElementById('saveButton').innerText = 'Save Label';
      toggleButtons(false);
    } else if (editingIndex > globalIndex) {
      editingIndex--;
    }
    const totalPages = Math.ceil(savedLabels.length / labelsPerPage);
    if (currentPage >= totalPages && totalPages > 0) {
      currentPage = totalPages - 1;
    }
    renderSavedLabels();
  }
}

function clearForm() {
  document.getElementById('productSearch').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('nameStyle').value = 'medium-center';
  document.getElementById('price').value = '';
  document.getElementById('priceSize').value = 'medium';
  document.getElementById('priceAlign').value = 'center';
  document.getElementById('currency').value = '£';
  document.getElementById('unit').value = 'each';
  document.getElementById('promotion').value = '';
  document.getElementById('color').value = 'white';
  document.getElementById('flag').value = '';
  document.getElementById('flagSize').value = 'medium';
  document.getElementById('iconCategory').value = '';
  document.getElementById('iconSize').value = 'medium';
  document.getElementById('barcodeInput').value = '';
  currentData = {};
  updateLabel();
  filterProducts();
}

function loadForm(data) {
  document.getElementById('productSearch').value = '';
  document.getElementById('productName').value = data.name || '';
  document.getElementById('nameStyle').value = data.nameStyle || 'medium-center';
  document.getElementById('price').value = data.price || '';
  document.getElementById('priceSize').value = data.priceSize || 'medium';
  document.getElementById('priceAlign').value = data.priceAlign || 'center';
  document.getElementById('currency').value = data.currency || '£';
  document.getElementById('unit').value = data.unit || 'each';
  document.getElementById('promotion').value = data.promo || '';
  document.getElementById('color').value = data.color || 'white';
  document.getElementById('flag').value = data.flag || '';
  document.getElementById('flagSize').value = data.flagSize || 'medium';
  document.getElementById('iconCategory').value = data.iconCategory || '';
  document.getElementById('iconSize').value = data.iconSize || 'medium';
  document.getElementById('barcodeInput').value = data.barcodeValue || '';
}

function toggleButtons(isEditing) {
  const buttons = document.querySelectorAll('.form-container .button-group button');
  buttons.forEach(button => {
    button.style.display = ['Update Label', 'Save Label', 'Add New Label', 'Import and Generate Labels'].includes(button.innerText) ? 'block' : 'none';
  });
}

function renderSavedLabels() {
  const list = document.getElementById('labelsList');
  list.innerHTML = '';
  const totalPages = Math.ceil(savedLabels.length / labelsPerPage);
  const startIndex = currentPage * labelsPerPage;
  const pageLabels = savedLabels.slice(startIndex, startIndex + labelsPerPage);

  const h2 = document.querySelector('#savedLabels h2');
  if (totalPages <= 1) {
    h2.innerText = 'Saved Labels';
  } else {
    h2.innerText = `Saved Labels - Page ${currentPage + 1} of ${totalPages}`;
  }

  pageLabels.forEach((label, pageIndex) => {
    const globalIndex = startIndex + pageIndex;
    const div = document.createElement('div');
    div.className = 'saved-label';
    div.innerHTML = `Etykieta nr ${globalIndex + 1}: ${label.name} - ${label.currency}${label.price} ${label.unit}`;
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edytuj';
    editBtn.onclick = () => editLabel(globalIndex);
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Usuń';
    deleteBtn.className = 'delete';
    deleteBtn.onclick = () => deleteLabel(globalIndex);
    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);
    div.appendChild(buttonContainer);
    list.appendChild(div);
  });

  let pagination = document.getElementById('pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.id = 'pagination';
    pagination.style.textAlign = 'center';
    pagination.style.marginTop = '10px';
    document.getElementById('savedLabels').insertBefore(pagination, document.querySelector('.pdf-buttons'));
  }
  pagination.innerHTML = '';
  if (totalPages > 1) {
    if (currentPage > 0) {
      const prevBtn = document.createElement('button');
      prevBtn.innerText = 'Previous';
      prevBtn.onclick = () => {
        currentPage--;
        renderSavedLabels();
      };
      pagination.appendChild(prevBtn);
      pagination.appendChild(document.createTextNode(' '));
    }
    pagination.appendChild(document.createTextNode(`Page ${currentPage + 1} of ${totalPages}`));
    if (currentPage < totalPages - 1) {
      pagination.appendChild(document.createTextNode(' '));
      const nextBtn = document.createElement('button');
      nextBtn.innerText = 'Next';
      nextBtn.onclick = () => {
        currentPage++;
        renderSavedLabels();
      };
      pagination.appendChild(nextBtn);
    }
  }
}

function generatePDFContent(labels) {
  const numLabels = labels.length;
  const pdfPage = document.createElement("div");
  pdfPage.classList.add("pdf-page");
  pdfPage.style.display = "grid";
  pdfPage.style.gridTemplateColumns = "repeat(2, 1fr)";
  pdfPage.style.gridTemplateRows = "repeat(3, 1fr)";
  pdfPage.style.width = "297mm";
  pdfPage.style.height = "210mm";
  pdfPage.style.margin = "0";
  pdfPage.style.padding = "0";
  pdfPage.style.pageBreakInside = "avoid";

  const flagUrls = {
    pl: "https://flagcdn.com/w40/pl.png",
    ro: "https://flagcdn.com/w40/ro.png",
    ua: "https://flagcdn.com/w40/ua.png",
    lt: "https://flagcdn.com/w40/lt.png",
    bg: "https://flagcdn.com/w40/bg.png"
  };

  for (let i = 0; i < 6; i++) {
    const data = (i < numLabels) ? labels[i] : null;
    const label = document.createElement("div");
    label.className = "label-small";
    if (data) {
      label.style.background = data.color;
    } else {
      label.style.display = "none";
    }
    const fold = document.createElement("div");
    fold.className = "label-fold";
    fold.innerHTML = "▼ ZEGNIJ TUTAJ";
    if (!data) fold.style.display = "none";
    label.appendChild(fold);

    const content = document.createElement("div");
    content.className = "label-content";

    if (data) {
      const promoBox = document.createElement("div");
      promoBox.style.position = "absolute";
      promoBox.style.top = "4px";
      promoBox.style.left = "6px";
      promoBox.style.textAlign = "left";
      const promoTitle = document.createElement("div");
      promoTitle.style.fontWeight = "bold";
      promoTitle.style.fontSize = "12px";
      promoTitle.innerText = "Special Offer";
      const promoDate = document.createElement("div");
      promoDate.style.fontSize = "11px";
      promoDate.innerText = data.promo || '--';
      promoBox.appendChild(promoTitle);
      promoBox.appendChild(promoDate);
      content.appendChild(promoBox);

      if (data.flag && flagUrls[data.flag]) {
        const flagImg = document.createElement("img");
        flagImg.src = flagUrls[data.flag];
        flagImg.className = "pdf-flag";
        flagImg.style.width = data.flagSize === "small" ? "20px" : data.flagSize === "medium" ? "30px" : "40px";
        flagImg.style.height = data.flagSize === "small" ? "12px" : data.flagSize === "medium" ? "18px" : "24px";
        flagImg.style.border = "1px solid #000";
        content.appendChild(flagImg);
      }

      if (data.iconCategory) {
        const iconImg = document.createElement("img");
        const iconBaseUrl = "https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia%20wektorowe/";
        iconImg.src = `${iconBaseUrl}${data.iconCategory}.png`;
        iconImg.className = "pdf-icon";
        iconImg.style.width = data.iconSize === "small" ? "20px" : data.iconSize === "medium" ? "30px" : "40px";
        iconImg.style.height = data.iconSize === "small" ? "20px" : data.iconSize === "medium" ? "30px" : "40px";
        content.appendChild(iconImg);
      }

      const priceContainer = document.createElement("div");
      priceContainer.className = (data.priceAlign === "right") ? "price-right" : "price-center";
      const price = document.createElement("div");
      price.className = (data.priceSize === "small" ? "price-small" : data.priceSize === "large" ? "price-large" : "price-medium");
      price.innerText = data.currency + parseFloat(data.price).toFixed(2);
      const unit = document.createElement("div");
      unit.className = "pdf-unit";
      unit.innerText = data.unit;
      priceContainer.appendChild(price);
      priceContainer.appendChild(unit);
      content.appendChild(priceContainer);

      const name = document.createElement("div");
      const nameParts = data.nameStyle.split("-");
      const sizeClass = "name-" + nameParts[0];
      const alignClass = "name-" + nameParts[1];
      name.className = sizeClass + " " + alignClass;
      name.innerText = data.name || 'Product Name';
      content.appendChild(name);

      if (data.barcodeValue) {
        try {
          const barcodeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          barcodeSvg.classList.add("barcode");
          JsBarcode(barcodeSvg, data.barcodeValue, {
            format: "EAN13",
            lineColor: "#000",
            background: data.color,
            width: 2,
            height: 30,
            displayValue: true,
            fontSize: 10
          });
          content.appendChild(barcodeSvg);
        } catch (e) {
          console.error("Invalid barcode value in PDF:", data.barcodeValue);
        }
      }
    } else {
      content.style.display = "none";
    }

    label.appendChild(content);
    pdfPage.appendChild(label);
  }
  return pdfPage;
}

function generateMultiPagePDF() {
  const totalPages = Math.ceil(savedLabels.length / labelsPerPage);
  const multiPageContainer = document.createElement("div");
  multiPageContainer.style.width = "100%";
  multiPageContainer.style.margin = "0";
  multiPageContainer.style.padding = "0";

  for (let page = 0; page < totalPages; page++) {
    const pageLabels = savedLabels.slice(page * labelsPerPage, (page + 1) * labelsPerPage);
    if (pageLabels.length > 0) {
      const pdfPage = generatePDFContent(pageLabels);
      if (page < totalPages - 1) {
        pdfPage.classList.add("pdf-page-break");
      }
      multiPageContainer.appendChild(pdfPage);
    }
  }
  return multiPageContainer;
}

function exportPDF() {
  if (savedLabels.length === 0) {
    alert("No labels to export.");
    return;
  }

  const multiPageElement = generateMultiPagePDF();
  if (multiPageElement.children.length === 0) {
    alert("No valid pages to export.");
    return;
  }

  html2pdf().set({
    margin: 0,
    filename: 'labels.pdf',
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    pagebreak: { mode: ['css'] }
  }).from(multiPageElement).save();
}

function loadEANDatabase(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      eanDatabase = {};
      data.forEach(item => {
        eanDatabase[item.INDEKS] = item['unit barcode '];
      });
      console.log('EAN Database loaded:', eanDatabase);
    } catch (err) {
      alert('Error loading JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function fetchEANDatabase() {
  fetch('https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/ean%20MM.json')
    .then(response => response.json())
    .then(data => {
      eanDatabase = {};
      data.forEach(item => {
        eanDatabase[item.INDEKS] = item['unit barcode '];
      });
      console.log('EAN Database fetched:', eanDatabase);
    })
    .catch(error => console.error('Error fetching EAN database:', error));
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    let data;
    if (file.name.endsWith('.csv')) {
      data = parseCSV(e.target.result);
    } else {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      data = parseExcelData(data);
    }
    sessionStorage.setItem('importedData', JSON.stringify(data));
    console.log('Data imported:', data);
  };
  if (file.name.endsWith('.csv')) {
    reader.readAsText(file);
  } else {
    reader.readAsBinaryString(file);
  }
}

function parseCSV(text) {
  const lines = text.split('\n').map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')));
  const headers = lines[0].map(header => header.toLowerCase());
  return lines.slice(1).filter(row => row.length >= 4).map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

function parseExcelData(data) {
  const headers = data[0].map(header => header.toLowerCase().replace(/\s+/g, ' '));
  return data.slice(1).filter(row => row.length >= 4).map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

function importAndGenerate() {
  const importedDataStr = sessionStorage.getItem('importedData');
  if (!importedDataStr) {
    alert('No data imported. Please select a file first.');
    return;
  }
  if (Object.keys(eanDatabase).length === 0) {
    alert('Please load or fetch EAN database JSON first.');
    return;
  }
  const data = JSON.parse(importedDataStr);
  savedLabels = [];
  const totalPages = Math.ceil(data.length / labelsPerPage);

  data.forEach(record => {
    const index = record.indeks || record.INDEKS || '';
    const country = (record['kraj pochodzenia'] || record['Kraj pochodzenia'] || '').toLowerCase().trim();
    const flagCode = countryToFlag[country] || '';
    document.getElementById('productName').value = record.nazwa || record.NAZWA || 'Product Name';
    document.getElementById('nameStyle').value = 'medium-center';
    document.getElementById('price').value = record.cena || record.Cena || '0.00';
    document.getElementById('priceSize').value = 'large';
    document.getElementById('priceAlign').value = 'center';
    document.getElementById('currency').value = '£';
    document.getElementById('unit').value = 'each';
    document.getElementById('promotion').value = '--';
    document.getElementById('color').value = 'white';
    document.getElementById('flag').value = flagCode;
    document.getElementById('flagSize').value = 'large';
    document.getElementById('iconCategory').value = '';
    document.getElementById('iconSize').value = 'medium';
    document.getElementById('barcodeInput').value = eanDatabase[index] || '';
    updateLabel();
    saveLabel(true);
  });

  currentPage = 0;
  renderSavedLabels();
  alert(`Generated ${data.length} labels across ${totalPages} pages. Ready to export as PDF.`);
}

function fetchProducts() {
  fetch('https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/ean%20MM.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      filterProducts();
    })
    .catch(error => console.error('Error fetching products:', error));
}

function populateProductSelect(productsToDisplay) {
  const productSuggestions = document.getElementById('productSuggestions');
  productSuggestions.innerHTML = '';
  productsToDisplay.forEach(product => {
    const option = document.createElement('option');
    option.value = product.INDEKS;
    option.textContent = `${product.NAZWA} (Index: ${product.INDEKS})`;
    productSuggestions.appendChild(option);
  });
}

function filterProducts() {
  const searchInput = document.getElementById('productSearch').value.toLowerCase();
  const words = searchInput.split(/\s+/).filter(word => word.length > 0);
  const filteredProducts = products.filter(product => {
    const nameLower = product.NAZWA.toLowerCase();
    const indexStr = product.INDEKS.toString();
    return words.every(word => nameLower.includes(word) || indexStr.includes(word));
  }).sort((a, b) => {
    const aIndex = a.INDEKS.toString();
    const bIndex = b.INDEKS.toString();
    if (aIndex.startsWith(searchInput) && !bIndex.startsWith(searchInput)) return -1;
    if (!aIndex.startsWith(searchInput) && bIndex.startsWith(searchInput)) return 1;
    return 0;
  });
  populateProductSelect(filteredProducts);
}

function handleProductSelection() {
  const productSearch = document.getElementById('productSearch');
  const selectedIndex = productSearch.value;
  if (selectedIndex) {
    const selectedProduct = products.find(product => product.INDEKS === selectedIndex);
    if (selectedProduct) {
      console.log('Selected product:', selectedProduct);
      document.getElementById('productName').value = selectedProduct.NAZWA || '';
      document.getElementById('barcodeInput').value = selectedProduct['unit barcode '] || '';
      updateLabel();
    } else {
      console.error('Product not found for index:', selectedIndex);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  clearForm();
  toggleButtons(false);
  fetchProducts();
  fetchEANDatabase();
  renderSavedLabels();
  document.getElementById('productSearch').addEventListener('input', filterProducts);
  document.getElementById('productSearch').addEventListener('change', handleProductSelection);
});
