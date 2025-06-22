// =====================================================================
// FILE SCRIPT.JS FINAL - VERSI LENGKAP DAN STABIL
// =====================================================================

// Bagian 0: Import dari Firebase
import { db } from './firebase-init.js';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {

    // =====================================================================
    // BAGIAN 1: VARIABEL GLOBAL & PENGATURAN AWAL
    // =====================================================================

    let productsDB = [];
    let musimAktif = 'default';
    const seasonalSlogans = {
        sekolah: "Produk Musiman: Kembali ke Sekolah!",
        lebaran: "Spesial Lebaran Penuh Berkah",
        remaja: "Gaya Trendy Kekinian untuk Kamu"
    };
    let notificationTimeout;

    // =====================================================================
    // BAGIAN 2: KUMPULAN SEMUA FUNGSI APLIKASI
    // =====================================================================

    // --- Fungsi UI & Notifikasi ---
    function showCustomNotification(message) {
        const notification = document.getElementById('cart-notification');
        if (!notification) return;
        clearTimeout(notificationTimeout);
        notification.textContent = message;
        notification.classList.add('show');
        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
        }, 2500);
    }

    // --- Fungsi Pengelola Keranjang (Cart) ---
    function getCart() {
        const cart = localStorage.getItem('tokoMinimalisCart');
        return cart ? JSON.parse(cart) : [];
    }

    function saveCart(cart) {
        localStorage.setItem('tokoMinimalisCart', JSON.stringify(cart));
    }

    function updateCartIcon() {
        const cart = getCart();
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        const cartBadge = document.getElementById('cart-item-count');
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            if (totalItems > 0) {
                cartBadge.classList.remove('hidden');
            } else {
                cartBadge.classList.add('hidden');
            }
        }
    }

    function addToCart(productId) {
        let cart = getCart();
        const existingProduct = cart.find(item => item.productId === productId);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push({ productId: productId, quantity: 1 });
        }
        saveCart(cart);
        updateCartIcon();
        showCustomNotification('Ditambahkan!');
    }

    function removeFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.productId !== productId);
        saveCart(cart);
        updateCartIcon();
        renderCartItems();
        if (document.getElementById('cart-page-container')) {
            renderCartPage();
        }
    }

    function updateQuantity(productId, change) {
        let cart = getCart();
        const productInCart = cart.find(item => item.productId === productId);
        if (productInCart) {
            productInCart.quantity += change;
            if (productInCart.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart(cart);
                updateCartIcon();
                renderCartItems();
                if (document.getElementById('cart-page-container')) {
                    renderCartPage();
                }
            }
        }
    }

    // --- Fungsi untuk Render Komponen ---
    function createFeaturedCard(product) {
        return `<a href="detail-produk.html?id=${product.id}" class="product-card"><img src="${product.gambar}" alt="${product.nama}"><div class="card-label">${product.kategori.toUpperCase()}</div></a>`;
    }

    function createGridCard(product) {
        const formattedPrice = `Rp${product.harga.toLocaleString('id-ID')}`;
        return `<a href="detail-produk.html?id=${product.id}" class="grid-product-card"><img src="${product.gambar}" alt="${product.nama}"><div class="grid-card-info"><h3>${product.nama}</h3><p class="price">${formattedPrice}</p></div></a>`;
    }

    function renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        if (!cartItemsContainer) return;
        const cart = getCart();
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Keranjang Anda masih kosong.</p>';
        } else {
            cart.forEach(item => {
                const product = productsDB.find(p => p.id === item.productId);
                if (product) {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'cart-item';
                    itemElement.innerHTML = `
                        <div class="cart-item-image"><img src="${product.gambar}" alt="${product.nama}"></div>
                        <div class="cart-item-info">
                            <h4>${product.nama}</h4>
                            <p class="price">Rp${product.harga.toLocaleString('id-ID')}</p>
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button class="quantity-btn btn-decrease" data-product-id="${product.id}">-</button>
                                <span class="item-quantity">${item.quantity}</span>
                                <button class="quantity-btn btn-increase" data-product-id="${product.id}">+</button>
                            </div>
                            <button class="remove-item-btn" data-product-id="${product.id}" title="Hapus item"><i class="fas fa-trash-alt"></i></button>
                        </div>`;
                    cartItemsContainer.appendChild(itemElement);
                }
            });
        }
        updateCartTotal();
    }

    function updateCartTotal() {
        const cart = getCart();
        const totalContainer = document.getElementById('cart-total-container');
        const totalPriceEl = document.getElementById('cart-total-price');
        if (!totalContainer || !totalPriceEl) return;
        if (cart.length === 0) {
            totalContainer.style.visibility = 'hidden';
            return;
        }
        totalContainer.style.visibility = 'visible';
        let totalPrice = 0;
        cart.forEach(item => {
            const product = productsDB.find(p => p.id === item.productId);
            if (product) {
                totalPrice += product.harga * item.quantity;
            }
        });
        totalPriceEl.textContent = `Rp${totalPrice.toLocaleString('id-ID')}`;
    }
    
    // --- Fungsi Pencarian ---
    function displaySearchResults(results) { const resultsContainer = document.getElementById('search-results-dropdown'); if (!resultsContainer) return; resultsContainer.innerHTML = ''; if (results.length === 0 && document.querySelector('#header-search-bar input').value.length > 1) { resultsContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--color-text-secondary);">Produk tidak ditemukan.</p>'; return; } results.forEach(product => { const resultElement = document.createElement('a'); resultElement.href = `detail-produk.html?id=${product.id}`; resultElement.className = 'search-result-item'; resultElement.innerHTML = `<img src="${product.gambar}" alt="${product.nama}"><span>${product.nama}</span>`; resultsContainer.appendChild(resultElement); }); }
    function handleSearchInput(e) { const query = e.target.value.toLowerCase(); const resultsContainer = document.getElementById('search-results-dropdown'); if (!resultsContainer) return; if (query.length > 1) { const filteredProducts = productsDB.filter(product => product.nama.toLowerCase().includes(query)); displaySearchResults(filteredProducts); resultsContainer.classList.add('active'); } else { resultsContainer.classList.remove('active'); } }
    
    // --- Fungsi Render Halaman ---
    function getQueryParam(param) { const urlParams = new URLSearchParams(window.location.search); return urlParams.get(param) ? decodeURIComponent(urlParams.get(param)) : null; }
    function renderHomePage() { const limitProdukMusiman = 4; const featuredContainer = document.querySelector('.product-carousel'); if (featuredContainer) { const featuredProducts = productsDB.filter(p => p.isUnggulan === true); featuredContainer.innerHTML = featuredProducts.map(createFeaturedCard).join(''); initializeFeaturedCarousel(); } const seasonalGrid = document.querySelector('.seasonal-section .product-grid'); const seasonalTitle = document.querySelector('.seasonal-section h2'); const seeMoreButton = document.querySelector('.seasonal-section .see-more-btn'); if (seasonalGrid && seasonalTitle && seeMoreButton) { const slogan = seasonalSlogans[musimAktif]; seasonalTitle.textContent = slogan ? slogan : "Produk Pilihan Musiman"; const seasonalProducts = productsDB.filter(product => product.tagMusiman === musimAktif).slice(0, limitProdukMusiman); seasonalGrid.innerHTML = seasonalProducts.map(createGridCard).join(''); seeMoreButton.href = `produk-musiman.html?musim=${musimAktif}`; } }
    function renderSeasonalPage() { const seasonFromURL = getQueryParam('musim'); const titleElement = document.getElementById('seasonal-page-title'); const gridElement = document.getElementById('seasonal-products-grid'); if (!seasonFromURL || !titleElement || !gridElement) return; const slogan = seasonalSlogans[seasonFromURL] || "Produk Pilihan"; titleElement.textContent = slogan; const allSeasonalProducts = productsDB.filter(p => p.tagMusiman === seasonFromURL); if (allSeasonalProducts.length > 0) { gridElement.innerHTML = allSeasonalProducts.map(createGridCard).join(''); } else { gridElement.innerHTML = `<p>Produk untuk musim ini tidak ditemukan.</p>`; } }
    function renderAllProductsPage() { const gridElement = document.getElementById('all-products-grid'); if (!gridElement) return; const allProducts = productsDB; if (allProducts.length > 0) { gridElement.innerHTML = allProducts.map(createGridCard).join(''); } else { gridElement.innerHTML = "<p>Belum ada produk untuk ditampilkan.</p>"; } }
    function renderCategoryPage() { const categoryName = getQueryParam('nama'); const titleElement = document.getElementById('kategori-page-title'); const gridElement = document.getElementById('kategori-products-grid'); if (!categoryName || !titleElement || !gridElement) return; const pageTitle = `Kategori: ${categoryName}`; titleElement.textContent = pageTitle; document.title = pageTitle; const productsInCategory = productsDB.filter(p => p.kategori === categoryName); if (productsInCategory.length > 0) { gridElement.innerHTML = productsInCategory.map(createGridCard).join(''); } else { gridElement.innerHTML = `<p>Tidak ada produk dalam kategori "${categoryName}".</p>`; } }
    function renderDetailPage() { const productId = getQueryParam('id'); const container = document.getElementById('product-detail-container'); if (!productId) { container.innerHTML = "<h1>404: ID Produk tidak ditemukan di URL.</h1>"; return; } const product = productsDB.find(p => p.id === productId); if (!product) { container.innerHTML = `<h1>404: Produk dengan ID "${productId}" tidak ditemukan.</h1>`; return; } document.title = product.nama; document.getElementById('product-image').src = product.gambar; document.getElementById('product-image').alt = product.nama; document.getElementById('product-name').textContent = product.nama; document.getElementById('product-price').textContent = `Rp${product.harga.toLocaleString('id-ID')}`; document.getElementById('product-description').textContent = product.deskripsi; const addToCartButton = document.querySelector('.btn-keranjang'); if (addToCartButton) { addToCartButton.addEventListener('click', () => { addToCart(product.id); }); } }
    function renderCartPage() { const cartItemsContainer = document.getElementById('cart-page-items'); const summarySubtotal = document.getElementById('summary-subtotal'); const summaryTotal = document.getElementById('summary-total'); const cartPageContainer = document.getElementById('cart-page-container'); if (!cartItemsContainer) return; const cart = getCart(); cartItemsContainer.innerHTML = ''; if (cart.length === 0) { cartPageContainer.innerHTML = '<p class="empty-cart-msg" style="text-align:center; padding: 40px 0;">Keranjang Anda masih kosong. <br><br><a href="index.html" style="color: var(--color-accent-primary); text-decoration: underline;">Mulai belanja</a></p>'; return; } let subtotal = 0; cart.forEach(item => { const product = productsDB.find(p => p.id === item.productId); if (product) { subtotal += product.harga * item.quantity; const itemElement = document.createElement('div'); itemElement.className = 'cart-item'; itemElement.innerHTML = `<div class="cart-item-image"><img src="${product.gambar}" alt="${product.nama}"></div><div class="cart-item-info"><h4>${product.nama}</h4><p class="price">Rp${product.harga.toLocaleString('id-ID')}</p></div><div class="cart-item-actions"><div class="quantity-control"><button class="quantity-btn btn-decrease" data-product-id="${product.id}">-</button><span class="item-quantity">${item.quantity}</span><button class="quantity-btn btn-increase" data-product-id="${product.id}">+</button></div><button class="remove-item-btn" data-product-id="${product.id}" title="Hapus item"><i class="fas fa-trash-alt"></i></button></div>`; cartItemsContainer.appendChild(itemElement); } }); summarySubtotal.textContent = `Rp${subtotal.toLocaleString('id-ID')}`; summaryTotal.textContent = `Rp${subtotal.toLocaleString('id-ID')}`; }
    function renderCheckoutPage() {
        const checkoutItemsContainer = document.getElementById('checkout-items-list');
        const checkoutTotalPriceEl = document.getElementById('checkout-total-price');
        const checkoutForm = document.getElementById('checkout-form');
        if (!checkoutForm) return;
        const cart = getCart();
        if (cart.length === 0) {
            document.querySelector('.main-content-wrapper').innerHTML = '<p class="empty-cart-msg" style="text-align:center; padding: 40px 0;">Keranjang Anda kosong untuk di-checkout. <br><br><a href="index.html" style="color: var(--color-accent-primary); text-decoration: underline;">Kembali belanja</a></p>';
            return;
        }
        let totalPrice = 0;
        checkoutItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const product = productsDB.find(p => p.id === item.productId);
            if (product) {
                totalPrice += product.harga * item.quantity;
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `<div class="cart-item-info"><h4>${item.quantity}x ${product.nama}</h4></div><p class="price">Rp${(product.harga * item.quantity).toLocaleString('id-ID')}</p>`;
                checkoutItemsContainer.appendChild(itemElement);
                // --- LOGIKA UNTUK TAMPILAN PEMILIHAN PEMBAYARAN ---
        const paymentOptions = document.querySelectorAll('.payment-option');
        const paymentInstructions = document.getElementById('payment-instructions');
        const confirmBtn = document.getElementById('confirm-order-btn');

        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Hapus kelas 'selected' dari semua pilihan
                paymentOptions.forEach(opt => opt.classList.remove('selected'));
                // Tambahkan kelas 'selected' ke pilihan yang diklik
                option.classList.add('selected');

                const selectedMethod = option.dataset.method;
                let instructionsHTML = '';

                if (selectedMethod === 'qris') {
                    instructionsHTML = `
                        <p>Silakan pindai (scan) kode QRIS di bawah ini dengan aplikasi E-Wallet atau M-Banking Anda.</p>
                        <img src="https://i.imgur.com/example-qris.png" alt="Contoh QRIS" style="max-width: 200px; display: block; margin: 16px auto;">
                        <p><strong>Total: ${checkoutTotalPriceEl.textContent}</strong></p>
                    `;
                } else if (selectedMethod === 'bank-jago') {
                    instructionsHTML = `
                        <p>Silakan transfer ke rekening berikut:</p>
                        <p><strong>Bank Jago</strong><br>
                        No. Rek: <strong>123-456-7890</strong><br>
                        Atas Nama: <strong>Toko Marsi</strong></p>
                        <p style="margin-top: 8px;">Total: <strong>${checkoutTotalPriceEl.textContent}</strong></p>
                    `;
                }

                paymentInstructions.innerHTML = instructionsHTML;
                paymentInstructions.classList.add('active');
                confirmBtn.disabled = false; // Aktifkan tombol konfirmasi
            });
        });
        
        // Awalnya tombol konfirmasi dinonaktifkan sampai metode pembayaran dipilih
        confirmBtn.disabled = true;
        }
        });
        checkoutTotalPriceEl.textContent = `Rp${totalPrice.toLocaleString('id-ID')}`;
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const customerName = document.getElementById('customer-name').value;
            const customerPhone = document.getElementById('customer-phone').value;
            const customerAddress = document.getElementById('customer-address').value;
            const confirmBtn = document.getElementById('confirm-order-btn');
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Memproses...';
            const orderData = { customerName, customerPhone, customerAddress, items: getCart(), totalPrice, status: 'Baru', createdAt: serverTimestamp() };
            try {
                const docRef = await addDoc(collection(db, "orders"), orderData);
                localStorage.removeItem('tokoMinimalisCart');
                updateCartIcon();
                alert('Terima kasih! Pesanan Anda telah diterima.');
                window.location.href = 'index.html';
            } catch (error) {
                console.error("Error menyimpan pesanan: ", error);
                alert('Terjadi kesalahan saat menyimpan pesanan Anda.');
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Konfirmasi & Kirim Pesanan';
            }
        });
    }

    // --- Fungsi Komponen Lain ---
    function initializeFeaturedCarousel() { const carousel = document.querySelector('.product-carousel'); if (!carousel) return; const cards = carousel.querySelectorAll('.product-card'); if (cards.length === 0) return; let currentIndex = 0; const numCards = cards.length; function updateCarousel() { cards.forEach((card, index) => { let offset = index - currentIndex; if (Math.abs(offset) > numCards / 2) { offset > 0 ? offset -= numCards : offset += numCards; } let transform = ""; let opacity = "0"; let zIndex = 0; let direction = offset > 0 ? 1 : -1; if (offset === 0) { transform = "translateX(-50%) scale(1)"; opacity = "1"; zIndex = 10; } else if (offset === 1 || offset === -1) { transform = `translateX(${-50 + 60 * direction}%) scale(0.7) translateZ(-150px)`; opacity = "0.6"; zIndex = 9; } else { transform = `translateX(${-50 + 80 * direction}%) scale(0.5) translateZ(-300px)`; opacity = "0"; zIndex = 8; } card.style.transform = transform; card.style.opacity = opacity; card.style.zIndex = zIndex; }); } let isDragging = false, startX, dragThreshold = 50; function startDrag(e) { isDragging = true; startX = e.pageX || e.touches[0].pageX; } function endDrag(e) { if (!isDragging) return; isDragging = false; const endX = e.pageX || e.changedTouches[0].pageX; const diff = endX - startX; if (Math.abs(diff) > dragThreshold) { diff < 0 ? currentIndex = (currentIndex + 1) % numCards : currentIndex = (currentIndex - 1 + numCards) % numCards; updateCarousel(); } } updateCarousel(); carousel.addEventListener("mousedown", startDrag); carousel.addEventListener("mouseup", endDrag); carousel.addEventListener("mouseleave", endDrag); carousel.addEventListener("touchstart", startDrag); carousel.addEventListener("touchend", endDrag); }
    function setupPanel(buttonId, overlayId, panelId) { const button = document.getElementById(buttonId); const overlay = document.getElementById(overlayId); const panel = document.getElementById(panelId); function closeAllSidePanels() { document.querySelectorAll('.panel-container, .overlay-background').forEach(el => { if (el.id !== 'cart-panel' && el.id !== 'panel-overlay') { el.classList.remove('active'); } }); } if (button && overlay && panel) { const closeBtn = panel.querySelector('.close-btn'); const openPanel = (event) => { event.preventDefault(); closeAllSidePanels(); overlay.classList.add('active'); panel.classList.add('active'); }; const closePanel = () => { overlay.classList.remove('active'); panel.classList.remove('active'); }; button.addEventListener('click', openPanel); if (closeBtn) closeBtn.addEventListener('click', closePanel); overlay.addEventListener('click', closePanel); } }

    // =====================================================================
    // BAGIAN 4: FUNGSI UTAMA & PROSES INISIALISASI
    // =====================================================================
    
    function main() {
        const route = () => {
            if (document.querySelector('.product-carousel')) renderHomePage();
            else if (document.getElementById('seasonal-products-grid')) renderSeasonalPage();
            else if (document.getElementById('all-products-grid')) renderAllProductsPage();
            else if (document.getElementById('product-detail-container')) renderDetailPage();
            else if (document.getElementById('kategori-products-grid')) renderCategoryPage();
            else if (document.getElementById('cart-page-container')) renderCartPage();
            else if (document.getElementById('checkout-form')) renderCheckoutPage();
        };
        route();

        updateCartIcon();
        setupPanel('kategori-btn', 'categoryOverlay', 'categoryPanel');
        setupPanel('info-btn', 'infoOverlay', 'infoPanel');
        // --- PENAMBAHAN KEMBALI KODE UNTUK MENGAKTIFKAN PANEL PENCARIAN ---
        const headerSearchInput = document.querySelector('#header-search-bar input');
        const searchResultsDropdown = document.getElementById('search-results-dropdown');

        if (headerSearchInput && searchResultsDropdown) {
            // Jalankan pencarian setiap kali pengguna mengetik
            headerSearchInput.addEventListener('input', handleSearchInput);

            // Sembunyikan hasil pencarian saat input tidak lagi fokus
            headerSearchInput.addEventListener('blur', () => {
                // Beri jeda sedikit agar proses klik pada hasil pencarian bisa berjalan
                setTimeout(() => {
                    searchResultsDropdown.classList.remove('active');
                }, 200);
            });

            // Tampilkan kembali jika pengguna kembali fokus ke input
            headerSearchInput.addEventListener('focus', handleSearchInput);
        }
        
        const infoSliderWrapper = document.querySelector('.info-slider .slider-wrapper');
        if (infoSliderWrapper) { let infoSlides = document.querySelectorAll('.info-slider .slide'); if (infoSlides.length > 0) { let infoCurrentIndex = 1; const totalRealSlides = infoSlides.length; let slideInterval; const firstClone = infoSlides[0].cloneNode(!0), lastClone = infoSlides[totalRealSlides - 1].cloneNode(!0); infoSliderWrapper.appendChild(firstClone); infoSliderWrapper.prepend(lastClone); infoSlides = document.querySelectorAll(".info-slider .slide"); function silentTranslate() { infoSliderWrapper.style.transition = "none"; infoSliderWrapper.style.transform = `translateX(-${100 * infoCurrentIndex}%)`; requestAnimationFrame(() => { requestAnimationFrame(() => { infoSliderWrapper.style.transition = "transform 0.5s ease-in-out" }) }) } silentTranslate(); function startInterval() { slideInterval = setInterval(() => { infoCurrentIndex++; infoSliderWrapper.style.transform = `translateX(-${100 * infoCurrentIndex}%)` }, 8000) } infoSliderWrapper.addEventListener("transitionend", () => { if (infoCurrentIndex >= totalRealSlides + 1) { infoCurrentIndex = 1; silentTranslate(); } else if (infoCurrentIndex <= 0) { infoCurrentIndex = totalRealSlides; silentTranslate(); } }); startInterval(); } }
        
        const cartPanel = document.getElementById('cart-panel');
        const panelOverlay = document.getElementById('panel-overlay');
        const closeCartBtn = document.getElementById('close-cart-btn');
        const cartIcon = document.querySelector('.header-cart-icon');
        const cartItemsContainerPanel = document.getElementById('cart-items-container');
        const checkoutBtnInPanel = document.getElementById('checkout-btn');
        
        function openCartPanel(e) { e.preventDefault(); renderCartItems(); cartPanel.classList.add('active'); panelOverlay.classList.add('active'); }
        function closeCartPanel() { cartPanel.classList.remove('active'); panelOverlay.classList.remove('active'); }

        if (cartIcon) cartIcon.addEventListener('click', openCartPanel);
        if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartPanel);
        if (panelOverlay) panelOverlay.addEventListener('click', closeCartPanel);

        function handleCartActions(e) {
            const target = e.target;
            const productId = target.closest('[data-product-id]')?.dataset.productId;
            if (!productId) return;
            if (target.closest('.remove-item-btn')) removeFromCart(productId);
            else if (target.closest('.btn-increase')) updateQuantity(productId, 1);
            else if (target.closest('.btn-decrease')) updateQuantity(productId, -1);
        }
        
        if (cartItemsContainerPanel) cartItemsContainerPanel.addEventListener('click', handleCartActions);
        const cartItemsContainerPage = document.getElementById('cart-page-items');
        if (cartItemsContainerPage) cartItemsContainerPage.addEventListener('click', handleCartActions);
        
        if (checkoutBtnInPanel) {
            checkoutBtnInPanel.addEventListener('click', () => {
                if (getCart().length === 0) { alert('Keranjang Anda kosong!'); return; }
                window.location.href = 'checkout.html';
            });
        }
    }

    async function fetchDataAndRender() {
        const loader = document.getElementById('loader');
        if(loader) loader.classList.remove('hidden');
        try {
            const settingsSnap = await getDoc(doc(db, "settings", "siteConfig"));
            if (settingsSnap.exists()) { musimAktif = settingsSnap.data().musimAktif; }
            
            const productsSnapshot = await getDocs(collection(db, "products"));
            productsDB = productsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            
            main(productsDB, musimAktif);
        } catch (error) {
            console.error("Gagal memuat data awal:", error);
            document.body.innerHTML = `<h1>Gagal Memuat Aplikasi</h1><p>Penyebab: ${error.message}.</p>`;
        } finally {
            if(loader) setTimeout(() => loader.classList.add('hidden'), 500); // Beri jeda sedikit sebelum menghilangkan loader
        }
    }

    fetchDataAndRender();
});