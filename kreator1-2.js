console.log('kreator1-2.js załadowany');

// Inicjalizacja zmiennej dla aktualnej strony
window.currentPage = 0;

async function toBase64(url) {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      console.warn(`Nie udało się załadować obrazu z ${url}: ${response.status}`);
      return null;
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(`Błąd odczytu obrazu z ${url}`));
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn(`Błąd konwersji URL na base64 (${url}):`, e);
    return null;
  }
}

async function loadManufacturerLogos() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/MasterMM2025/kreator-katalog/main/Producenci.json");
    if (!response.ok) throw new Error(`Nie udało się załadować Producenci.json: ${response.status}`);
    const jsonData = await response.json();
    for (const manufacturer of jsonData) {
      const name = manufacturer.NAZWA_PROD?.trim() || '';
      const urls = [
        `https://raw.githubusercontent.com/MasterMM2025/kreator-katalog/main/zdjecia/${name}.jpg`,
        `https://raw.githubusercontent.com/MasterMM2025/kreator-katalog/main/zdjecia/${name}.png`
      ];
      let base64Logo = null;
      for (const url of urls) {
        base64Logo = await toBase64(url);
        if (base64Logo) break;
      }
      if (base64Logo) {
        window.manufacturerLogos[name] = base64Logo;
      }
    }
    console.log(`Załadowano loga producentów: ${Object.keys(window.manufacturerLogos).length}`);
  } catch (error) {
    console.error("Błąd ładowania logów producentów:", error);
    document.getElementById('debug').innerText = `Błąd ładowania logów producentów: ${error.message}`;
  }
}

async function loadProducts() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/UKRAINA.json");
    if (!response.ok) throw new Error(`Nie udało się załadować JSON: ${response.status}`);
    const jsonData = await response.json();
    window.jsonProducts = await Promise.all(jsonData.map(async (p) => {
      const urls = [
        `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-ukraina/${p.INDEKS}.jpg`,
        `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/zdjecia-ukraina/${p.INDEKS}.png`,
        `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/rumunia/${p.INDEKS}.jpg`,
        `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/rumunia/${p.INDEKS}.png`
      ];
      let base64Img = null;
      for (const url of urls) {
        base64Img = await toBase64(url);
        if (base64Img) {
          console.log(`Załadowano obraz dla indeksu ${p.INDEKS}: ${url}`);
          break;
        }
      }
      return {
        nazwa: p.NAZWA || '',
        opakowanie: p.OPAKOWANIE || '',
        ean: p["unit barcode"] || '',
        ranking: p.RANKING || '',
        cena: p.CENA || '',
        indeks: p.INDEKS?.toString() || '',
        img: base64Img,
        producent: p.NAZWA_PROD || ''
      };
    }));
    console.log(`Załadowano jsonProducts: ${window.jsonProducts.length}`);
    await loadManufacturerLogos();
  } catch (error) {
    console.error("Błąd loadProducts:", error);
    document.getElementById('debug').innerText = `Błąd ładowania JSON: ${error.message}`;
  }
}

function handleFiles(files, callback) {
  if (!files || files.length === 0) {
    console.error("Brak plików do załadowania");
    document.getElementById('debug').innerText = "Brak zdjęć do załadowania";
    return;
  }
  [...files].forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      callback(file, e.target.result);
      document.getElementById('debug').innerText = `Załadowano plik: ${file.name}`;
    };
    reader.onerror = () => {
      console.error(`Błąd ładowania pliku: ${file.name}`);
      document.getElementById('debug').innerText = `Błąd ładowania pliku: ${file.name}`;
    };
    reader.readAsDataURL(file);
  });
}

function loadCustomBanner(file, data) {
  window.selectedBanner = { id: "custom", data };
  console.log(`Załadowano baner: ${file.name}`);
}

function loadCustomBackground(file, data) {
  window.selectedBackground = { id: "customBackground", data };
  console.log(`Załadowano tło: ${file.name}`);
}

function loadCustomCover(file, data) {
  window.selectedCover = { id: "customCover", data };
  console.log(`Załadowano okładkę: ${file.name}`);
}

function loadCustomImages(file, data) {
  const fileName = file.name.split('.')[0];
  window.uploadedImages[fileName] = data;
  console.log(`Załadowano obraz dla indeksu: ${fileName}`);
  window.renderCatalog();
}

function showBannerModal() {
  try {
    const bannerModal = document.getElementById('bannerModal');
    if (bannerModal) {
      bannerModal.style.display = 'block';
      loadBanners();
    } else {
      console.error("Nie znaleziono elementu bannerModal");
      document.getElementById('debug').innerText = "Błąd: Brak modalu banera";
    }
  } catch (e) {
    console.error('Błąd pokazywania modalu banera:', e);
    document.getElementById('debug').innerText = `Błąd pokazywania modalu banera: ${e.message}`;
  }
}

function hideBannerModal() {
  try {
    const bannerModal = document.getElementById('bannerModal');
    if (bannerModal) {
      bannerModal.style.display = 'none';
    }
  } catch (e) {
    console.error('Błąd ukrywania modalu banera:', e);
    document.getElementById('debug').innerText = `Błąd ukrywania modalu banera: ${e.message}`;
  }
}

async function loadBanners() {
  try {
    const bannerOptions = document.getElementById('bannerOptions');
    if (!bannerOptions) {
      console.error("Nie znaleziono elementu bannerOptions");
      document.getElementById('debug').innerText = "Błąd: Brak kontenera opcji banera";
      return;
    }
    bannerOptions.innerHTML = '';
    const bannerList = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (const id of bannerList) {
      const urls = [
        `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/BANER/${id}.JPG`,
        `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/BANER/${id}.jpg`,
        `https://raw.githubusercontent.com/Marcin870119/masterzamowienia/main/BANER/${id}.png`
      ];
      let base64Banner = null;
      for (const url of urls) {
        base64Banner = await toBase64(url);
        if (base64Banner) {
          console.log(`Załadowano baner ${id}: ${url}`);
          break;
        }
      }
      if (base64Banner) {
        const preview = document.createElement('img');
        preview.src = base64Banner;
        preview.className = 'banner-preview';
        preview.onclick = () => selectBanner(id, base64Banner);
        bannerOptions.appendChild(preview);
      }
    }
  } catch (e) {
    console.error('Błąd ładowania banerów:', e);
    document.getElementById('debug').innerText = `Błąd ładowania banerów: ${e.message}`;
  }
}

function selectBanner(id, data) {
  window.selectedBanner = { id, data };
  document.querySelectorAll('.banner-preview').forEach(p => p.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  hideBannerModal();
}

function renderCatalog() {
  try {
    console.log(`renderCatalog wywołany, currentPage: ${window.currentPage}`);
    const container = document.getElementById("catalog");
    const pageInfo = document.getElementById("pageInfo");
    if (!container) {
      console.error("Nie znaleziono elementu catalog");
      document.getElementById('debug').innerText = "Błąd: Brak elementu katalogu";
      return;
    }
    container.innerHTML = "";
    if (!window.products || window.products.length === 0) {
      container.innerHTML = "<p>Brak produktów do wyświetlenia. Zaimportuj plik Excel.</p>";
      document.getElementById('prevPage').disabled = true;
      document.getElementById('nextPage').disabled = true;
      if (pageInfo) pageInfo.innerText = "Strona 0/0";
      return;
    }
    const layout = document.getElementById('layoutSelect')?.value || "16";
    const showCena = document.getElementById('showCena')?.checked || false;
    const showLogo = document.getElementById('showLogo')?.checked || false;
    const showRanking = document.getElementById('showRanking')?.checked || false;
    const showEan = document.getElementById('showEan')?.checked || false;
    const priceLabel = window.globalLanguage === 'en' ? 'Price' : 'Cena';
    let itemsPerPage;
    let gridColumns;
    if (layout === "1") {
      itemsPerPage = 1;
      gridColumns = "1fr";
    } else if (layout === "2") {
      itemsPerPage = 2;
      gridColumns = "repeat(2, 1fr)";
    } else if (layout === "4") {
      itemsPerPage = 4;
      gridColumns = "repeat(2, 1fr)";
    } else if (layout === "8") {
      itemsPerPage = 8;
      gridColumns = "repeat(4, 1fr)";
    } else if (layout === "16") {
      itemsPerPage = 16;
      gridColumns = "repeat(4, 1fr)";
    } else if (layout === "4-2-4") {
      itemsPerPage = 10;
      gridColumns = "repeat(4, 1fr)";
    }
    const totalPages = Math.ceil(window.products.length / itemsPerPage);
    if (window.currentPage >= totalPages) window.currentPage = totalPages - 1;
    if (window.currentPage < 0) window.currentPage = 0;
    const startIndex = window.currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, window.products.length);
    const pageProducts = window.products.slice(startIndex, endIndex);
    document.getElementById('prevPage').disabled = window.currentPage === 0;
    document.getElementById('nextPage').disabled = window.currentPage >= totalPages - 1;
    if (pageInfo) {
      pageInfo.innerText = `Strona ${window.currentPage + 1}/${totalPages}`;
    }
    const pageDiv = document.createElement("div");
    pageDiv.className = "page";
    pageDiv.setAttribute("data-page", window.currentPage);
    pageDiv.style.display = "grid";
    pageDiv.style.gridTemplateColumns = gridColumns;
    pageDiv.style.gap = "25px";
    pageDiv.style.padding = "20px";
    container.appendChild(pageDiv);
    pageProducts.forEach((p, pageIndex) => {
      if (!p || !p.indeks) {
        console.warn(`Produkt o indeksie ${startIndex + pageIndex} jest nieprawidłowy lub brak indeksu`, p);
        return;
      }
      const globalIndex = startIndex + pageIndex;
      const item = document.createElement("div");
      item.className = layout === "1" || layout === "2" ? "item item-large" : "item";
      const edit = window.productEdits[globalIndex] || {};
      const pageEdit = window.pageEdits[window.currentPage] || {};
      const finalEdit = { ...pageEdit, ...edit };
      const img = document.createElement('img');
      img.src = window.uploadedImages[p.indeks] || p.img || "https://dummyimage.com/120x84/eee/000&text=brak";
      img.style.width = layout === "1" || layout === "2" ? '200px' : '120px';
      img.style.height = layout === "1" || layout === "2" ? '140px' : '84px';
      img.style.objectFit = "contain";
      img.onerror = () => {
        console.warn(`Błąd ładowania obrazu dla produktu ${p.indeks}`);
        img.src = "https://dummyimage.com/120x84/eee/000&text=brak";
      };
      const details = document.createElement('div');
      details.className = "details";
      details.innerHTML = `<b style="font-family: ${finalEdit.nazwaFont || 'Arial'}; color: ${finalEdit.nazwaFontColor || '#000000'}">${p.nazwa || 'Brak nazwy'}</b><br>` +
                         `<span style="font-family: ${finalEdit.indeksFont || 'Arial'}; color: ${finalEdit.indeksFontColor || '#000000'}">Indeks: ${p.indeks || 'Brak indeksu'}</span>`;
      if (showRanking && p.ranking) {
        details.innerHTML += `<br><span style="font-family: ${finalEdit.rankingFont || 'Arial'}; color: ${finalEdit.rankingFontColor || '#000000'}">RANKING: ${p.ranking}</span>`;
      }
      if (showCena && p.cena) {
        const currency = finalEdit.priceCurrency || window.globalCurrency;
        const currencySymbol = currency === 'EUR' ? '€' : '£';
        const showPriceLabel = finalEdit.showPriceLabel !== undefined ? finalEdit.showPriceLabel : true;
        details.innerHTML += `<br><span style="font-family: ${finalEdit.cenaFont || 'Arial'}; color: ${finalEdit.cenaFontColor || '#000000'}; font-size: ${finalEdit.priceFontSize || 'medium'}">${showPriceLabel ? `${priceLabel}: ` : ''}${p.cena} ${currencySymbol}</span>`;
      }
      if (showLogo && layout === "4" && (finalEdit.logo || (p.producent && window.manufacturerLogos[p.producent]))) {
        const logoImg = document.createElement('img');
        logoImg.src = finalEdit.logo || window.manufacturerLogos[p.producent] || "https://dummyimage.com/120x60/eee/000&text=brak";
        logoImg.style.width = '120px';
        logoImg.style.height = '60px';
        logoImg.style.objectFit = 'contain';
        logoImg.style.marginTop = '8px';
        logoImg.onerror = () => {
          console.warn(`Błąd ładowania logo dla produktu ${p.indeks}`);
          logoImg.src = "https://dummyimage.com/120x60/eee/000&text=brak";
        };
        details.appendChild(logoImg);
      }
      if (showEan && p.ean && p.barcode) {
        const barcodeImg = document.createElement('img');
        barcodeImg.src = p.barcode;
        barcodeImg.style.width = '85px';
        barcodeImg.style.height = '32px';
        barcodeImg.style.marginTop = '8px';
        barcodeImg.onerror = () => {
          console.warn(`Błąd ładowania kodu kreskowego dla produktu ${p.indeks}`);
          barcodeImg.src = "https://dummyimage.com/85x32/eee/000&text=brak";
        };
        details.appendChild(barcodeImg);
      }
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'buttons-container';
      buttonsContainer.style.display = 'flex';
      buttonsContainer.style.gap = '10px';
      buttonsContainer.style.marginTop = '10px';
      const editButton = document.createElement('button');
      editButton.className = 'btn-primary edit-button';
      editButton.innerHTML = '<i class="fas fa-edit"></i> Edytuj';
      editButton.onclick = () => {
        console.log(`Kliknięto Edytuj dla produktu: ${globalIndex}`);
        window.showEditModal(globalIndex);
      };
      const layoutButton = document.createElement('button');
      layoutButton.className = 'btn-primary layout-button';
      layoutButton.innerHTML = '<i class="fas fa-object-group"></i> Edytuj układ';
      layoutButton.onclick = () => {
        console.log(`Kliknięto Edytuj układ dla produktu: ${globalIndex}`);
        console.log(`showVirtualEditModal dostępny: ${typeof window.showVirtualEditModal}`);
        if (typeof window.showVirtualEditModal === 'function') {
          window.showVirtualEditModal(globalIndex);
        } else {
          console.error('Funkcja showVirtualEditModal nie jest zdefiniowana');
          document.getElementById('debug').innerText = "Błąd: Funkcja edycji układu nie jest dostępna";
        }
      };
      buttonsContainer.appendChild(editButton);
      buttonsContainer.appendChild(layoutButton);
      item.appendChild(img);
      item.appendChild(details);
      item.appendChild(buttonsContainer);
      pageDiv.appendChild(item);
      console.log(`Dodano produkt ${p.indeks} z przyciskami edycji na stronie ${window.currentPage}`);
    });
    console.log(`renderCatalog zakończony, strona: ${window.currentPage}, produkty: ${pageProducts.length}, totalPages: ${totalPages}`);
  } catch (e) {
    console.error('Błąd renderowania katalogu:', e);
    document.getElementById('debug').innerText = `Błąd renderowania katalogu: ${e.message}`;
  }
}

function showPage(pageNum) {
  try {
    const totalPages = Math.ceil(window.products.length / getItemsPerPage());
    window.currentPage = Math.max(0, Math.min(pageNum, totalPages - 1));
    console.log(`showPage wywołany, strona: ${window.currentPage}`);
    renderCatalog();
  } catch (e) {
    console.error('Błąd przełączania strony:', e);
    document.getElementById('debug').innerText = `Błąd przełączania strony: ${e.message}`;
  }
}

function getItemsPerPage() {
  const layout = document.getElementById('layoutSelect')?.value || "16";
  if (layout === "1") return 1;
  else if (layout === "2") return 2;
  else if (layout === "4") return 4;
  else if (layout === "8") return 8;
  else if (layout === "16") return 16;
  else if (layout === "4-2-4") return 10;
  return 16;
}

function importExcel() {
  try {
    const file = document.getElementById('excelFile').files[0];
    if (!file) {
      alert('Wybierz plik Excel lub CSV do importu');
      document.getElementById('debug').innerText = "Błąd: Nie wybrano pliku";
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        if (!window.jsonProducts || window.jsonProducts.length === 0) {
          console.log("jsonProducts niezaładowane, wywołuję loadProducts");
          await window.loadProducts();
        }
        let rows;
        if (file.name.endsWith('.csv')) {
          const parsed = Papa.parse(e.target.result, { header: true, skipEmptyLines: true });
          rows = parsed.data;
          if (rows.length === 0) {
            console.error("Plik CSV jest pusty lub niepoprawny");
            document.getElementById('debug').innerText = "Błąd: Plik CSV jest pusty";
            return;
          }
          const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim());
          rows = rows.map(row => {
            let obj = {};
            headers.forEach((header, i) => {
              const value = row[Object.keys(row)[i]];
              if (['index', 'indeks'].some(h => header.includes(h))) obj['indeks'] = value || '';
              if (['ean', 'kod ean', 'barcode'].some(h => header.includes(h))) obj['ean'] = value || '';
              if (['rank', 'ranking'].some(h => header.includes(h))) obj['ranking'] = value || '';
              if (['cen', 'cena', 'price', 'netto'].some(h => header.includes(h))) obj['cena'] = value || '';
              if (['nazwa', 'name'].some(h => header.includes(h))) obj['nazwa'] = value || '';
              if (['logo', 'nazwa_prod', 'producent', 'manufacturer'].some(h => header.includes(h))) obj['producent'] = value || '';
            });
            return obj;
          });
        } else {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
          const headers = rows[0].map(h => h.toString().toLowerCase().trim());
          rows = rows.slice(1).map(row => {
            let obj = {};
            headers.forEach((header, i) => {
              if (['index', 'indeks'].some(h => header.includes(h))) obj['indeks'] = row[i] || '';
              if (['ean', 'kod ean', 'barcode'].some(h => header.includes(h))) obj['ean'] = row[i] || '';
              if (['rank', 'ranking'].some(h => header.includes(h))) obj['ranking'] = row[i] || '';
              if (['cen', 'cena', 'price', 'netto'].some(h => header.includes(h))) obj['cena'] = row[i] || '';
              if (['nazwa', 'name'].some(h => header.includes(h))) obj['nazwa'] = row[i] || '';
              if (['logo', 'nazwa_prod', 'producent', 'manufacturer'].some(h => header.includes(h))) obj['producent'] = row[i] || '';
            });
            return obj;
          });
        }
        console.log("Przetworzone wiersze CSV/Excel:", rows);
        const newProducts = [];
        rows.forEach(row => {
          const indeks = row['indeks'] || row[0];
          if (indeks) {
            const matched = window.jsonProducts.find(p => p.indeks.toString() === indeks.toString()) || {};
            let barcodeImg = null;
            if (row['ean'] && /^\d{12,13}$/.test(row['ean'])) {
              try {
                const barcodeCanvas = document.createElement('canvas');
                JsBarcode(barcodeCanvas, row['ean'], {
                  format: "EAN13",
                  width: 1.6,
                  height: 32,
                  displayValue: true,
                  fontSize: 9,
                  margin: 0
                });
                barcodeImg = barcodeCanvas.toDataURL("image/png", 0.8);
              } catch (e) {
                console.error(`Błąd generowania kodu kreskowego dla EAN: ${row['ean']}`, e);
                document.getElementById('debug').innerText = "Błąd generowania kodu kreskowego";
              }
            }
            newProducts.push({
              nazwa: row['nazwa'] || matched.nazwa || '',
              ean: row['ean'] || matched.ean || '',
              ranking: row['ranking'] || matched.ranking || '',
              cena: row['cena'] || matched.cena || '',
              indeks: indeks.toString(),
              img: window.uploadedImages[indeks.toString()] || matched.img || null,
              barcode: barcodeImg || matched.barcode || null,
              producent: row['producent'] || matched.producent || ''
            });
          }
        });
        console.log("Nowe produkty:", newProducts);
        if (newProducts.length) {
          window.products = newProducts;
          window.productEdits = {};
          window.pageEdits = {};
          window.currentPage = 0; // Reset strony po imporcie
          window.renderCatalog();
          document.getElementById('pdfButton').disabled = false;
          document.getElementById('previewButton').disabled = false;
          document.getElementById('debug').innerText = `Zaimportowano ${newProducts.length} produktów`;
        } else {
          document.getElementById('debug').innerText = "Brak produktów po imporcie. Sprawdź format pliku.";
        }
      } catch (e) {
        console.error("Błąd przetwarzania pliku Excel/CSV:", e);
        document.getElementById('debug').innerText = `Błąd przetwarzania pliku Excel/CSV: ${e.message}`;
      }
    };
    reader.onerror = () => {
      console.error("Błąd odczytu pliku");
      document.getElementById('debug').innerText = "Błąd odczytu pliku CSV/Excel";
    };
    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsBinaryString(file);
  } catch (e) {
    console.error('Błąd importu pliku Excel/CSV:', e);
    document.getElementById('debug').innerText = `Błąd importu pliku Excel/CSV: ${e.message}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log('DOMContentLoaded wywołany');
    const imageInput = document.getElementById("imageInput");
    const uploadArea = document.getElementById("uploadArea");
    if (imageInput && uploadArea) {
      imageInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          console.log(`Zmiana w imageInput, pliki: ${e.target.files.length}`);
          handleFiles(e.target.files, loadCustomImages);
        }
      });
      uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("dragover");
      });
      uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("dragover");
      });
      uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
          console.log(`Drop zdjęć: ${e.dataTransfer.files.length}`);
          handleFiles(e.dataTransfer.files, loadCustomImages);
        }
      });
      uploadArea.querySelector('.file-label').addEventListener("click", (e) => {
        e.preventDefault();
        imageInput.click();
      });
    } else {
      console.error("Nie znaleziono elementów: imageInput lub uploadArea");
      document.getElementById('debug').innerText = "Błąd: Brak elementów do obsługi zdjęć";
    }
    const bannerFileInput = document.getElementById("bannerFileInput");
    const bannerUpload = document.getElementById("bannerUpload");
    if (bannerFileInput && bannerUpload) {
      bannerFileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          console.log(`Zmiana w bannerFileInput, pliki: ${e.target.files.length}`);
          handleFiles(e.target.files, loadCustomBanner);
        }
      });
      bannerUpload.addEventListener("dragover", (e) => {
        e.preventDefault();
        bannerUpload.classList.add("dragover");
      });
      bannerUpload.addEventListener("dragleave", () => {
        bannerUpload.classList.remove("dragover");
      });
      bannerUpload.addEventListener("drop", (e) => {
        e.preventDefault();
        bannerUpload.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
          console.log(`Drop banera: ${e.dataTransfer.files.length}`);
          handleFiles(e.dataTransfer.files, loadCustomBanner);
        }
      });
      bannerUpload.querySelector('.file-label').addEventListener("click", (e) => {
        e.preventDefault();
        bannerFileInput.click();
      });
    } else {
      console.error("Nie znaleziono elementów: bannerFileInput lub bannerUpload");
      document.getElementById('debug').innerText = "Błąd: Brak elementów do obsługi banera";
    }
    const backgroundFileInput = document.getElementById("backgroundFileInput");
    const backgroundUpload = document.getElementById("backgroundUpload");
    if (backgroundFileInput && backgroundUpload) {
      backgroundFileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          console.log(`Zmiana w backgroundFileInput, pliki: ${e.target.files.length}`);
          handleFiles(e.target.files, loadCustomBackground);
        }
      });
      backgroundUpload.addEventListener("dragover", (e) => {
        e.preventDefault();
        backgroundUpload.classList.add("dragover");
      });
      backgroundUpload.addEventListener("dragleave", () => {
        backgroundUpload.classList.remove("dragover");
      });
      backgroundUpload.addEventListener("drop", (e) => {
        e.preventDefault();
        backgroundUpload.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
          console.log(`Drop tła: ${e.dataTransfer.files.length}`);
          handleFiles(e.dataTransfer.files, loadCustomBackground);
        }
      });
      backgroundUpload.querySelector('.file-label').addEventListener("click", (e) => {
        e.preventDefault();
        backgroundFileInput.click();
      });
    } else {
      console.error("Nie znaleziono elementów: backgroundFileInput lub backgroundUpload");
      document.getElementById('debug').innerText = "Błąd: Brak elementów do obsługi tła";
    }
    const coverFileInput = document.getElementById("coverFileInput");
    const coverUpload = document.getElementById("coverUpload");
    if (coverFileInput && coverUpload) {
      coverFileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          console.log(`Zmiana w coverFileInput, pliki: ${e.target.files.length}`);
          handleFiles(e.target.files, loadCustomCover);
        }
      });
      coverUpload.addEventListener("dragover", (e) => {
        e.preventDefault();
        coverUpload.classList.add("dragover");
      });
      coverUpload.addEventListener("dragleave", () => {
        coverUpload.classList.remove("dragover");
      });
      coverUpload.addEventListener("drop", (e) => {
        e.preventDefault();
        coverUpload.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
          console.log(`Drop okładki: ${e.dataTransfer.files.length}`);
          handleFiles(e.dataTransfer.files, loadCustomCover);
        }
      });
      coverUpload.querySelector('.file-label').addEventListener("click", (e) => {
        e.preventDefault();
        coverFileInput.click();
      });
    } else {
      console.error("Nie znaleziono elementów: coverFileInput lub coverUpload");
      document.getElementById('debug').innerText = "Błąd: Brak elementów do obsługi okładki";
    }
    const excelFileInput = document.getElementById("excelFile");
    const fileLabelWrapper = document.querySelector(".file-label-wrapper");
    if (excelFileInput && fileLabelWrapper) {
      excelFileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          console.log(`Zmiana w excelFileInput, plik: ${e.target.files[0].name}`);
          importExcel();
        }
      });
      fileLabelWrapper.addEventListener("click", (e) => {
        e.preventDefault();
        excelFileInput.click();
      });
    } else {
      console.error("Nie znaleziono elementów: excelFileInput lub fileLabelWrapper");
      document.getElementById('debug').innerText = "Błąd: Brak elementów do obsługi importu Excel";
    }
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        window.globalCurrency = e.target.value;
        console.log(`Zmieniono walutę na: ${window.globalCurrency}`);
        window.currentPage = 0; // Reset strony po zmianie waluty
        window.renderCatalog();
      });
    }
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        window.globalLanguage = e.target.value;
        console.log(`Zmieniono język na: ${window.globalLanguage}`);
        window.currentPage = 0; // Reset strony po zmianie języka
        window.renderCatalog();
      });
    }
    const layoutSelect = document.getElementById('layoutSelect');
    if (layoutSelect) {
      layoutSelect.addEventListener('change', (e) => {
        window.currentPage = 0; // Reset strony po zmianie układu
        window.renderCatalog();
      });
    }
    const pageEditButton = document.createElement('button');
    pageEditButton.className = 'btn-secondary';
    pageEditButton.innerHTML = '<i class="fas fa-file-alt"></i> Edytuj stronę PDF';
    pageEditButton.onclick = () => {
      console.log('Kliknięto Edytuj stronę PDF');
      window.showPageEditModal(window.currentPage);
    };
    document.querySelector('.improved-panel').appendChild(pageEditButton);
    const previewButton = document.getElementById('previewButton');
    if (previewButton) {
      previewButton.addEventListener('click', () => {
        console.log('Kliknięto Podgląd PDF');
        if (typeof window.previewPDF === 'function') {
          window.previewPDF();
        } else {
          console.error('Funkcja previewPDF nie jest zdefiniowana');
          document.getElementById('debug').innerText = "Błąd: Funkcja podglądu PDF nie jest dostępna";
        }
      });
    } else {
      console.error("Nie znaleziono elementu previewButton");
      document.getElementById('debug').innerText = "Błąd: Brak przycisku podglądu PDF";
    }
    window.loadProducts();
  } catch (e) {
    console.error('Błąd inicjalizacji zdarzeń DOM:', e);
    document.getElementById('debug').innerText = `Błąd inicjalizacji zdarzeń DOM: ${e.message}`;
  }
});
window.importExcel = importExcel;
window.renderCatalog = renderCatalog;
window.showBannerModal = showBannerModal;
window.hideBannerModal = hideBannerModal;
window.loadBanners = loadBanners;
window.selectBanner = selectBanner;
window.loadProducts = loadProducts;
window.showPage = showPage;
