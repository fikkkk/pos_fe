import React, { useState } from "react";
import { FaTimes, FaTruck } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse same CSS

export default function AddSupplierModal({ isOpen, onClose, onSuccess }) {
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            phone: "",
            email: "",
            address: "",
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
            setError("Harap isi nama supplier");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                name: formData.name.trim(),
                phone: formData.phone.trim() || undefined,
                address: formData.address.trim() || undefined,
            };

            await api.post("/admin/suppliers", payload);

            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error creating supplier:", err);
            const message = err.response?.data?.message || err.message || "Gagal menambahkan supplier.";
            setError(message);
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
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px" }}>
                {/* Header */}
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}>
                    <h2 className="modal-title">
                        <span className="modal-title-icon"><FaTruck /></span>
                        Tambah Supplier Baru
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
                        {/* Nama Supplier */}
                        <div className="form-group full-width">
                            <label className="form-label">
                                Nama Supplier <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Contoh: PT Sumber Jaya, CV Maju Bersama..."
                                autoFocus
                            />
                        </div>

                        {/* Telepon */}
                        <div className="form-group">
                            <label className="form-label">Nomor Telepon</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Contoh: 08123456789"
                            />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Contoh: supplier@email.com"
                            />
                        </div>

                        {/* Alamat */}
                        <div className="form-group full-width">
                            <label className="form-label">Alamat</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Alamat lengkap supplier..."
                                rows={3}
                                style={{ resize: "vertical", minHeight: "80px" }}
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#f5f3ff",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#6d28d9",
                        border: "1px solid #ddd6fe"
                    }}>
                        💡 Supplier digunakan untuk mencatat asal produk yang dijual di toko Anda.
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
                            style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}
                        >
                            {loading ? "Menyimpan..." : "Simpan Supplier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
