import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse same CSS
import SearchableDropdown from "./SearchableDropdown";

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
    // Form state
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        role: "KASIR",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

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
            confirmPassword: "",
            role: "KASIR",
        });
        setError(null);
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validasi
        if (!formData.email || !formData.username || !formData.password) {
            setError("Harap isi semua field yang wajib (*)");
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

        // Validasi password
        if (formData.password.length < 8) {
            setError("Password minimal 8 karakter");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Password dan konfirmasi password tidak sama");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                email: formData.email,
                username: formData.username,
                password: formData.password,
                role: formData.role,
            };

            await api.post("/admin/users", payload);

            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error creating user:", err);
            setError(err.response?.data?.message || "Gagal menambahkan user. Silakan coba lagi.");
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
                        <span className="modal-title-icon">👤</span>
                        Tambah User Baru
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

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">
                                Password <span className="required">*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Minimal 8 karakter"
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

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label className="form-label">
                                Konfirmasi Password <span className="required">*</span>
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Ulangi password"
                            />
                        </div>

                        {/* Role */}
                        <div className="form-group full-width">
                            <label className="form-label">
                                Role <span className="required">*</span>
                            </label>
                            <SearchableDropdown
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                options={[
                                    { id: "KASIR", name: "Kasir" },
                                    { id: "ADMIN", name: "Admin" }
                                ]}
                                placeholder="Pilih Role"
                                searchPlaceholder="Cari role..."
                                required
                            />
                        </div>
                    </div>

                    {/* Password hints */}
                    <div style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#f1f5f9",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#64748b"
                    }}>
                        <strong>Ketentuan Password:</strong>
                        <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
                            <li>Minimal 8 karakter</li>
                            <li>Disarankan kombinasi huruf besar, kecil, angka, dan simbol</li>
                        </ul>
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
                            {loading ? "Menyimpan..." : "Simpan User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
