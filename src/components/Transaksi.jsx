import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { api } from "../api";
import "./transaksi.css";

const formatRp = (n) =>
  Number(n ?? 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

// Default icon for categories without image
const DEFAULT_CATEGORY_ICON = "/img/cat-lainnya.png";

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
  // Data from API
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState(null); // null = semua kategori
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/admin/products"),
          api.get("/admin/categories")
        ]);

        // Map products to format yang dibutuhkan
        const mappedProducts = (productsRes.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.selling_price || p.harga_jual || 0,
          stock: p.stock ?? p.stok ?? 0,
          imageUrl: p.image_url || p.gambar || "/img/placeholder.png",
          categoryId: p.category_id || p.kategori_id,
          categoryName: p.category?.name || p.kategori?.nama || "",
          discountPercent: p.discount_percent || 0,
          barcode: p.barcode || p.kode_barcode || "",
        }));

        // Map categories
        const mappedCategories = (categoriesRes.data || []).map((c) => ({
          id: c.id,
          label: c.name || c.nama,
          icon: c.icon || c.gambar || DEFAULT_CATEGORY_ICON,
        }));

        setProducts(mappedProducts);
        setCategories(mappedCategories);

        // Set kategori aktif ke kategori pertama jika ada
        if (mappedCategories.length > 0) {
          setActiveCategory(mappedCategories[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // FILTER PRODUK berdasarkan search dan kategori
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = !activeCategory || p.categoryId === activeCategory;
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
          {/* Tombol Semua Kategori */}
          <button
            className={
              "trx-cat-pill" +
              (activeCategory === null ? " trx-cat-active" : "")
            }
            onClick={() => setActiveCategory(null)}
          >
            <span className="trx-cat-label">Semua</span>
            <span className="trx-cat-icon">
              <img src="/img/cat-lainnya.png" alt="Semua" />
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              className={
                "trx-cat-pill" +
                (cat.id === activeCategory ? " trx-cat-active" : "")
              }
              onClick={() => setActiveCategory(cat.id)}
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
          {loading ? (
            <div style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              padding: "60px 20px",
              color: "#94a3b8"
            }}>
              <div className="loading-spinner" style={{
                width: "48px",
                height: "48px",
                border: "4px solid #334155",
                borderTop: "4px solid #f59e0b",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              <div>Memuat produk...</div>
            </div>
          ) : currentProducts.length === 0 ? (
            <div style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              padding: "60px 20px",
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
              }}>
                📦
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#94a3b8" }}>
                {search ? "Produk Tidak Ditemukan" : "Belum Ada Produk"}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b", textAlign: "center", maxWidth: "300px" }}>
                {search
                  ? `Tidak ada produk yang cocok dengan "${search}"`
                  : "Produk belum tersedia untuk kategori ini. Tambahkan produk melalui Data Master."}
              </div>
            </div>
          ) : (
            currentProducts.map((p) => (
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
                  <img src={p.imageUrl} alt={p.name} onError={(e) => { e.target.src = "/img/placeholder.png"; }} />
                </div>

                <div className="trx-product-info">
                  <div className="trx-name">{p.name}</div>
                  <div className="trx-price">{formatRp(p.price)}</div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* PAGINATION - hanya tampil jika ada data */}
        {!loading && filteredProducts.length > 0 && (
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
                disabled={currentPage >= totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                ›
              </button>
              <button
                disabled={currentPage >= totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages || 1)}
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
        )}
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
