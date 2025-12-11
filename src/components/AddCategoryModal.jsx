import React, { useState, useRef } from "react";
import { FaTimes, FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse same CSS

export default function AddCategoryModal({ isOpen, onClose, onSuccess }) {
    // Form state
    const [formData, setFormData] = useState({
        name: "",
    });

    // Image state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Compress image function - returns Blob for FormData
    const compressImageToBlob = (file, maxWidth = 400, quality = 0.6) => {
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

                    // Convert to Blob
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, "image/jpeg", quality);
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

    // Handle file selection
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                setError("Harap pilih file gambar (JPG, PNG, GIF, dll)");
                return;
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError("Ukuran gambar maksimal 10MB");
                return;
            }

            setImageFile(file);
            setError(null);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
        });
        setImageFile(null);
        setImagePreview(null);
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

        // Validasi
        if (!formData.name.trim()) {
            setError("Harap isi nama kategori");
            setLoading(false);
            return;
        }

        try {
            // 1. Create category first
            const payload = {
                name: formData.name.trim(),
            };

            const res = await api.post("/admin/categories", payload);
            const categoryId = res.data.id;

            // 2. Upload compressed image if exists
            if (imageFile && categoryId) {
                const compressedBlob = await compressImageToBlob(imageFile, 400, 0.6);
                const imageFormData = new FormData();
                imageFormData.append("file", compressedBlob, "image.jpg");

                await api.post(`/admin/category/${categoryId}/image`, imageFormData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error creating category:", err);
            const message = err.response?.data?.message || err.message || "Gagal menambahkan kategori.";
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
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
                {/* Header */}
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                    <h2 className="modal-title">
                        <span className="modal-title-icon">📁</span>
                        Tambah Kategori Baru
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
                        {/* Nama Kategori */}
                        <div className="form-group full-width">
                            <label className="form-label">
                                Nama Kategori <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Contoh: Sembako, Minuman, Snack..."
                                autoFocus
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="form-group full-width">
                            <label className="form-label">Gambar Kategori</label>
                            <div
                                className="image-upload-area"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: "2px dashed #bbf7d0",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    background: imagePreview ? "transparent" : "#f0fdf4",
                                    transition: "all 0.2s ease",
                                    position: "relative",
                                    minHeight: "100px",
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
                                                maxHeight: "150px",
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
                                        <FaCloudUploadAlt size={28} style={{ color: "#10b981", marginBottom: "8px" }} />
                                        <div style={{ color: "#166534", fontSize: "13px", fontWeight: 500 }}>
                                            Klik atau seret gambar ke sini
                                        </div>
                                        <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "4px" }}>
                                            Format: JPG, PNG, GIF (Maks. 10MB)
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#f0fdf4",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#166534",
                        border: "1px solid #bbf7d0"
                    }}>
                        💡 Kategori digunakan untuk mengelompokkan produk agar lebih mudah dicari dan dikelola.
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
                            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                        >
                            {loading ? "Menyimpan..." : "Simpan Kategori"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
