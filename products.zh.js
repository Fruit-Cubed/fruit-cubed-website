// =========================
// PRODUCT DATA
// =========================

// 产品目录的唯一数据源：店铺卡片和购物车行所需的一切信息。
// 店铺网格由 script.zh.js 中的 renderProducts() 根据此对象生成，
// 因此添加、重命名或重新排序产品只需编辑此文件。键的顺序即卡片顺序。
//
//   name        - 卡片和购物车中显示的名称
//   price       - 以美元计，由 formatPrice() 格式化
//   description - 店铺卡片名称下方的说明
//   emoji       - 卡片图片占位符，也用于飞入购物车的动画
//   image       - 可选图片路径；设置后替代 emoji
//   className   - 柔和色调类，购物车商品缩略图复用

// 注意：当前产品仅为占位符；与团队其他成员确认后，
// 它们将被替换为我们的实际产品。
const PRODUCTS = {
    strawberry: {
        name: "草莓风味",
        price: 25.5,
        description: "甜美鲜亮，莓香四溢。",
        emoji: "🍓",
        image: "",
        className: "strawberry"
    },
    mango: {
        name: "芒果风味",
        price: 24,
        description: "每一勺都是热带风情。",
        emoji: "🥭",
        image: "",
        className: "mango"
    },
    citrus: {
        name: "柑橘风味",
        price: 26,
        description: "清新酸爽，柑橘味十足。",
        emoji: "🍊",
        image: "",
        className: "citrus"
    }
};
