// =========================
// NAVIGATION
// =========================

function toggleMenu() {

    const menu = document.getElementById("navLinks");
    const button = document.querySelector(".menu-toggle");

    menu.classList.toggle("active");

    button.setAttribute(
        "aria-expanded",
        menu.classList.contains("active")
    );
}

function notifyComingSoon(product) {

    alert(
        "More about " + product + " is coming soon!\n\n" +
        "Thanks for your interest in Fruit Cubed."
    );

}

// Close mobile menu when a navigation link is selected

document.getElementById("navLinks").addEventListener("click", event => {

    if (event.target.closest("a")) {

        document.getElementById("navLinks")
        .classList.remove("active");

        document.querySelector(".menu-toggle")
        .setAttribute("aria-expanded", "false");

    }

});

// =========================
// PROGRESSIVE "MORE" NAV
// =========================

const NAV_ITEMS = [
    { href: "#about", text: "Company Identity" },
    { href: "#info", text: "Product Information" },
    { href: "#process", text: "How It Works" },
    { href: "#impact", text: "Our Impact" },
    { href: "#products", text: "Shop&nbsp;Now&nbsp;↗", className: "nav-button", pinned: true }
];

const MORE_MENU_HTML = `
    <div class="nav-more" id="navMore">
        <button class="nav-more-toggle" id="navMoreToggle"
        aria-label="More navigation" aria-expanded="false">More...</button>
        <div class="nav-more-dropdown" id="navMoreDropdown"></div>
    </div>
`;

function updateMoreMenu() {

    const nav = document.querySelector("nav");
    const navLinks = document.getElementById("navLinks");

    if (!nav || !navLinks) {
        return;
    }

    const logo = document.querySelector(".logo");
    const actions = document.querySelector(".nav-actions");

    const navWidth = nav.clientWidth;
    const navStyle = getComputedStyle(nav);
    const navPaddingLeft = parseFloat(navStyle.paddingLeft) || 0;
    const navPaddingRight = parseFloat(navStyle.paddingRight) || 0;
    const logoWidth = logo ? logo.offsetWidth : 0;
    const actionsWidth = actions ? actions.offsetWidth : 0;
    const actionsMargin = actions
        ? parseFloat(getComputedStyle(actions).marginLeft) || 0
        : 0;
    const linksGap = parseFloat(getComputedStyle(navLinks).gap) || 0;

    const availableWidth = navWidth - navPaddingLeft - navPaddingRight
        - logoWidth - actionsWidth - actionsMargin;

    // Mobile breakpoint: hamburger takes over, keep all links in the list
    if (window.innerWidth <= 600) {
        navLinks.innerHTML = NAV_ITEMS.map(item =>
            `<a href="${item.href}"${item.className ? ` class="${item.className}"` : ""}>${item.text}</a>`
        ).join("") + MORE_MENU_HTML;
        return;
    }

    const pinnedIndex = NAV_ITEMS.findIndex(item => item.pinned);
    const collapsibleItems = NAV_ITEMS.filter(item => !item.pinned);
    const pinnedItem = NAV_ITEMS[pinnedIndex];

    // Render collapsible items + More + pinned item so we can measure widths
    navLinks.innerHTML = collapsibleItems.map(item =>
        `<a href="${item.href}"${item.className ? ` class="${item.className}"` : ""}>${item.text}</a>`
    ).join("") + MORE_MENU_HTML +
    `<a href="${pinnedItem.href}" class="${pinnedItem.className}">${pinnedItem.text}</a>`;

    const renderedLinks = Array.from(navLinks.querySelectorAll(":scope > a"));
    const renderedMore = document.getElementById("navMore");
    const renderedToggle = document.getElementById("navMoreToggle");
    const renderedDropdown = document.getElementById("navMoreDropdown");

    if (!renderedMore || !renderedToggle || !renderedDropdown) {
        return;
    }

    const collapsibleWidths = renderedLinks.slice(0, -1).map(link => link.offsetWidth);
    const pinnedWidth = renderedLinks[renderedLinks.length - 1].offsetWidth;

    // Check if all collapsible items + pinned item fit (no More needed)
    const totalWithoutMore = collapsibleWidths.reduce((a, b) => a + b, 0)
        + collapsibleItems.length * linksGap + pinnedWidth;

    if (totalWithoutMore <= availableWidth) {
        renderedMore.style.display = "none";
        renderedDropdown.innerHTML = "";
        return;
    }

    // Need the More button: figure out how many collapsible items fit beside it
    const moreWidth = renderedToggle.offsetWidth + 20; // small buffer
    let sumWidths = 0;
    let fitCount = 0;

    for (let i = 0; i < collapsibleItems.length; i++) {
        sumWidths += collapsibleWidths[i];
        const needed = sumWidths + (i + 1) * linksGap + moreWidth + pinnedWidth;
        if (needed <= availableWidth) {
            fitCount = i + 1;
        } else {
            break;
        }
    }

    const visibleCollapsible = collapsibleItems.slice(0, fitCount);
    const hiddenCollapsible = collapsibleItems.slice(fitCount);

    // Render the visible collapsible items + More + pinned item
    navLinks.innerHTML = visibleCollapsible.map(item =>
        `<a href="${item.href}"${item.className ? ` class="${item.className}"` : ""}>${item.text}</a>`
    ).join("") + MORE_MENU_HTML +
    `<a href="${pinnedItem.href}" class="${pinnedItem.className}">${pinnedItem.text}</a>`;

    const finalMore = document.getElementById("navMore");
    const finalDropdown = document.getElementById("navMoreDropdown");

    if (hiddenCollapsible.length > 0) {
        finalMore.style.display = "";
        finalMore.classList.add("has-items");
        finalDropdown.innerHTML = hiddenCollapsible.map(item =>
            `<a href="${item.href}">${item.text}</a>`
        ).join("");
    } else {
        finalMore.style.display = "none";
        finalMore.classList.remove("has-items");
        finalDropdown.innerHTML = "";
    }

}

// Recalculate the More menu on resize
let moreMenuResizeTimeout;

window.addEventListener("resize", () => {
    clearTimeout(moreMenuResizeTimeout);
    moreMenuResizeTimeout = setTimeout(() => {
        updateMoreMenu();
        setNavHeight();
    }, 80);
});

// Keep the anchor offset in sync with the nav's actual rendered height,
// which can differ slightly between browsers due to font metrics.

function setNavHeight() {

    const nav = document.querySelector("nav");

    if (!nav) {
        return;
    }

    // Round up to the nearest whole pixel so Safari never leaves a
    // 1 px gap between the sticky nav and the coloured band.
    const height = Math.ceil(nav.getBoundingClientRect().height);

    document.documentElement.style.setProperty(
        "--nav-height",
        height + "px"
    );

}

// Re-measure once web fonts have loaded, since they can change nav height.
if (document.fonts) {
    document.fonts.ready.then(setNavHeight);
}

// =========================
// SHOPPING CART
// =========================

// The catalogue itself (names, prices, emoji) lives in
// products.js so the shop cards and the cart always agree.

// Product ID -> quantity in the cart, restored from the last visit
const CART_STORAGE_KEY = "fruitcubed.cart";

let cart = loadCart();

function loadCart() {

    let saved = null;

    try {
        saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    } catch (error) {
        // Missing, unreadable or blocked storage: start with an empty cart
        return {};
    }

    if (!saved || typeof saved !== "object") {
        return {};
    }

    // Keep only real products with whole, positive quantities
    const restored = {};

    Object.keys(saved).forEach(id => {

        const quantity = Number(saved[id]);

        if (PRODUCTS[id] && Number.isInteger(quantity) && quantity > 0) {
            restored[id] = quantity;
        }

    });

    return restored;

}

function saveCart() {

    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        // Storage can be full or unavailable; the cart still works
    }

}

function formatPrice(value) {
    return "$" + value.toFixed(2);
}

// Build the shop cards from the PRODUCTS data, in its key order
function renderProducts() {

    const grid = document.querySelector(".product-grid");

    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    Object.keys(PRODUCTS).forEach(id => {

        const product = PRODUCTS[id];

        // Products can carry a photo; the emoji is the placeholder
        const image = product.image
            ? `<img src="${product.image}" alt="${product.name}">`
            : product.emoji;

        const card = document.createElement("div");

        card.className = "product-card";
        card.dataset.productId = id;

        card.innerHTML = `
            <div class="product-image">${image}</div>

            <h3>${product.name}</h3>

            <p>${product.description}</p>

            <div class="product-price">${formatPrice(product.price)}</div>

            <div class="product-actions">

                <button class="product-button"
                onclick="addToCart('${id}', this)">
                    Add to Cart
                </button>

                <div class="product-quantity" hidden>

                    <button aria-label="Remove one ${product.name}"
                    onclick="changeQuantity('${id}', -1)">−</button>

                    <span class="product-quantity-count"
                    aria-live="polite">0</span>

                    <button aria-label="Add one ${product.name}"
                    onclick="changeQuantity('${id}', 1, this)">+</button>

                </div>

            </div>
        `;

        grid.appendChild(card);

    });

    syncProductCards();

}

// Swap each card between its Add to Cart button and a − / + stepper,
// so the quantity can be changed without opening the cart
function syncProductCards() {

    document.querySelectorAll(".product-card").forEach(card => {

        const quantity = cart[card.dataset.productId] || 0;

        card.querySelector(".product-button").hidden = quantity > 0;
        card.querySelector(".product-quantity").hidden = quantity === 0;

        card.querySelector(".product-quantity-count")
        .textContent = quantity;

    });

}

function addToCart(productID, source) {

    cart[productID] = (cart[productID] || 0) + 1;

    saveCart();

    // Fly first: the card swaps Add to Cart for a stepper, and a
    // hidden button can no longer report where the fruit starts
    flyToCart(productID, source);

    renderCart();
}

// Throw the product's fruit from the Add to Cart button into
// the cart icon
function flyToCart(productID, source) {

    const product = PRODUCTS[productID];
    const cartButton = document.querySelector(".cart-toggle");
    const cartIcon = document.querySelector(".cart-icon");

    // Respect visitors who have asked for less motion
    if (
        !product || !cartButton || !source ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        return;
    }

    // Start at the clicked button, not the card, so a card that is
    // partly scrolled off screen can't send the fruit in from nowhere
    const fromRect = source.getBoundingClientRect();
    const toRect = (cartIcon || cartButton).getBoundingClientRect();

    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;

    const chip = document.createElement("div");

    chip.className = "fly-to-cart";
    chip.textContent = product.emoji;
    chip.setAttribute("aria-hidden", "true");

    // Borrow the card image's colour so no pastel hex is repeated here
    const card = source.closest(".product-card");
    const cardImage = card ? card.querySelector(".product-image") : null;

    if (cardImage) {
        chip.style.background = getComputedStyle(cardImage).backgroundColor;
    }

    chip.style.left = startX + "px";
    chip.style.top = startY + "px";

    chip.style.setProperty("--fly-x", (endX - startX) + "px");
    chip.style.setProperty("--fly-y", (endY - startY) + "px");

    chip.addEventListener("animationend", () => {

        chip.remove();
        bumpCart(cartButton);

    }, { once: true });

    document.body.appendChild(chip);

}

// Little pop on the cart button as the fruit lands
function bumpCart(cartButton) {

    cartButton.classList.remove("bumped");

    // Force a reflow so the animation can restart
    void cartButton.offsetWidth;

    cartButton.classList.add("bumped");

    cartButton.addEventListener("animationend", () => {

        cartButton.classList.remove("bumped");

    }, { once: true });

}

function changeQuantity(productID, change, source) {

    const quantity = (cart[productID] || 0) + change;

    if (quantity < 1) {
        delete cart[productID];
    } else {
        cart[productID] = quantity;
    }

    saveCart();

    // The + on a shop card gets the same flight as Add to Cart
    if (change > 0 && source) {
        flyToCart(productID, source);
    }

    renderCart();
}

function removeFromCart(productID) {

    delete cart[productID];

    saveCart();
    renderCart();
}

function clearCart() {

    if (Object.keys(cart).length === 0) {
        return;
    }

    // Ask first: emptying the whole cart can't be undone
    const confirmed = confirm(
        "Empty your whole cart?\n\n" +
        "Every fruit will be removed and you'll have to add them again."
    );

    if (!confirmed) {
        return;
    }

    cart = {};

    saveCart();
    renderCart();
}

function renderCart() {

    const items = document.getElementById("cartItems");
    const count = document.getElementById("cartCount");

    const productIDs = Object.keys(cart);

    let totalItems = 0;
    let totalPrice = 0;

    items.innerHTML = "";

    if (productIDs.length === 0) {

        items.innerHTML =
            '<p class="cart-empty">Your cart is empty.<br>' +
            "Add a little fruity magic!</p>";

    }

    productIDs.forEach(id => {

        const product = PRODUCTS[id];
        const quantity = cart[id];

        totalItems += quantity;
        totalPrice += product.price * quantity;

        const item = document.createElement("div");

        item.className = "cart-item";

        item.innerHTML = `
            <div class="cart-item-image ${product.className}">
                ${product.emoji}
            </div>

            <div class="cart-item-info">
                <h4>${product.name}</h4>
                <div class="cart-item-price">
                    ${formatPrice(product.price)} each
                </div>

                <div class="cart-item-controls">
                    <button aria-label="Remove one ${product.name}"
                    onclick="changeQuantity('${id}', -1)">−</button>

                    <span>${quantity}</span>

                    <button aria-label="Add one ${product.name}"
                    onclick="changeQuantity('${id}', 1)">+</button>
                </div>
            </div>

            <button class="cart-item-remove"
            aria-label="Remove ${product.name} from cart"
            onclick="removeFromCart('${id}')">✕</button>
        `;

        items.appendChild(item);

    });

    count.textContent = totalItems;
    count.classList.toggle("empty", totalItems === 0);

    // Nothing to clear or check out while the cart is empty
    document.getElementById("cartClear").hidden = totalItems === 0;
    document.querySelector(".cart-checkout").disabled = totalItems === 0;

    document.getElementById("cartTotal").textContent =
        formatPrice(totalPrice);

    // Changing the cart from the drawer or Clear cart must also
    // update the steppers on the shop cards
    syncProductCards();

}

function openCart() {

    // Keep the mobile menu from sitting underneath the cart
    document.getElementById("navLinks").classList.remove("active");
    document.querySelector(".menu-toggle")
    .setAttribute("aria-expanded", "false");

    document.getElementById("cartDrawer").classList.add("active");
    document.getElementById("cartOverlay").classList.add("active");
    document.querySelector(".cart-toggle")
    .setAttribute("aria-expanded", "true");
    document.body.classList.add("cart-open");

}

function closeCart() {

    document.getElementById("cartDrawer").classList.remove("active");
    document.getElementById("cartOverlay").classList.remove("active");
    document.querySelector(".cart-toggle")
    .setAttribute("aria-expanded", "false");
    document.body.classList.remove("cart-open");

}

function openCheckout() {

    if (Object.keys(cart).length === 0) {
        return;
    }

    alert(
        "Checkout is coming soon!\n\n" +
        "Your Fruit Cubed cart will be ready to order at launch. " +
        "No payment has been taken."
    );

}

// Close the cart and the More dropdown with the Escape key

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeCart();

        const moreMenu = document.getElementById("navMore");

        if (moreMenu) {
            moreMenu.classList.add("esc-closed");
        }
    }

});

// Let hover reopen the More menu after it was closed with Escape
// (Listen on navLinks so it survives updateMoreMenu re-renders.)
document.getElementById("navLinks").addEventListener("mousemove", event => {

    const moreMenu = event.target.closest(".nav-more");

    if (moreMenu) {
        moreMenu.classList.remove("esc-closed");
    }

});

document.getElementById("navLinks").addEventListener("focusout", event => {

    const moreMenu = event.target.closest(".nav-more");
    const relatedMore = event.relatedTarget && event.relatedTarget.closest(".nav-more");

    if (moreMenu && !relatedMore) {
        moreMenu.classList.remove("esc-closed");
    }

});

renderProducts();
renderCart();
updateMoreMenu();
setNavHeight();
