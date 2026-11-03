// LocalStorage Data Initialization
let customers = JSON.parse(localStorage.getItem('wifi_customers')) || [];
let payments = JSON.parse(localStorage.getItem('wifi_payments')) || [];

// Current Date Display
const currentDateEl = document.getElementById('current-date');
if(currentDateEl) {
    currentDateEl.innerText = new Date().toLocaleDateString('bn-BD', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
}

// Tab Switching System
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));

    const targetTab = document.getElementById(tabId + '-tab');
    if(targetTab) targetTab.classList.add('active');

    // Highlight active nav
    event && event.currentTarget && event.currentTarget.classList.add('active');

    // Update Title
    const titles = {
        'dashboard': 'ড্যাশবোর্ড',
        'customers': 'গ্রাহক তালিকা',
        'billing': 'বিল ও পেমেন্ট',
        'reports': 'রিপোর্টসমূহ',
        'settings': 'সেটিংস'
    };
    document.getElementById('page-title').innerText = titles[tabId] || 'ম্যানেজার';

    if(tabId === 'dashboard') updateDashboard();
    if(tabId === 'customers') renderCustomers();
    if(tabId === 'billing') renderBilling();
}

// Modal Controllers
function openCustomerModal(id = null) {
    document.getElementById('customer-modal').style.display = 'flex';
    if(id) {
        document.getElementById('modal-title').innerText = 'গ্রাহক তথ্য আপডেট করুন';
        const cust = customers.find(c => c.id === id);
        if(cust) {
            document.getElementById('c-id').value = cust.id;
            document.getElementById('c-name').value = cust.name;
            document.getElementById('c-room').value = cust.room;
            document.getElementById('c-phone').value = cust.phone;
            document.getElementById('c-whatsapp').value = cust.whatsapp;
            document.getElementById('c-device').value = cust.device;
            document.getElementById('c-bill').value = cust.bill;
        }
    } else {
        document.getElementById('modal-title').innerText = 'নতুন গ্রাহক যোগ করুন';
        document.getElementById('customer-form').reset();
        document.getElementById('c-id').value = '';
    }
}

function closeCustomerModal() {
    document.getElementById('customer-modal').style.display = 'none';
}

function closeReceiptModal() {
    document.getElementById('receipt-modal').style.display = 'none';
}

// Add or Edit Customer Form Submission
document.getElementById('customer-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('c-id').value;
    const name = document.getElementById('c-name').value;
    const room = document.getElementById('c-room').value;
    const phone = document.getElementById('c-phone').value;
    const whatsapp = document.getElementById('c-whatsapp').value;
    const device = document.getElementById('c-device').value;
    const bill = document.getElementById('c-bill').value;

    const currentMonth = new Date().toLocaleString('bn-BD', { month: 'long', year: 'numeric' });

    if(id) {
        // Edit
        customers = customers.map(c => c.id == id ? { ...c, name, room, phone, whatsapp, device, bill } : c);
    } else {
        // New
        const newId = Date.now();
        customers.push({ id: newId, name, room, phone, whatsapp, device, bill });
        payments.push({ customerId: newId, month: currentMonth, status: 'বাকি', amount: bill });
    }

    saveData();
    closeCustomerModal();
    renderCustomers();
    updateDashboard();
});

// Save Data
function saveData() {
    localStorage.setItem('wifi_customers', JSON.stringify(customers));
    localStorage.setItem('wifi_payments', JSON.stringify(payments));
}

// Render Customers List
function renderCustomers() {
    const container = document.getElementById('customer-list-container');
    container.innerHTML = '';
    
    if(customers.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#94a3b8; margin-top:20px;">কোনো গ্রাহক নেই</p>';
        return;
    }

    customers.forEach(c => {
        container.innerHTML += `
            <div class="customer-card">
                <div class="customer-info">
                    <h4>${c.name} (${c.room})</h4>
                    <p><i class="fa-solid fa-phone"></i> ${c.phone} | <i class="fa-solid fa-wifi"></i> ${c.device}</p>
                </div>
                <div class="customer-actions">
                    <button class="action-btn" onclick="openCustomerModal(${c.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete" onclick="deleteCustomer(${c.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

// Search Customers
function searchCustomers() {
    const query = document.getElementById('search-customer').value.toLowerCase();
    const cards = document.querySelectorAll('.customer-card');
    customers.forEach((c, index) => {
        const text = (c.name + c.room + c.phone).toLowerCase();
        cards[index].style.display = text.includes(query) ? 'flex' : 'none';
    });
}

// Delete Customer
function deleteCustomer(id) {
    if(confirm('আপনি কি এই গ্রাহককে মুছে ফেলতে চান?')) {
        customers = customers.filter(c => c.id !== id);
        payments = payments.filter(p => p.customerId !== id);
        saveData();
        renderCustomers();
        updateDashboard();
    }
}

// Render Billing List
function renderBilling() {
    const tbody = document.querySelector('#billing-table tbody');
    tbody.innerHTML = '';

    if(customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8;">কোনো ডেটা পাওয়া যায়নি</td></tr>`;
        return;
    }

    customers.forEach(c => {
        const payment = payments.find(p => p.customerId === c.id);
        const status = payment ? payment.status : 'বাকি';
        const currentMonth = new Date().toLocaleString('bn-BD', { month: 'long', year: 'numeric' });

        tbody.innerHTML += `
            <tr>
                <td><b>${c.name}</b><br><small>${c.room}</small></td>
                <td>${currentMonth}</td>
                <td>৳ ${c.bill}</td>
                <td><span style="color: ${status === 'পরিশোধিত' ? '#10b981' : '#ef4444'}; font-weight:bold;">${status}</span></td>
                <td>
                    ${status === 'বাকি' ? 
                        `<button class="btn-primary" style="padding:4px 8px; font-size:11px; background-color:#10b981;" onclick="markAsPaid(${c.id})">গ্রহণ</button>` : 
                        `<button class="btn-primary" style="padding:4px 8px; font-size:11px;" onclick="showReceipt(${c.id})">রিসিট</button>`
                    }
                </td>
            </tr>
        `;
    });
}

// Mark as Paid
let lastPaidCustomer = null;
function markAsPaid(customerId) {
    payments = payments.map(p => {
        if(p.customerId === customerId) {
            p.status = 'পরিশোধিত';
        }
        return p;
    });
    saveData();
    renderBilling();
    updateDashboard();
    showReceipt(customerId);
}

// Show Receipt Modal
function showReceipt(customerId) {
    const c = customers.find(item => item.id === customerId);
    if(!c) return;
    lastPaidCustomer = c;

    const currentMonth = new Date().toLocaleString('bn-BD', { month: 'long', year: 'numeric' });
    const receiptBody = document.getElementById('receipt-details');
    receiptBody.innerHTML = `
        <p><b>গ্রাহক:</b> ${c.name} (${c.room})</p>
        <p><b>মোবাইল:</b> ${c.phone}</p>
        <p><b>মাস:</b> ${currentMonth}</p>
        <p><b>পরিমাণ:</b> ৳ ${c.bill}</p>
        <p><b>তারিখ:</b> ${new Date().toLocaleDateString('bn-BD')}</p>
        <hr style="border-color:#334155; margin:8px 0;">
        <p style="text-align:right; font-size:11px; color:#94a3b8;">স্বাক্ষর: ওয়াইফাই ম্যানেজার</p>
    `;

    document.getElementById('receipt-modal').style.display = 'flex';
}

// Share on WhatsApp
function shareWhatsApp() {
    if(!lastPaidCustomer) return;
    const message = `আসসালামু আলাইকুম ${lastPaidCustomer.name}, আপনার ${lastPaidCustomer.bill} টাকা ওয়াইফাই বিল সফলভাবে গ্রহণ করা হয়েছে। ধন্যবাদ!`;
    window.open(`https://wa.me/${lastPaidCustomer.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
}

// Update Dashboard Counters
function updateDashboard() {
    document.getElementById('total-customers').innerText = customers.length;
    
    let totalIncome = 0;
    let dueAmount = 0;

    customers.forEach(c => {
        const payment = payments.find(p => p.customerId === c.id);
        if(payment && payment.status === 'পরিশোধিত') {
            totalIncome += Number(c.bill);
        } else {
            dueAmount += Number(c.bill);
        }
    });

    document.getElementById('total-income').innerText = `৳ ${totalIncome}`;
    document.getElementById('due-amount').innerText = `৳ ${dueAmount}`;
}

// Database Export/Import/Clear
function exportDataJSON() {
    const data = { customers, payments };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wifi_manager_backup.json';
    a.click();
}

function clearAllData() {
    if(confirm('সতর্কবাণী: সব ডেটা মুছে যাবে! আপনি কি নিশ্চিত?')) {
        localStorage.clear();
        customers = [];
        payments = [];
        renderCustomers();
        updateDashboard();
        alert('সব ডেটা সফলভাবে মুছে ফেলা হয়েছে।');
    }
}

// Initial Load
updateDashboard();
renderCustomers();
