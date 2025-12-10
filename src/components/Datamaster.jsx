import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaTrash, FaEdit, FaBox, FaUser, FaTags, FaRuler, FaSpinner } from "react-icons/fa";
import { getProducts } from "../services/product.service";
import AddProductModal from "./AddProductModal";

const Tabs = [
  { id: "produk", label: "Data Produk", icon: <FaBox className="text-xl" /> },
  { id: "user", label: "Data User", icon: <FaUser className="text-xl" /> },
  { id: "kategori", label: "Kategori Produk", icon: <FaTags className="text-xl" /> },
  { id: "satuan", label: "Data Satuan", icon: <FaRuler className="text-xl" /> },
];

export default function DataMaster() {
  const [activeTab, setActiveTab] = useState("produk");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Data State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce Search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Data
  useEffect(() => {
    if (activeTab === 'produk') {
      fetchProducts();
    }
  }, [activeTab, fetchProducts]);

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
      });
      setProducts(result.data);
      setTotalItems(result.total);
    } catch (err) {
      setError("Gagal mengambil data produk.");
    } finally {
      // Simulate slight delay for smooth animation feeling
      setTimeout(() => setLoading(false), 300);
    }
  }, [currentPage, itemsPerPage, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Determine pagination start and end indices for display
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 lg:p-6 animate-fade-in text-white/90 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER TABS & STATS */}
      <div className="w-full z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-2">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4 lg:mb-0">
            Master Data
          </h1>
        </div>

        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {Tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative group flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300
                    ${isActive
                      ? "bg-gradient-to-br from-orange-500/20 to-amber-500/5 border-orange-500/50 shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]"
                      : "bg-[#121212]/80 border-white/5 hover:border-white/10 hover:bg-white/5"
                    }
                  `}
                >
                  <div className={`
                    p-3 rounded-xl transition-all duration-300
                    ${isActive
                      ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                      : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white"}
                  `}>
                    {tab.icon}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className={`text-sm font-bold tracking-wide ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
                      {tab.label}
                    </span>
                    {tab.id === 'produk' && (
                      <span className={`text-[10px] uppercase font-medium mt-0.5 ${isActive ? "text-orange-200" : "text-gray-600"}`}>
                        {totalItems.toLocaleString()} Total Items
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col gap-4 z-10">

        {/* ACTION BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#121212]/60 p-5 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500 group-focus-within:text-orange-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/5 rounded-xl leading-5 text-gray-300 placeholder-gray-600 
                focus:outline-none focus:bg-black/40 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 
                transition-all duration-300"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-xl border border-white/5 transition-all hover:border-white/20">
              Export
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 
                text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95 group"
            >
              <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="flex-1 bg-[#121212]/80 rounded-2xl border border-white/5 overflow-hidden flex flex-col backdrop-blur-sm relative min-h-[400px] shadow-2xl">
          {loading && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <FaSpinner className="animate-spin text-4xl text-orange-500" />
                <span className="text-sm font-medium text-orange-200 animate-pulse">Memuat Data...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl backdrop-blur-md shadow-xl flex items-center gap-3 animate-fade-in pointer-events-auto">
                <FaTrash className="text-xl" /> {/* Reusing Icon for error visual - would prefer FaExclamationTriangle but it's not imported. Trash is ok-ish or just no icon */}
                <span>{error}</span>
                <button onClick={fetchProducts} className="ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors">
                  Try Again
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-5 font-bold text-center w-16 text-gray-500">No</th>
                  <th className="px-6 py-5 font-bold text-gray-300">Detail Produk</th>
                  <th className="px-6 py-5 font-bold text-gray-300">Kode & SKU</th>
                  <th className="px-6 py-5 font-bold text-gray-300">Kategori</th>
                  <th className="px-6 py-5 font-bold text-right text-gray-300">Harga</th>
                  <th className="px-6 py-5 font-bold text-center text-gray-300">Stok</th>
                  <th className="px-6 py-5 font-bold text-center text-gray-300">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {products.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors relative">
                    <td className="px-6 py-4 text-center text-gray-600 font-mono text-xs">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0f0f0f] flex items-center justify-center border border-white/5 overflow-hidden group-hover:border-orange-500/30 transition-colors shadow-lg">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <FaBox className="text-gray-700" size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-200 group-hover:text-orange-400 transition-colors text-base">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FaTags size={10} /> {item.supplier?.name || "Non-Supplier"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-orange-400/80 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 w-fit">
                          {item.productCode}
                        </span>
                        <span className="font-mono text-[10px] text-gray-500 tracking-wider w-fit">
                          {item.barcode || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5 text-xs font-medium group-hover:border-white/10 transition-colors">
                        {item.category?.name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-emerald-400 text-base">
                        Rp {Number(item.price ?? 0).toLocaleString("id-ID")}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`
                            relative z-10 font-bold text-sm
                            ${item.stock > 10 ? 'text-emerald-400' : 'text-red-400'}
                          `}>
                          {item.stock}
                        </span>
                        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${item.stock > 10 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(item.stock, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <button className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/20">
                          <FaEdit size={14} />
                        </button>
                        <button className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/20">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-24 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-white/5 border border-white/5">
                          <FaSearch className="text-4xl opacity-20" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-400">Tidak ada produk ditemukan</p>
                          <p className="text-sm">Coba kata kunci lain atau tambah produk baru</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col md:flex-row items-center justify-between p-5 border-t border-white/5 bg-[#0f0f0f] gap-4 z-10">
            <div className="text-xs font-medium text-gray-500">
              {products.length > 0 &&
                `Displaying ${(currentPage - 1) * itemsPerPage + 1} – ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} items`
              }
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-gray-400 transition-all border border-white/5 hover:border-white/20"
              >
                Prev
              </button>

              <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl text-white font-bold text-sm shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)]">
                {currentPage}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-gray-400 transition-all border border-white/5 hover:border-white/20"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADD PRODUCT */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchProducts();
        }}
      />
    </div>
  );
}
