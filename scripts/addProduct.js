const fs = require("fs");
const path = require("path");

const [category, name] = process.argv.slice(2);

if (!category || !name) {
  console.log("使い方: node scripts/addProduct.js doll doll2");
  process.exit(1);
}

const base = path.join(__dirname, "../public/products", category, name);

fs.mkdirSync(base, { recursive: true });

// テンプレ元
const templates = {
  main: path.join(__dirname, "../public/main.jpg"),
  after: path.join(__dirname, "../public/after.png"),
  detail: path.join(__dirname, "../public/set.jpg")
};

// コピー処理
fs.copyFileSync(templates.main, path.join(base, "main.jpg"));
fs.copyFileSync(templates.after, path.join(base, "after.jpg"));
fs.copyFileSync(templates.detail, path.join(base, "detail.jpg"));

console.log(`✅ 完全生成: ${category}/${name}`);