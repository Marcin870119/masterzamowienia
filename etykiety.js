
let currentData = {};
let savedLabels = [];
let editingIndex = -1;
let products = [];

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
    nameStyle: document.getElementById('nameStyle').value
  };
  document.getElementById('labelPrice').innerText = currentData.currency + currentData.price;
  document.getElementById('labelUnit').innerText = currentData.unit;
  document.getElementById('labelName').innerText = currentData.name;
  document.getElementById('labelPromo').innerText = "Special offer: " + currentData.promo;
  const flagImg = document.getElementById('labelFlag');
  if (currentData.flag === "") {
    flagImg.style.display = "none";
  } else {
    flagImg.style.display = "block";
    if (currentData.flag === "pl") flagImg.src = "https://flagcdn.com/w80/pl.png";
    if (currentData.flag === "ro") flagImg.src = "https://flagcdn.com/w80/ro.png";
    if (currentData.flag === "ua") flagImg.src = "https://flagcdn.com/w80/ua.png";
    if (currentData.flag === "lt") flagImg.src = "https://flagcdn.com/w80/lt.png";
    if (currentData.flag === "bg") flagImg.src = "https://flagcdn.com/w80/bg.png";
    if (currentData.flagSize === "small") { flagImg.style.width = "30px"; flagImg.style.height = "18px"; }
    if (currentData.flagSize === "medium") { flagImg.style.width = "40px"; flagImg.style.height = "24px"; }
    if (currentData.flagSize === "large") { flagImg.style.width = "50px"; flagImg.style.height = "30px"; }
  }
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
function saveLabel() {
  updateLabel(); // Ensure currentData is up-to-date with form values
  if (editingIndex === -1) {
    if (savedLabels.length < 6) {
      savedLabels.push({ ...currentData });
    } else {
      alert("You can only add up to 6 labels.");
      return;
    }
  } else {
    savedLabels[editingIndex] = { ...currentData };
  }
  editingIndex = -1;
  document.getElementById('saveButton').innerText = 'Save Label';
  toggleButtons(false);
  renderSavedLabels();
  clearForm();
}
function addNewLabel() {
  clearForm();
  editingIndex = -1;
  document.getElementById('saveButton').innerText = 'Save Label';
  toggleButtons(false);
}
function editLabel(index) {
  currentData = { ...savedLabels[index] }; // Create a fresh copy of the saved label
  loadForm(currentData);
  updateLabel();
  editingIndex = index;
  document.getElementById('saveButton').innerText = 'Save Label';
  toggleButtons(true);
}
function deleteLabel(index) {
  if (confirm("Are you sure you want to delete this label?")) {
    savedLabels.splice(index, 1);
    renderSavedLabels();
    if (editingIndex === index) {
      clearForm();
      editingIndex = -1;
      document.getElementById('saveButton').innerText = 'Save Label';
      toggleButtons(false);
    } else if (editingIndex > index) {
      editingIndex--;
    }
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
  document.getElementById('barcodeInput').value = '';
  currentData = {}; // Clear currentData to prevent stale data
  updateLabel(); // Reset preview
  filterProducts(); // Reset suggestions
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
  document.getElementById('barcodeInput').value = data.barcodeValue || '';
}
function toggleButtons(isEditing) {
  const buttons = document.querySelectorAll('.form-container .button-group button');
  buttons.forEach(button => {
    button.style.display = ['Update Label', 'Save Label', 'Add New Label'].includes(button.innerText) ? 'block' : 'none';
  });
}
function renderSavedLabels() {
  const list = document.getElementById('labelsList');
  list.innerHTML = '';
  savedLabels.forEach((label, index) => {
    const div = document.createElement('div');
    div.className = 'saved-label';
    div.innerHTML = `Etykieta nr ${index + 1}: ${label.name} - ${label.currency}${label.price} ${label.unit}`;
    const buttonContainer = document.createElement('div');
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edytuj';
    editBtn.onclick = () => editLabel(index);
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Usuń';
    deleteBtn.className = 'delete';
    deleteBtn.onclick = () => deleteLabel(index);
    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);
    div.appendChild(buttonContainer);
    list.appendChild(div);
  });
}
function generatePDFContent() {
  const pdfPage = document.createElement("div");
  pdfPage.id = "pdfPage";
  const flagUrls = {
    pl: "https://flagcdn.com/w40/pl.png",
    ro: "https://flagcdn.com/w40/ro.png",
    ua: "https://flagcdn.com/w40/ua.png",
    lt: "https://flagcdn.com/w40/lt.png",
    bg: "https://flagcdn.com/w40/bg.png"
  };
  for (let i = 0; i < 6; i++) {
    const data = savedLabels[i] || null;
    const label = document.createElement("div");
    label.className = "label-small";
    if (data) {
      label.style.background = data.color;
    }
    const fold = document.createElement("div");
    fold.className = "label-fold";
    fold.innerHTML = "▼ ZEGNIJ TUTAJ";
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
      promoDate.innerText = data.promo;
      promoBox.appendChild(promoTitle);
      promoBox.appendChild(promoDate);
      content.appendChild(promoBox);
      if (data.flag && flagUrls[data.flag]) {
        const flagImg = document.createElement("img");
        flagImg.src = flagUrls[data.flag];
        flagImg.className = "pdf-flag";
        if (data.flagSize === "small") { flagImg.style.width = "20px"; flagImg.style.height = "12px"; }
        if (data.flagSize === "medium") { flagImg.style.width = "30px"; flagImg.style.height = "18px"; }
        if (data.flagSize === "large") { flagImg.style.width = "40px"; flagImg.style.height = "24px"; }
        content.appendChild(flagImg);
      }
      const priceContainer = document.createElement("div");
      priceContainer.className = (data.priceAlign === "right") ? "price-right" : "price-center";
      const price = document.createElement("div");
      price.className = (data.priceSize === "small" ? "price-small" : data.priceSize === "large" ? "price-large" : "price-medium");
      price.innerText = data.currency + data.price;
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
      name.innerText = data.name;
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
    }
    label.appendChild(content);
    pdfPage.appendChild(label);
  }
  return pdfPage;
}
function exportPDF() {
  if (savedLabels.length === 0) {
    alert("No labels to export.");
    return;
  }
  const pdfPage = generatePDFContent();
  html2pdf().set({
    margin: 0,
    filename: 'labels-6-horizontal.pdf',
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  }).from(pdfPage).save();
}
function fetchProducts() {
  fetch('https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/ean%20MM.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      filterProducts(); // Initial population and filtering
    })
    .catch(error => console.error('Error fetching products:', error));
}
function populateProductSelect(productsToDisplay) {
  const productSuggestions = document.getElementById('productSuggestions');
  productSuggestions.innerHTML = '';
  productsToDisplay.forEach(product => {
    const option = document.createElement('option');
    option.value = product.INDEKS;
    option.textContent = `${product.NAZWA} (Index: ${product.INDEKS})`; // Label shown in suggestions
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
  populateProductSelect(filteredProducts); // Remove limit to show all matches
}
function handleProductSelection() {
  const productSearch = document.getElementById('productSearch');
  const selectedIndex = productSearch.value;
  if (selectedIndex) {
    const selectedProduct = products.find(product => product.INDEKS === selectedIndex);
    if (selectedProduct) {
      console.log('Selected product:', selectedProduct); // Debug log
      document.getElementById('productName').value = selectedProduct.NAZWA || '';
      document.getElementById('barcodeInput').value = selectedProduct['unit barcode '] || '';
      updateLabel();
    } else {
      console.error('Product not found for index:', selectedIndex);
    }
  }
}
// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  clearForm(); // Reset form and preview on page load
  toggleButtons(false); // Ensure correct buttons are shown
  fetchProducts(); // Fetch products on page load
  document.getElementById('productSearch').addEventListener('input', filterProducts);
  document.getElementById('productSearch').addEventListener('change', handleProductSelection);
});
