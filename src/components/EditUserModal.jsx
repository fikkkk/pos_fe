import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse same CSS

export default function EditUserModal({ isOpen, onClose, onSuccess, user }) {
    // Form state
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        role: "KASIR",
        status: "AKTIF",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Populate form dengan data user yang akan diedit
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                email: user.email || "",
                username: user.username || "",
                password: "", // Password kosong untuk edit (opsional)
                role: user.role || "KASIR",
                status: user.status || "AKTIF",
            });
        }
    }, [isOpen, user]);

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
            email: "",
            username: "",
            password: "",
            role: "KASIR",
            status: "AKTIF",
        });
        setError(null);
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validasi
        if (!formData.email || !formData.username) {
            setError("Harap isi email dan username");
            setLoading(false);
            return;
        }

        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Format email tidak valid");
            setLoading(false);
            return;
        }

        // Validasi password jika diisi
        if (formData.password && formData.password.length < 8) {
            setError("Password minimal 8 karakter");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                email: formData.email,
                username: formData.username,
                role: formData.role,
                status: formData.status,
            };

            // Hanya sertakan password jika diisi
            if (formData.password) {
                payload.password = formData.password;
            }

            await api.patch(`/admin/users/${user.id}`, payload);

            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error updating user:", err);
            setError(err.response?.data?.message || "Gagal memperbarui user. Silakan coba lagi.");
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
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" }}>
                    <h2 className="modal-title">
                        <span className="modal-title-icon">✏️</span>
                        Edit User
                    </h2>
                    <button className="modal-close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* User Info */}
                {user && (
                    <div style={{
                        padding: "12px 24px",
                        background: "#f1f5f9",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: "13px",
                        color: "#64748b"
                    }}>
                        ID User: <strong style={{ color: "#334155" }}>#{user.id}</strong>
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
                        {/* Username */}
                        <div className="form-group">
                            <label className="form-label">
                                Username <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Masukkan username"
                            />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="contoh@email.com"
                            />
                        </div>

                        {/* New Password */}
                        <div className="form-group full-width">
                            <label className="form-label">
                                Password Baru <span style={{ color: "#94a3b8", fontWeight: 400 }}>(kosongkan jika tidak ingin mengubah)</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Masukkan password baru..."
                                    style={{ paddingRight: "50px" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        color: "#64748b"
                                    }}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="KASIR">Kasir</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="AKTIF">Aktif</option>
                                <option value="TIDAK_AKTIF">Tidak Aktif</option>
                            </select>
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
                            style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" }}
                        >
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
