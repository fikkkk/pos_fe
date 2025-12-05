import React, { useState, useMemo } from "react";
import { FaSearch, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "./transaksi.css";

const formatRp = (n) =>
  Number(n ?? 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

// ====================================
// DUMMY PRODUK
// ====================================
const dummyProducts = [
  {
    id: 1,
    name: "Minyak Fortune 2L",
    price: 32900,
    stock: 60,
    imageUrl: "/img/minyak.png",
    discountPercent: 20, // contoh produk ada diskon
  },
  {
    id: 2,
    name: "Mie Goreng Indomie",
    price: 3500,
    stock: 110,
    imageUrl: "/img/indomie.png",
  },
  {
    id: 3,
    name: "Beras Ramos 5Kg",
    price: 78000,
    stock: 30,
    imageUrl: "/img/beras.png",
  },
  {
    id: 4,
    name: "Sabun Lifebuoy 450ml",
    price: 20000,
    stock: 50,
    imageUrl: "/img/sabun.png",
  },
  {
    id: 5,
    name: "Aqua Botol 600ml",
    price: 3500,
    stock: 200,
    imageUrl: "/img/aqua.png",
  },
  {
    id: 6,
    name: "Rinso 900gr",
    price: 24000,
    stock: 80,
    imageUrl: "/img/rinso.png",
  },
  {
    id: 7,
    name: "Gula Pasir 1Kg",
    price: 14000,
    stock: 40,
    imageUrl: "/img/gula.png",
  },
  {
    id: 8,
    name: "Telur Ayam 1Kg",
    price: 28000,
    stock: 50,
    imageUrl: "/img/telur.png",
  },
  {
    id: 9,
    name: "Susu Dancow 400gr",
    price: 52000,
    stock: 30,
    imageUrl: "/img/dancow.png",
  },
  {
    id: 10,
    name: "Choki-Choki 5pc",
    price: 6000,
    stock: 100,
    imageUrl: "/img/choki.png",
  },
  {
    id: 11,
    name: "Kecap ABC 600ml",
    price: 18000,
    stock: 90,
    imageUrl: "/img/kecap.png",
  },
  {
    id: 12,
    name: "Tepung Segitiga Biru 1Kg",
    price: 12500,
    stock: 70,
    imageUrl: "/img/tepung.png",
  },
  {
    id: 13,
    name: "Sprite Botol 390ml",
    price: 4500,
    stock: 150,
    imageUrl: "/img/sprite.png",
  },
  {
    id: 14,
    name: "Sarden ABC 425gr",
    price: 22000,
    stock: 45,
    imageUrl: "/img/sarden.png",
  },
  {
    id: 15,
    name: "Teh Pucuk 500ml",
    price: 4000,
    stock: 160,
    imageUrl: "/img/pucuk.png",
  },
  {
    id: 16,
    name: "Gas Elpiji 3Kg",
    price: 23000,
    stock: 25,
    imageUrl: "/img/gas.png",
  },
  {
    id: 17,
    name: "Roti Tawar Sari Roti",
    price: 16500,
    stock: 35,
    imageUrl: "/img/roti.png",
  },
  {
    id: 18,
    name: "Susu Ultramilk 1L",
    price: 19500,
    stock: 45,
    imageUrl: "/img/ultramilk.png",
  },
  {
    id: 19,
    name: "SilverQueen 65gr",
    price: 14500,
    stock: 60,
    imageUrl: "/img/silverqueen.png",
  },
  {
    id: 20,
    name: "Downy 650ml",
    price: 21000,
    stock: 40,
    imageUrl: "/img/downy.png",
  },
  {
    id: 21,
    name: "Japota Honey Butter",
    price: 23000,
    stock: 25,
    imageUrl: "/img/japotamadu.png",
  },
];

// ====================================
// KATEGORI
// ====================================
const categories = [
  { label: "Makanan", icon: "/img/cat-makanan.png" },
  { label: "Sembako", icon: "/img/cat-sembako.png" },
  { label: "Perawatan Tubuh", icon: "/img/cat-perawatan.png" },
  { label: "Produk Bayi", icon: "/img/cat-bayi.png" },
  { label: "Bumbu Dapur", icon: "/img/cat-bumbu.png" },
  { label: "Frozen Food", icon: "/img/cat-frozen.png" },
  { label: "Minuman", icon: "/img/cat-minuman.png" },
  { label: "Kebutuhan Rumah Tangga", icon: "/img/cat-rumah.png" },
  { label: "Peralatan / Alat", icon: "/img/cat-alat.png" },
  { label: "Obat & Kesehatan", icon: "/img/cat-obat.png" },
  { label: "Lainnya", icon: "/img/cat-lainnya.png" },
];

// hitung total per-item (sudah termasuk diskon kalau ada)
const getItemTotal = (item) => {
  const base = item.price * item.qty;
  if (item.discountPercent) {
    return Math.round(base * (1 - item.discountPercent / 100));
  }
  return base;
};

// ====================================
// MAIN COMPONENT
// ====================================
const Transaksi = () => {
  const [activeCategory, setActiveCategory] = useState("Makanan");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // FILTER PRODUK (sementara hanya by search, kategori hanya styling aktif)
  const filteredProducts = dummyProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // HITUNG PAGE
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // ADD TO CART
  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((c) => c.id === product.id);
      if (exist) {
        return prev.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      // tambahkan properti unit (default 'SATUAN')
      return [...prev, { ...product, qty: 1, unit: "SATUAN" }];
    });
  };

  // QTY plus/minus
  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c
        )
        .filter((c) => c.qty > 0)
    );
  };

  // QTY dari input
  const setQty = (id, value) => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n <= 0) return;
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: n } : c))
    );
  };

  // Ganti satuan (UI saja, belum ada logika pack)
  const changeUnit = (id, unit) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unit } : c))
    );
  };

  // REMOVE ITEM
  const removeItem = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

  // CLEAR CART
  const clearCart = () => setCart([]);

  // SUMMARY (pakai harga setelah diskon)
  const { subtotal, pajak, total } = useMemo(() => {
    const sub = cart.reduce((a, c) => a + getItemTotal(c), 0);
    const tax = Math.round(sub * 0.11);
    return { subtotal: sub, pajak: tax, total: sub + tax };
  }, [cart]);

  return (
    <div className="trx-page">
      {/* ========================================== */}
      {/* KIRI */}
      {/* ========================================== */}
      <div className="trx-left">
        <div className="trx-search-box">
          <FaSearch size={12} />
          <input
            className="trx-search-input"
            placeholder="Cari Produk"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* KATEGORI */}
        <div className="trx-cat-row">
          {categories.map((cat) => (
            <button
              key={cat.label}
              className={
                "trx-cat-pill" +
                (cat.label === activeCategory ? " trx-cat-active" : "")
              }
              onClick={() => setActiveCategory(cat.label)}
            >
              <span className="trx-cat-label">{cat.label}</span>
              <span className="trx-cat-icon">
                <img src={cat.icon} alt={cat.label} />
              </span>
            </button>
          ))}
        </div>

        {/* GRID PRODUK */}
        <div className="trx-product-grid">
          {currentProducts.map((p) => (
            <button
              key={p.id}
              className="trx-product-card"
              onClick={() => addToCart(p)}
            >
              <div className="trx-stock-bar">
                <img
                  src="/img/icon-box.png"
                  alt="stok"
                  className="trx-stock-icon-img"
                />
                <span className="trx-stock-text">{p.stock}</span>
              </div>

              <div className="trx-product-image">
                <img src={p.imageUrl} alt={p.name} />
              </div>

              <div className="trx-product-info">
                <div className="trx-name">{p.name}</div>
                <div className="trx-price">{formatRp(p.price)}</div>
              </div>
            </button>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="trx-pagination">
          <div className="trx-page-info">
            {indexOfFirst + 1}–{Math.min(indexOfLast, filteredProducts.length)}{" "}
            dari {filteredProducts.length} item
          </div>

          <div className="trx-page-buttons">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              «
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ‹
            </button>

            <span className="trx-page-number">{currentPage}</span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              ›
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              »
            </button>
          </div>

          <div className="trx-page-size">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
            </select>
            <span>items per page</span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* KANAN */}
      {/* ========================================== */}
      <div className="trx-right">
        <div className="trx-right-header">
          <div>
            <div className="trx-title">KASIR</div>
            <div className="trx-subtitle">Produk yang dibeli</div>
          </div>
          <button className="trx-clear" onClick={clearCart}>
            Hapus Semua
          </button>
        </div>

        <div className="trx-cart-list">
          {cart.length === 0 && (
            <div className="trx-empty">Belum ada produk.</div>
          )}

          {cart.map((item, index) => {
            const lineTotal = getItemTotal(item);
            return (
              <div key={item.id} className="trx-cart-item">
                {/* KIRI: nomor + info produk */}
                <div className="trx-cart-left">
                  <div className="trx-number-box">{index + 1}</div>

                  <div className="trx-cart-main">
                    <div className="trx-cart-name">{item.name}</div>

                    <div className="trx-cart-meta-row">
                      <div className="trx-unit-price-wrap">
                        <span className="trx-unit-price-pill">
                          {formatRp(item.price)}
                        </span>

                        {item.discountPercent && (
                          <span className="trx-discount-pill">
                            <img
                              src="/img/diskon.png"
                              alt="diskon"
                              className="trx-discount-icon"
                            />
                            <span>{`Diskon ${item.discountPercent}%`}</span>
                          </span>
                        )}
                      </div>

                      <div className="trx-stock-small">
                        <img
                          src="/img/icon-box.png"
                          alt="stok"
                          className="trx-stock-small-icon"
                        />
                        <span className="trx-stock-small-text">
                          {item.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KANAN: satuan, qty, total, delete */}
                <div className="trx-cart-right">
                  <div className="trx-unit-select-row">
                    <select
                      className="trx-unit-select"
                      value={item.unit}
                      onChange={(e) => changeUnit(item.id, e.target.value)}
                    >
                      <option value="SATUAN">Satuan (x1)</option>
                      <option value="PACK">Pack (x6)</option>
                      <option value="DUS">Dus</option>
                    </select>
                  </div>

                  <div className="trx-qty-total-row">
                    <div className="trx-qty">
                      <button onClick={() => changeQty(item.id, -1)}>
                        <FaMinus size={10} />
                      </button>
                      <input
                        className="trx-qty-input"
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => setQty(item.id, e.target.value)}
                      />
                      <button onClick={() => changeQty(item.id, +1)}>
                        <FaPlus size={10} />
                      </button>
                    </div>

                    <div className="trx-total-delete-col">
                      <button
                        className="trx-delete-circle"
                        onClick={() => removeItem(item.id)}
                      >
                        <FaTrash size={12} />
                      </button>

                      <div className="trx-item-total-pill">
                        {formatRp(lineTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="trx-summary">
          <div className="trx-row">
            <span>SubTotal</span>
            <span>{formatRp(subtotal)}</span>
          </div>

          <div className="trx-row">
            <span>Pajak</span>
            <span>{formatRp(pajak)}</span>
          </div>

          <div className="trx-row trx-total-row">
            <span>Total</span>
            <span>{formatRp(total)}</span>
          </div>
        </div>

        <button className="trx-bayar-btn">Bayar {formatRp(total)}</button>
      </div>
    </div>
  );
};

export default Transaksi;
