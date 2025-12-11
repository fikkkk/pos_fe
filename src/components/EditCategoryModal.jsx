import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse same CSS

export default function EditCategoryModal({ isOpen, onClose, onSuccess, category }) {
    // Form state
    const [formData, setFormData] = useState({
        name: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Populate form dengan data kategori yang akan diedit
    useEffect(() => {
        if (isOpen && category) {
            setFormData({
                name: category.name || "",
            });
        }
    }, [isOpen, category]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
        });
        setError(null);
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
            const payload = {
                name: formData.name.trim(),
            };

            await api.patch(`/admin/categories/${category.id}`, payload);

            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error updating category:", err);
            setError(err.response?.data?.message || "Gagal memperbarui kategori. Silakan coba lagi.");
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
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
                {/* Header */}
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                    <h2 className="modal-title">
                        <span className="modal-title-icon">✏️</span>
                        Edit Kategori
                    </h2>
                    <button className="modal-close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Category Info */}
                {category && (
                    <div style={{
                        padding: "12px 24px",
                        background: "#f0fdf4",
                        borderBottom: "1px solid #bbf7d0",
                        fontSize: "13px",
                        color: "#166534"
                    }}>
                        ID Kategori: <strong style={{ color: "#15803d" }}>#{category.id}</strong>
                        {category._count?.products !== undefined && (
                            <span style={{ marginLeft: "16px" }}>
                                Jumlah Produk: <strong>{category._count.products}</strong>
                            </span>
                        )}
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
                                placeholder="Masukkan nama kategori"
                                autoFocus
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
