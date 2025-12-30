import React, { useState, useEffect } from "react";
import { FaTimes, FaTrash, FaHistory, FaBox, FaArrowUp, FaArrowDown, FaExclamationTriangle } from "react-icons/fa";
import { api } from "../api";
import "./AddProductModal.css";

export default function StockHistoryModal({ isOpen, onClose, onDelete }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    
    // State untuk konfirmasi hapus
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: null });

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/admin/stock-history");
            setHistory(response.data);
        } catch (err) {
            console.error("Error fetching stock history:", err);
            setError("Gagal memuat riwayat stok");
        } finally {
            setLoading(false);
        }
    };

    const showDeleteConfirm = (id, productName) => {
        setDeleteConfirm({ show: true, id, name: productName });
    };

    const hideDeleteConfirm = () => {
        setDeleteConfirm({ show: false, id: null, name: null });
    };

    const handleDelete = async () => {
        const id = deleteConfirm.id;
        setDeleting(id);
        hideDeleteConfirm();
        
        try {
            await api.delete(`/admin/stock-history/${id}`);
            setHistory(prev => prev.filter(h => h.id !== id));
            if (onDelete) onDelete();
        } catch (err) {
            console.error("Error deleting history:", err);
            setError("Gagal menghapus riwayat");
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
                            Hapus Riwayat?
                        </h3>
                        
                        <p style={{ 
                            color: "#94a3b8", 
                            fontSize: "14px", 
                            marginBottom: "28px",
                            lineHeight: 1.6
                        }}>
                            Riwayat stok untuk <strong style={{ color: "#fff" }}>{deleteConfirm.name}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
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
                    <div className="modal-header" style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" }}>
                        <h2 className="modal-title">
                            <span className="modal-title-icon">📋</span>
                            Riwayat Stok
                        </h2>
                        <button className="modal-close-btn" onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>

                    {error && <div className="modal-error">{error}</div>}

                    <div style={{ padding: "20px", maxHeight: "60vh", overflowY: "auto" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                Memuat riwayat...
                            </div>
                        ) : history.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "60px 20px",
                                color: "#94a3b8",
                                background: "rgba(255,255,255,0.03)",
                                borderRadius: "12px"
                            }}>
                                <FaHistory style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }} />
                                <div style={{ fontSize: "16px" }}>Belum ada riwayat perubahan stok</div>
                                <div style={{ fontSize: "13px", marginTop: "8px" }}>
                                    Riwayat akan muncul setelah Anda menambahkan stok produk
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {history.map((item) => (
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
                                            background: item.type === "IN"
                                                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                                : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0
                                        }}>
                                            {item.type === "IN" ? (
                                                <FaArrowUp style={{ color: "#fff", fontSize: "20px" }} />
                                            ) : (
                                                <FaArrowDown style={{ color: "#fff", fontSize: "20px" }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                marginBottom: "4px"
                                            }}>
                                                <span style={{ fontWeight: 600, color: "#fff", fontSize: "15px" }}>
                                                    {item.product?.name || "Produk"}
                                                </span>
                                                <span style={{
                                                    fontSize: "11px",
                                                    color: "#64748b",
                                                    background: "rgba(255,255,255,0.1)",
                                                    padding: "2px 8px",
                                                    borderRadius: "4px"
                                                }}>
                                                    {item.product?.productCode}
                                                </span>
                                            </div>

                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                fontSize: "13px",
                                                color: "#94a3b8"
                                            }}>
                                                <span style={{
                                                    color: item.type === "IN" ? "#10b981" : "#ef4444",
                                                    fontWeight: 600
                                                }}>
                                                    {item.type === "IN" ? "+" : "-"}{item.quantity} Pcs
                                                </span>
                                                <span>•</span>
                                                <span>{item.stockBefore} → {item.stockAfter}</span>
                                                <span>•</span>
                                                <span>{formatDate(item.createdAt)}</span>
                                            </div>

                                            {item.note && (
                                                <div style={{
                                                    fontSize: "12px",
                                                    color: "#64748b",
                                                    marginTop: "6px",
                                                    fontStyle: "italic"
                                                }}>
                                                    📝 {item.note}
                                                </div>
                                            )}
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => showDeleteConfirm(item.id, item.product?.name || "Produk")}
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
                                ))}
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
                            Total: {history.length} riwayat
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
