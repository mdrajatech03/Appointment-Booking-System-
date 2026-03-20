// 1. Firebase Configuration (Updated from your image)
const firebaseConfig = {
  apiKey: "AIzaSyD-Iqgk4mxo-kh3lPEJnZ8M3LZTGs8CWEI",
  authDomain: "appointment-booking-syst-58963.firebaseapp.com",
  projectId: "appointment-booking-syst-58963",
  storageBucket: "appointment-booking-syst-58963.firebasestorage.app",
  messagingSenderId: "494502187842",
  appId: "1:494502187842:web:195a5d7a5a4441e1daeedb",
  measurementId: "G-CK2KR0D0BK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. Data for 10 Items
const items = [
    { id: 1, name: "Premium Consultant", price: 1500, img: "https://picsum.photos/400/250?random=1" },
    { id: 2, name: "Web Development", price: 5000, img: "https://picsum.photos/400/250?random=2" },
    { id: 3, name: "Graphic Design", price: 2000, img: "https://picsum.photos/400/250?random=3" },
    { id: 4, name: "SEO Optimization", price: 2500, img: "https://picsum.photos/400/250?random=4" },
    { id: 5, name: "App Debugging", price: 1200, img: "https://picsum.photos/400/250?random=5" },
    { id: 6, name: "Cloud Server Setup", price: 4500, img: "https://picsum.photos/400/250?random=6" },
    { id: 7, name: "Digital Marketing", price: 3500, img: "https://picsum.photos/400/250?random=7" },
    { id: 8, name: "Content Writing", price: 800, img: "https://picsum.photos/400/250?random=8" },
    { id: 9, name: "Security Audit", price: 6000, img: "https://picsum.photos/400/250?random=9" },
    { id: 10, name: "UI/UX Review", price: 1800, img: "https://picsum.photos/400/250?random=10" }
];

let selectedItem = null;

// Page Navigation Logic
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    window.scrollTo(0,0);
}

// Render Services to Home Page
const itemList = document.getElementById('item-list');
items.forEach(item => {
    itemList.innerHTML += `
        <div class="card">
            <img src="${item.img}" class="card-img" alt="${item.name}">
            <div class="card-body">
                <h3 class="card-title">${item.name}</h3>
                <p class="price">₹${item.price}</p>
                <button class="btn-book" onclick="openBooking(${item.id})">Book Appointment</button>
            </div>
        </div>
    `;
});

// Modal Logic
function openBooking(id) {
    selectedItem = items.find(i => i.id === id);
    document.getElementById('item-info').innerHTML = `
        <h2 style="color:var(--primary);">${selectedItem.name}</h2>
        <p>Expert professional service at your doorstep.</p>
        <p class="price" style="font-size:1.6rem;">Rate: ₹${selectedItem.price}</p>
    `;
    document.getElementById('booking-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('booking-modal').classList.remove('active');
}

// Form Submission & Firebase Upload
document.getElementById('appointment-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const customerData = {
        name: document.getElementById('custName').value,
        address: document.getElementById('custAddress').value,
        mobile: document.getElementById('custMobile').value,
        service: selectedItem.name,
        price: selectedItem.price,
        timestamp: new Date()
    };

    try {
        const docRef = await db.collection("appointments").add(customerData);
        alert("Success! Your appointment is booked.");
        
        // Generate PDF Slip
        generatePDF(docRef.id, customerData);
        
        closeModal();
        e.target.reset();
    } catch (err) {
        console.error("Firebase Error:", err);
        alert("Booking Failed. Please check internet or Firebase rules.");
    }
};

// PDF Slip Logic
function generatePDF(id, data) {
    document.getElementById('slip-id').innerText = id.substring(0, 8).toUpperCase();
    document.getElementById('slip-name').innerText = data.name;
    document.getElementById('slip-mobile').innerText = data.mobile;
    document.getElementById('slip-address').innerText = data.address;
    document.getElementById('slip-item').innerText = data.service;
    document.getElementById('slip-date').innerText = new Date().toLocaleString();

    const element = document.getElementById('booking-slip');
    const opt = {
        margin: 0.5,
        filename: `Appointment_${data.name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

// Admin Panel Security
const ADMIN_PASSWORD = "admin123"; // Aap ise yaha se badal sakte hain

function checkAdminPass() {
    const entered = document.getElementById('adminPass').value;
    if (entered === ADMIN_PASSWORD) {
        document.getElementById('admin-login-box').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        fetchAdminData();
    } else {
        alert("Galat Password! Dubara koshish karein.");
    }
}

async function fetchAdminData() {
    const snapshot = await db.collection("appointments").orderBy("timestamp", "desc").get();
    const tbody = document.getElementById('admin-data');
    tbody.innerHTML = "";
    
    snapshot.forEach(doc => {
        const d = doc.data();
        const dateStr = d.timestamp ? d.timestamp.toDate().toLocaleDateString() : 'N/A';
        tbody.innerHTML += `
            <tr>
                <td>${d.name}</td>
                <td>${d.mobile}</td>
                <td>${d.service}</td>
                <td>${dateStr}</td>
            </tr>
        `;
    });
}

function adminLogout() {
    document.getElementById('admin-login-box').style.display = 'block';
    document.getElementById('admin-content').style.display = 'none';
    document.getElementById('adminPass').value = "";
}
