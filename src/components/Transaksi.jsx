import React, { useState, useMemo, useEffect } from "react";
import { FaSearch, FaTrash, FaPlus, FaMinus, FaShoppingCart, FaCashRegister, FaSpinner } from "react-icons/fa";
import { api } from "../api";
import "./transaksi.css";

const formatRp = (n) =>
  Number(n ?? 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

// ====================================
// KATEGORI
// ====================================
const categories = [
  { label: "Semua", icon: "/img/cat-lainnya.png" },
  { label: "Makanan", icon: "/img/cat-makanan.png" },
  { label: "Sembako", icon: "/img/cat-sembako.png" },
  { label: "Perawatan Tubuh", icon: "/img/cat-perawatan.png" },
  { label: "Produk Bayi", icon: "/img/cat-bayi.png" },
  { label: "Frozen Food", icon: "/img/cat-frozen.png" },
  { label: "Minuman", icon: "/img/cat-minuman.png" },
  { label: "Kebutuhan Rumah Tangga", icon: "/img/cat-rumah.png" },
  { label: "Peralatan / Alat", icon: "/img/cat-alat.png" },
  { label: "Obat & Kesehatan", icon: "/img/cat-obat.png" },
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
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  // STATE untuk data dari API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Fetch produk dari backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/admin/products");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Gagal memuat data produk");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // FILTER PRODUK (by search dan kategori)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "Semua" ||
        (p.category?.name?.toLowerCase() === activeCategory.toLowerCase());
      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategory]);

  // HITUNG PAGE
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory]);

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
      {/* ==========================================
          HEADER - Modern Style with Animated Icon 
       ========================================== */}
      <div className="trx-page-header">
        <div className="trx-header-content">
          <div className="trx-header-icon">
            <FaShoppingCart />
          </div>
          <div className="trx-header-text">
            <h1 className="trx-page-title">Transaksi Penjualan</h1>
            <p className="trx-page-subtitle">Kelola transaksi kasir dengan cepat dan mudah</p>
          </div>
        </div>
      </div>

      {/* ==========================================
          MAIN CONTENT - Two Column Layout
       ========================================== */}
      <div className="trx-main-content">
        {/* ========================================== */}
        {/* KIRI - PRODUK */}
        {/* ========================================== */}
        <div className="trx-left">
          <div className="trx-search-box">
            <FaSearch size={14} />
            <input
              className="trx-search-input"
              placeholder="Cari Produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* KATEGORI - Tab Style */}
          <div className="trx-cat-tabs">
            {categories.map((cat) => (
              <button
                key={cat.label}
                className={
                  "trx-cat-tab" +
                  (cat.label === activeCategory ? " active" : "")
                }
                onClick={() => {
                  setActiveCategory(cat.label);
                  setCurrentPage(1);
                }}
              >
                <span className="trx-cat-tab-text">{cat.label}</span>
                <span className="trx-cat-tab-circle">
                  <img src={cat.icon} alt={cat.label} />
                </span>
              </button>
            ))}
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="trx-loading">
              <FaSpinner className="trx-spinner" />
              <span>Memuat produk...</span>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="trx-error">{error}</div>
          )}

          {/* GRID PRODUK */}
          {!loading && !error && (
            <div className="trx-product-grid">
              {currentProducts.map((p) => (
                <button
                  key={p.id}
                  className="trx-product-card"
                  onClick={() => addToCart(p)}
                >
                  <div className="trx-product-info">
                    <div className="trx-stock-bar">
                      <img
                        src="/img/icon-box.png"
                        alt="stok"
                        className="trx-stock-icon-img"
                      />
                      <span className="trx-stock-text">{p.stock}</span>
                    </div>
                    <div className="trx-name">{p.name}</div>
                    <div className="trx-price">{formatRp(p.price)}</div>
                  </div>
                </button>
              ))}

              {currentProducts.length === 0 && (
                <div className="trx-no-products">
                  Tidak ada produk ditemukan
                </div>
              )}
            </div>
          )}

          {/* PAGINATION */}
          <div className="trx-pagination">
            <div className="trx-page-info">
              {filteredProducts.length > 0 ? (
                <>
                  {indexOfFirst + 1}–{Math.min(indexOfLast, filteredProducts.length)}{" "}
                  dari {filteredProducts.length} item
                </>
              ) : (
                "0 item"
              )}
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
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                ›
              </button>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
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
        {/* KANAN - KERANJANG */}
        {/* ========================================== */}
        <div className="trx-right">
          <div className="trx-right-header">
            <div className="trx-right-title-section">
              <div className="trx-right-icon">
                <FaCashRegister />
              </div>
              <div>
                <div className="trx-title">KASIR</div>
                <div className="trx-subtitle">Produk yang dibeli</div>
              </div>
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
    </div>
  );
};

export default Transaksi;
