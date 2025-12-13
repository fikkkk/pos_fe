import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse existing CSS
import SearchableDropdown from "./SearchableDropdown";

export default function AddPromoModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        productId: "",
        unitId: "", // Optional
        minQty: "",
        bonusQty: "",
        discountPercent: "",
        discountValue: "",
        startDate: "",
        endDate: "",
        isActive: true
    });

    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]); // All units for reference
    const [productUnits, setProductUnits] = useState([]); // Filtered units for selected product
    const [promoType, setPromoType] = useState("bonus"); // "bonus" | "discount_percent" | "discount_value"

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch products and units
    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            // Set default dates
            const today = new Date();
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            setFormData(prev => ({
                ...prev,
                startDate: today.toISOString().split('T')[0],
                endDate: nextMonth.toISOString().split('T')[0]
            }));
        }
    }, [isOpen]);

    // Filter units when product changes
    useEffect(() => {
        if (formData.productId) {
            const filtered = units.filter(u => u.productId === parseInt(formData.productId, 10));
            setProductUnits(filtered);
            setFormData(prev => ({ ...prev, unitId: "" })); // Reset unit selection
        } else {
            setProductUnits([]);
        }
    }, [formData.productId, units]);

    const fetchInitialData = async () => {
        try {
            const [prodRes, unitRes] = await Promise.all([
                api.get("/admin/products"),
                api.get("/admin/product-units/all")
            ]);
            setProducts(prodRes.data);
            setUnits(unitRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Gagal memuat data produk");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!formData.productId || !formData.minQty) {
            setError("Produk dan Jumlah Minimal (Min Qty) wajib diisi");
            setLoading(false);
            return;
        }

        if (promoType === "bonus" && !formData.bonusQty) {
            setError("Jumlah Bonus wajib diisi untuk tipe Bonus Produk");
            setLoading(false);
            return;
        }

        if (promoType === "discount_percent" && !formData.discountPercent) {
            setError("Persentase Diskon wajib diisi");
            setLoading(false);
            return;
        }

        if (promoType === "discount_value" && !formData.discountValue) {
            setError("Nominal Diskon wajib diisi");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                productId: parseInt(formData.productId, 10),
                minQty: parseInt(formData.minQty, 10),
                isActive: formData.isActive,
                startDate: formData.startDate ? new Date(formData.startDate) : undefined,
                endDate: formData.endDate ? new Date(formData.endDate) : undefined,
            };

            // Add optional unitId
            if (formData.unitId) {
                payload.unitId = parseInt(formData.unitId, 10);
            }

            // Add benefit based on type
            if (promoType === "bonus") {
                payload.bonusQty = parseInt(formData.bonusQty, 10);
            } else if (promoType === "discount_percent") {
                payload.discountPercent = parseFloat(formData.discountPercent);
            } else if (promoType === "discount_value") {
                payload.discountValue = parseInt(formData.discountValue, 10);
            }

            console.log("Creating Promo:", payload);
            await api.post("/admin/promo", payload);

            onSuccess();
            handleClose();
        } catch (err) {
            console.error("Error creating promo:", err);
            setError(err.response?.data?.message || "Gagal membuat promo baru");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            productId: "",
            unitId: "",
            minQty: "",
            bonusQty: "",
            discountPercent: "",
            discountValue: "",
            startDate: "",
            endDate: "",
            isActive: true
        });
        setPromoType("bonus");
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                    <h2 className="modal-title">
                        <span className="modal-title-icon">🏷️</span>
                        Tambah Promo Baru
                    </h2>
                    <button className="modal-close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        {/* Pilih Produk */}
                        <div className="form-group full-width">
                            <SearchableDropdown
                                label="Pilih Produk"
                                name="productId"
                                value={formData.productId}
                                onChange={handleChange}
                                options={products}
                                placeholder="Cari Produk yang akan dipromosikan..."
                                searchPlaceholder="Ketik nama produk..."
                                required
                            />
                        </div>

                        {/* Pilih Satuan (Opsional) */}
                        <div className="form-group">
                            <label className="form-label">Satuan (Opsional)</label>
                            <select
                                name="unitId"
                                value={formData.unitId}
                                onChange={handleChange}
                                className="form-select"
                                disabled={!formData.productId || productUnits.length === 0}
                            >
                                <option value="">-- Semua Satuan --</option>
                                {productUnits.map(u => (
                                    <option key={u.id} value={u.id}>{u.unitName} (x{u.multiplier})</option>
                                ))}
                            </select>
                            <small style={{ fontSize: "10px", color: "#64748b" }}>
                                Kosongkan untuk berlaku di semua satuan (Pcs)
                            </small>
                        </div>

                        {/* Min Qty */}
                        <div className="form-group">
                            <label className="form-label">Minimal Beli (Min Qty) <span className="required">*</span></label>
                            <input
                                type="number"
                                name="minQty"
                                value={formData.minQty}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Contoh: 2"
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "10px 0" }}></div>
                            <label className="form-label">Jenis Benefit Promo</label>
                            <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px 16px", background: promoType === "bonus" ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.05)", borderRadius: "10px", border: promoType === "bonus" ? "2px solid #10b981" : "2px solid transparent", transition: "all 0.2s ease" }}>
                                    <input type="radio" checked={promoType === "bonus"} onChange={() => setPromoType("bonus")} style={{ accentColor: "#10b981" }} />
                                    <span style={{ color: "#fff", fontWeight: 500 }}>Bonus Produk (Buy X Get Y)</span>
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px 16px", background: promoType === "discount_percent" ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.05)", borderRadius: "10px", border: promoType === "discount_percent" ? "2px solid #f59e0b" : "2px solid transparent", transition: "all 0.2s ease" }}>
                                    <input type="radio" checked={promoType === "discount_percent"} onChange={() => setPromoType("discount_percent")} style={{ accentColor: "#f59e0b" }} />
                                    <span style={{ color: "#fff", fontWeight: 500 }}>Diskon (%)</span>
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px 16px", background: promoType === "discount_value" ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.05)", borderRadius: "10px", border: promoType === "discount_value" ? "2px solid #3b82f6" : "2px solid transparent", transition: "all 0.2s ease" }}>
                                    <input type="radio" checked={promoType === "discount_value"} onChange={() => setPromoType("discount_value")} style={{ accentColor: "#3b82f6" }} />
                                    <span style={{ color: "#fff", fontWeight: 500 }}>Potongan Harga (Rp)</span>
                                </label>
                            </div>
                        </div>

                        {/* Conditional Inputs based on Promo Type */}
                        {promoType === "bonus" && (
                            <div className="form-group full-width">
                                <label className="form-label">Jumlah Bonus (Pcs) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="bonusQty"
                                    value={formData.bonusQty}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Contoh: 1 (Gratis 1)"
                                />
                                <small style={{ color: "#10b981", fontWeight: 600 }}>
                                    {formData.minQty && formData.bonusQty ? `Beli ${formData.minQty} Gratis ${formData.bonusQty}` : ""}
                                </small>
                            </div>
                        )}

                        {promoType === "discount_percent" && (
                            <div className="form-group full-width">
                                <label className="form-label">Persentase Diskon (%) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="discountPercent"
                                    value={formData.discountPercent}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Contoh: 10"
                                />
                            </div>
                        )}

                        {promoType === "discount_value" && (
                            <div className="form-group full-width">
                                <label className="form-label">Nominal Potongan (Rp) <span className="required">*</span></label>
                                <div className="input-with-prefix">
                                    <span className="input-prefix">Rp</span>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleChange}
                                        className="form-input with-prefix"
                                        placeholder="Contoh: 5000"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Periode */}
                        <div className="form-group">
                            <label className="form-label">Tanggal Mulai</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tanggal Berakhir</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "12px 16px", background: formData.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", borderRadius: "12px", border: formData.isActive ? "2px solid #10b981" : "2px solid #ef4444", transition: "all 0.2s ease" }}>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    style={{ width: "20px", height: "20px", accentColor: "#10b981" }}
                                />
                                <span style={{ fontWeight: 600, color: formData.isActive ? "#10b981" : "#ef4444", fontSize: "15px" }}>
                                    {formData.isActive ? "✓ Status Promo Aktif" : "✗ Status Promo Tidak Aktif"}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose}>Batal</button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                        >
                            {loading ? "Menyimpan..." : "Simpan Promo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
