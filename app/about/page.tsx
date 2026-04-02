"use client";

import { useState } from "react";

const t = {
  ja: {
    back: "トップへ",
    title: "Trend Selectについて",
    subtitle: "なぜ私たちから買うのがいいのか",
    s1title: "現地スタッフが検品",
    s1p1: "中国在住のスタッフが、仕入れ先の店舗に直接足を運び、一点ずつ実物を確認しています。",
    s1p2: "写真と実物が違う、縫製が甘い、汚れがある——そういった商品はその場で返品。日本に届くのは「合格品」だけです。",
    s1p3: "ネットの画像だけで仕入れている業者とは、ここが決定的に違います。",
    s2title: "安全な梱包で発送",
    s2p1: "格安通販サイトで「梱包材から異臭がする」「発がん性物質が検出された」というニュースを見たことはありませんか？",
    s2p2: "私たちは安全な梱包材のみを使用し、商品を丁寧に包んで発送します。届いた瞬間から安心してお使いいただけます。",
    s3title: "中国製＝実は高品質",
    s3p1: "Apple、Nike、Uniqloなど世界の一流ブランドの多くが中国で製造されています。",
    s3p2: "中国には優れた技術と品質管理を持つ工場が数多くあります。問題は「どの店から買うか」です。",
    s3p3: "私たちは長年の現地経験から、品質の高い信頼できる店舗だけを厳選。「ハズレ」を引くリスクをゼロにしています。",
    s4title: "お届けまでの流れ",
    s4step1: "商品を注文",
    s4step2: "現地スタッフが検品",
    s4step3: "安全梱包で発送",
    s4step4: "約7〜14日でお届け",
    s5title: "万が一のときも安心",
    s5p1: "届いた商品に不具合があった場合は、返品・交換に対応いたします。",
    s5p2: "サイズ感や色味が気になる方は、ご注文前にLINEでお気軽にご相談ください。実物の写真をお送りすることも可能です。",
    cta: "商品を見る",
    lineAsk: "LINEで相談する",
  },
  zh: {
    back: "返回首页",
    title: "关于Trend Select",
    subtitle: "为什么选择我们",
    s1title: "当地员工亲自验货",
    s1p1: "我们在中国的员工会亲自前往供应商店铺，逐件检查实物。",
    s1p2: "图片与实物不符、缝制不良、有污渍——这些商品当场退回。寄到日本的只有「合格品」。",
    s1p3: "这与仅凭网络图片进货的商家有着根本性的区别。",
    s2title: "安全包装发货",
    s2p1: "你是否看过「廉价网购平台包装材料有异味」「检测出致癌物质」的新闻？",
    s2p2: "我们仅使用安全的包装材料，精心包装后发货。收到时就能安心使用。",
    s3title: "中国制造=高品质",
    s3p1: "Apple、Nike、优衣库等世界一线品牌大多在中国生产。",
    s3p2: "中国拥有众多技术精湛、品控严格的工厂。关键在于「从哪家店买」。",
    s3p3: "凭借多年的当地经验，我们只精选品质可靠的店铺，将买到次品的风险降为零。",
    s4title: "配送流程",
    s4step1: "下单购买",
    s4step2: "当地员工验货",
    s4step3: "安全包装发货",
    s4step4: "约7〜14天送达",
    s5title: "售后保障",
    s5p1: "如收到的商品有质量问题，我们提供退换货服务。",
    s5p2: "对尺寸或颜色有疑问的话，下单前可通过LINE咨询，我们可以发实物照片。",
    cta: "查看商品",
    lineAsk: "LINE咨询",
  },
  en: {
    back: "Home",
    title: "About Trend Select",
    subtitle: "Why buy from us",
    s1title: "On-site quality inspection",
    s1p1: "Our staff in China personally visits supplier stores and inspects every single item.",
    s1p2: "Photos don't match? Poor stitching? Stains? Those items are returned on the spot. Only approved products are shipped to Japan.",
    s1p3: "This is fundamentally different from sellers who source based on online photos alone.",
    s2title: "Safe packaging guaranteed",
    s2p1: "Have you seen news about cheap platforms using packaging materials with strange odors or even carcinogenic substances?",
    s2p2: "We use only safe packaging materials and carefully wrap each product. You can use it with peace of mind from the moment it arrives.",
    s3title: "Made in China = Quality",
    s3p1: "Apple, Nike, Uniqlo — many of the world's top brands manufacture in China.",
    s3p2: "China has numerous factories with excellent technology and quality control. The key is knowing which stores to buy from.",
    s3p3: "With years of local experience, we handpick only trustworthy, high-quality stores — eliminating the risk of receiving poor products.",
    s4title: "How delivery works",
    s4step1: "Place your order",
    s4step2: "On-site inspection",
    s4step3: "Safe packaging & shipping",
    s4step4: "Delivered in ~7-14 days",
    s5title: "Peace of mind guarantee",
    s5p1: "If you receive a defective product, we offer returns and exchanges.",
    s5p2: "Unsure about size or color? Ask us via LINE before ordering — we can send photos of the actual product.",
    cta: "Browse Products",
    lineAsk: "Ask via LINE",
  },
};

export default function AboutPage() {
  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");
  const l = t[lang];

  return (
    <main className="bg-white text-black min-h-screen pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <a href="/" className="text-sm text-gray-600">&#8592; {l.back}</a>
        <div className="flex gap-0.5 text-[10px] bg-gray-100 px-0.5 py-0.5 rounded-full">
          {(["ja", "zh", "en"] as const).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`px-2 py-1 rounded-full transition ${lang === code ? "bg-black text-white" : ""}`}
            >
              {code === "ja" ? "JP" : code === "zh" ? "CN" : "EN"}
            </button>
          ))}
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <img
          src="https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=1200&q=80"
          alt=""
          className="w-full h-56 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 flex items-end">
          <div className="p-6">
            <h1 className="text-white text-2xl font-black">{l.title}</h1>
            <p className="text-white/80 text-sm mt-1">{l.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Section 1: Inspection */}
      <section className="px-4 pt-8">
        <img
          src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&q=80"
          alt=""
          className="w-full h-48 object-cover rounded-2xl mb-4"
        />
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">1</span>
          <h2 className="text-lg font-bold">{l.s1title}</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>{l.s1p1}</p>
          <p>{l.s1p2}</p>
          <p className="font-medium text-black">{l.s1p3}</p>
        </div>
      </section>

      <div className="mx-4 my-8 border-t border-gray-100" />

      {/* Section 2: Packaging */}
      <section className="px-4">
        <img
          src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80"
          alt=""
          className="w-full h-48 object-cover rounded-2xl mb-4"
        />
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">2</span>
          <h2 className="text-lg font-bold">{l.s2title}</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>{l.s2p1}</p>
          <p>{l.s2p2}</p>
        </div>
      </section>

      <div className="mx-4 my-8 border-t border-gray-100" />

      {/* Section 3: Quality */}
      <section className="px-4">
        <img
          src="https://images.unsplash.com/photo-1665686306574-1ace09918530?w=800&q=80"
          alt=""
          className="w-full h-48 object-cover rounded-2xl mb-4"
        />
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">3</span>
          <h2 className="text-lg font-bold">{l.s3title}</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>{l.s3p1}</p>
          <p>{l.s3p2}</p>
          <p className="font-medium text-black">{l.s3p3}</p>
        </div>
      </section>

      <div className="mx-4 my-8 border-t border-gray-100" />

      {/* Section 4: Delivery Flow */}
      <section className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-purple-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">4</span>
          <h2 className="text-lg font-bold">{l.s4title}</h2>
        </div>
        <div className="space-y-0">
          {[l.s4step1, l.s4step2, l.s4step3, l.s4step4].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  ["bg-gray-800", "bg-green-500", "bg-orange-500", "bg-blue-500"][i]
                }`}>
                  {i + 1}
                </div>
                {i < 3 && <div className="w-0.5 h-8 bg-gray-200" />}
              </div>
              <div className="pt-2.5">
                <p className="text-sm font-medium">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-4 my-8 border-t border-gray-100" />

      {/* Section 5: Guarantee */}
      <section className="px-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">5</span>
          <h2 className="text-lg font-bold">{l.s5title}</h2>
        </div>
        <div className="bg-green-50 rounded-2xl p-5 space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>{l.s5p1}</p>
          <p>{l.s5p2}</p>
        </div>
      </section>

      {/* CTAs */}
      <section className="px-4 pt-8 space-y-3">
        <a href="/" className="block w-full bg-black text-white text-center py-4 rounded-xl font-bold text-sm">
          {l.cta}
        </a>
        <a
          href="https://lin.ee/wuKhILR"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-[#06C755] text-white text-center py-4 rounded-xl font-bold text-sm"
        >
          {l.lineAsk}
        </a>
      </section>
    </main>
  );
}
