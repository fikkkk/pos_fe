import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { FaTimes, FaSave, FaSearchPlus, FaSearchMinus } from "react-icons/fa";
import "./ImageCropModal.css";

// Helper function to create cropped image
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size to the crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // Return as blob
    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                resolve(blob);
            },
            "image/jpeg",
            0.9
        );
    });
}

export default function ImageCropModal({ isOpen, imageSrc, onClose, onSave }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [saving, setSaving] = useState(false);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;

        setSaving(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            // Create a File from the blob
            const file = new File([croppedBlob], "profile.jpg", {
                type: "image/jpeg",
            });
            onSave(file);
        } catch (error) {
            console.error("Error cropping image:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="crop-modal-overlay" onClick={onClose}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
                <div className="crop-modal-header">
                    <h3>Crop Foto Profil</h3>
                    <button className="crop-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="crop-container">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                <div className="crop-controls">
                    <div className="zoom-control">
                        <FaSearchMinus className="zoom-icon" />
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="zoom-slider"
                        />
                        <FaSearchPlus className="zoom-icon" />
                    </div>
                </div>

                <div className="crop-modal-actions">
                    <button className="crop-cancel-btn" onClick={onClose}>
                        <FaTimes /> Batal
                    </button>
                    <button
                        className="crop-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <FaSave /> {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
