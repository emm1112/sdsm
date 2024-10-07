document.addEventListener('DOMContentLoaded', () => {
    showSection('purchases');
});

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
}

const inventory = [];
let totalSales = 0; // Variable to keep track of total sales

function handleAddPurchase() {
    const item = document.getElementById('purchaseItem').value.trim();
    const quantity = parseInt(document.getElementById('purchaseQuantity').value);
    const price = parseFloat(document.getElementById('purchasePrice').value);

    if (item && !isNaN(quantity) && !isNaN(price) && quantity > 0 && price > 0) {
        addPurchase(item, quantity, price);
        document.getElementById('purchaseItem').value = '';
        document.getElementById('purchaseQuantity').value = '';
        document.getElementById('purchasePrice').value = '';
        showToast('Purchase added successfully', 'success');
    } else {
        showToast('Please fill in all fields correctly.', 'danger');
    }
}

function addPurchase(item, quantity, price) {
    const existingItem = inventory.find(invItem => invItem.name.toLowerCase() === item.toLowerCase());
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = price;
    } else {
        inventory.push({ name: item, quantity, price });
    }
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    inventoryTableBody.innerHTML = '';
    inventory.forEach(item => {
        inventoryTableBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
            </tr>
        `;
    });
}

function handleProcessSale() {
    const item = document.getElementById('saleItem').value.trim();
    const quantity = parseInt(document.getElementById('saleQuantity').value);

    if (item && !isNaN(quantity) && quantity > 0) {
        const saleResult = processSale(item, quantity);
        document.getElementById('saleItem').value = '';
        document.getElementById('saleQuantity').value = '';

        if (saleResult) {
            showToast('Sale processed successfully', 'success');
        } else {
            showToast('Not enough stock available', 'danger');
        }
    } else {
        showToast('Please fill in all fields correctly.', 'danger');
    }
}

function processSale(item, quantity) {
    const existingItem = inventory.find(invItem => invItem.name.toLowerCase() === item.toLowerCase());
    if (existingItem && existingItem.quantity >= quantity) {
        existingItem.quantity -= quantity;
        totalSales += existingItem.price * quantity; // Update total sales
        updateInventoryDisplay();
        updateCollectionDisplay(); // Update collection display
        return true;
    }
    return false;
}

function updateCollectionDisplay() {
    const collectionSection = document.getElementById('collection');
    collectionSection.innerHTML = `
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h3>Collection</h3>
            </div>
            <div class="card-body">
                <p class="fw-bold">Total Sales: $${totalSales.toFixed(2)}</p>
            </div>
        </div>
    `;
}

function handleGenerateQuotation() {
    const customerName = document.getElementById('customerName').value.trim();
    const itemsText = document.getElementById('quotationItems').value.trim();

    if (customerName && itemsText) {
        const items = itemsText.split('\n').map(line => {
            const [name, quantity] = line.split(':');
            return { name: name.trim(), quantity: parseInt(quantity) };
        });

        if (items.every(item => item.name && !isNaN(item.quantity) && item.quantity > 0)) {
            generateQuotation(customerName, items);
        } else {
            showToast('Please enter item details in the correct format.', 'danger');
        }
    } else {
        showToast('Please fill in all fields.', 'danger');
    }
}

function generateQuotation(customerName, items) {
    let quotationHTML = `<h4>Quotation for ${customerName}</h4><table class="table table-bordered"><thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead><tbody>`;
    let total = 0;

    items.forEach(item => {
        const inventoryItem = inventory.find(invItem => invItem.name.toLowerCase() === item.name.toLowerCase());
        if (inventoryItem) {
            const lineTotal = inventoryItem.price * item.quantity;
            quotationHTML += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>$${inventoryItem.price.toFixed(2)}</td><td>$${lineTotal.toFixed(2)}</td></tr>`;
            total += lineTotal;
        } else {
            quotationHTML += `<tr><td>${item.name}</td><td>${item.quantity}</td><td colspan="2" class="text-danger">Item not in inventory</td></tr>`;
        }
    });

    quotationHTML += `</tbody></table><p class="fw-bold">Total Amount: $${total.toFixed(2)}</p>`;
    document.getElementById('quotationDisplay').innerHTML = quotationHTML;
    showToast('Quotation generated successfully', 'success');
}

function showToast(message, type) {
    const toastContainer = document.createElement('div');
    toastContainer.classList.add('toast', 'align-items-center', `bg-${type}`, 'text-white', 'border-0');
    toastContainer.setAttribute('role', 'alert');
    toastContainer.setAttribute('aria-live', 'assertive');
    toastContainer.setAttribute('aria-atomic', 'true');

    toastContainer.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.body.appendChild(toastContainer);
    const toast = new bootstrap.Toast(toastContainer);
    toast.show();

    toastContainer.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toastContainer);
    });
}
