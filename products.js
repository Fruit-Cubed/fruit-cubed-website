// =========================
// PRODUCT DATA
// =========================

// Single source of truth for the catalogue: everything a shop card
// and a cart line needs. The shop grid is generated from this object
// by renderProducts() in script.js, so a product is added, renamed or
// reordered by editing only this file. Key order is card order.
//
//   name        - shown on the card and in the cart
//   price       - in dollars, formatted by formatPrice()
//   description - the line under the name on the shop card
//   emoji       - card image fallback, also used for the flying fruit
//   image       - optional image path; when set it replaces the emoji
//   className   - pastel class reused by the cart item thumbnail

// Note that the current products here are just placeholders;
// they will be replaced with our actual products once confirmed
// with rest of team.
const PRODUCTS = {
    strawberry: {
        name: "Strawberry Crush",
        price: 9.5,
        description: "Sweet, vibrant and berry delicious.",
        emoji: "🍓",
        image: "",
        className: "strawberry"
    },
    mango: {
        name: "Mango Sunshine",
        price: 10,
        description: "Tropical flavour in every little spoonful.",
        emoji: "🥭",
        image: "",
        className: "mango"
    },
    citrus: {
        name: "Citrus Zing",
        price: 8.5,
        description: "Bright, zesty and bursting with citrus flavour.",
        emoji: "🍊",
        image: "",
        className: "citrus"
    }
};
