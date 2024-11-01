const fs = require('fs');
const path = require('path');

// Ścieżki do plików
const productsFilePath = path.join(__dirname, '..', 'products.json');
const adminHtmlPath = path.join(__dirname, '..', 'admin.html');

// Funkcja do odczytu pliku admin.html
function readAdminHtml() {
  try {
    const data = fs.readFileSync(adminHtmlPath, 'utf-8');
    const start = data.indexOf('<script id="products-data" type="application/json">') + 50;
    const end = data.indexOf('</script>', start);
    const jsonData = data.substring(start, end).trim();
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Błąd podczas odczytu danych z admin.html:", error);
    return null;
  }
}

// Funkcja do aktualizacji products.json
function updateProductsJson(products) {
  try {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
    console.log("Plik products.json został zaktualizowany.");
  } catch (error) {
    console.error("Błąd podczas zapisu products.json:", error);
  }
}

// Główna funkcja
function main() {
  const products = readAdminHtml();
  if (products) {
    updateProductsJson(products);
  } else {
    console.log("Brak danych do zapisania.");
  }
}

main();
