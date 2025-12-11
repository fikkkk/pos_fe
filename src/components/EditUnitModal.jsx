import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css"; // Reuse same CSS

export default function EditUnitModal({ isOpen, onClose, onSuccess, unit }) {
    // Form state
    const [formData, setFormData] = useState({
        unitName: "",
        multiplier: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Populate form dengan data unit yang akan diedit
    useEffect(() => {
        if (isOpen && unit) {
            setFormData({
                unitName: unit.unitName || "",
                multiplier: unit.multiplier?.toString() || "",
            });
        }
    }, [isOpen, unit]);

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
        if (!formData.unitName || !formData.multiplier) {
            setError("Harap isi semua field yang wajib");
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
                unitName: formData.unitName.trim(),
                multiplier: parseInt(formData.multiplier, 10),
            };

            await api.patch(`/admin/unitId/${unit.id}`, payload);

            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error updating unit:", err);
            setError(err.response?.data?.message || "Gagal memperbarui satuan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    // Handle close
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Calculate new price
    const newPrice = unit?.product?.price
        ? parseInt(formData.multiplier || 0, 10) * unit.product.price
        : 0;

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
                {/* Header */}
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" }}>
                    <h2 className="modal-title">
                        <span className="modal-title-icon">✏️</span>
                        Edit Satuan Produk
                    </h2>
                    <button className="modal-close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Unit Info */}
                {unit && (
                    <div style={{
                        padding: "12px 24px",
                        background: "#fdf2f8",
                        borderBottom: "1px solid #fbcfe8",
                        fontSize: "13px",
                        color: "#9d174d"
                    }}>
                        <div>Produk: <strong style={{ color: "#831843" }}>{unit.product?.name || "-"}</strong></div>
                        <div style={{ marginTop: "4px" }}>
                            Harga per Pcs: <strong>Rp {Number(unit.product?.price || 0).toLocaleString("id-ID")}</strong>
                        </div>
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
                    {unit?.product && formData.multiplier && (
                        <div style={{
                            marginTop: "16px",
                            padding: "16px",
                            background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
                            borderRadius: "12px",
                            border: "1px solid #fbcfe8"
                        }}>
                            <div style={{ fontSize: "12px", color: "#9d174d", marginBottom: "8px" }}>
                                💡 Harga Satuan Baru:
                            </div>
                            <div style={{ fontSize: "14px", color: "#831843", fontWeight: 600 }}>
                                {formData.unitName || "Satuan"} = {formData.multiplier} x Rp {Number(unit.product.price || 0).toLocaleString("id-ID")}
                            </div>
                            <div style={{ fontSize: "18px", color: "#be185d", fontWeight: 700, marginTop: "4px" }}>
                                = Rp {newPrice.toLocaleString("id-ID")}
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
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
