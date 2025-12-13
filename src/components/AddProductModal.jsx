import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css";
import SearchableDropdown from "./SearchableDropdown";

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
    });

    // Image state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [compressedImage, setCompressedImage] = useState(null);
    const fileInputRef = useRef(null);

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

    // Compress image function
    const compressImage = (file, maxWidth = 400, quality = 0.7) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to compressed base64
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
            // Validate file type
            if (!file.type.startsWith("image/")) {
                setError("Harap pilih file gambar (JPG, PNG, GIF, dll)");
                return;
            }
            // Validate file size (max 10MB for original)
            if (file.size > 10 * 1024 * 1024) {
                setError("Ukuran gambar maksimal 10MB");
                return;
            }

            setImageFile(file);
            setError(null);

            // Create preview (original)
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Compress image for upload
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
                imageUrl: compressedImage || undefined, // Use compressed base64
            };

            await api.post("/admin/products", payload);

            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error creating product:", err);
            const message = err.response?.data?.message || err.message || "Gagal menambahkan produk.";
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

                        {/* Image Upload */}
                        <div className="form-group full-width">
                            <label className="form-label">Gambar Produk</label>
                            <div
                                className="image-upload-area"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: "2px dashed #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    background: imagePreview ? "transparent" : "#f8fafc",
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
                                        <div style={{
                                            marginTop: "8px",
                                            fontSize: "11px",
                                            color: "#10b981",
                                            fontWeight: 500
                                        }}>
                                            ✓ Gambar akan dikompres otomatis saat disimpan
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt size={32} style={{ color: "#94a3b8", marginBottom: "8px" }} />
                                        <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
                                            Klik atau seret gambar ke sini
                                        </div>
                                        <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
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

                        {/* Kategori */}
                        <div className="form-group">
                            <label className="form-label">
                                Kategori <span className="required">*</span>
                            </label>
                            <SearchableDropdown
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                options={categories}
                                placeholder="Pilih Kategori"
                                searchPlaceholder="Cari kategori..."
                                required
                            />
                        </div>

                        {/* Supplier */}
                        <div className="form-group">
                            <label className="form-label">
                                Supplier <span className="required">*</span>
                            </label>
                            <SearchableDropdown
                                name="supplierId"
                                value={formData.supplierId}
                                onChange={handleChange}
                                options={suppliers}
                                placeholder="Pilih Supplier"
                                searchPlaceholder="Cari supplier..."
                                required
                            />
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
            </div >
        </div >
    );
}
