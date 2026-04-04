import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { nameJa, salePrice, cnyPrice, id } = req.body;

  const prompt = `
あなたは日本のSNSマーケターです。
以下の商品情報をもとに、各SNS媒体向けの投稿文を日本語で作成してください。

商品名: ${nameJa}
販売価格: ¥${salePrice?.toLocaleString()}
特徴: 中国発・安心品質・かわいい（HaoHao 好好ブランド）

【条件】
- ターゲット: 日本在住の20〜30代女性
- ブランドコンセプト: 中国製でも安心・安全・かわいい・プチラグジュアリー
- 各媒体の特性に合わせた文体・長さ・ハッシュタグ

以下のJSON形式で返してください（他のテキストは不要）:
{
  "instagram": "投稿文とハッシュタグ",
  "tiktok": "短くてキャッチーな文言",
  "x": "140文字以内のツイート",
  "line": "LINE公式アカウント向けメッセージ",
  "threads": "Threads向けの自然な文章"
}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // JSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON not found in response");

    const captions = JSON.parse(jsonMatch[0]);

    // 各SNSの投稿URLも生成
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ec-crossborder.vercel.app";
    const productUrl = `${baseUrl}/product/${id}`;

    res.status(200).json({
      success: true,
      captions,
      productUrl,
      xUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(captions.x + "\n" + productUrl)}`,
    });

  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: error.message });
  }
}
