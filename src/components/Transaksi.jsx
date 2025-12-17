import React, { useState, useMemo, useEffect } from "react";
import { FaSearch, FaTrash, FaPlus, FaMinus, FaShoppingCart, FaCashRegister, FaSpinner, FaTimes, FaMoneyBillWave, FaQrcode, FaCreditCard, FaWallet, FaCheckCircle } from "react-icons/fa";
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

// METODE PEMBAYARAN
const paymentMethods = [
  { id: "TUNAI", label: "Tunai", icon: FaMoneyBillWave, color: "#10b981" },
  { id: "QRIS", label: "QRIS", icon: FaQrcode, color: "#8b5cf6" },
  { id: "DEBIT", label: "Debit", icon: FaCreditCard, color: "#3b82f6" },
  { id: "KREDIT", label: "Kredit", icon: FaWallet, color: "#f59e0b" },
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
  const [promos, setPromos] = useState([]); // State untuk promo produk
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // PAYMENT POPUP STATE
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [cashInput, setCashInput] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Fetch produk dan promo dari backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch products dan promos secara paralel
        const [productsRes, promosRes] = await Promise.all([
          api.get("/admin/products"),
          api.get("/admin/promo").catch(() => ({ data: [] })), // Promo optional
        ]);
        setProducts(productsRes.data || []);

        // Debug: log raw promo data
        console.log("Raw promos from API:", promosRes.data);

        // Filter promo yang aktif dan dalam periode berlaku
        const now = new Date();
        const activePromos = (promosRes.data || []).filter((p) => {
          // Jika isActive adalah false secara eksplisit, filter out
          if (p.isActive === false) return false;
          // Jika startDate ada dan belum mulai, filter out
          if (p.startDate && new Date(p.startDate) > now) return false;
          // Jika endDate ada dan sudah lewat, filter out
          if (p.endDate && new Date(p.endDate) < now) return false;
          return true;
        });

        console.log("Filtered active promos:", activePromos);
        setPromos(activePromos);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data produk");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk mendapatkan promo yang berlaku untuk produk
  const getApplicablePromo = (productId, qty) => {
    // Cari promo untuk produk ini
    const productPromos = promos.filter((p) => p.productId === productId);
    if (productPromos.length === 0) return null;

    // Cari promo yang memenuhi syarat minQty (ambil yang paling tinggi)
    const applicablePromos = productPromos
      .filter((p) => qty >= p.minQty)
      .sort((a, b) => b.minQty - a.minQty); // Sort descending by minQty

    return applicablePromos.length > 0 ? applicablePromos[0] : null;
  };

  // Fungsi untuk menghitung diskon dari promo
  const calculatePromoDiscount = (item, promo) => {
    if (!promo) return 0;

    const basePrice = item.price * item.qty;

    // Diskon persen
    if (promo.discountPercent && promo.discountPercent > 0) {
      return Math.round(basePrice * (promo.discountPercent / 100));
    }

    // Diskon nilai tetap
    if (promo.discountValue && promo.discountValue > 0) {
      return Math.min(promo.discountValue, basePrice); // Jangan melebihi harga
    }

    return 0;
  };

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

  // SUMMARY (pakai harga setelah diskon promo)
  const { subtotal, totalDiskon, pajak, total, cartWithPromo } = useMemo(() => {
    // Helper function untuk mendapatkan promo yang berlaku
    const findApplicablePromo = (productId, qty) => {
      // Debug: log matching process
      console.log(`Finding promo for productId: ${productId}, qty: ${qty}`);
      console.log("Available promos:", promos);

      const productPromos = promos.filter((p) => p.productId === productId);
      console.log(`Matching promos for product ${productId}:`, productPromos);

      if (productPromos.length === 0) return null;
      const applicablePromos = productPromos
        .filter((p) => qty >= p.minQty)
        .sort((a, b) => b.minQty - a.minQty);

      console.log(`Applicable promos (qty >= minQty):`, applicablePromos);
      return applicablePromos.length > 0 ? applicablePromos[0] : null;
    };

    // Helper function untuk menghitung diskon
    const calcDiscount = (item, promo) => {
      if (!promo) return 0;
      const basePrice = item.price * item.qty;
      if (promo.discountPercent && promo.discountPercent > 0) {
        return Math.round(basePrice * (promo.discountPercent / 100));
      }
      if (promo.discountValue && promo.discountValue > 0) {
        return Math.min(promo.discountValue, basePrice);
      }
      return 0;
    };

    // Tambahkan info promo ke setiap item cart
    const cartPromo = cart.map((item) => {
      const promo = findApplicablePromo(item.id, item.qty);
      const discount = calcDiscount(item, promo);
      const itemSubtotal = item.price * item.qty;
      const itemTotal = itemSubtotal - discount;

      return {
        ...item,
        promo: promo,
        discount: discount,
        bonusQty: promo?.bonusQty || 0,
        itemSubtotal: itemSubtotal,
        itemTotal: itemTotal,
      };
    });

    const sub = cartPromo.reduce((a, c) => a + c.itemSubtotal, 0);
    const disc = cartPromo.reduce((a, c) => a + c.discount, 0);
    const afterDisc = sub - disc;
    const tax = Math.round(afterDisc * 0.11);

    return {
      subtotal: sub,
      totalDiskon: disc,
      pajak: tax,
      total: afterDisc + tax,
      cartWithPromo: cartPromo,
    };
  }, [cart, promos]);

  // KEMBALIAN untuk pembayaran tunai
  const kembalian = useMemo(() => {
    const cash = parseInt(cashInput.replace(/\D/g, ""), 10) || 0;
    return cash - total;
  }, [cashInput, total]);

  // OPEN/CLOSE PAYMENT POPUP
  const openPaymentPopup = () => {
    if (cart.length === 0) return;
    setShowPaymentPopup(true);
    setSelectedPayment(null);
    setCashInput("");
    setPaymentSuccess(false);
    setPaymentError(null);
  };

  const closePaymentPopup = () => {
    setShowPaymentPopup(false);
    setSelectedPayment(null);
    setCashInput("");
    setPaymentSuccess(false);
    setPaymentError(null);
  };

  // PROCESS PAYMENT & UPDATE STOCK
  const processPayment = async () => {
    if (!selectedPayment) {
      setPaymentError("Pilih metode pembayaran");
      return;
    }

    if (selectedPayment === "TUNAI" && kembalian < 0) {
      setPaymentError("Uang yang diberikan kurang");
      return;
    }

    setPaymentProcessing(true);
    setPaymentError(null);

    try {
      // 1. Update stock untuk setiap item di cart
      for (const item of cart) {
        const newStock = Math.max(0, item.stock - item.qty);
        await api.patch(`/admin/products/${item.id}`, {
          stock: newStock,
        });
      }

      // 2. Buat order di backend untuk masuk ke laporan manajemen
      try {
        const orderItems = cart.map((item) => ({
          barcode: item.barcode || item.productCode || `PROD-${item.id}`,
          unitId: item.unitId || 1, // default satuan
          quantity: item.qty,
        }));

        await api.post("/kasir/orders", {
          items: orderItems,
          paymentMethod: selectedPayment,
          taxPercent: 11, // pajak 11%
          discountPercent: 0,
        });
      } catch (orderErr) {
        // Jika gagal buat order (misal bukan role KASIR), simpan ke localStorage saja
        console.warn("Order creation skipped (not KASIR role or endpoint issue):", orderErr);
      }

      // 3. Simpan transaksi ke localStorage sebagai backup/riwayat lokal
      const transactionRecord = {
        id: `TRX-${Date.now()}`,
        tanggal: new Date().toISOString(),
        items: cart.map((item) => ({
          productId: item.id,
          productName: item.name,
          qty: item.qty,
          price: item.price,
          subtotal: item.price * item.qty,
        })),
        subtotal: subtotal,
        pajak: pajak,
        total: total,
        metodePembayaran: selectedPayment,
        uangDiterima: selectedPayment === "TUNAI" ? parseInt(cashInput.replace(/\D/g, ""), 10) || 0 : total,
        kembalian: selectedPayment === "TUNAI" ? kembalian : 0,
        status: "SELESAI",
      };

      // Simpan ke localStorage
      const existingTransactions = JSON.parse(localStorage.getItem("pos_transactions") || "[]");
      existingTransactions.unshift(transactionRecord);
      // Simpan maksimal 100 transaksi terakhir
      localStorage.setItem("pos_transactions", JSON.stringify(existingTransactions.slice(0, 100)));

      // 4. Update local products state
      setProducts((prev) =>
        prev.map((p) => {
          const cartItem = cart.find((c) => c.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
          }
          return p;
        })
      );

      setPaymentSuccess(true);

      // Tidak auto close - tunggu user klik tombol selesai

    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError("Gagal memproses pembayaran. Silakan coba lagi.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // FINISH PAYMENT - untuk menutup popup setelah sukses
  const finishPayment = () => {
    clearCart();
    closePaymentPopup();
  };

  // Quick cash buttons
  const quickCashAmounts = [
    total,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000,
  ].filter((v, i, arr) => arr.indexOf(v) === i && v >= total).slice(0, 4);

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
              {currentProducts.map((p) => {
                // Cek apakah produk ini punya promo aktif
                const productPromo = promos.find((promo) => promo.productId === p.id);

                return (
                  <button
                    key={p.id}
                    className="trx-product-card"
                    onClick={() => addToCart(p)}
                  >
                    {/* Stock badge di kiri atas */}
                    <div className="trx-stock-bar">
                      <img
                        src="/img/icon-box.png"
                        alt="stok"
                        className="trx-stock-icon-img"
                      />
                      <span className="trx-stock-text">{p.stock}</span>
                    </div>

                    {/* Badge Promo di kanan atas */}
                    {productPromo && (
                      <div className="trx-promo-badge" style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontSize: "0.65rem",
                        fontWeight: "700",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                        zIndex: 5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                      }}>
                        <span>🎉 PROMO</span>
                        <span style={{ fontSize: "0.6rem", opacity: 0.9 }}>
                          {productPromo.discountPercent ? `${productPromo.discountPercent}% OFF` :
                            productPromo.discountValue ? `Hemat ${formatRp(productPromo.discountValue)}` :
                              productPromo.bonusQty ? `+${productPromo.bonusQty} Gratis` : "Promo"}
                        </span>
                        <span style={{ fontSize: "0.55rem", opacity: 0.8 }}>
                          Min. {productPromo.minQty} pcs
                        </span>
                      </div>
                    )}

                    {/* Gambar produk di tengah */}
                    <div className="trx-product-image">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add('no-image');
                          }}
                        />
                      ) : (
                        <div className="trx-placeholder-icon">📦</div>
                      )}
                    </div>

                    {/* Info produk di bawah */}
                    <div className="trx-product-info">
                      <div className="trx-name">{p.name}</div>
                      <div className="trx-price">{formatRp(p.price)}</div>
                    </div>
                  </button>
                );
              })}

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

            {cartWithPromo.map((item, index) => {
              // Cari promo yang tersedia untuk produk ini (meskipun belum aktif)
              const availablePromo = promos.find((p) => p.productId === item.id);
              const promoActive = item.promo && item.discount > 0;
              const promoAvailableNotActive = availablePromo && !promoActive;

              return (
                <div
                  key={item.id}
                  className="trx-cart-item"
                  style={{
                    border: promoActive ? "2px solid #10b981" : promoAvailableNotActive ? "2px dashed #f59e0b" : undefined,
                    background: promoActive ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)" : undefined,
                  }}
                >
                  {/* KIRI: nomor + info produk */}
                  <div className="trx-cart-left">
                    <div className="trx-number-box" style={{
                      background: promoActive ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : undefined,
                    }}>{index + 1}</div>

                    <div className="trx-cart-main">
                      <div className="trx-cart-name">{item.name}</div>

                      <div className="trx-cart-meta-row">
                        <div className="trx-unit-price-wrap">
                          <span className="trx-unit-price-pill">
                            {formatRp(item.price)}
                          </span>

                          {/* Badge Promo AKTIF (sudah dapat diskon) */}
                          {promoActive && (
                            <span className="trx-discount-pill" style={{
                              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              color: "#fff",
                              padding: "3px 10px",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                            }}>
                              🎉 HEMAT {item.promo.discountPercent ? `${item.promo.discountPercent}%` : formatRp(item.discount)}
                            </span>
                          )}

                          {/* Badge Promo TERSEDIA (belum aktif karena qty kurang) */}
                          {promoAvailableNotActive && (
                            <span style={{
                              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                              color: "#fff",
                              padding: "3px 10px",
                              borderRadius: "12px",
                              fontSize: "0.7rem",
                              fontWeight: "600",
                            }}>
                              📦 Beli {availablePromo.minQty}+ dapat promo!
                            </span>
                          )}

                          {/* Badge Bonus jika ada */}
                          {item.promo && item.bonusQty > 0 && (
                            <span className="trx-bonus-pill" style={{
                              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                              color: "#fff",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontSize: "0.7rem",
                              fontWeight: "600",
                            }}>
                              🎁 +{item.bonusQty} Gratis
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

                      {/* Info promo yang sedang berlaku */}
                      {promoActive && (
                        <div style={{
                          fontSize: "0.75rem",
                          color: "#10b981",
                          marginTop: "6px",
                          fontWeight: "600",
                          background: "rgba(16, 185, 129, 0.1)",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          display: "inline-block",
                        }}>
                          ✅ Promo Aktif! Anda hemat {formatRp(item.discount)}
                        </div>
                      )}

                      {/* Info promo yang tersedia tapi belum aktif */}
                      {promoAvailableNotActive && (
                        <div style={{
                          fontSize: "0.7rem",
                          color: "#f59e0b",
                          marginTop: "4px",
                          fontStyle: "italic",
                        }}>
                          💡 Tambah {availablePromo.minQty - item.qty} lagi untuk dapat
                          {availablePromo.discountPercent && ` diskon ${availablePromo.discountPercent}%`}
                          {availablePromo.discountValue && ` hemat ${formatRp(availablePromo.discountValue)}`}
                          {availablePromo.bonusQty && ` bonus ${availablePromo.bonusQty} pcs`}
                        </div>
                      )}
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
                          {item.discount > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                              <span style={{ textDecoration: "line-through", fontSize: "0.7rem", color: "#94a3b8" }}>
                                {formatRp(item.itemSubtotal)}
                              </span>
                              <span style={{ color: "#10b981", fontWeight: "700" }}>
                                {formatRp(item.itemTotal)}
                              </span>
                            </div>
                          ) : (
                            formatRp(item.itemTotal)
                          )}
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

            {/* Info Promo Terdeteksi (untuk debugging) */}
            <div className="trx-row" style={{ fontSize: "0.75rem", color: "#64748b" }}>
              <span>📊 Promo Terdeteksi</span>
              <span>{promos.length} promo aktif</span>
            </div>

            {/* Diskon Promo (hanya tampil jika ada) */}
            {totalDiskon > 0 && (
              <div className="trx-row" style={{ color: "#10b981" }}>
                <span>🎉 Diskon Promo</span>
                <span>-{formatRp(totalDiskon)}</span>
              </div>
            )}

            <div className="trx-row">
              <span>Pajak (11%)</span>
              <span>{formatRp(pajak)}</span>
            </div>

            <div className="trx-row trx-total-row">
              <span>Total</span>
              <span>{formatRp(total)}</span>
            </div>
          </div>

          <button
            className="trx-bayar-btn"
            onClick={openPaymentPopup}
            disabled={cart.length === 0}
          >
            Bayar {formatRp(total)}
          </button>
        </div>
      </div>

      {/* ==========================================
          PAYMENT POPUP MODAL
       ========================================== */}
      {showPaymentPopup && (
        <div className="trx-popup-overlay" onClick={closePaymentPopup}>
          <div className="trx-popup-modal" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div className="trx-popup-header">
              <div className="trx-popup-title">
                <FaCashRegister />
                <span>Pembayaran</span>
              </div>
              <button className="trx-popup-close" onClick={closePaymentPopup}>
                <FaTimes />
              </button>
            </div>

            {/* SUCCESS STATE */}
            {paymentSuccess ? (
              <div className={`trx-popup-success ${selectedPayment === "TUNAI" ? "trx-success-tunai" : ""}`}>
                {/* Confetti Effect */}
                <div className="trx-confetti">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="trx-confetti-piece" style={{ '--delay': `${i * 0.1}s`, '--x': `${Math.random() * 100}%` }} />
                  ))}
                </div>

                <div className="trx-success-icon">
                  <FaCheckCircle />
                </div>
                <h3>Pembayaran Berhasil!</h3>
                <p>{selectedPayment === "TUNAI" ? "Transaksi Tunai Selesai" : "Transaksi telah selesai"}</p>

                {/* KHUSUS TUNAI - Struk Mini dengan Detail Promo */}
                {selectedPayment === "TUNAI" && (
                  <div className="trx-success-receipt">
                    <div className="trx-receipt-header">
                      <FaMoneyBillWave className="trx-receipt-icon" />
                      <span>Struk Pembayaran</span>
                    </div>

                    {/* DAFTAR ITEM */}
                    <div style={{
                      padding: "12px 16px",
                      borderBottom: "1px dashed #e2e8f0",
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}>
                      {cartWithPromo.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "8px",
                            fontSize: "0.8rem",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "600" }}>{item.name}</div>
                            <div style={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {formatRp(item.price)} x {item.qty}
                              {item.promo && (
                                <span style={{
                                  marginLeft: "6px",
                                  color: "#10b981",
                                  fontWeight: "600",
                                }}>
                                  🎉 {item.promo.discountPercent ? `-${item.promo.discountPercent}%` :
                                    item.promo.discountValue ? `Hemat ${formatRp(item.promo.discountValue)}` :
                                      `+${item.promo.bonusQty} Gratis`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            {item.discount > 0 && (
                              <div style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "0.65rem" }}>
                                {formatRp(item.itemSubtotal)}
                              </div>
                            )}
                            <div style={{ fontWeight: "600", color: item.discount > 0 ? "#10b981" : "#1e293b" }}>
                              {formatRp(item.itemTotal)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="trx-receipt-body">
                      {/* SUBTOTAL */}
                      <div className="trx-receipt-row" style={{ fontSize: "0.85rem" }}>
                        <span>SubTotal</span>
                        <span className="trx-receipt-amount">{formatRp(subtotal)}</span>
                      </div>

                      {/* DISKON PROMO */}
                      {totalDiskon > 0 && (
                        <div className="trx-receipt-row" style={{ color: "#10b981", fontSize: "0.85rem" }}>
                          <span>🎉 Diskon Promo</span>
                          <span className="trx-receipt-amount">-{formatRp(totalDiskon)}</span>
                        </div>
                      )}

                      {/* PAJAK */}
                      <div className="trx-receipt-row" style={{ fontSize: "0.85rem" }}>
                        <span>Pajak (11%)</span>
                        <span className="trx-receipt-amount">{formatRp(pajak)}</span>
                      </div>

                      <div className="trx-receipt-divider" />

                      {/* TOTAL */}
                      <div className="trx-receipt-row" style={{ fontWeight: "700", fontSize: "1rem" }}>
                        <span>TOTAL</span>
                        <span className="trx-receipt-amount">{formatRp(total)}</span>
                      </div>

                      <div className="trx-receipt-divider" />

                      {/* UANG DITERIMA */}
                      <div className="trx-receipt-row">
                        <span>Uang Diterima</span>
                        <span className="trx-receipt-amount trx-cash-received">{formatRp(parseInt(cashInput.replace(/\D/g, ""), 10) || 0)}</span>
                      </div>

                      {/* KEMBALIAN */}
                      <div className="trx-receipt-row trx-receipt-change">
                        <span>KEMBALIAN</span>
                        <span className="trx-receipt-amount trx-change-amount">{formatRp(kembalian > 0 ? kembalian : 0)}</span>
                      </div>
                    </div>
                    <div className="trx-receipt-footer">
                      <span>Terima kasih atas kunjungan Anda!</span>
                      <div className="trx-receipt-barcode" />
                    </div>
                  </div>
                )}

                {/* Non-Tunai tetap tampil seperti sebelumnya */}
                {selectedPayment !== "TUNAI" && (
                  <div className="trx-success-badge">
                    <span>Metode: {paymentMethods.find(m => m.id === selectedPayment)?.label}</span>
                  </div>
                )}

                {/* TOMBOL SELESAI */}
                <button className="trx-success-finish-btn" onClick={finishPayment}>
                  <FaCheckCircle />
                  <span>Transaksi Baru</span>
                </button>
              </div>
            ) : (
              <>
                {/* KHUSUS ITEM DENGAN PROMO */}
                {cartWithPromo.filter(item => item.promo && item.discount > 0).length > 0 && (
                  <div className="trx-popup-section" style={{ maxHeight: "180px", overflowY: "auto" }}>
                    <h4 style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#10b981",
                    }}>
                      🎉 Item dengan Promo
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {cartWithPromo
                        .filter(item => item.promo && item.discount > 0)
                        .map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px 14px",
                              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.06) 100%)",
                              borderRadius: "12px",
                              border: "1px solid rgba(16, 185, 129, 0.4)",
                              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.1)",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#1e293b" }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                                {formatRp(item.price)} x {item.qty} pcs
                              </div>
                              <div style={{
                                marginTop: "6px",
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "#fff",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "0.7rem",
                                fontWeight: "700",
                                display: "inline-block",
                              }}>
                                🎉 {item.promo.discountPercent ? `Diskon ${item.promo.discountPercent}%` :
                                  item.promo.discountValue ? `Hemat ${formatRp(item.promo.discountValue)}` :
                                    item.promo.bonusQty ? `Bonus ${item.promo.bonusQty} pcs` : "Promo Aktif"}
                              </div>
                            </div>
                            <div style={{ textAlign: "right", marginLeft: "12px" }}>
                              <div style={{ textDecoration: "line-through", fontSize: "0.75rem", color: "#94a3b8" }}>
                                {formatRp(item.itemSubtotal)}
                              </div>
                              <div style={{ fontWeight: "800", color: "#10b981", fontSize: "1.1rem" }}>
                                {formatRp(item.itemTotal)}
                              </div>
                              <div style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: "600" }}>
                                Hemat {formatRp(item.discount)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Total Hemat dari Promo */}
                    <div style={{
                      marginTop: "12px",
                      padding: "10px 14px",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "#fff",
                    }}>
                      <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>💰 Total Hemat dari Promo</span>
                      <span style={{ fontWeight: "800", fontSize: "1.1rem" }}>{formatRp(totalDiskon)}</span>
                    </div>
                  </div>
                )}

                {/* SUMMARY PEMBAYARAN */}
                <div className="trx-popup-section" style={{
                  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                  borderRadius: "12px",
                  padding: "16px",
                  margin: "0 20px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                    <span>SubTotal</span>
                    <span style={{ fontWeight: "600" }}>{formatRp(subtotal)}</span>
                  </div>
                  {totalDiskon > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#10b981", fontSize: "0.9rem" }}>
                      <span>🎉 Diskon Promo</span>
                      <span style={{ fontWeight: "600" }}>-{formatRp(totalDiskon)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                    <span>Pajak (11%)</span>
                    <span style={{ fontWeight: "600" }}>{formatRp(pajak)}</span>
                  </div>
                </div>

                {/* TOTAL DISPLAY */}
                <div className="trx-popup-total">
                  <span className="trx-popup-total-label">Total Pembayaran</span>
                  <span className="trx-popup-total-value">{formatRp(total)}</span>
                </div>

                {/* PAYMENT METHODS */}
                <div className="trx-popup-section">
                  <h4>Pilih Metode Pembayaran</h4>
                  <div className="trx-payment-methods">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        className={`trx-payment-btn ${selectedPayment === method.id ? 'active' : ''}`}
                        style={{ '--method-color': method.color }}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <method.icon className="trx-payment-icon" />
                        <span>{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CASH INPUT (only for TUNAI) */}
                {selectedPayment === "TUNAI" && (
                  <div className="trx-popup-section trx-cash-section">
                    <h4>Uang Diterima</h4>
                    <input
                      type="text"
                      className="trx-cash-input"
                      placeholder="Masukkan jumlah uang..."
                      value={cashInput}
                      onChange={(e) => setCashInput(e.target.value)}
                    />
                    <div className="trx-quick-cash">
                      {quickCashAmounts.map((amount) => (
                        <button
                          key={amount}
                          className="trx-quick-cash-btn"
                          onClick={() => setCashInput(amount.toString())}
                        >
                          {formatRp(amount)}
                        </button>
                      ))}
                    </div>
                    {cashInput && (
                      <div className={`trx-change-display ${kembalian >= 0 ? 'positive' : 'negative'}`}>
                        <span>Kembalian:</span>
                        <span className="trx-change-value">{formatRp(kembalian)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ERROR MESSAGE */}
                {paymentError && (
                  <div className="trx-popup-error">
                    {paymentError}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="trx-popup-actions">
                  <button className="trx-popup-cancel" onClick={closePaymentPopup}>
                    Batal
                  </button>
                  <button
                    className="trx-popup-confirm"
                    onClick={processPayment}
                    disabled={paymentProcessing || !selectedPayment}
                  >
                    {paymentProcessing ? (
                      <>
                        <FaSpinner className="trx-btn-spinner" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Konfirmasi Bayar
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaksi;

