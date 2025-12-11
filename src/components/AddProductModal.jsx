import React, { useState, useEffect } from "react";
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css";

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
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

    // Fetch categories dan suppliers saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            fetchDropdownData();
        }
    }, [isOpen]);

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
        // Hanya izinkan angka
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

        // Validasi required fields
        if (!formData.name || !formData.price || !formData.costPrice || !formData.categoryId || !formData.supplierId) {
            setError("Harap isi semua field yang wajib (*)");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                name: formData.name,
                barcode: formData.barcode || undefined,
                price: parseFloat(formData.price),
                costPrice: parseFloat(formData.costPrice),
                stock: formData.stock ? parseInt(formData.stock, 10) : 0,
                description: formData.description || undefined,
                categoryId: parseInt(formData.categoryId, 10),
                supplierId: parseInt(formData.supplierId, 10),
                imageUrl: formData.imageUrl || undefined,
            };

            await api.post("/admin/products", payload);

            resetForm();
            onSuccess(); // Refresh data di parent
            onClose();   // Tutup modal
        } catch (err) {
            console.error("Error creating product:", err);
            setError(err.response?.data?.message || "Gagal menambahkan produk. Silakan coba lagi.");
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
                <div className="modal-header">
                    <h2 className="modal-title">
                        <span className="modal-title-icon">📦</span>
                        Tambah Produk Baru
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
                            />
                        </div>

                        {/* Harga Beli (Cost Price) */}
                        <div className="form-group">
                            <label className="form-label">
                                Harga Beli <span className="required">*</span>
                            </label>
                            <div className="input-with-prefix">
                                <span className="input-prefix">Rp</span>
                                <input
                                    type="text"
                                    name="costPrice"
                                    value={formData.costPrice}
                                    onChange={handleNumberChange}
                                    className="form-input with-prefix"
                                    placeholder="0"
                                />
                            </div>
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
                            <label className="form-label">Stok Awal</label>
                            <input
                                type="text"
                                name="stock"
                                value={formData.stock}
                                onChange={handleNumberChange}
                                className="form-input"
                                placeholder="0"
                            />
                        </div>

                        {/* Kategori */}
                        <div className="form-group">
                            <label className="form-label">
                                Kategori <span className="required">*</span>
                            </label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Supplier */}
                        <div className="form-group">
                            <label className="form-label">
                                Supplier <span className="required">*</span>
                            </label>
                            <select
                                name="supplierId"
                                value={formData.supplierId}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">Pilih Supplier</option>
                                {suppliers.map((sup) => (
                                    <option key={sup.id} value={sup.id}>
                                        {sup.name}
                                    </option>
                                ))}
                            </select>
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
                        >
                            {loading ? "Menyimpan..." : "Simpan Produk"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
