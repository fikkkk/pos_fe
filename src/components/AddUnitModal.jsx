import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse same CSS

export default function AddUnitModal({ isOpen, onClose, onSuccess }) {
    // Form state
    const [formData, setFormData] = useState({
        productId: "",
        unitName: "",
        multiplier: "",
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch products saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/admin/products");
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle number input
    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (value === "" || /^\d+$/.test(value)) {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            productId: "",
            unitName: "",
            multiplier: "",
        });
        setError(null);
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validasi
        if (!formData.productId || !formData.unitName || !formData.multiplier) {
            setError("Harap isi semua field yang wajib (*)");
            setLoading(false);
            return;
        }

        if (parseInt(formData.multiplier, 10) < 1) {
            setError("Jumlah per satuan minimal 1");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                productId: parseInt(formData.productId, 10),
                unitName: formData.unitName.trim(),
                multiplier: parseInt(formData.multiplier, 10),
            };

            await api.post("/admin", payload);

            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error creating unit:", err);
            setError(err.response?.data?.message || "Gagal menambahkan satuan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    // Handle close
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Get selected product info
    const selectedProduct = products.find(p => p.id === parseInt(formData.productId, 10));

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
                {/* Header */}
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" }}>
                    <h2 className="modal-title">
                        <span className="modal-title-icon">📦</span>
                        Tambah Satuan Produk
                    </h2>
                    <button className="modal-close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="modal-error">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        {/* Pilih Produk */}
                        <div className="form-group full-width">
                            <label className="form-label">
                                Pilih Produk <span className="required">*</span>
                            </label>
                            <select
                                name="productId"
                                value={formData.productId}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">-- Pilih Produk --</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} - Rp {Number(product.price || 0).toLocaleString("id-ID")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nama Satuan */}
                        <div className="form-group">
                            <label className="form-label">
                                Nama Satuan <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="unitName"
                                value={formData.unitName}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Contoh: Dus, Pack, Karton..."
                            />
                        </div>

                        {/* Multiplier */}
                        <div className="form-group">
                            <label className="form-label">
                                Jumlah Pcs per Satuan <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="multiplier"
                                value={formData.multiplier}
                                onChange={handleNumberChange}
                                className="form-input"
                                placeholder="Contoh: 12, 24, 30..."
                            />
                        </div>
                    </div>

                    {/* Info kalkulasi harga */}
                    {selectedProduct && formData.multiplier && (
                        <div style={{
                            marginTop: "16px",
                            padding: "16px",
                            background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
                            borderRadius: "12px",
                            border: "1px solid #fbcfe8"
                        }}>
                            <div style={{ fontSize: "12px", color: "#9d174d", marginBottom: "8px" }}>
                                💡 Kalkulasi Harga Otomatis:
                            </div>
                            <div style={{ fontSize: "14px", color: "#831843", fontWeight: 600 }}>
                                {formData.unitName || "Satuan"} = {formData.multiplier} x Rp {Number(selectedProduct.price || 0).toLocaleString("id-ID")}
                            </div>
                            <div style={{ fontSize: "18px", color: "#be185d", fontWeight: 700, marginTop: "4px" }}>
                                = Rp {(parseInt(formData.multiplier, 10) * (selectedProduct.price || 0)).toLocaleString("id-ID")}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                            style={{ background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" }}
                        >
                            {loading ? "Menyimpan..." : "Simpan Satuan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
