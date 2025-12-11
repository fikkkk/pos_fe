import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaCloudUploadAlt, FaTrash } from "react-icons/fa";
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
    });

    // Image state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [compressedImage, setCompressedImage] = useState(null);
    const [hasNewImage, setHasNewImage] = useState(false);
    const fileInputRef = useRef(null);

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
            });
            // Set existing image as preview
            if (product.imageUrl) {
                setImagePreview(product.imageUrl);
            }
            setHasNewImage(false);
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

    // Compress image function
    const compressImage = (file, maxWidth = 400, quality = 0.6) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
                    resolve(compressedDataUrl);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
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

    // Handle file selection
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Harap pilih file gambar (JPG, PNG, GIF, dll)");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError("Ukuran gambar maksimal 10MB");
                return;
            }

            setImageFile(file);
            setHasNewImage(true);
            setError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            try {
                const compressed = await compressImage(file, 400, 0.6);
                setCompressedImage(compressed);
            } catch (err) {
                console.error("Error compressing image:", err);
                setError("Gagal memproses gambar");
            }
        }
    };

    // Handle drag & drop
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const fakeEvent = { target: { files: [file] } };
            handleFileSelect(fakeEvent);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Remove image
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setCompressedImage(null);
        setHasNewImage(true); // Mark as changed (removed)
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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
        });
        setImageFile(null);
        setImagePreview(null);
        setCompressedImage(null);
        setHasNewImage(false);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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

            // Only include imageUrl if image changed
            if (hasNewImage) {
                payload.imageUrl = compressedImage || undefined;
            }

            await api.patch(`/admin/products/${product.id}`, payload);

            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error updating product:", err);
            const message = err.response?.data?.message || err.message || "Gagal memperbarui produk.";
            if (message.includes("entity too large") || message.includes("too large")) {
                setError("Gambar terlalu besar. Coba gunakan gambar yang lebih kecil.");
            } else {
                setError(message);
            }
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

                        {/* Image Upload */}
                        <div className="form-group full-width">
                            <label className="form-label">Gambar Produk</label>
                            <div
                                className="image-upload-area"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: "2px dashed #93c5fd",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    background: imagePreview ? "transparent" : "#eff6ff",
                                    transition: "all 0.2s ease",
                                    position: "relative",
                                    minHeight: "120px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    style={{ display: "none" }}
                                />

                                {imagePreview ? (
                                    <div style={{ position: "relative", width: "100%" }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "200px",
                                                borderRadius: "8px",
                                                objectFit: "contain",
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveImage();
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: "-8px",
                                                right: "-8px",
                                                width: "28px",
                                                height: "28px",
                                                borderRadius: "50%",
                                                background: "#ef4444",
                                                border: "none",
                                                color: "#fff",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                        {hasNewImage && (
                                            <div style={{
                                                marginTop: "8px",
                                                fontSize: "11px",
                                                color: "#3b82f6",
                                                fontWeight: 500
                                            }}>
                                                ✓ Gambar baru akan dikompres otomatis saat disimpan
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt size={32} style={{ color: "#3b82f6", marginBottom: "8px" }} />
                                        <div style={{ color: "#1e40af", fontSize: "14px", fontWeight: 500 }}>
                                            Klik atau seret gambar baru ke sini
                                        </div>
                                        <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
                                            Format: JPG, PNG, GIF (Maks. 10MB)
                                        </div>
                                    </>
                                )}
                            </div>
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
