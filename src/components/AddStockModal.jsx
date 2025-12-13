import React, { useState, useEffect } from "react";
import { FaTimes, FaBox, FaPlus } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse existing CSS

export default function AddStockModal({ isOpen, onClose, onSuccess, product }) {
    const [quantity, setQuantity] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuantity("");
            setNote("");
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        const qty = parseInt(quantity, 10);
        if (!qty || qty < 1) {
            setError("Jumlah stok harus minimal 1");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post(`/admin/products/${product.id}/add-stock`, {
                quantity: qty,
                note: note || undefined
            });

            console.log("Stock added:", response.data);
            onSuccess(response.data);
            onClose();
        } catch (err) {
            console.error("Error adding stock:", err);
            setError(err.response?.data?.message || "Gagal menambahkan stok");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !product) return null;

    const currentStock = product.stock || 0;
    const addedQty = parseInt(quantity, 10) || 0;
    const newStock = currentStock + addedQty;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: "480px" }}>
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}>
                    <h2 className="modal-title">
                        <span className="modal-title-icon">📦</span>
                        Tambah Stok
                    </h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Product Info */}
                    <div style={{
                        background: "rgba(59, 130, 246, 0.1)",
                        padding: "16px",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        border: "1px solid rgba(59, 130, 246, 0.2)"
                    }}>
                        <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>Produk</div>
                        <div style={{ fontWeight: 700, color: "#fff", fontSize: "18px" }}>{product.name}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                            Kode: {product.productCode} | Barcode: {product.barcode || "-"}
                        </div>
                    </div>

                    {/* Current Stock Display */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "rgba(255,255,255,0.05)",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        marginBottom: "20px"
                    }}>
                        <div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Stok Saat Ini</div>
                            <div style={{ fontSize: "28px", fontWeight: 700, color: "#f59e0b" }}>
                                {currentStock} <span style={{ fontSize: "14px", fontWeight: 400 }}>Pcs</span>
                            </div>
                        </div>
                        <div style={{ fontSize: "24px", color: "#3b82f6" }}>→</div>
                        <div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Stok Setelah</div>
                            <div style={{ fontSize: "28px", fontWeight: 700, color: "#10b981" }}>
                                {newStock} <span style={{ fontSize: "14px", fontWeight: 400 }}>Pcs</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-grid">
                        {/* Quantity Input */}
                        <div className="form-group full-width">
                            <label className="form-label">
                                Jumlah Stok Masuk <span className="required">*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="form-input"
                                    placeholder="Contoh: 50"
                                    min="1"
                                    required
                                    style={{ paddingLeft: "50px", fontSize: "18px", fontWeight: 600 }}
                                />
                                <span style={{
                                    position: "absolute",
                                    left: "16px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#3b82f6",
                                    fontWeight: 600
                                }}>
                                    <FaPlus />
                                </span>
                            </div>
                        </div>

                        {/* Note Input */}
                        <div className="form-group full-width">
                            <label className="form-label">Catatan (Opsional)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="form-input"
                                placeholder="Contoh: Barang dari Supplier ABC, Invoice #12345"
                                rows={3}
                                style={{ resize: "none" }}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading || !quantity}
                            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}
                        >
                            {loading ? "Menyimpan..." : `Tambah ${addedQty || 0} Stok`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
