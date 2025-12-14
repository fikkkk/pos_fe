import React, { useState, useEffect } from "react";
import {
    FaUser,
    FaEnvelope,
    FaUserTag,
    FaCalendarAlt,
    FaClock,
    FaCamera,
    FaSave,
    FaTimes,
    FaEdit,
    FaCheckCircle,
    FaSpinner,
    FaShieldAlt,
    FaTrash,
} from "react-icons/fa";
import { api } from "../api";
import "./AkunSaya.css";
import ImageCropModal from "./ImageCropModal";

// Decode JWT Token
function decodeJWT(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export default function AkunSaya({ onProfileUpdate }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Crop modal state
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        username: "",
    });

    // Get user info from token
    const token = localStorage.getItem("token");
    const userInfo = token ? decodeJWT(token) : null;

    // Fetch profile data
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get("/profile/me");
            setProfile(res.data);
            setFormData({
                name: res.data.name || "",
                username: res.data.username || "",
            });
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Gagal memuat data profil");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await api.patch("/profile", formData);
            setProfile(res.data.user);
            setSuccess("Profil berhasil diperbarui!");
            setIsEditing(false);
            setTimeout(() => setSuccess(null), 3000);
            // Notify parent to refresh sidebar
            if (onProfileUpdate) onProfileUpdate();
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.response?.data?.message || "Gagal memperbarui profil");
        } finally {
            setSaving(false);
        }
    };

    // Handle file selection - open crop modal
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create URL for the selected image
        const imageUrl = URL.createObjectURL(file);
        setImageToCrop(imageUrl);
        setCropModalOpen(true);

        // Reset input so same file can be selected again
        e.target.value = "";
    };

    // Handle cropped image upload
    const handleCroppedUpload = async (croppedFile) => {
        const formDataFile = new FormData();
        formDataFile.append("photo", croppedFile);

        try {
            setSaving(true);
            setCropModalOpen(false);

            const res = await api.patch("/profile/photo", formDataFile, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProfile((prev) => ({ ...prev, picture: res.data.picture }));
            setSuccess("Foto profil berhasil diperbarui!");
            setTimeout(() => setSuccess(null), 3000);
            // Notify parent to refresh sidebar
            if (onProfileUpdate) onProfileUpdate();
        } catch (err) {
            console.error("Error uploading photo:", err);
            setError("Gagal mengupload foto");
        } finally {
            setSaving(false);
            // Clean up the object URL
            if (imageToCrop) {
                URL.revokeObjectURL(imageToCrop);
                setImageToCrop(null);
            }
        }
    };

    // Handle delete photo
    const handleDeletePhoto = async () => {
        if (!profile?.picture) return;

        if (!window.confirm("Apakah Anda yakin ingin menghapus foto profil?")) {
            return;
        }

        try {
            setSaving(true);
            await api.delete("/profile/photo");
            setProfile((prev) => ({ ...prev, picture: null }));
            setSuccess("Foto profil berhasil dihapus!");
            setTimeout(() => setSuccess(null), 3000);
            // Notify parent to refresh sidebar
            if (onProfileUpdate) onProfileUpdate();
        } catch (err) {
            console.error("Error deleting photo:", err);
            setError(err.response?.data?.message || "Gagal menghapus foto");
        } finally {
            setSaving(false);
        }
    };

    // Close crop modal
    const handleCloseCropModal = () => {
        setCropModalOpen(false);
        if (imageToCrop) {
            URL.revokeObjectURL(imageToCrop);
            setImageToCrop(null);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: profile?.name || "",
            username: profile?.username || "",
        });
        setIsEditing(false);
        setError(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case "SUPERADMIN": return "role-superadmin";
            case "ADMIN": return "role-admin";
            case "KASIR": return "role-kasir";
            default: return "role-default";
        }
    };

    const getStatusBadgeClass = (status) => {
        return status === "AKTIF" ? "status-active" : "status-inactive";
    };

    if (loading) {
        return (
            <div className="akun-page">
                <div className="akun-loading">
                    <FaSpinner className="spinner" />
                    <span>Memuat profil...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="akun-page">
            {/* Header */}
            <div className="akun-header">
                <div className="akun-header-content">
                    <div className="akun-header-icon">
                        <FaUser />
                    </div>
                    <div className="akun-header-text">
                        <h1 className="akun-title">Profil Saya</h1>
                        <p className="akun-subtitle">
                            Kelola informasi profil dan preferensi akun Anda
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="akun-alert error">
                    <FaTimes className="alert-icon" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><FaTimes /></button>
                </div>
            )}
            {success && (
                <div className="akun-alert success">
                    <FaCheckCircle className="alert-icon" />
                    <span>{success}</span>
                </div>
            )}

            <div className="akun-content">
                {/* Profile Card */}
                <div className="akun-profile-card">
                    <div className="profile-cover"></div>

                    <div className="profile-avatar-section">
                        <div className="profile-avatar">
                            {profile?.picture ? (
                                <img src={`http://localhost:3000${profile.picture}`} alt="Profile" />
                            ) : (
                                <span>{(profile?.name || profile?.username || "U")[0].toUpperCase()}</span>
                            )}

                            {/* Upload button */}
                            <label className="avatar-upload-btn">
                                <FaCamera />
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleFileSelect}
                                    hidden
                                />
                            </label>

                            {/* Delete button - only show if has picture */}
                            {profile?.picture && (
                                <button
                                    className="avatar-delete-btn"
                                    onClick={handleDeletePhoto}
                                    disabled={saving}
                                    title="Hapus foto"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>

                        <div className="profile-info">
                            <h2 className="profile-name">{profile?.name || profile?.username || "User"}</h2>
                            <p className="profile-email">{profile?.email}</p>
                            <div className="profile-badges">
                                <span className={`role-badge ${getRoleBadgeClass(profile?.role)}`}>
                                    <FaShieldAlt /> {profile?.role}
                                </span>
                                <span className={`status-badge ${getStatusBadgeClass(profile?.status)}`}>
                                    {profile?.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="akun-details-grid">
                    {/* Info Card */}
                    <div className="akun-card">
                        <div className="akun-card-header">
                            <h3>Informasi Akun</h3>
                            {!isEditing ? (
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                    <FaEdit /> Edit
                                </button>
                            ) : (
                                <div className="edit-actions">
                                    <button className="cancel-btn" onClick={handleCancel}>
                                        <FaTimes /> Batal
                                    </button>
                                    <button className="save-btn" onClick={handleSave} disabled={saving}>
                                        {saving ? <FaSpinner className="spinner" /> : <FaSave />}
                                        Simpan
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="akun-card-body">
                            <div className="info-row">
                                <div className="info-label">
                                    <FaUser /> Nama Lengkap
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="info-input"
                                        placeholder="Nama lengkap"
                                    />
                                ) : (
                                    <div className="info-value">{profile?.name || "-"}</div>
                                )}
                            </div>

                            <div className="info-row">
                                <div className="info-label">
                                    <FaUserTag /> Username
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="info-input"
                                        placeholder="Username"
                                    />
                                ) : (
                                    <div className="info-value">@{profile?.username || "-"}</div>
                                )}
                            </div>

                            <div className="info-row">
                                <div className="info-label">
                                    <FaEnvelope /> Email
                                </div>
                                <div className="info-value">{profile?.email || "-"}</div>
                            </div>

                            <div className="info-row">
                                <div className="info-label">
                                    <FaShieldAlt /> Role
                                </div>
                                <div className="info-value">
                                    <span className={`role-badge small ${getRoleBadgeClass(profile?.role)}`}>
                                        {profile?.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Card */}
                    <div className="akun-card">
                        <div className="akun-card-header">
                            <h3>Aktivitas</h3>
                        </div>

                        <div className="akun-card-body">
                            <div className="info-row">
                                <div className="info-label">
                                    <FaClock /> Login Terakhir
                                </div>
                                <div className="info-value">
                                    {formatDateTime(profile?.lastLogin)}
                                </div>
                            </div>

                            <div className="info-row">
                                <div className="info-label">
                                    <FaCalendarAlt /> Member Sejak
                                </div>
                                <div className="info-value">
                                    {formatDate(profile?.createdAt)}
                                </div>
                            </div>

                            <div className="info-row">
                                <div className="info-label">
                                    <FaCheckCircle /> Status Akun
                                </div>
                                <div className="info-value">
                                    <span className={`status-badge ${getStatusBadgeClass(profile?.status)}`}>
                                        {profile?.status === "AKTIF" ? "Aktif" : "Tidak Aktif"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Crop Modal */}
            <ImageCropModal
                isOpen={cropModalOpen}
                imageSrc={imageToCrop}
                onClose={handleCloseCropModal}
                onSave={handleCroppedUpload}
            />
        </div>
    );
}
