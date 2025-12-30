import React, { useState, useEffect } from "react";
import { FaTimes, FaTrash, FaHistory, FaPlus, FaEdit, FaUser, FaFolder, FaBox, FaTags, FaExclamationTriangle } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css";

const ENTITY_CONFIG = {
    USER: {
        label: "User",
        icon: <FaUser />,
        color: "#3b82f6",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
    },
    CATEGORY: {
        label: "Kategori",
        icon: <FaFolder />,
        color: "#10b981",
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    PRODUCT_UNIT: {
        label: "Satuan",
        icon: <FaBox />,
        color: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    PROMO: {
        label: "Promo",
        icon: <FaTags />,
        color: "#8b5cf6",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
    }
};

const ACTION_CONFIG = {
    CREATE: { label: "Dibuat", icon: <FaPlus />, color: "#10b981" },
    UPDATE: { label: "Diubah", icon: <FaEdit />, color: "#f59e0b" },
    DELETE: { label: "Dihapus", icon: <FaTrash />, color: "#ef4444" }
};

export default function ActivityLogModal({ isOpen, onClose, entityType = null }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [filter, setFilter] = useState(entityType || "ALL");

    // State untuk konfirmasi hapus
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: null });

    useEffect(() => {
        if (isOpen) {
            setFilter(entityType || "ALL");
            fetchLogs(entityType);
        }
    }, [isOpen, entityType]);

    const fetchLogs = async (type) => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = type && type !== "ALL"
                ? `/admin/activity-logs?type=${type}`
                : "/admin/activity-logs";
            const response = await api.get(endpoint);
            setLogs(response.data);
        } catch (err) {
            console.error("Error fetching activity logs:", err);
            setError("Gagal memuat riwayat aktivitas");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (type) => {
        setFilter(type);
        fetchLogs(type === "ALL" ? null : type);
    };

    const showDeleteConfirm = (id, name) => {
        setDeleteConfirm({ show: true, id, name });
    };

    const hideDeleteConfirm = () => {
        setDeleteConfirm({ show: false, id: null, name: null });
    };

    const handleDelete = async () => {
        const id = deleteConfirm.id;
        setDeleting(id);
        hideDeleteConfirm();

        try {
            await api.delete(`/admin/activity-logs/${id}`);
            setLogs(prev => prev.filter(l => l.id !== id));
        } catch (err) {
            console.error("Error deleting log:", err);
            setError("Gagal menghapus log");
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (!isOpen) return null;

    const entityConfig = entityType ? ENTITY_CONFIG[entityType] : null;

    return (
        <>
            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div
                    className="modal-overlay"
                    style={{ zIndex: 1100 }}
                    onClick={hideDeleteConfirm}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "linear-gradient(145deg, #1e1e2e 0%, #252538 100%)",
                            borderRadius: "20px",
                            padding: "32px",
                            maxWidth: "400px",
                            width: "90%",
                            textAlign: "center",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
                        }}
                    >
                        <div style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                            boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)"
                        }}>
                            <FaExclamationTriangle style={{ color: "#fff", fontSize: "28px" }} />
                        </div>

                        <h3 style={{
                            color: "#fff",
                            fontSize: "20px",
                            fontWeight: 700,
                            marginBottom: "12px"
                        }}>
                            Hapus Log Aktivitas?
                        </h3>

                        <p style={{
                            color: "#94a3b8",
                            fontSize: "14px",
                            marginBottom: "28px",
                            lineHeight: 1.6
                        }}>
                            Log untuk <strong style={{ color: "#fff" }}>{deleteConfirm.name}</strong> akan dihapus permanen.
                        </p>

                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button
                                onClick={hideDeleteConfirm}
                                style={{
                                    padding: "12px 28px",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    background: "rgba(255,255,255,0.05)",
                                    color: "#fff",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    fontSize: "14px"
                                }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: "12px 28px",
                                    borderRadius: "12px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                    color: "#fff",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    fontSize: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)"
                                }}
                            >
                                <FaTrash />
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Modal */}
            <div className="modal-overlay" onClick={onClose}>
                <div
                    className="modal-container"
                    onClick={e => e.stopPropagation()}
                    style={{ maxWidth: "900px", maxHeight: "85vh" }}
                >
                    <div className="modal-header" style={{
                        background: entityConfig?.gradient || "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                    }}>
                        <h2 className="modal-title">
                            <span className="modal-title-icon">📋</span>
                            Riwayat Aktivitas {entityConfig?.label || ""}
                        </h2>
                        <button className="modal-close-btn" onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>

                    {error && <div className="modal-error">{error}</div>}

                    {/* Filter Tabs */}
                    {!entityType && (
                        <div style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap"
                        }}>
                            <button
                                onClick={() => handleFilterChange("ALL")}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: filter === "ALL" ? "rgba(99, 102, 241, 0.3)" : "rgba(255,255,255,0.05)",
                                    color: filter === "ALL" ? "#818cf8" : "#94a3b8",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontSize: "13px"
                                }}
                            >
                                Semua
                            </button>
                            {Object.entries(ENTITY_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handleFilterChange(key)}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: filter === key ? `${config.color}33` : "rgba(255,255,255,0.05)",
                                        color: filter === key ? config.color : "#94a3b8",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        fontSize: "13px"
                                    }}
                                >
                                    {config.icon}
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div style={{ padding: "20px", maxHeight: "60vh", overflowY: "auto" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                Memuat riwayat...
                            </div>
                        ) : logs.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "60px 20px",
                                color: "#94a3b8",
                                background: "rgba(255,255,255,0.03)",
                                borderRadius: "12px"
                            }}>
                                <FaHistory style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }} />
                                <div style={{ fontSize: "16px" }}>Belum ada riwayat aktivitas</div>
                                <div style={{ fontSize: "13px", marginTop: "8px" }}>
                                    Riwayat akan muncul setelah ada perubahan data
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {logs.map((item) => {
                                    const entity = ENTITY_CONFIG[item.entityType] || { label: item.entityType, color: "#64748b" };
                                    const action = ACTION_CONFIG[item.action] || { label: item.action, color: "#64748b" };

                                    return (
                                        <div
                                            key={item.id}
                                            style={{
                                                background: "rgba(255,255,255,0.05)",
                                                borderRadius: "12px",
                                                padding: "16px",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "16px"
                                            }}
                                        >
                                            {/* Icon */}
                                            <div style={{
                                                width: "48px",
                                                height: "48px",
                                                borderRadius: "12px",
                                                background: entity.gradient || entity.color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0
                                            }}>
                                                <span style={{ color: "#fff", fontSize: "18px" }}>
                                                    {entity.icon}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    marginBottom: "4px",
                                                    flexWrap: "wrap"
                                                }}>
                                                    <span style={{
                                                        fontSize: "11px",
                                                        color: entity.color,
                                                        background: `${entity.color}22`,
                                                        padding: "2px 8px",
                                                        borderRadius: "4px",
                                                        fontWeight: 600
                                                    }}>
                                                        {entity.label}
                                                    </span>
                                                    <span style={{
                                                        fontSize: "11px",
                                                        color: action.color,
                                                        background: `${action.color}22`,
                                                        padding: "2px 8px",
                                                        borderRadius: "4px",
                                                        fontWeight: 600,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px"
                                                    }}>
                                                        {action.icon}
                                                        {action.label}
                                                    </span>
                                                </div>

                                                <div style={{ fontWeight: 600, color: "#fff", fontSize: "15px" }}>
                                                    {item.entityName || `ID: ${item.entityId}`}
                                                </div>

                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                    fontSize: "12px",
                                                    color: "#64748b",
                                                    marginTop: "4px"
                                                }}>
                                                    <span>{formatDate(item.createdAt)}</span>
                                                    {item.performedBy && (
                                                        <>
                                                            <span>•</span>
                                                            <span>oleh {item.performedBy}</span>
                                                        </>
                                                    )}
                                                </div>

                                                {item.changes && (
                                                    <div style={{
                                                        fontSize: "12px",
                                                        color: "#94a3b8",
                                                        marginTop: "6px",
                                                        fontStyle: "italic",
                                                        maxWidth: "400px",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap"
                                                    }}>
                                                        📝 {item.changes}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => showDeleteConfirm(item.id, item.entityName || `ID: ${item.entityId}`)}
                                                disabled={deleting === item.id}
                                                style={{
                                                    background: "rgba(239, 68, 68, 0.1)",
                                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                                    borderRadius: "8px",
                                                    padding: "8px 12px",
                                                    color: "#ef4444",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    fontSize: "12px",
                                                    transition: "all 0.2s ease"
                                                }}
                                            >
                                                <FaTrash />
                                                {deleting === item.id ? "..." : "Hapus"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{
                        padding: "16px 20px",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                            Total: {logs.length} log
                        </span>
                        <button
                            className="btn-cancel"
                            onClick={onClose}
                            style={{ padding: "10px 24px" }}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
