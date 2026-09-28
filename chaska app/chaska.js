(function () {
  /* ---------------- DATA ---------------- */
  const MENU = [
    { id: 1, cat: "Biryani", name: "Hyderabadi Chicken Biryani", desc: "Dum-cooked basmati, saffron, fried onions", price: 249, veg: false, rating: 4.5, emoji: "🍛" },
    { id: 2, cat: "Biryani", name: "Veg Dum Biryani", desc: "Mixed vegetables, mint, whole spices", price: 189, veg: true, rating: 4.2, emoji: "🍚" },
    { id: 3, cat: "Biryani", name: "Mutton Biryani", desc: "Slow-cooked mutton, layered rice", price: 319, veg: false, rating: 4.6, emoji: "🍲" },
    { id: 4, cat: "Pizza", name: "Margherita Pizza", desc: "Fresh mozzarella, basil, tomato sauce", price: 229, veg: true, rating: 4.3, emoji: "🍕" },
    { id: 5, cat: "Pizza", name: "Peppy Paneer Pizza", desc: "Paneer, capsicum, red pepper flakes", price: 269, veg: true, rating: 4.4, emoji: "🍕" },
    { id: 6, cat: "Pizza", name: "Chicken Tikka Pizza", desc: "Tandoori chicken, onion, mint mayo", price: 319, veg: false, rating: 4.5, emoji: "🍕" },
    { id: 7, cat: "Burgers", name: "Classic Veg Burger", desc: "Crispy patty, lettuce, cheese, mayo", price: 129, veg: true, rating: 4.1, emoji: "🍔" },
    { id: 8, cat: "Burgers", name: "Spicy Chicken Burger", desc: "Fried chicken, chipotle mayo, slaw", price: 169, veg: false, rating: 4.4, emoji: "🍔" },
    { id: 9, cat: "South Indian", name: "Masala Dosa", desc: "Crisp rice crepe, potato masala, chutney", price: 99, veg: true, rating: 4.6, emoji: "🥞" },
    { id: 10, cat: "South Indian", name: "Idli Sambar (4pc)", desc: "Steamed rice cakes, sambar, coconut chutney", price: 89, veg: true, rating: 4.5, emoji: "🍘" },
    { id: 11, cat: "Chinese", name: "Veg Hakka Noodles", desc: "Wok-tossed noodles, julienne vegetables", price: 159, veg: true, rating: 4.2, emoji: "🍜" },
    { id: 12, cat: "Chinese", name: "Chilli Chicken", desc: "Indo-Chinese style, dry-tossed, capsicum", price: 219, veg: false, rating: 4.5, emoji: "🥡" },
    { id: 13, cat: "Desserts", name: "Gulab Jamun (4pc)", desc: "Soft milk dumplings, cardamom syrup", price: 99, veg: true, rating: 4.7, emoji: "🍮" },
    { id: 14, cat: "Desserts", name: "Chocolate Brownie", desc: "Warm fudge brownie with walnuts", price: 139, veg: true, rating: 4.4, emoji: "🍫" },
    { id: 15, cat: "Beverages", name: "Masala Chai", desc: "Spiced milk tea, freshly brewed", price: 39, veg: true, rating: 4.3, emoji: "☕" },
    { id: 16, cat: "Beverages", name: "Cold Coffee", desc: "Chilled coffee, whipped cream", price: 99, veg: true, rating: 4.2, emoji: "🥤" },
  ];

  const CATEGORIES = [...new Set(MENU.map(m => m.cat))];
  const DELIVERY_FEE = 35;
  const GST_RATE = 0.05;

  let cart = {}; // id -> qty
  let activeCat = "All";
  let deliveryAddress = "";
  let payMethod = "card";

  /* ---------------- RENDER: NAV + GRID ---------------- */
  const catNav = document.getElementById('catNav');
  const menuSection = document.getElementById('menuSection');

  function renderCatNav() {
    const cats = ["All", ...CATEGORIES];
    catNav.innerHTML = cats.map(c =>
      `<button class="cat-chip ${c === activeCat ? 'active' : ''}" data-cat="${c}">${c}</button>`
    ).join('');
    catNav.querySelectorAll('.cat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCat = btn.dataset.cat;
        renderCatNav();
        renderMenu();
      });
    });
  }

  function renderMenu(filterText) {
    const groups = {};
    MENU.forEach(item => {
      if (activeCat !== "All" && item.cat !== activeCat) return;
      if (filterText && !item.name.toLowerCase().includes(filterText.toLowerCase())) return;
      (groups[item.cat] = groups[item.cat] || []).push(item);
    });

    const catOrder = activeCat === "All" ? CATEGORIES : [activeCat];
    let html = "";
    catOrder.forEach(cat => {
      const items = groups[cat];
      if (!items || !items.length) return;
      html += `<div class="section-title"><h2>${cat}</h2><span class="count">${items.length} dishes</span></div>`;
      html += `<div class="grid">`;
      items.forEach(item => {
        const qty = cart[item.id] || 0;
        html += `
          <div class="card">
            <div class="card-img" style="background:${cardBg(item.cat)};">
              <div class="veg-dot ${item.veg ? 'veg' : 'nonveg'}"></div>
              <div class="rating">★ ${item.rating}</div>
              ${item.emoji}
            </div>
            <div class="card-body">
              <h3>${item.name}</h3>
              <div class="desc">${item.desc}</div>
              <div class="card-foot">
                <span class="price">₹${item.price}</span>
                <div id="ctrl-${item.id}">
                  ${qty > 0 ? qtyCtrlHtml(item.id, qty) : `<button class="add-btn" data-add="${item.id}">ADD +</button>`}
                </div>
              </div>
            </div>
          </div>`;
      });
      html += `</div>`;
    });

    if (!html) {
      html = `<div class="empty-cart"><div class="emoji">🍽️</div>No dishes found. Try another search.</div>`;
    }
    menuSection.innerHTML = html;
    bindCardButtons();
  }

  function qtyCtrlHtml(id, qty) {
    return `<div class="qty-ctrl">
      <button data-dec="${id}">−</button>
      <span>${qty}</span>
      <button data-inc="${id}">+</button>
    </div>`;
  }

  const catColors = {
    "Biryani": "#f3e0c8", "Pizza": "#f6d6c4", "Burgers": "#f0e2b8", "South Indian": "#e2ecd7",
    "Chinese": "#f2dede", "Desserts": "#f3dde6", "Beverages": "#dcebe6"
  };

  function cardBg(cat) { return catColors[cat] || "#eee"; }

  function bindCardButtons() {
    menuSection.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => { changeQty(parseInt(btn.dataset.add), 1); });
    });
    menuSection.querySelectorAll('[data-inc]').forEach(btn => {
      btn.addEventListener('click', () => { changeQty(parseInt(btn.dataset.inc), 1); });
    });
    menuSection.querySelectorAll('[data-dec]').forEach(btn => {
      btn.addEventListener('click', () => { changeQty(parseInt(btn.dataset.dec), -1); });
    });
  }

  function changeQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    updateCartCount();
    const ctrl = document.getElementById('ctrl-' + id);
    if (ctrl) {
      const qty = cart[id] || 0;
      ctrl.innerHTML = qty > 0 ? qtyCtrlHtml(id, qty) : `<button class="add-btn" data-add="${id}">ADD +</button>`;
      bindCardButtons();
    }
    if (drawerState !== 'closed') renderDrawer();
    showToast(delta > 0 ? "Added to cart" : "Removed from cart");
  }

  function updateCartCount() {
    const total = Object.values(cart).reduce((a, b) => a + b, 0);
    document.getElementById('cartCount').textContent = total;
  }

  /* ---------------- SEARCH ---------------- */
  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderMenu(e.target.value);
  });

  /* ---------------- LOCATION ---------------- */
  const locPill = document.getElementById('locPill');
  const locVal = document.getElementById('locVal');
  locPill.addEventListener('click', detectLocation);

  function detectLocation() {
    locVal.textContent = "Locating...";
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(3);
          const lon = pos.coords.longitude.toFixed(3);
          deliveryAddress = `Lat ${lat}, Lon ${lon}`;
          locVal.textContent = deliveryAddress;
          showToast("Location detected");
        },
        () => {
          deliveryAddress = "Arera Colony, Bhopal";
          locVal.textContent = deliveryAddress;
          showToast("Using approximate location");
        },
        { timeout: 5000 }
      );
    } else {
      deliveryAddress = "Arera Colony, Bhopal";
      locVal.textContent = deliveryAddress;
    }
  }

  /* ---------------- CART DRAWER ---------------- */
  const overlay = document.getElementById('overlay');
  const drawer = document.getElementById('drawer');
  const drawerTitle = document.getElementById('drawerTitle');
  const drawerBody = document.getElementById('drawerBody');
  const drawerFoot = document.getElementById('drawerFoot');
  let drawerState = 'closed'; // closed | cart | address | payment | success

  document.getElementById('cartOpenBtn').addEventListener('click', () => openDrawer('cart'));
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  function openDrawer(state) {
    drawerState = state;
    overlay.classList.add('show');
    drawer.classList.add('show');
    renderDrawer();
  }

  function closeDrawer() {
    overlay.classList.remove('show');
    drawer.classList.remove('show');
    drawerState = 'closed';
  }

  function cartLines() {
    return Object.entries(cart).map(([id, qty]) => {
      const item = MENU.find(m => m.id === parseInt(id));
      return { ...item, qty };
    });
  }

  function subtotal() { return cartLines().reduce((sum, l) => sum + l.price * l.qty, 0); }

  function renderDrawer() {
    const lines = cartLines();
    if (drawerState === 'cart') {
      drawerTitle.textContent = "Your cart";
      if (!lines.length) {
        drawerBody.innerHTML = `<div class="empty-cart"><div class="emoji">🛒</div>Your cart is empty.<br>Add something tasty!</div>`;
        drawerFoot.innerHTML = "";
        return;
      }
      drawerBody.innerHTML = lines.map(l => `
        <div class="cart-line">
          <div style="font-size:1.4rem;">${l.emoji}</div>
          <div class="ci-name">${l.name}<div class="ci-price">₹${l.price} × ${l.qty}</div></div>
          <div class="qty-ctrl" style="background:var(--cream); border:1px solid var(--line);">
            <button data-dec="${l.id}" style="color:var(--chili);">−</button>
            <span style="color:var(--charcoal);">${l.qty}</span>
            <button data-inc="${l.id}" style="color:var(--chili);">+</button>
          </div>
        </div>`).join('');
      drawerBody.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => changeQty(parseInt(b.dataset.inc), 1)));
      drawerBody.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => changeQty(parseInt(b.dataset.dec), -1)));

      const sub = subtotal();
      const gst = sub * GST_RATE;
      const total = sub + DELIVERY_FEE + gst;
      drawerFoot.innerHTML = `
        <div class="bill-row"><span>Item total</span><span class="mono">₹${sub.toFixed(0)}</span></div>
        <div class="bill-row"><span>Delivery fee</span><span class="mono">₹${DELIVERY_FEE}</span></div>
        <div class="bill-row"><span>GST (5%)</span><span class="mono">₹${gst.toFixed(0)}</span></div>
        <div class="bill-row total"><span>To pay</span><span class="mono">₹${total.toFixed(0)}</span></div>
        <button class="primary-btn" id="toAddress">Proceed to address →</button>`;
      document.getElementById('toAddress').addEventListener('click', () => openDrawer('address'));
    }

    else if (drawerState === 'address') {
      drawerTitle.textContent = "Delivery address";
      drawerBody.innerHTML = `
        <div class="steps"><div class="seg done"></div><div class="seg done"></div><div class="seg"></div></div>
        <div class="field">
          <label>Full name</label>
          <input id="fName" type="text" placeholder="e.g. Aarav Sharma" value="">
        </div>
        <div class="field">
          <label>Phone number</label>
          <input id="fPhone" type="tel" placeholder="10-digit mobile number" maxlength="10">
          <div class="err" id="errPhone">Enter a valid 10-digit phone number.</div>
        </div>
        <div class="field">
          <label>Delivery address</label>
          <input id="fAddr" type="text" placeholder="House no, street, area" value="${deliveryAddress}">
          <div class="locate-btn" id="useLoc">📍 Use current location</div>
        </div>
        <div class="field-row">
          <div class="field"><label>City</label><input id="fCity" type="text" value="Bhopal"></div>
          <div class="field"><label>Pincode</label><input id="fPin" type="text" placeholder="462001" maxlength="6"></div>
        </div>
      `;
      document.getElementById('useLoc').addEventListener('click', () => {
        detectLocation();
        setTimeout(() => { document.getElementById('fAddr').value = deliveryAddress; }, 600);
      });
      const sub = subtotal();
      const total = sub + DELIVERY_FEE + sub * GST_RATE;
      drawerFoot.innerHTML = `
        <div class="bill-row total"><span>To pay</span><span class="mono">₹${total.toFixed(0)}</span></div>
        <button class="primary-btn" id="toPayment">Continue to payment →</button>
        <button class="ghost-btn" id="backCart">← Back to cart</button>`;
      document.getElementById('backCart').addEventListener('click', () => openDrawer('cart'));
      document.getElementById('toPayment').addEventListener('click', () => {
        const phone = document.getElementById('fPhone').value.trim();
        const name = document.getElementById('fName').value.trim();
        const addr = document.getElementById('fAddr').value.trim();
        const phoneOk = /^\d{10}$/.test(phone);
        document.getElementById('errPhone').style.display = phoneOk ? 'none' : 'block';
        if (!name || !addr || !phoneOk) {
          if (!phoneOk) document.getElementById('fPhone').focus();
          showToast("Please complete the address details");
          return;
        }
        deliveryAddress = addr;
        openDrawer('payment');
      });
    }

    else if (drawerState === 'payment') {
      drawerTitle.textContent = "Payment";
      drawerBody.innerHTML = `
        <div class="steps"><div class="seg done"></div><div class="seg done"></div><div class="seg done"></div></div>
        <div class="pay-methods">
          <div class="pay-method ${payMethod === 'card' ? 'active' : ''}" data-pm="card">💳 Card</div>
          <div class="pay-method ${payMethod === 'upi' ? 'active' : ''}" data-pm="upi">📱 UPI</div>
          <div class="pay-method ${payMethod === 'cod' ? 'active' : ''}" data-pm="cod">💵 Cash</div>
        </div>
        <div id="payFields"></div>
      `;
      renderPayFields();
      drawerBody.querySelectorAll('[data-pm]').forEach(el => {
        el.addEventListener('click', () => { payMethod = el.dataset.pm; renderDrawer(); });
      });

      const sub = subtotal();
      const total = sub + DELIVERY_FEE + sub * GST_RATE;
      drawerFoot.innerHTML = `
        <div class="bill-row total"><span>Pay ${payMethod === 'cod' ? 'on delivery' : 'now'}</span><span class="mono">₹${total.toFixed(0)}</span></div>
        <button class="primary-btn" id="placeOrder">🔒 Place order</button>
        <button class="ghost-btn" id="backAddr">← Back to address</button>`;
      document.getElementById('backAddr').addEventListener('click', () => openDrawer('address'));
      document.getElementById('placeOrder').addEventListener('click', validateAndPlaceOrder);
    }

    else if (drawerState === 'success') {
      const orderId = 'CH' + Math.floor(100000 + Math.random() * 899999);
      drawerTitle.textContent = "Order placed!";
      drawerBody.innerHTML = `
        <div class="success-wrap">
          <div class="success-icon">✓</div>
          <h3>Your food is being prepared</h3>
          <div class="order-id">Order #${orderId}</div>
          <div class="route-wrap" style="margin-top:22px;">
            <svg viewBox="0 0 300 120" preserveAspectRatio="none">
              <path class="route-path" d="M10,95 C90,20 160,100 290,15"></path>
              <path class="route-progress" d="M10,95 C90,20 160,100 290,15"></path>
            </svg>
            <div class="pin start" style="color:var(--charcoal)">🍳</div>
            <div class="pin end" style="color:var(--charcoal)">🏠</div>
            <div class="scooter">🛵</div>
          </div>
          <p style="font-size:0.85rem; color:#8a8078; margin-top:10px;">Estimated delivery time: <strong>25 - 30 mins</strong></p>
        </div>
      `;
      drawerFoot.innerHTML = `
        <button class="primary-btn" id="closeSuccess">Done</button>
      `;
      document.getElementById('closeSuccess').addEventListener('click', () => {
        cart = {};
        updateCartCount();
        renderMenu();
        closeDrawer();
      });
    }
  }

  function renderPayFields() {
    const payFields = document.getElementById('payFields');
    if (!payFields) return;

    if (payMethod === 'card') {
      payFields.innerHTML = `
        <div class="field">
          <label>Card Number</label>
          <input type="text" placeholder="4532 •••• •••• 8892" maxlength="19">
        </div>
        <div class="field-row">
          <div class="field">
            <label>Expiry</label>
            <input type="text" placeholder="MM/YY" maxlength="5">
          </div>
          <div class="field">
            <label>CVV</label>
            <input type="password" placeholder="•••" maxlength="4">
          </div>
        </div>
      `;
    } else if (payMethod === 'upi') {
      payFields.innerHTML = `
        <div class="field">
          <label>UPI ID</label>
          <input type="text" placeholder="username@upi">
        </div>
      `;
    } else if (payMethod === 'cod') {
      payFields.innerHTML = `
        <p style="font-size:0.85rem; color:#5c534c; background:var(--cream); padding:12px; border-radius:10px; border:1px solid var(--line);">
          Pay with cash or scan QR code when your food arrives.
        </p>
      `;
    }
  }

  function validateAndPlaceOrder() {
    const btn = document.getElementById('placeOrder');
    btn.disabled = true;
    btn.textContent = "Processing...";
    setTimeout(() => {
      openDrawer('success');
    }, 1000);
  }

  /* ---------------- TOAST ---------------- */
  let toastTimeout;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  /* ---------------- INIT ---------------- */
  renderCatNav();
  renderMenu();
})();
