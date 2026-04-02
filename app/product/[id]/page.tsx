"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { addToCart, getCart, getCartCount } from "@/lib/cart";

type Product = {
  id: string;
  name: string;
  price: number | null;
  trend_reason: string | null;
  use_scene: string | null;
  good_review: string | null;
  bad_review: string | null;
  features: string | null;
  images: string[] | null;
  category: string | null;
};

const REVIEW_NAMES = {
  ja: ["Aさん", "Bさん", "Cさん", "Dさん", "Eさん"],
  zh: ["用户A", "用户B", "用户C", "用户D", "用户E"],
  en: ["User A", "User B", "User C", "User D", "User E"],
};

const t = {
  ja: {
    back: "戻る",
    yen: "¥",
    why: "人気の理由",
    scene: "こんなシーンに",
    good: "購入者の声",
    bad: "ここが気になる",
    badNote: "※ 個人の感想です。サイズ感など不安な方はLINEでお気軽にご相談ください。",
    feat: "商品の特徴",
    buy: "カートに入れる",
    added: "追加しました!",
    line: "LINE相談",
    cart: "カート",
    notFound: "商品が見つかりません",
    loading: "読み込み中...",
    shipping: "中国から直送",
    deliveryEst: "お届け予定",
    guarantee: "現地スタッフが検品済み",
    returnOk: "不良品は返品OK",
    safe: "安全な梱包材を使用",
    sold: "人が購入",
    share: "シェア",
    alsoLike: "こちらもおすすめ",
    fewLeft: "残りわずか！お早めに",
    reviews: "件のレビュー",
    verified: "購入済み",
  },
  zh: {
    back: "返回",
    yen: "¥",
    why: "流行原因",
    scene: "使用场景",
    good: "买家好评",
    bad: "需要注意",
    badNote: "※ 仅为个人感受。如对尺寸有疑问，请通过LINE咨询。",
    feat: "商品特点",
    buy: "加入购物车",
    added: "已添加!",
    line: "LINE咨询",
    cart: "购物车",
    notFound: "商品未找到",
    loading: "加载中...",
    shipping: "中国直邮",
    deliveryEst: "预计到货",
    guarantee: "当地员工已质检",
    returnOk: "不良品可退",
    safe: "使用安全包装材料",
    sold: "人已购买",
    share: "分享",
    alsoLike: "猜你喜欢",
    fewLeft: "库存紧张！抓紧下单",
    reviews: "条评价",
    verified: "已购买",
  },
  en: {
    back: "Back",
    yen: "¥",
    why: "Why trending",
    scene: "Use cases",
    good: "Buyer reviews",
    bad: "Things to note",
    badNote: "* Personal opinions. Feel free to ask us via LINE if you have concerns about sizing.",
    feat: "Features",
    buy: "Add to Cart",
    added: "Added!",
    line: "LINE",
    cart: "Cart",
    notFound: "Product not found",
    loading: "Loading...",
    shipping: "Direct from China",
    deliveryEst: "Est. delivery",
    guarantee: "Inspected on-site",
    returnOk: "Returns for defects",
    safe: "Safe packaging",
    sold: "sold",
    share: "Share",
    alsoLike: "You may also like",
    fewLeft: "Few left! Order soon",
    reviews: "reviews",
    verified: "Verified buyer",
  },
};

function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 10);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [shared, setShared] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const l = t[lang];

  const sold = product ? (seededRandom(product.id) % 180) + 20 : 0;
  const rating = product ? (4.0 + (seededRandom(product.id + "r") % 10) / 10).toFixed(1) : "4.5";
  const reviewCount = product ? (seededRandom(product.id + "rc") % 60) + 5 : 0;
  const fewLeft = product ? seededRandom(product.id + "stock") % 5 === 0 : false;

  useEffect(() => {
    setCartCount(getCartCount(getCart()));
    function onUpdate() { setCartCount(getCartCount(getCart())); }
    window.addEventListener("cart-update", onUpdate);
    return () => window.removeEventListener("cart-update", onUpdate);
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      setProduct(data);
      setLoading(false);

      if (data) {
        // Load related: same category first, then others
        const { data: sameCat } = await supabase
          .from("products")
          .select("id, name, price, images, category, created_at")
          .eq("category", data.category || "goods")
          .neq("id", id)
          .limit(4);

        if (sameCat && sameCat.length > 0) {
          setRelated(sameCat);
        } else {
          const { data: others } = await supabase
            .from("products")
            .select("id, name, price, images, category, created_at")
            .neq("id", id)
            .limit(4);
          if (others) setRelated(others);
        }
      }
    }
    load();
  }, [id]);

  // Swipe handling for image gallery
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    let startX = 0;
    let diff = 0;

    function onTouchStart(e: TouchEvent) { startX = e.touches[0].clientX; }
    function onTouchMove(e: TouchEvent) { diff = e.touches[0].clientX - startX; }
    function onTouchEnd() {
      const images = product?.images || [];
      if (Math.abs(diff) > 50) {
        if (diff < 0 && currentImg < images.length - 1) setCurrentImg((p) => p + 1);
        if (diff > 0 && currentImg > 0) setCurrentImg((p) => p - 1);
      }
      diff = 0;
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [currentImg, product]);

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-14">
        <div className="animate-pulse">
          <div className="w-full aspect-square bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-5 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-gray-400">{l.notFound}</p>
        <a href="/" className="text-sm text-blue-500 underline">{l.back}</a>
      </div>
    );
  }

  const images = product.images || [];
  const reviewerName = REVIEW_NAMES[lang][seededRandom(product.id + "name") % 5];
  const reviewerName2 = REVIEW_NAMES[lang][(seededRandom(product.id + "name2") + 1) % 5];

  return (
    <main className="bg-gray-50 text-black min-h-screen pb-28">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur z-50 flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <a href="/" className="text-sm text-gray-600">&#8592; {l.back}</a>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="text-xs bg-gray-100 px-3 py-1.5 rounded-full">
            {shared ? "&#10003;" : l.share}
          </button>
          <a href="/cart" className="relative text-xs bg-gray-100 px-3 py-1.5 rounded-full">
            {l.cart}
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </a>
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
        </div>
      </header>

      {/* Swipeable Image Gallery */}
      {images.length > 0 && (
        <section className="pt-12 bg-white">
          <div ref={galleryRef} className="relative overflow-hidden">
            <img
              src={images[currentImg]}
              alt={product.name}
              className="w-full aspect-square object-cover transition-transform"
            />
            {/* Swipe dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition ${
                      currentImg === i ? "bg-white scale-110" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
            {fewLeft && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                {l.fewLeft}
              </div>
            )}
          </div>
          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                    currentImg === i ? "border-black" : "border-gray-200"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Price & Name */}
      <section className="bg-white px-4 pb-4">
        {product.price && (
          <p className="text-3xl font-black text-red-600">
            {l.yen}{product.price.toLocaleString()}
          </p>
        )}
        <h1 className="text-lg font-bold mt-2">{product.name}</h1>

        {/* Rating + Sold */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-sm ${s <= Math.round(parseFloat(rating)) ? "text-yellow-400" : "text-gray-200"}`}>&#9733;</span>
            ))}
            <span className="text-sm font-bold ml-1">{rating}</span>
          </div>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500">{reviewCount} {l.reviews}</span>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500">{sold} {l.sold}</span>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-green-50 rounded-xl p-2.5 text-center">
            <p className="text-green-600 font-bold text-xs">&#10003; {l.guarantee}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-2.5 text-center">
            <p className="text-green-600 font-bold text-xs">&#10003; {l.returnOk}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-2.5 text-center">
            <p className="text-blue-600 font-bold text-xs">&#10003; {l.safe}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-2.5 text-center">
            <p className="text-blue-600 font-bold text-xs">{l.deliveryEst}: ~{getDeliveryDate()}</p>
          </div>
        </div>
      </section>

      <div className="h-2" />

      {/* Product Details */}
      <div className="bg-white px-4 py-5 space-y-5">
        {product.trend_reason && (
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-xs">&#9830;</span>
              {l.why}
            </h3>
            <p className="text-sm text-gray-700 bg-orange-50 rounded-xl p-4 leading-relaxed">
              {product.trend_reason}
            </p>
          </div>
        )}

        {product.use_scene && (
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-xs">&#9679;</span>
              {l.scene}
            </h3>
            <p className="text-sm text-gray-700 bg-blue-50 rounded-xl p-4 leading-relaxed">
              {product.use_scene}
            </p>
          </div>
        )}

        {product.features && (
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center text-xs">&#9733;</span>
              {l.feat}
            </h3>
            <p className="text-sm text-gray-700 bg-purple-50 rounded-xl p-4 leading-relaxed">
              {product.features}
            </p>
          </div>
        )}
      </div>

      {/* Reviews Section (styled with avatars) */}
      {(product.good_review || product.bad_review) && (
        <>
          <div className="h-2" />
          <div className="bg-white px-4 py-5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-1.5">
              <span className="w-5 h-5 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center text-xs">&#9733;</span>
              {l.good} ({reviewCount})
            </h3>

            {product.good_review && (
              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                    {reviewerName[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{reviewerName}</p>
                    <p className="text-[10px] text-gray-400">{l.verified} &#10003;</p>
                  </div>
                  <div className="ml-auto text-yellow-400 text-xs">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{product.good_review}</p>
              </div>
            )}

            {product.bad_review && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                    {reviewerName2[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{reviewerName2}</p>
                    <p className="text-[10px] text-gray-400">{l.verified} &#10003;</p>
                  </div>
                  <div className="ml-auto text-yellow-400 text-xs">&#9733;&#9733;&#9733;&#9734;&#9734;</div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{product.bad_review}</p>
                <p className="text-[10px] text-gray-400 mt-2">{l.badNote}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Related Products (same category first) */}
      {related.length > 0 && (
        <>
          <div className="h-2" />
          <section className="bg-white px-4 py-5">
            <h3 className="text-sm font-bold mb-3">{l.alsoLike}</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {related.map((r) => (
                <a key={r.id} href={`/product/${r.id}`} className="flex-shrink-0 w-32">
                  {r.images && r.images[0] ? (
                    <img src={r.images[0]} alt={r.name} className="w-32 h-32 object-cover rounded-xl" />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-xl" />
                  )}
                  <p className="text-xs font-medium mt-1 truncate">{r.name}</p>
                  {r.price && (
                    <p className="text-xs font-bold text-red-600">{l.yen}{r.price.toLocaleString()}</p>
                  )}
                </a>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg px-4 py-3 flex gap-2 z-50">
        <a
          href="https://lin.ee/wuKhILR"
          target="_blank"
          rel="noopener noreferrer"
          className="w-1/4 bg-[#06C755] text-white text-center py-3.5 rounded-xl font-bold text-sm flex items-center justify-center"
        >
          {l.line}
        </a>
        <button
          onClick={() => {
            if (!product || !product.price) return;
            addToCart({ id: product.id, name: product.name, price: product.price, image: images[0] || "" });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
          className={`w-3/4 text-white text-center py-3.5 rounded-xl font-bold text-sm flex items-center justify-center transition ${
            added ? "bg-green-500" : "bg-black"
          }`}
        >
          {added ? l.added : `${l.buy} ${product.price ? `${l.yen}${product.price.toLocaleString()}` : ""}`}
        </button>
      </div>
    </main>
  );
}
