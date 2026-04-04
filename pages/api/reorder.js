import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { id, from, to } = req.body;

  const dir = path.join(process.cwd(), "public/products", id);
  const files = fs.readdirSync(dir).sort();

  if (to < 0 || to >= files.length) {
    return res.status(400).end();
  }

  const temp = files[from];
  files[from] = files[to];
  files[to] = temp;

  // 一旦全部リネーム
  files.forEach((file, i) => {
    fs.renameSync(
      path.join(dir, file),
      path.join(dir, `temp_${i}.jpg`)
    );
  });

  // 正式番号へ
  fs.readdirSync(dir).forEach((file, i) => {
    fs.renameSync(
      path.join(dir, file),
      path.join(dir, `${i + 1}.jpg`)
    );
  });

  res.status(200).end();
}