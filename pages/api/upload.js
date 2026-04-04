import formidable from "formidable";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: { bodyParser: false },
};

ffmpeg.setFfmpegPath(ffmpegStatic);

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log("[upload] using key:", serviceKey ? "service_role" : "anon");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceKey || anonKey
);

// SNSサイズ定義
const SNS_IMAGE_SIZES = [
  { key: "original",   width: null,  height: null  },
  { key: "instagram",  width: 1080,  height: 1080  },
  { key: "tiktok",     width: 1080,  height: 1920  },
  { key: "x",          width: 1200,  height: 675   },
  { key: "line",       width: 1080,  height: 1080  },
];

const SNS_VIDEO_SIZES = [
  { key: "tiktok",     width: 1080,  height: 1920  },
  { key: "instagram",  width: 1080,  height: 1920  },
  { key: "x",          width: 1280,  height: 720   },
];

// EMS料金テーブル
function getEmsRate(weightG) {
  if (weightG <= 500)  return 1500;
  if (weightG <= 1000) return 2200;
  if (weightG <= 2000) return 3200;
  if (weightG <= 3000) return 4200;
  if (weightG <= 5000) return 5500;
  return 7000;
}

// 販売価格自動計算
function calcSalePrice(cnyPrice, weightG) {
  const baseCost  = cnyPrice * 23;
  const emsCost   = getEmsRate(weightG);
  const subtotal  = baseCost + emsCost;
  const importTax = subtotal * 0.08;
  const totalCost = subtotal + importTax + 1000;
  return Math.ceil((totalCost * 1.33) / 100) * 100;
}

// 画像をリサイズしてBufferを返す
async function resizeImage(inputPath, width, height) {
  if (!width || !height) {
    return fs.readFileSync(inputPath);
  }
  return sharp(inputPath)
    .resize(width, height, { fit: "cover", position: "center" })
    .jpeg({ quality: 85 })
    .toBuffer();
}

// 動画を変換してファイルパスを返す
function convertVideo(inputPath, outputPath, width, height) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "28",
        "-c:a", "aac",
        "-movflags", "+faststart",
      ])
      .output(outputPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

// Supabase Storageにアップロード
async function uploadToStorage(buffer, storagePath, mimeType) {
  const { error } = await supabase.storage
    .from("products")
    .upload(storagePath, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error("Storage upload error: " + error.message);

  const { data } = supabase.storage.from("products").getPublicUrl(storagePath);
  return data.publicUrl;
}

export default function handler(req, res) {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "parse error" });

    const id = Date.now().toString();
    const tmpDir = path.join(process.cwd(), "tmp", id);
    fs.mkdirSync(tmpDir, { recursive: true });

    try {
      const allFiles = files.images
        ? Array.isArray(files.images) ? files.images : [files.images]
        : [];

      const imageFiles = allFiles.filter(f => f.mimetype?.startsWith("image/"));
      const videoFiles = allFiles.filter(f => f.mimetype?.startsWith("video/"));

      const snsImages = {};
      const snsVideos = {};

      // 画像処理（Sharp）
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileKey = `img${i + 1}`;
        snsImages[fileKey] = {};

        for (const { key, width, height } of SNS_IMAGE_SIZES) {
          const buffer = await resizeImage(file.filepath, width, height);
          const storagePath = `${id}/${fileKey}_${key}.jpg`;
          const url = await uploadToStorage(buffer, storagePath, "image/jpeg");
          snsImages[fileKey][key] = url;
        }
      }

      // 動画処理（FFmpeg）
      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        const fileKey = `vid${i + 1}`;
        snsVideos[fileKey] = {};

        for (const { key, width, height } of SNS_VIDEO_SIZES) {
          const outputPath = path.join(tmpDir, `${fileKey}_${key}.mp4`);
          await convertVideo(file.filepath, outputPath, width, height);
          const buffer = fs.readFileSync(outputPath);
          const storagePath = `${id}/${fileKey}_${key}.mp4`;
          const url = await uploadToStorage(buffer, storagePath, "video/mp4");
          snsVideos[fileKey][key] = url;
          fs.unlinkSync(outputPath);
        }
      }

      // tmpディレクトリ削除
      fs.rmSync(tmpDir, { recursive: true, force: true });

      // 価格計算
      const cnyPrice  = parseFloat(fields.cnyPrice?.[0] || fields.cnyPrice || 0);
      const weightG   = parseFloat(fields.weightG?.[0]  || fields.weightG  || 500);
      const nameJa    = fields.nameJa?.[0] || fields.nameJa || "";
      const salePrice = calcSalePrice(cnyPrice, weightG);

      const baseCost  = Math.round(cnyPrice * 23);
      const emsCost   = getEmsRate(weightG);
      const subtotal  = baseCost + emsCost;
      const importTax = Math.round(subtotal * 0.08);
      const totalCost = subtotal + importTax + 1000;

      // メイン画像URL（original）
      const firstImgKey = Object.keys(snsImages)[0];
      const mainImages = firstImgKey
        ? Object.values(snsImages).map(img => img.original)
        : [];

      // Supabase productsテーブルに保存
      const { error: dbError } = await supabase.from("products").insert({
        id,
        name_ja:    nameJa,
        cny_price:  cnyPrice,
        weight_g:   weightG,
        sale_price: salePrice,
        images:     mainImages,
        sns_images: snsImages,
        sns_videos: snsVideos,
      });

      if (dbError) throw new Error("DB insert error: " + dbError.message);

      res.status(200).json({
        success: true,
        id,
        salePrice,
        snsImages,
        snsVideos,
        breakdown: { baseCost, emsCost, importTax, totalCost, salePrice },
      });

    } catch (e) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });
}
