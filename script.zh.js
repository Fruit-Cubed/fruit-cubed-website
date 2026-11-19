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
        "关于 " + product + " 的更多信息即将上线！\n\n" +
        "感谢你对 Fruit Cubed 的关注。"
    );

}

// 选择导航链接时关闭移动端菜单

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
    { href: "#about", text: "品牌理念" },
    { href: "#info", text: "产品信息" },
    { href: "#process", text: "制作流程" },
    { href: "#impact", text: "我们的影响" },
    { href: "#products", text: "立即购买&nbsp;↗", className: "nav-button", pinned: true }
];

const MORE_MENU_HTML = `
    <div class="nav-more" id="navMore">
        <button class="nav-more-toggle" id="navMoreToggle"
        aria-label="更多导航" aria-expanded="false">更多...</button>
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

    // 移动端断点：汉堡菜单接管，保留所有链接在列表中
    if (window.innerWidth <= 600) {
        navLinks.innerHTML = NAV_ITEMS.map(item =>
            `<a href="${item.href}"${item.className ? ` class="${item.className}"` : ""}>${item.text}</a>`
        ).join("") + MORE_MENU_HTML;
        return;
    }

    const pinnedIndex = NAV_ITEMS.findIndex(item => item.pinned);
    const collapsibleItems = NAV_ITEMS.filter(item => !item.pinned);
    const pinnedItem = NAV_ITEMS[pinnedIndex];

    // 渲染可折叠项 + 更多 + 固定项以便测量宽度
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

    // 检查所有可折叠项 + 固定项是否能放下（不需要“更多”）
    const totalWithoutMore = collapsibleWidths.reduce((a, b) => a + b, 0)
        + collapsibleItems.length * linksGap + pinnedWidth;

    if (totalWithoutMore <= availableWidth) {
        renderedMore.style.display = "none";
        renderedDropdown.innerHTML = "";
        return;
    }

    // 需要“更多”按钮：计算 beside 它能放下多少个可折叠项
    const moreWidth = renderedToggle.offsetWidth + 20; // 小缓冲
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

    // 渲染可见可折叠项 + 更多 + 固定项
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

// 调整窗口大小时重新计算“更多”菜单
let moreMenuResizeTimeout;

window.addEventListener("resize", () => {
    clearTimeout(moreMenuResizeTimeout);
    moreMenuResizeTimeout = setTimeout(() => {
        updateMoreMenu();
        setNavHeight();
    }, 80);
});

// 将锚点偏移量与导航实际渲染高度保持同步，
// 因为不同浏览器中字体高度可能略有差异。

function setNavHeight() {

    const nav = document.querySelector("nav");

    if (!nav) {
        return;
    }

    // 向上取整到最接近的整数像素，避免 Safari 在粘性导航和色带之间留下 1px 间隙。
    const height = Math.ceil(nav.getBoundingClientRect().height);

    document.documentElement.style.setProperty(
        "--nav-height",
        height + "px"
    );

}

// 网页字体加载完成后重新测量，因为它们可能改变导航高度。
if (document.fonts) {
    document.fonts.ready.then(setNavHeight);
}

// =========================
// BACK TO TOP
// =========================

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// =========================
// SHOPPING CART
// =========================

// 目录本身（名称、价格、emoji）保存在 products.zh.js 中，
// 这样店铺卡片和购物车始终保持一致。

// 购物车：产品 ID → 数量，从上一次访问恢复
const CART_STORAGE_KEY = "fruitcubed.cart";

let cart = loadCart();

function loadCart() {

    let saved = null;

    try {
        saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    } catch (error) {
        // 缺失、无法读取或存储被阻止：从空购物车开始
        return {};
    }

    if (!saved || typeof saved !== "object") {
        return {};
    }

    // 只保留真实产品且数量为整正数
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
        // 存储可能已满或不可用；购物车仍可正常工作
    }

}

function formatPrice(value) {
    return "$" + value.toFixed(2);
}

// 根据 PRODUCTS 数据按键顺序构建店铺卡片
function renderProducts() {

    const grid = document.querySelector(".product-grid");

    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    Object.keys(PRODUCTS).forEach(id => {

        const product = PRODUCTS[id];

        // 产品可带照片；emoji 是占位符
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
                    加入购物车
                </button>

                <div class="product-quantity" hidden>

                    <button aria-label="减少一个 ${product.name}"
                    onclick="changeQuantity('${id}', -1)">−</button>

                    <span class="product-quantity-count"
                    aria-live="polite">0</span>

                    <button aria-label="增加一个 ${product.name}"
                    onclick="changeQuantity('${id}', 1, this)">+</button>

                </div>

            </div>
        `;

        grid.appendChild(card);

    });

    syncProductCards();

}

// 在“加入购物车”按钮和 − / + 步进器之间切换每张卡片，
// 这样无需打开购物车即可调整数量
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

    // 先飞入购物车：卡片会将“加入购物车”替换为步进器，
    // 隐藏后的按钮无法再报告水果的起点位置
    flyToCart(productID, source);

    renderCart();
}

// 将产品水果从“加入购物车”按钮抛向购物车图标
function flyToCart(productID, source) {

    const product = PRODUCTS[productID];
    const cartButton = document.querySelector(".cart-toggle");
    const cartIcon = document.querySelector(".cart-icon");

    // 尊重偏好减少动效的用户
    if (
        !product || !cartButton || !source ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        return;
    }

    // 从点击的按钮开始，而不是卡片，避免部分滚出屏幕的卡片让水果从屏幕外飞入
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

    // 借用卡片图片的颜色，避免在这里重复柔和色十六进制值
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

// 水果落进购物车时按钮轻微弹动
function bumpCart(cartButton) {

    cartButton.classList.remove("bumped");

    // 强制重排，使动画可以重新开始
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

    // 卡片上的 + 获得与“加入购物车”相同的飞入效果
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

    // 先询问：清空整个购物车无法撤销
    const confirmed = confirm(
        "确定要清空购物车吗？\n\n" +
        "所有商品都会被移除，需要重新添加。"
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
            '<p class="cart-empty">您的购物车是空的。<br>' +
            "来点果味魔法吧！</p>";

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
                    每件 ${formatPrice(product.price)}
                </div>

                <div class="cart-item-controls">
                    <button aria-label="减少一个 ${product.name}"
                    onclick="changeQuantity('${id}', -1)">−</button>

                    <span>${quantity}</span>

                    <button aria-label="增加一个 ${product.name}"
                    onclick="changeQuantity('${id}', 1)">+</button>
                </div>
            </div>

            <button class="cart-item-remove"
            aria-label="从购物车移除 ${product.name}"
            onclick="removeFromCart('${id}')">✕</button>
        `;

        items.appendChild(item);

    });

    count.textContent = totalItems;
    count.classList.toggle("empty", totalItems === 0);

    // 购物车为空时无需清空或结账
    document.getElementById("cartClear").hidden = totalItems === 0;
    document.querySelector(".cart-checkout").disabled = totalItems === 0;

    document.getElementById("cartTotal").textContent =
        formatPrice(totalPrice);

    // 从购物车或“清空购物车”更改数量时，也必须更新店铺卡片上的步进器
    syncProductCards();

}

function openCart() {

    // 防止移动菜单位于购物车下方
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
        "结账功能即将上线！\n\n" +
        "Fruit Cubed 购物车将在开业后开放下单。尚未收款。"
    );

}

// 使用 Escape 键关闭购物车和“更多”下拉菜单

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeCart();

        const moreMenu = document.getElementById("navMore");

        if (moreMenu) {
            moreMenu.classList.add("esc-closed");
        }
    }

});

// 鼠标悬停时让“更多”菜单在按 Escape 关闭后重新打开
// （在 navLinks 上监听，这样 updateMoreMenu 重新渲染后仍然有效。）
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

// 页面滚动一段距离后显示返回顶部按钮
const scrollTopButton = document.getElementById("scrollTop");

function toggleScrollTop() {

    if (!scrollTopButton) {
        return;
    }

    if (window.scrollY > 300) {
        scrollTopButton.classList.add("visible");
    } else {
        scrollTopButton.classList.remove("visible");
    }

}

if (scrollTopButton) {
    window.addEventListener("scroll", toggleScrollTop, { passive: true });
    toggleScrollTop();
}
