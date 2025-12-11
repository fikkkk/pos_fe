import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse same CSS

export default function EditProductModal({ isOpen, onClose, onSuccess, product }) {
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        barcode: "",
        price: "",
        costPrice: "",
        stock: "",
        description: "",
        categoryId: "",
        supplierId: "",
        imageUrl: "",
    });

    // Data untuk dropdown
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Populate form dengan data produk yang akan diedit
    useEffect(() => {
        if (isOpen && product) {
            setFormData({
                name: product.name || "",
                barcode: product.barcode || "",
                price: product.price?.toString() || "",
                costPrice: product.costPrice?.toString() || "",
                stock: product.stock?.toString() || "",
                description: product.description || "",
                categoryId: product.categoryId?.toString() || product.category?.id?.toString() || "",
                supplierId: product.supplierId?.toString() || product.supplier?.id?.toString() || "",
                imageUrl: product.imageUrl || "",
            });
            fetchDropdownData();
        }
    }, [isOpen, product]);

    const fetchDropdownData = async () => {
        try {
            const [catRes, supRes] = await Promise.all([
                api.get("/admin/categories"),
                api.get("/admin/suppliers"),
            ]);
            setCategories(catRes.data);
            setSuppliers(supRes.data);
        } catch (err) {
            console.error("Error fetching dropdown data:", err);
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
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            barcode: "",
            price: "",
            costPrice: "",
            stock: "",
            description: "",
            categoryId: "",
            supplierId: "",
            imageUrl: "",
        });
        setError(null);
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name || !formData.price) {
            setError("Harap isi nama dan harga produk");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                name: formData.name,
                barcode: formData.barcode || undefined,
                price: parseFloat(formData.price),
                stock: formData.stock ? parseInt(formData.stock, 10) : undefined,
                description: formData.description || undefined,
            };

            await api.patch(`/admin/products/${product.id}`, payload);

            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error updating product:", err);
            setError(err.response?.data?.message || "Gagal memperbarui produk. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    // Handle close
    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}>
                    <h2 className="modal-title">
                        <span className="modal-title-icon">✏️</span>
                        Edit Produk
                    </h2>
                    <button className="modal-close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Product Info */}
                {product && (
                    <div style={{
                        padding: "12px 24px",
                        background: "#f1f5f9",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: "13px",
                        color: "#64748b"
                    }}>
                        Kode Produk: <strong style={{ color: "#334155" }}>{product.productCode}</strong>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="modal-error">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        {/* Nama Produk */}
                        <div className="form-group full-width">
                            <label className="form-label">
                                Nama Produk <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Masukkan nama produk"
                            />
                        </div>

                        {/* Barcode */}
                        <div className="form-group">
                            <label className="form-label">Barcode</label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="8997035567890"
                            />
                        </div>

                        {/* Image URL */}
                        <div className="form-group">
                            <label className="form-label">URL Gambar</label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://example.com/image.jpg"
                                disabled
                            />
                            <small style={{ color: "#94a3b8", fontSize: "11px" }}>URL gambar tidak dapat diubah dari sini</small>
                        </div>

                        {/* Harga Jual (Price) */}
                        <div className="form-group">
                            <label className="form-label">
                                Harga Jual <span className="required">*</span>
                            </label>
                            <div className="input-with-prefix">
                                <span className="input-prefix">Rp</span>
                                <input
                                    type="text"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleNumberChange}
                                    className="form-input with-prefix"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Stok */}
                        <div className="form-group">
                            <label className="form-label">Stok</label>
                            <input
                                type="text"
                                name="stock"
                                value={formData.stock}
                                onChange={handleNumberChange}
                                className="form-input"
                                placeholder="0"
                            />
                        </div>

                        {/* Kategori (readonly info) */}
                        <div className="form-group">
                            <label className="form-label">Kategori</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="form-select"
                                disabled
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <small style={{ color: "#94a3b8", fontSize: "11px" }}>Kategori tidak dapat diubah</small>
                        </div>

                        {/* Supplier (readonly info) */}
                        <div className="form-group">
                            <label className="form-label">Supplier</label>
                            <select
                                name="supplierId"
                                value={formData.supplierId}
                                onChange={handleChange}
                                className="form-select"
                                disabled
                            >
                                <option value="">Pilih Supplier</option>
                                {suppliers.map((sup) => (
                                    <option key={sup.id} value={sup.id}>
                                        {sup.name}
                                    </option>
                                ))}
                            </select>
                            <small style={{ color: "#94a3b8", fontSize: "11px" }}>Supplier tidak dapat diubah</small>
                        </div>

                        {/* Deskripsi */}
                        <div className="form-group full-width">
                            <label className="form-label">Deskripsi</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Masukkan deskripsi produk (opsional)"
                                rows={3}
                            />
                        </div>
                    </div>

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
                            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}
                        >
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
