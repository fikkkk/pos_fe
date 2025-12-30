import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse existing CSS
import SearchableDropdown from "./SearchableDropdown";

export default function EditPromoModal({ isOpen, onClose, onSuccess, promo }) {
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
    const [units, setUnits] = useState([]);
    const [productUnits, setProductUnits] = useState([]);
    const [promoType, setPromoType] = useState("bonus");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial data load from prop
    useEffect(() => {
        if (isOpen && promo) {
            fetchInitialData();

            // Determine promo type
            let type = "bonus";
            if (promo.discountPercent > 0) type = "discount_percent";
            else if (promo.discountValue > 0) type = "discount_value";
            setPromoType(type);

            setFormData({
                productId: promo.productId?.toString() || "",
                unitId: promo.unitId?.toString() || "",
                minQty: promo.minQty?.toString() || "",
                bonusQty: promo.bonusQty?.toString() || "",
                discountPercent: promo.discountPercent?.toString() || "",
                discountValue: promo.discountValue?.toString() || "",
                startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : "",
                endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : "",
                isActive: promo.isActive ?? true
            });
        }
    }, [isOpen, promo]);

    useEffect(() => {
        if (formData.productId) {
            const filtered = units.filter(u => u.productId === parseInt(formData.productId, 10));
            setProductUnits(filtered);
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
        if (!formData.minQty) {
            setError("Jumlah Minimal (Min Qty) wajib diisi");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                minQty: parseInt(formData.minQty, 10),
                isActive: formData.isActive,
                startDate: formData.startDate ? new Date(formData.startDate) : undefined,
                endDate: formData.endDate ? new Date(formData.endDate) : undefined,
            };

            // Note: ProductID usually shouldn't change for existing promo logic, but passing it just in case if BE allows
            // payload.productId = parseInt(formData.productId, 10); 
            // payload.unitId = formData.unitId ? parseInt(formData.unitId, 10) : null;

            if (promoType === "bonus") {
                payload.bonusQty = parseInt(formData.bonusQty, 10);
                payload.discountPercent = 0;
                payload.discountValue = 0;
            } else if (promoType === "discount_percent") {
                payload.discountPercent = parseFloat(formData.discountPercent);
                payload.bonusQty = 0;
                payload.discountValue = 0;
            } else if (promoType === "discount_value") {
                payload.discountValue = parseInt(formData.discountValue, 10);
                payload.bonusQty = 0;
                payload.discountPercent = 0;
            }

            await api.patch(`/admin/promo/${promo.id}`, payload);

            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error updating promo:", err);
            setError(err.response?.data?.message || "Gagal memperbarui promo");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                    <h2 className="modal-title">
                        <span className="modal-title-icon">✏️</span>
                        Edit Promo
                    </h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Readonly Info */}
                    <div style={{ background: "#ecfdf5", padding: "12px", borderRadius: "10px", marginBottom: "16px", border: "1px solid #d1fae5" }}>
                        <div style={{ fontSize: "12px", color: "#059669" }}>Produk:</div>
                        <div style={{ fontWeight: 600, color: "#065f46" }}>
                            {products.find(p => p.id == formData.productId)?.name || "Loading..."}
                        </div>
                    </div>

                    <div className="form-grid">

                        {/* Min Qty */}
                        <div className="form-group">
                            <label className="form-label">Minimal Beli (Min Qty) <span className="required">*</span></label>
                            <input
                                type="number"
                                name="minQty"
                                value={formData.minQty}
                                onChange={handleChange}
                                className="form-input"
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "10px 0" }}></div>
                            <label className="form-label">Jenis Benefit Promo (Ubah Tipe)</label>
                            <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px 16px", background: promoType === "bonus" ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.05)", borderRadius: "10px", border: promoType === "bonus" ? "2px solid #10b981" : "2px solid transparent", transition: "all 0.2s ease" }}>
                                    <input type="radio" checked={promoType === "bonus"} onChange={() => setPromoType("bonus")} style={{ accentColor: "#10b981" }} />
                                    <span style={{ color: "#fff", fontWeight: 500 }}>Bonus Produk</span>
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px 16px", background: promoType === "discount_percent" ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.05)", borderRadius: "10px", border: promoType === "discount_percent" ? "2px solid #f59e0b" : "2px solid transparent", transition: "all 0.2s ease" }}>
                                    <input type="radio" checked={promoType === "discount_percent"} onChange={() => setPromoType("discount_percent")} style={{ accentColor: "#f59e0b" }} />
                                    <span style={{ color: "#fff", fontWeight: 500 }}>Diskon (%)</span>
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "10px 16px", background: promoType === "discount_value" ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.05)", borderRadius: "10px", border: promoType === "discount_value" ? "2px solid #3b82f6" : "2px solid transparent", transition: "all 0.2s ease" }}>
                                    <input type="radio" checked={promoType === "discount_value"} onChange={() => setPromoType("discount_value")} style={{ accentColor: "#3b82f6" }} />
                                    <span style={{ color: "#fff", fontWeight: 500 }}>Potongan (Rp)</span>
                                </label>
                            </div>
                        </div>

                        {/* Conditional Inputs */}
                        {promoType === "bonus" && (
                            <div className="form-group full-width">
                                <label className="form-label">Jumlah Bonus (Pcs) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="bonusQty"
                                    value={formData.bonusQty}
                                    onChange={handleChange}
                                    className="form-input"
                                />
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
                        <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                        >
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
