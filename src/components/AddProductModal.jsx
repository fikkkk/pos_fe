import React, { useState } from "react";
import {
    FaTimes, FaSave, FaSpinner, FaBox, FaBarcode, FaTag,
    FaDollarSign, FaImage, FaLayerGroup, FaTruck, FaAlignLeft, FaCube
} from "react-icons/fa";
import { createProduct } from "../services/product.service";

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        productCode: "",
        barcode: "",
        price: "",
        stock: "",
        categoryId: "",
        supplierId: "",
        imageUrl: "",
        description: ""
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name || !formData.productCode || !formData.price) {
            setError("Data bertanda (*) wajib diisi.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
                supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
            };

            await createProduct(payload);
            onSuccess();
            onClose();
            setFormData({
                name: "",
                productCode: "",
                barcode: "",
                price: "",
                stock: "",
                categoryId: "",
                supplierId: "",
                imageUrl: "",
                description: ""
            });
        } catch (err) {
            console.error(err);
            setError("Gagal menyimpan produk. Cek koneksi atau data duplikat.");
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, icon: Icon, name, type = "text", placeholder, required = false, colSpan = 1 }) => (
        <div className={`space-y-2 ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                {label} {required && <span className="text-orange-500">*</span>}
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="text-gray-500 group-focus-within:text-orange-400 transition-colors duration-300" />
                </div>
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 
            focus:outline-none focus:border-orange-500/50 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 
            transition-all duration-300 backdrop-blur-sm hover:border-white/10"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-3xl bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">

                {/* Decorative Gradients */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 opacity-50" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between p-8 pb-4 border-b border-white/5 z-10">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Tambah Produk
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Masukkan detail produk baru ke database</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 group"
                    >
                        <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar z-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <form id="add-product-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* Section 1: Basic Info */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                    <FaCube />
                                </div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identitas Produk</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField
                                    label="Nama Produk"
                                    name="name"
                                    icon={FaBox}
                                    placeholder="Contoh: Kopi Robusta Premium"
                                    required
                                    colSpan={2}
                                />
                                <InputField
                                    label="Kode Produk"
                                    name="productCode"
                                    icon={FaTag}
                                    placeholder="PROD-001"
                                    required
                                />
                                <InputField
                                    label="Barcode / SKU"
                                    name="barcode"
                                    icon={FaBarcode}
                                    placeholder="Scan barcode..."
                                />
                            </div>
                        </section>

                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Section 2: Economics */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <FaDollarSign />
                                </div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Harga & Inventaris</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        Harga Jual <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-serif">
                                            Rp
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 
                        focus:outline-none focus:border-emerald-500/50 focus:bg-black/60 focus:ring-4 focus:ring-emerald-500/10 
                        transition-all duration-300 backdrop-blur-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <InputField
                                    label="Stok Awal"
                                    name="stock"
                                    icon={FaLayerGroup}
                                    type="number"
                                    placeholder="0"
                                />
                            </div>
                        </section>

                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Section 3: Details */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <FaAlignLeft />
                                </div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Detail Tambahan</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Category ID" name="categoryId" icon={FaTag} placeholder="ID Kategori (opsional)" />
                                <InputField label="Supplier ID" name="supplierId" icon={FaTruck} placeholder="ID Supplier (opsional)" />
                            </div>

                            <div className="space-y-2 mt-4">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    Image URL
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaImage className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 
                      focus:outline-none focus:border-blue-500/50 focus:bg-black/60 focus:ring-4 focus:ring-blue-500/10 
                      transition-all duration-300"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Deskripsi</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 
                    focus:outline-none focus:border-white/20 focus:bg-black/60 focus:ring-4 focus:ring-white/5 
                    transition-all duration-300 resize-none"
                                    placeholder="Tambahkan catatan atau deskripsi produk..."
                                />
                            </div>
                        </section>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md flex justify-end gap-4 z-10">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-8 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold tracking-wide"
                        disabled={loading}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="add-product-form"
                        disabled={loading}
                        className="
              relative overflow-hidden group px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 
              text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] 
              transition-all duration-300 text-sm font-bold tracking-wide flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin text-lg" />
                                <span className="relative">Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <FaSave className="text-lg" />
                                <span className="relative">Simpan Produk</span>
                            </>
                        )}
                    </button>
                </div>

            </div>

            {/* Global CSS for animations if needed, though Tailwind mostly handles it */}
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }
      `}</style>
        </div>
    );
}
