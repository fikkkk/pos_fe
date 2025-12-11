import React from "react";
import "./DeleteConfirmationModal.css";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isLoading,
}) {
    if (!isOpen) return null;

    return (
        <div className="dm-modal-overlay">
            <div className="dm-delete-modal-content">
                <button className="dm-modal-close" onClick={onClose} disabled={isLoading}>
                    <FaTimes />
                </button>

                <div className="dm-delete-icon-wrapper">
                    <FaExclamationTriangle className="dm-delete-icon" />
                </div>

                <h3 className="dm-delete-title">{title}</h3>
                <p className="dm-delete-message">{message}</p>

                <div className="dm-delete-actions">
                    <button
                        className="dm-btn-cancel"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </button>
                    <button
                        className="dm-btn-confirm-delete"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Menghapus..." : "Hapus"}
                    </button>
                </div>
            </div>
        </div>
    );
}
