// LocalStorage Data Initialization
let customers = JSON.parse(localStorage.getItem('wifi_customers')) || [];
let payments = JSON.parse(localStorage.getItem('wifi_payments')) || [];

// Current Date Display
document.getElementById('current-date').innerText = new Date().toLocaleDateString('bn-BD', { 
    year: 'numeric', month: 'long', day: 'numeric' 
});

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));

    document.getElementById(tabId + '-tab').classList.add('active');
    event.currentTarget.classList.add('active');

    if(tabId === 'dashboard') updateDashboard();
    if(tabId === 'customers') renderCustomers();
    if(tabId === 'payments') renderPayments();
}

// Modal Control
function openCustomerModal() {
    document.getElementById('customer-modal').style.display = 'flex';
}
function closeCustomerModal() {
    document.getElementById('customer-modal').style.display = 'none';
}

// Add Customer
document.getElementById('customer-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('c-name').value;
    const room = document.getElementById('c-room').value;
    const phone = document.getElementById('c-phone').value;
    const whatsapp = document.getElementById('c-whatsapp').value;
    const device = document.getElementById('c-device').value;

    const newCustomer = { id: Date.now(), name, room, phone, whatsapp, device };
    customers.push(newCustomer);
    
    // Auto create payment entry for current month
    const currentMonth = new Date().toLocaleString('bn-BD', { month: 'long', year: 'numeric' });
    payments.push({ customerId: newCustomer.id, month: currentMonth, status: 'বাকি' });

    saveData();
    closeCustomerModal();
    this.reset();
    renderCustomers();
    updateDashboard();
});

// Save to LocalStorage
function saveData() {
    localStorage.setItem('wifi_customers', JSON.stringify(customers));
    localStorage.setItem('wifi_payments', JSON.stringify(payments));
}

// Render Customers
function renderCustomers() {
    const tbody = document.querySelector('#customer-table tbody');
    tbody.innerHTML = '';
    customers.forEach((c, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${c.name}</td>
                <td>${c.room}</td>
                <td>${c.phone}</td>
                <td>${c.whatsapp}</td>
                <td>${c.device}</td>
                <td>
                    <button class="btn-primary" style="background-color: #ef4444; padding: 5px 10px;" onclick="deleteCustomer(${c.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

// Delete Customer
function deleteCustomer(id) {
    customers = customers.filter(c => c.id !== id);
    payments = payments.filter(p => p.customerId !== id);
    saveData();
    renderCustomers();
    updateDashboard();
}

// Render Payments
function renderPayments() {
    const tbody = document.querySelector('#payment-table tbody');
    tbody.innerHTML = '';
    customers.forEach(c => {
        const payment = payments.find(p => p.customerId === c.id);
        const status = payment ? payment.status : 'বাকি';
        const currentMonth = new Date().toLocaleString('bn-BD', { month: 'long', year: 'numeric' });
        
        tbody.innerHTML += `
            <tr>
                <td>${c.name}</td>
                <td>${c.room}</td>
                <td>${currentMonth}</td>
                <td><span style="color: ${status === 'পরিশোধিত' ? 'green' : 'red'}; font-weight: bold;">${status}</span></td>
                <td>
                    ${status === 'বাকি' ? 
                        `<button class="btn-primary" style="padding: 5px 10px; background-color: #10b981;" onclick="markAsPaid(${c.id})">টাকা গ্রহণ করুন</button>` : 
                        `<button class="btn-primary" style="padding: 5px 10px; background-color: #64748b;" onclick="sendWhatsApp('${c.whatsapp}', '${c.name}')">হোয়াটসঅ্যাপ রিসিট</button>`
                    }
                </td>
            </tr>
        `;
    });
}

// Mark as Paid & Simulate Receipt
function markAsPaid(customerId) {
    payments = payments.map(p => {
        if(p.customerId === customerId) {
            p.status = 'পরিশোধিত';
        }
        return p;
    });
    saveData();
    renderPayments();
    updateDashboard();
    alert('টাকা সফলভাবে গ্রহণ করা হয়েছে এবং রিসিট আপডেট হয়েছে!');
}

// WhatsApp Message & Receipt Simulation
function WhatsApp(phone, name) {
    const message = `আসসালামু আলাইকুম ${name}, আপনার ওয়াইফাই বিল সফলভাবে গ্রহণ করা হয়েছে। ধন্যবাদ! - ওয়াইফাই ম্যানেজার`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

// Update Dashboard Counters
function updateDashboard() {
    document.getElementById('total-customers').innerText = customers.length;
    const paidCount = payments.filter(p => p.status === 'পরিশোধিত').length;
    document.getElementById('paid-count').innerText = paidCount;
    document.getElementById('due-count').innerText = customers.length - paidCount;
}

// Initial Dashboard Load
updateDashboard();
