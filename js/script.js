/* ═══════════════════════════════════════════════════════════════
   CERTIVO — Digital Certificate Generator UI  (AAT-1)
   script.js — one shared script for all four pages.
   <body data-page="…"> decides which initialiser runs.
   Cart state lives in localStorage so it survives navigation.
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ───────────────────────── 1. Template catalogue ───────────────────────── */
const TEMPLATES = [
  {
    id: "classic", name: "Classic Gold", cat: "formal", price: 249,
    tagline: "Double gold frame on warm parchment — the timeless one.",
    sample: { title: "Certificate of Achievement", name: "Aarav Reddy", course: "Full Stack Web Development" }
  },
  {
    id: "royal", name: "Royal Navy", cat: "formal", price: 299,
    tagline: "Deep navy with gilded lines for prestigious awards.",
    sample: { title: "Certificate of Excellence", name: "Meera Iyer", course: "National Design Championship" }
  },
  {
    id: "minimal", name: "Modern Minimal", cat: "modern", price: 199,
    tagline: "A single crisp rule and bold type. Nothing extra.",
    sample: { title: "Certificate of Completion", name: "Kabir Shah", course: "UI Engineering Bootcamp" }
  },
  {
    id: "emerald", name: "Emerald Executive", cat: "formal", price: 329,
    tagline: "Registry green with a grooved gold frame.",
    sample: { title: "Certificate of Appreciation", name: "Ananya Rao", course: "Corporate Leadership Summit" }
  },
  {
    id: "tech", name: "Hackathon Tech", cat: "modern", price: 279,
    tagline: "Monospace and midnight blue for builders.",
    sample: { title: "Certificate of Achievement", name: "Vikram Nair", course: "Smart India Hackathon 2026" }
  },
  {
    id: "playful", name: "Playful Pop", cat: "decorative", price: 229,
    tagline: "Dashed and dotted borders for fun events.",
    sample: { title: "Certificate of Participation", name: "Sara Khan", course: "Inter-College Art Carnival" }
  },
  {
    id: "ivory", name: "Academic Ivory", cat: "formal", price: 269,
    tagline: "Maroon double rules and a wax-red seal.",
    sample: { title: "Certificate of Merit", name: "Dev Patel", course: "B.Tech Semester Topper Award" }
  },
  {
    id: "blush", name: "Elegant Blush", cat: "decorative", price: 259,
    tagline: "Soft rose tones with a fine gold inline.",
    sample: { title: "Certificate of Appreciation", name: "Ishita Menon", course: "Annual Cultural Fest 2026" }
  }
];

const GST_RATE = 0.18;               // 18% GST
const CART_KEY = "certivo_cart";
const ORG_DEFAULT = "Arden Institute of Technology";

/* ───────────────────────── 2. Small helpers ───────────────────────── */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function money(n) {
  return "\u20B9" + n.toLocaleString("en-IN");   // ₹ Indian formatting
}
function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id);
}
/* escape user-typed text before injecting into HTML (safe innerHTML) */
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/* ───────────────────────── 3. Cart state (localStorage) ───────────────────────── */
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function cartCount() {
  return Object.values(getCart()).reduce((sum, q) => sum + q, 0);
}
function cartTotals() {
  const cart = getCart();
  let subtotal = 0;
  for (const id in cart) {
    const t = getTemplate(id);
    if (t) subtotal += t.price * cart[id];
  }
  const gst = Math.round(subtotal * GST_RATE);
  return { subtotal, gst, total: subtotal + gst };
}
function addToCart(id) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + 1;
  saveCart(cart);
}
function setQty(id, qty) {
  const cart = getCart();
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveCart(cart);
}
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}
function updateCartBadge() {
  const badge = $("#cartCount");
  if (badge) badge.textContent = cartCount();
}

/* ───────────────────────── 4. Toast ───────────────────────── */
let toastTimer = null;
function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ───────────────────────── 5. Certificate renderer ─────────────────────────
   ONE function draws every certificate. The theme class (t-classic,
   t-royal, …) restyles it, and the size class (cert-lg / cert-md /
   cert-sm) rescales it because everything inside is measured in em. */
function renderCert(templateId, data, sizeClass) {
  return `
    <div class="cert ${sizeClass} t-${templateId}" aria-label="Certificate preview">
      <div class="cert-inner">
        <p class="cert-org">${esc(data.org)}</p>
        <h3 class="cert-title">${esc(data.title)}</h3>
        <p class="cert-sub">This certificate is proudly presented to</p>
        <p class="cert-name">${esc(data.name)}</p>
        <p class="cert-course">for successfully completing <b>${esc(data.course)}</b></p>
        <div class="cert-footer">
          <div class="cert-sig">
            <span class="script">${esc(data.signer)}</span>
            <span class="lbl">Signature</span>
          </div>
          <div class="cert-seal"><span>&#9733;</span></div>
          <div class="cert-sig">
            <span class="plain">${esc(data.date)}</span>
            <span class="lbl">Date</span>
          </div>
        </div>
      </div>
    </div>`;
}

/* sample payload used for hero + product thumbnails */
function sampleData(t) {
  return {
    org: ORG_DEFAULT,
    title: t.sample.title,
    name: t.sample.name,
    course: t.sample.course,
    signer: "Dr. R. Sharma",
    date: "21 August 2026"
  };
}

/* ───────────────────────── 6. Landing page (hero + generator) ───────────────────────── */
function initHome() {
  /* hero preview */
  const hero = $("#heroCert");
  if (hero) hero.innerHTML = renderCert("classic", sampleData(getTemplate("classic")), "cert-md");

  /* — the live generator — */
  const preview = $("#genCert");
  if (!preview) return;

  let activeTemplate = "classic";

  // default the date picker to today
  const dateInput = $("#gDate");
  if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

  function currentData() {
    return {
      org:    $("#gOrg").value.trim()    || ORG_DEFAULT,
      title:  $("#gType").value,
      name:   $("#gName").value.trim()   || "Your Name Here",
      course: $("#gCourse").value.trim() || "Full Stack Web Development",
      signer: $("#gSigner").value.trim() || "Dr. R. Sharma",
      date:   formatDate($("#gDate").value) || "21 August 2026"
    };
  }

  function renderPreview() {
    preview.innerHTML = renderCert(activeTemplate, currentData(), "cert-lg");
  }

  /* template chips */
  const chipRow = $("#templateChips");
  chipRow.innerHTML = TEMPLATES
    .map((t, i) => `<button type="button" class="tchip ${i === 0 ? "active" : ""}" data-t="${t.id}">${t.name}</button>`)
    .join("");
  chipRow.addEventListener("click", e => {
    const chip = e.target.closest(".tchip");
    if (!chip) return;
    $$(".tchip", chipRow).forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeTemplate = chip.dataset.t;
    renderPreview();
  });

  /* live re-render on every keystroke */
  ["gOrg", "gName", "gCourse", "gSigner", "gType", "gDate"].forEach(id => {
    $("#" + id).addEventListener("input", renderPreview);
  });

  /* print / save as PDF — @media print CSS isolates the certificate */
  $("#printBtn").addEventListener("click", () => window.print());

  renderPreview();
}

/* ───────────────────────── 7. Products page ───────────────────────── */
function initProducts() {
  const grid = $("#productGrid");
  if (!grid) return;

  function renderGrid(filter) {
    const list = filter === "all" ? TEMPLATES : TEMPLATES.filter(t => t.cat === filter);
    grid.innerHTML = list.map(t => `
      <article class="product">
        <div class="product-stage">
          ${renderCert(t.id, sampleData(t), "cert-sm")}
        </div>
        <div class="product-info">
          <h3>${t.name}</h3>
          <p class="tagline">${t.tagline}</p>
          <div class="product-meta">
            <span class="price">${money(t.price)}</span>
            <button class="add-btn" data-id="${t.id}">Add to cart</button>
          </div>
        </div>
      </article>`).join("");
  }

  renderGrid("all");

  $$(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      $$(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderGrid(chip.dataset.filter);
    });
  });

  /* add-to-cart via event delegation (survives re-renders) */
  grid.addEventListener("click", e => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    const t = getTemplate(btn.dataset.id);
    addToCart(t.id);
    showToast(`${t.name} added to cart`);
    btn.textContent = "Added \u2713";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = "Add to cart";
      btn.classList.remove("added");
    }, 1400);
  });
}

/* ───────────────────────── 8. Cart page ───────────────────────── */
function initCart() {
  const wrap = $("#cartWrap");
  if (!wrap) return;

  function render() {
    const cart = getCart();
    const ids = Object.keys(cart);

    if (ids.length === 0) {
      wrap.innerHTML = `
        <div class="empty-state">
          <div class="empty-mark">&#9733;</div>
          <h2>Your cart is empty</h2>
          <p>Choose a certificate template and it will appear here.</p>
          <a href="products.html" class="btn btn-primary">Browse templates</a>
        </div>`;
      return;
    }

    const rows = ids.map(id => {
      const t = getTemplate(id);
      const qty = cart[id];
      return `
        <div class="cart-row">
          <div class="swatch sw-${t.id}" aria-hidden="true"></div>
          <div class="cart-item-info">
            <div class="cart-item-name">${t.name}</div>
            <div class="cart-item-price">${money(t.price)} per licence</div>
          </div>
          <div class="qty">
            <button data-id="${t.id}" data-action="dec" aria-label="Decrease quantity of ${t.name}">&minus;</button>
            <output>${qty}</output>
            <button data-id="${t.id}" data-action="inc" aria-label="Increase quantity of ${t.name}">+</button>
          </div>
          <div class="line-total">${money(t.price * qty)}</div>
          <button class="remove-btn" data-id="${t.id}" data-action="remove"
                  aria-label="Remove ${t.name} from cart">&times;</button>
        </div>`;
    }).join("");

    const tt = cartTotals();
    wrap.innerHTML = `
      <div class="cart-layout">
        <div class="cart-list">${rows}</div>
        <aside class="summary">
          <h3>Order summary</h3>
          <div class="summary-line"><span>Subtotal</span><span>${money(tt.subtotal)}</span></div>
          <div class="summary-line"><span>GST (18%)</span><span>${money(tt.gst)}</span></div>
          <div class="summary-total"><span>Total</span><span>${money(tt.total)}</span></div>
          <a href="payment.html" class="btn btn-primary btn-block">Proceed to payment</a>
          <p class="summary-note">Each licence covers unlimited certificates for one event.</p>
        </aside>
      </div>`;
  }

  render();

  wrap.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const { id, action } = btn.dataset;
    const cart = getCart();
    if (action === "inc") setQty(id, cart[id] + 1);
    if (action === "dec") setQty(id, cart[id] - 1);
    if (action === "remove") {
      setQty(id, 0);
      showToast(`${getTemplate(id).name} removed`);
    }
    render();
  });
}

/* ───────────────────────── 9. Payment page ───────────────────────── */
function initPayment() {
  const form = $("#payForm");
  if (!form) return;

  /* — order summary — */
  const summaryBox = $("#paySummary");
  const cart = getCart();
  const ids = Object.keys(cart);
  const tt = cartTotals();

  if (ids.length === 0) {
    summaryBox.innerHTML = `
      <h3>Order summary</h3>
      <p style="color:var(--muted);font-size:.92rem;margin-bottom:18px;">
        Your cart is empty, so there is nothing to pay for yet.</p>
      <a href="products.html" class="btn btn-ghost btn-block">Browse templates</a>`;
    $("#payBtn").disabled = true;
  } else {
    const items = ids.map(id => {
      const t = getTemplate(id);
      return `
        <div class="mini-item">
          <div class="swatch sw-${t.id}" aria-hidden="true"></div>
          <span class="m-name">${t.name}</span>
          <span class="m-qty">&times;${cart[id]}</span>
          <span class="m-price">${money(t.price * cart[id])}</span>
        </div>`;
    }).join("");
    summaryBox.innerHTML = `
      <h3>Order summary</h3>
      ${items}
      <div class="summary-line" style="margin-top:16px;"><span>Subtotal</span><span>${money(tt.subtotal)}</span></div>
      <div class="summary-line"><span>GST (18%)</span><span>${money(tt.gst)}</span></div>
      <div class="summary-total"><span>Total payable</span><span>${money(tt.total)}</span></div>
      <p class="summary-note">You will not be charged &mdash; this is a demo checkout.</p>`;
    $("#payBtn").textContent = `Pay ${money(tt.total)}`;
  }

  /* — live input formatting — */
  const cardInput = $("#cardNumber");
  cardInput.addEventListener("input", () => {
    const digits = cardInput.value.replace(/\D/g, "").slice(0, 16);
    cardInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });
  const expiryInput = $("#expiry");
  expiryInput.addEventListener("input", () => {
    let v = expiryInput.value.replace(/\D/g, "").slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    expiryInput.value = v;
  });
  $("#cvv").addEventListener("input", () => {
    $("#cvv").value = $("#cvv").value.replace(/\D/g, "").slice(0, 3);
  });
  $("#phone").addEventListener("input", () => {
    $("#phone").value = $("#phone").value.replace(/\D/g, "").slice(0, 10);
  });
  $("#pincode").addEventListener("input", () => {
    $("#pincode").value = $("#pincode").value.replace(/\D/g, "").slice(0, 6);
  });

  /* — validators: each returns an error message or "" — */
  const validators = {
    fullName: v => /^[A-Za-z][A-Za-z .]{2,}$/.test(v.trim())
      ? "" : "Enter your full name (letters only, min 3 characters).",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
      ? "" : "Enter a valid email address, e.g. name@example.com.",
    phone: v => /^[6-9]\d{9}$/.test(v.trim())
      ? "" : "Enter a valid 10-digit mobile number.",
    address: v => v.trim().length >= 10
      ? "" : "Address should be at least 10 characters.",
    city: v => /^[A-Za-z][A-Za-z ]{1,}$/.test(v.trim())
      ? "" : "Enter a valid city name.",
    pincode: v => /^\d{6}$/.test(v.trim())
      ? "" : "PIN code must be exactly 6 digits.",
    cardName: v => /^[A-Za-z][A-Za-z .]{2,}$/.test(v.trim())
      ? "" : "Enter the name printed on the card.",
    cardNumber: v => /^\d{16}$/.test(v.replace(/\s/g, ""))
      ? "" : "Card number must be 16 digits.",
    expiry: v => {
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim())) return "Use MM/YY format.";
      const [mm, yy] = v.split("/").map(Number);
      const expiryDate = new Date(2000 + yy, mm);   // first day AFTER expiry month
      return expiryDate > new Date() ? "" : "This card has expired.";
    },
    cvv: v => /^\d{3}$/.test(v.trim())
      ? "" : "CVV must be 3 digits."
  };

  function setFieldState(input, message) {
    const err = $(`#err-${input.id}`);
    if (message) {
      input.classList.add("invalid");
      if (err) { err.textContent = message; err.classList.add("show"); }
    } else {
      input.classList.remove("invalid");
      if (err) err.classList.remove("show");
    }
  }

  /* validate on blur; clear as the user fixes the field */
  for (const id in validators) {
    const input = $("#" + id);
    input.addEventListener("blur", () => setFieldState(input, validators[id](input.value)));
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) {
        setFieldState(input, validators[id](input.value));
      }
    });
  }

  /* — submit — */
  form.addEventListener("submit", e => {
    e.preventDefault();                 // JS handles validation + success
    let firstInvalid = null;

    for (const id in validators) {
      const input = $("#" + id);
      const message = validators[id](input.value);
      setFieldState(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      showToast("Please fix the highlighted fields");
      return;
    }

    const orderId = "CV-" + Date.now().toString().slice(-6);
    $("#orderId").textContent = "Order ID: " + orderId;
    $("#successModal").classList.add("show");
    clearCart();
  });
}

/* ───────────────────────── 10. Boot ───────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();

  const burger = $("#burger");
  const navLinks = $("#navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
    });
  }

  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "products") initProducts();
  if (page === "cart") initCart();
  if (page === "payment") initPayment();
});
