// src/components/Member.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
    FaUsers,
    FaSearch,
    FaPlus,
    FaEdit,
    FaTrash,
    FaPhone,
    FaStar,
    FaChevronLeft,
    FaChevronRight,
    FaUserPlus,
    FaTimes,
    FaCheck,
    FaGift,
    FaSyncAlt,
    FaIdCard,
    FaHistory,
    FaExclamationTriangle,
} from "react-icons/fa";
import "./Member.css";
import { api } from "../api";

export default function Member() {
    // Load members from localStorage on init
    const [members, setMembers] = useState(() => {
        try {
            const saved = localStorage.getItem("pos_members");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [rewards, setRewards] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
    });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [lookupQuery, setLookupQuery] = useState("");
    const [lookupLoading, setLookupLoading] = useState(false);

    // Save members to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("pos_members", JSON.stringify(members));
    }, [members]);

    // Load rewards on mount
    useEffect(() => {
        fetchRewards();
    }, []);

    // Fetch rewards
    const fetchRewards = async () => {
        try {
            const res = await api.get("/kasir/rewards");
            setRewards(res.data || []);
        } catch (err) {
            console.error("Error fetching rewards:", err);
        }
    };

    // Lookup member by phone or memberCode
    const handleLookupMember = async () => {
        if (!lookupQuery.trim()) {
            setFormError("Masukkan No HP atau Kode Member");
            return;
        }

        setLookupLoading(true);
        setFormError("");
        try {
            const isCode = lookupQuery.toUpperCase().startsWith("MBR");
            const res = await api.post("/kasir/members/lookup", {
                memberCode: isCode ? lookupQuery.trim() : undefined,
                phone: !isCode ? lookupQuery.trim() : undefined,
            });

            const member = res.data;
            console.log("Member found:", member);

            // Add to list if not exists
            if (!members.find((m) => m.id === member.id)) {
                setMembers((prev) => [member, ...prev]);
            } else {
                // Update existing member data
                setMembers((prev) =>
                    prev.map((m) => (m.id === member.id ? member : m))
                );
            }
            setLookupQuery("");
            setFormError(""); // Clear any error
        } catch (err) {
            console.error("Error lookup member:", err);
            setFormError(err?.response?.data?.message || "Member tidak ditemukan");
        } finally {
            setLookupLoading(false);
        }
    };

    // Filtered members based on search
    const filteredMembers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return members;
        return members.filter(
            (m) =>
                m.customer?.name?.toLowerCase().includes(q) ||
                m.customer?.phone?.includes(q) ||
                m.memberCode?.toLowerCase().includes(q)
        );
    }, [members, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedMembers = filteredMembers.slice(startIdx, startIdx + itemsPerPage);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Format currency
    const formatRp = (num) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num || 0);
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Check if expired
    const isExpired = (validUntil) => {
        if (!validUntil) return false;
        return new Date(validUntil) < new Date();
    };

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormError("");
    };

    // Open add modal
    const openAddModal = () => {
        setFormData({
            name: "",
            phone: "",
        });
        setFormError("");
        setShowAddModal(true);
    };

    // Open detail modal
    const openDetailModal = async (member) => {
        try {
            setLoading(true);
            const res = await api.get(`/kasir/members/${member.id}`);
            setSelectedMember(res.data);
            setShowDetailModal(true);
        } catch (err) {
            console.error("Error getting member detail:", err);
            alert("Gagal mengambil detail member");
        } finally {
            setLoading(false);
        }
    };

    // Open renew modal
    const openRenewModal = (member) => {
        setSelectedMember(member);
        setShowRenewModal(true);
    };

    // Open redeem modal
    const openRedeemModal = (member) => {
        setSelectedMember(member);
        fetchRewards();
        setShowRedeemModal(true);
    };

    // Open delete modal
    const openDeleteModal = (member) => {
        setSelectedMember(member);
        setShowDeleteModal(true);
    };

    // Delete member (from local list only)
    const handleDeleteMember = () => {
        if (!selectedMember) return;
        setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
        setShowDeleteModal(false);
        setSelectedMember(null);
    };

    // Add new member (Create)
    const handleAddMember = async () => {
        if (!formData.name.trim()) {
            setFormError("Nama member wajib diisi");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/kasir/members", {
                name: formData.name.trim(),
                phone: formData.phone.trim() || undefined,
            });

            // Add new member to local state
            setMembers((prev) => [res.data, ...prev]);
            setShowAddModal(false);
            setFormData({ name: "", phone: "" });
            setFormError("");
        } catch (err) {
            console.error("Error creating member:", err);
            const errorMsg = err?.response?.data?.message || "Gagal membuat member";

            // Jika member sudah terdaftar, coba lookup dan tampilkan
            if (errorMsg.toLowerCase().includes("sudah") || errorMsg.toLowerCase().includes("exist") || errorMsg.toLowerCase().includes("terdaftar")) {
                // Coba lookup dengan phone jika ada
                if (formData.phone.trim()) {
                    try {
                        const lookupRes = await api.post("/kasir/members/lookup", {
                            phone: formData.phone.trim(),
                        });
                        const existingMember = lookupRes.data;
                        // Add to list if not exists
                        if (!members.find((m) => m.id === existingMember.id)) {
                            setMembers((prev) => [existingMember, ...prev]);
                        }
                        setShowAddModal(false);
                        setFormData({ name: "", phone: "" });
                        setFormError("");
                        return;
                    } catch (lookupErr) {
                        console.error("Lookup failed:", lookupErr);
                    }
                }
            }
            setFormError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Renew member
    const handleRenewMember = async () => {
        if (!selectedMember) return;

        setLoading(true);
        try {
            const res = await api.patch(`/kasir/members/${selectedMember.id}/renew`, {
                note: "Perpanjangan member dari halaman Member",
            });

            // Update in local state
            setMembers((prev) =>
                prev.map((m) => (m.id === selectedMember.id ? res.data : m))
            );
            setShowRenewModal(false);
            setSelectedMember(null);
        } catch (err) {
            console.error("Error renewing member:", err);
            alert(err?.response?.data?.message || "Gagal memperpanjang member");
        } finally {
            setLoading(false);
        }
    };

    // Redeem reward
    const handleRedeemReward = async (rewardId) => {
        if (!selectedMember) return;

        setLoading(true);
        try {
            await api.post(`/kasir/members/${selectedMember.id}/redeem`, {
                rewardId,
            });

            // Refresh member data
            const res = await api.get(`/kasir/members/${selectedMember.id}`);
            setMembers((prev) =>
                prev.map((m) => (m.id === selectedMember.id ? res.data : m))
            );
            setSelectedMember(res.data);
            alert("Reward berhasil ditukar!");
        } catch (err) {
            console.error("Error redeeming reward:", err);
            alert(err?.response?.data?.message || "Gagal menukar reward");
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => !isExpired(m.validUntil)).length;
    const totalPoints = members.reduce((sum, m) => sum + (m.points || 0), 0);

    return (
        <div className="member-page">
            {/* Header */}
            <div className="member-header">
                <div className="member-header-content">
                    <div className="member-header-icon">
                        <FaUsers />
                    </div>
                    <div className="member-header-text">
                        <h1 className="member-title">Member & Loyalty</h1>
                        <p className="member-subtitle">
                            Kelola member dan program poin loyalti toko Anda
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="member-stats">
                <div className="stat-card total">
                    <div className="stat-icon">
                        <FaUsers />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{totalMembers}</span>
                        <span className="stat-label">Member Ditemukan</span>
                    </div>
                </div>
                <div className="stat-card active">
                    <div className="stat-icon">
                        <FaCheck />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{activeMembers}</span>
                        <span className="stat-label">Member Aktif</span>
                    </div>
                </div>
                <div className="stat-card points">
                    <div className="stat-icon">
                        <FaStar />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{totalPoints.toLocaleString()}</span>
                        <span className="stat-label">Total Poin</span>
                    </div>
                </div>
                <div className="stat-card spent">
                    <div className="stat-icon">
                        <FaGift />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{rewards.length}</span>
                        <span className="stat-label">Reward Tersedia</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="member-content">
                {/* Toolbar */}
                <div className="member-toolbar">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Cari No HP atau Kode Member..."
                            value={lookupQuery}
                            onChange={(e) => setLookupQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLookupMember()}
                        />
                        <button
                            className="btn-lookup"
                            onClick={handleLookupMember}
                            disabled={lookupLoading}
                        >
                            {lookupLoading ? "..." : "Cari"}
                        </button>
                    </div>
                    <button className="btn-add-member" onClick={openAddModal}>
                        <FaUserPlus />
                        <span>Daftar Member Baru</span>
                    </button>
                </div>

                {formError && (
                    <div className="toolbar-error">
                        <FaExclamationTriangle /> {formError}
                    </div>
                )}

                {/* Filter local */}
                {members.length > 0 && (
                    <div className="member-filter">
                        <input
                            type="text"
                            placeholder="Filter hasil..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}

                {/* Table */}
                <div className="member-table-wrapper">
                    <table className="member-table">
                        <thead>
                            <tr>
                                <th className="col-no">No</th>
                                <th>Member</th>
                                <th>Kode Member</th>
                                <th>No. HP</th>
                                <th className="col-points">Poin</th>
                                <th>Berlaku s.d.</th>
                                <th>Status</th>
                                <th className="col-action">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="empty-row">
                                        {members.length === 0
                                            ? "Cari member dengan No HP atau Kode Member"
                                            : "Tidak ada member yang cocok dengan filter"}
                                    </td>
                                </tr>
                            ) : (
                                paginatedMembers.map((member, idx) => (
                                    <tr key={member.id}>
                                        <td className="col-no">{startIdx + idx + 1}</td>
                                        <td>
                                            <div className="member-cell">
                                                <div className="member-avatar">
                                                    {getInitials(member.customer?.name)}
                                                </div>
                                                <div className="member-info">
                                                    <span className="member-name">{member.customer?.name || "-"}</span>
                                                    <span className="member-id">ID: {member.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="code-badge">
                                                <FaIdCard />
                                                {member.memberCode || "-"}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="phone-cell">
                                                <FaPhone className="phone-icon" />
                                                {member.customer?.phone || "-"}
                                            </div>
                                        </td>
                                        <td className="col-points">
                                            <div className="points-badge">
                                                <FaStar className="star-icon" />
                                                {(member.points || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>{formatDate(member.validUntil)}</td>
                                        <td>
                                            <span
                                                className={`status-badge ${isExpired(member.validUntil) ? "expired" : "aktif"
                                                    }`}
                                            >
                                                {isExpired(member.validUntil) ? "EXPIRED" : "AKTIF"}
                                            </span>
                                        </td>
                                        <td className="col-action">
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action detail"
                                                    onClick={() => openDetailModal(member)}
                                                    title="Detail Member"
                                                >
                                                    <FaHistory />
                                                </button>
                                                <button
                                                    className="btn-action reward"
                                                    onClick={() => openRedeemModal(member)}
                                                    title="Tukar Poin"
                                                    disabled={isExpired(member.validUntil) || member.points === 0}
                                                >
                                                    <FaGift />
                                                </button>
                                                {isExpired(member.validUntil) && (
                                                    <button
                                                        className="btn-action renew"
                                                        onClick={() => openRenewModal(member)}
                                                        title="Perpanjang Member"
                                                    >
                                                        <FaSyncAlt />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-action delete"
                                                    onClick={() => openDeleteModal(member)}
                                                    title="Hapus dari Daftar"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {members.length > 0 && (
                    <div className="member-pagination">
                        <div className="pagination-info">
                            Menampilkan {Math.min(startIdx + 1, filteredMembers.length)} -{" "}
                            {Math.min(startIdx + itemsPerPage, filteredMembers.length)} dari{" "}
                            {filteredMembers.length} member
                        </div>
                        <div className="pagination-controls">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                            </select>
                            <div className="pagination-buttons">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                >
                                    <FaChevronLeft />
                                </button>
                                <span className="page-number">{currentPage}</span>
                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <FaUserPlus /> Daftar Member Baru
                            </h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            {formError && <div className="form-error">{formError}</div>}
                            <div className="form-group">
                                <label>Nama Lengkap *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                            <div className="form-group">
                                <label>No. HP</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: 081234567890"
                                />
                            </div>
                            <p className="form-note">
                                * Member baru akan berlaku selama 5 tahun
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                Batal
                            </button>
                            <button
                                className="btn-save"
                                onClick={handleAddMember}
                                disabled={loading}
                            >
                                <FaCheck /> {loading ? "Menyimpan..." : "Daftarkan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Member Modal */}
            {showDetailModal && selectedMember && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header detail">
                            <h2>
                                <FaIdCard /> Detail Member
                            </h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-card">
                                    <div className="detail-avatar">
                                        {getInitials(selectedMember.customer?.name)}
                                    </div>
                                    <h3>{selectedMember.customer?.name || "-"}</h3>
                                    <p className="detail-code">{selectedMember.memberCode}</p>
                                </div>
                                <div className="detail-info">
                                    <div className="info-item">
                                        <span className="label">No. HP</span>
                                        <span className="value">{selectedMember.customer?.phone || "-"}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Poin</span>
                                        <span className="value points">
                                            <FaStar /> {(selectedMember.points || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Berlaku s.d.</span>
                                        <span className="value">{formatDate(selectedMember.validUntil)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Status</span>
                                        <span className={`value status ${isExpired(selectedMember.validUntil) ? "expired" : "aktif"}`}>
                                            {isExpired(selectedMember.validUntil) ? "EXPIRED" : "AKTIF"}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Bergabung</span>
                                        <span className="value">{formatDate(selectedMember.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Point History */}
                            {selectedMember.pointHistories && selectedMember.pointHistories.length > 0 && (
                                <div className="history-section">
                                    <h4><FaHistory /> Riwayat Poin Terakhir</h4>
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>Tanggal</th>
                                                <th>Tipe</th>
                                                <th>Poin</th>
                                                <th>Saldo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedMember.pointHistories.slice(0, 5).map((h) => (
                                                <tr key={h.id}>
                                                    <td>{formatDate(h.createdAt)}</td>
                                                    <td>
                                                        <span className={`type-badge ${h.type.toLowerCase()}`}>
                                                            {h.type}
                                                        </span>
                                                    </td>
                                                    <td className={h.type === "REDEEM" ? "negative" : "positive"}>
                                                        {h.type === "REDEEM" ? "-" : "+"}{h.points}
                                                    </td>
                                                    <td>{h.balanceAfter}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Renew Member Modal */}
            {showRenewModal && selectedMember && (
                <div className="modal-overlay" onClick={() => setShowRenewModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header renew">
                            <h2>
                                <FaSyncAlt /> Perpanjang Member
                            </h2>
                            <button className="modal-close" onClick={() => setShowRenewModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ textAlign: "center", marginBottom: "20px" }}>
                                Perpanjang member <strong>{selectedMember.customer?.name}</strong>?
                            </p>
                            <div className="renew-info">
                                <div>
                                    <span>Kode Member:</span>
                                    <strong>{selectedMember.memberCode}</strong>
                                </div>
                                <div>
                                    <span>Berlaku s.d. (saat ini):</span>
                                    <strong className="expired">{formatDate(selectedMember.validUntil)}</strong>
                                </div>
                                <div>
                                    <span>Akan diperpanjang:</span>
                                    <strong className="aktif">+5 Tahun</strong>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowRenewModal(false)}>
                                Batal
                            </button>
                            <button
                                className="btn-renew"
                                onClick={handleRenewMember}
                                disabled={loading}
                            >
                                <FaSyncAlt /> {loading ? "Memproses..." : "Perpanjang"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Redeem Reward Modal */}
            {showRedeemModal && selectedMember && (
                <div className="modal-overlay" onClick={() => setShowRedeemModal(false)}>
                    <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header reward">
                            <h2>
                                <FaGift /> Tukar Poin
                            </h2>
                            <button className="modal-close" onClick={() => setShowRedeemModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="redeem-header">
                                <span>Poin {selectedMember.customer?.name}:</span>
                                <strong><FaStar /> {(selectedMember.points || 0).toLocaleString()} poin</strong>
                            </div>

                            {rewards.length === 0 ? (
                                <p className="no-rewards">Tidak ada reward yang tersedia saat ini.</p>
                            ) : (
                                <div className="rewards-grid">
                                    {rewards.map((reward) => (
                                        <div
                                            key={reward.id}
                                            className={`reward-card ${selectedMember.points < reward.pointsCost ? "disabled" : ""}`}
                                        >
                                            <div className="reward-icon">
                                                <FaGift />
                                            </div>
                                            <h4>{reward.name}</h4>
                                            <p className="reward-desc">{reward.description || "-"}</p>
                                            <div className="reward-cost">
                                                <FaStar /> {reward.pointsCost.toLocaleString()} poin
                                            </div>
                                            <div className="reward-stock">Stok: {reward.stock}</div>
                                            <button
                                                className="btn-redeem-reward"
                                                disabled={selectedMember.points < reward.pointsCost || reward.stock <= 0 || loading}
                                                onClick={() => handleRedeemReward(reward.id)}
                                            >
                                                {selectedMember.points < reward.pointsCost
                                                    ? "Poin Tidak Cukup"
                                                    : reward.stock <= 0
                                                        ? "Stok Habis"
                                                        : "Tukar Sekarang"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowRedeemModal(false)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Member Modal */}
            {showDeleteModal && selectedMember && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header delete">
                            <h2>
                                <FaTrash /> Hapus Member
                            </h2>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="delete-message">
                                Apakah Anda yakin ingin menghapus member berikut dari daftar?
                            </div>
                            <div style={{
                                background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                                border: "2px solid #fca5a5",
                                borderRadius: "12px",
                                padding: "16px",
                                marginBottom: "16px",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#fff",
                                        fontWeight: "700",
                                        fontSize: "16px",
                                    }}>
                                        {selectedMember.customer?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "700", color: "#991b1b" }}>
                                            {selectedMember.customer?.name || "-"}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#b91c1c" }}>
                                            {selectedMember.memberCode}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="delete-warning">
                                <FaExclamationTriangle style={{ marginRight: "8px" }} />
                                Catatan: Ini hanya menghapus dari tampilan lokal. Data member di server tidak akan terpengaruh.
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Batal
                            </button>
                            <button className="btn-delete" onClick={handleDeleteMember}>
                                <FaTrash /> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
