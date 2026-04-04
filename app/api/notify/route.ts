import { NextRequest, NextResponse } from "next/server";

const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN || "";

export async function POST(req: NextRequest) {
  try {
    const { orderId, total, customerName, paymentMethod, items } = await req.json();

    const message = `
【新規注文】
注文番号: ${orderId}
お客様: ${customerName}
合計: ¥${total.toLocaleString()}
支払: ${paymentMethod}
商品:
${items.join("\n")}`;

    if (LINE_NOTIFY_TOKEN) {
      await fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `message=${encodeURIComponent(message)}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
