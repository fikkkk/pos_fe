import React, { useState, useEffect, useCallback } from "react";
import "./DataMaster.css";
import { FaSearch, FaPlus, FaTrash, FaCheckCircle, FaTimes } from "react-icons/fa";
import { api } from "../api";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import AddUnitModal from "./AddUnitModal";
import EditUnitModal from "./EditUnitModal";

export default function DataMaster() {
  const [activeTab, setActiveTab] = useState("produk");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 🔹 STATE untuk data dari API
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [productUnits, setProductUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 STATE untuk modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 🔹 STATE untuk modal user
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // 🔹 STATE untuk modal category
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 🔹 STATE untuk modal unit (satuan)
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showEditUnitModal, setShowEditUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // 🔹 STATE untuk notifikasi sukses
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // 🔹 Function untuk menampilkan notifikasi
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // 🔹 FETCH DATA berdasarkan tab aktif
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "produk") {
        const searchQuery = search.trim();
        const endpoint = searchQuery
          ? `/admin/products/search?q=${encodeURIComponent(searchQuery)}`
          : "/admin/products";
        const res = await api.get(endpoint);
        setProducts(res.data);
      } else if (activeTab === "kategori") {
        const searchQuery = search.trim();
        const endpoint = searchQuery
          ? `/admin/categories/search?q=${encodeURIComponent(searchQuery)}`
          : "/admin/categories";
        const res = await api.get(endpoint);
        setCategories(res.data);
      } else if (activeTab === "user") {
        const searchQuery = search.trim();
        const endpoint = searchQuery
          ? `/admin/Users/search?q=${encodeURIComponent(searchQuery)}`
          : "/admin/users";
        const res = await api.get(endpoint);
        setUsers(res.data);
      } else if (activeTab === "satuan") {
        const searchQuery = search.trim();
        const endpoint = searchQuery
          ? `/admin/products-units/search?q=${encodeURIComponent(searchQuery)}`
          : "/admin/product-units/all";
        const res = await api.get(endpoint);
        setProductUnits(res.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  // 🔹 Fetch data saat tab atau search berubah
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 300); // debounce untuk search

    return () => clearTimeout(debounceTimer);
  }, [fetchData]);

  // 🔹 Reset pagination saat tab berubah
  useEffect(() => {
    setCurrentPage(1);
    setSearch("");
  }, [activeTab]);

  // 🔹 Handle delete produk
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchData(); // refresh data
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Gagal menghapus produk.");
    }
  };

  // 🔹 Handle delete kategori
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Gagal menghapus kategori.");
    }
  };

  // 🔹 Handle delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Gagal menghapus user.");
    }
  };

  // 🔹 Handle delete satuan produk
  const handleDeleteUnit = async (id) => {
    if (!window.confirm("Yakin ingin menghapus satuan ini?")) return;
    try {
      await api.delete(`/admin/unitId/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting unit:", err);
      alert("Gagal menghapus satuan.");
    }
  };

  // 🔹 Handle export Excel (produk)
  const handleExportExcel = async () => {
    try {
      const res = await api.get("/admin/export-products-excel", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "produk.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting Excel:", err);
      alert("Gagal export Excel.");
    }
  };

  // 🔹 Handle copy data
  const handleCopy = () => {
    let dataToCopy = [];
    if (activeTab === "produk") {
      dataToCopy = products.map(p =>
        `${p.productCode}\t${p.name}\t${p.category?.name || ""}\t${p.price}\t${p.stock}`
      );
    } else if (activeTab === "kategori") {
      dataToCopy = categories.map(c => `${c.id}\t${c.name}`);
    } else if (activeTab === "user") {
      dataToCopy = users.map(u => `${u.username}\t${u.email}\t${u.role}`);
    } else if (activeTab === "satuan") {
      dataToCopy = productUnits.map(u =>
        `${u.product?.name || ""}\t${u.unitName}\t${u.multiplier}\t${u.price}`
      );
    }
    navigator.clipboard.writeText(dataToCopy.join("\n"));
    alert("Data berhasil disalin!");
  };

  // 🔹 Ambil data sesuai tab aktif
  const getCurrentData = () => {
    switch (activeTab) {
      case "produk": return products;
      case "kategori": return categories;
      case "user": return users;
      case "satuan": return productUnits;
      default: return [];
    }
  };

  const currentData = getCurrentData();
  const totalItems = currentData.length;


  // PAGINATION berdasarkan currentData (sudah difilter dari API)
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedData = currentData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(currentData.length / itemsPerPage));

  // 🔹 Get placeholder text untuk search
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "produk": return "Cari Produk...";
      case "kategori": return "Cari Kategori...";
      case "user": return "Cari User...";
      case "satuan": return "Cari Satuan...";
      default: return "Cari...";
    }
  };

  // 🔹 Get add button text
  const getAddButtonText = () => {
    switch (activeTab) {
      case "produk": return "Tambah Produk";
      case "kategori": return "Tambah Kategori";
      case "user": return "Tambah User";
      case "satuan": return "Tambah Satuan";
      default: return "Tambah";
    }
  };

  // 🔹 Get total label
  const getTotalLabel = () => {
    switch (activeTab) {
      case "produk": return "Total Produk";
      case "kategori": return "Total Kategori";
      case "user": return "Total User";
      case "satuan": return "Total Satuan";
      default: return "Total";
    }
  };

  // 🔹 Render table header berdasarkan tab
  const renderTableHeader = () => {
    switch (activeTab) {
      case "produk":
        return (
          <tr>
            <th className="dm-no-head">No</th>
            <th>Gambar</th>
            <th>Kode Produk & Barcode</th>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th>Harga Beli</th>
            <th>Harga Jual</th>
            <th>Stok</th>
            <th>Supplier</th>
            <th>Aksi</th>
          </tr>
        );
      case "kategori":
        return (
          <tr>
            <th className="dm-no-head">No</th>
            <th>Gambar</th>
            <th>Nama Kategori</th>
            <th>Jumlah Produk</th>
            <th>Dibuat Pada</th>
            <th>Aksi</th>
          </tr>
        );
      case "user":
        return (
          <tr>
            <th className="dm-no-head">No</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Dibuat Pada</th>
            <th>Aksi</th>
          </tr>
        );
      case "satuan":
        return (
          <tr>
            <th className="dm-no-head">No</th>
            <th>Nama Produk</th>
            <th>Nama Satuan</th>
            <th>Pcs per Satuan</th>
            <th>Harga per Unit</th>
            <th>Aksi</th>
          </tr>
        );
      default:
        return null;
    }
  };

  // 🔹 Render table row berdasarkan tab
  const renderTableRow = (item, index) => {
    switch (activeTab) {
      case "produk":
        return (
          <tr key={item.id}>
            <td className="dm-no-cell">{indexOfFirst + index + 1}</td>
            <td className="dm-img-cell">
              <img
                src={item.imageUrl || "/img/placeholder.png"}
                alt={item.name}
                className="dm-img"
              />
            </td>
            <td className="dm-code-cell">
              {item.productCode} <br />
              <small>{item.barcode}</small>
            </td>
            <td>{item.name}</td>
            <td>{item.category?.name || "-"}</td>
            <td className="dm-price">
              {"Rp " + Number(item.costPrice ?? 0).toLocaleString("id-ID")}
            </td>
            <td className="dm-price">
              {"Rp " + Number(item.price ?? 0).toLocaleString("id-ID")}
            </td>
            <td>{item.stock}</td>
            <td>{item.supplier?.name || "-"}</td>
            <td>
              <div className="dm-action-group">
                <button
                  className="dm-action-card dm-action-edit"
                  onClick={() => {
                    setSelectedProduct(item);
                    setShowEditProductModal(true);
                  }}
                >
                  <span className="dm-action-icon">✏️</span>
                  <span className="dm-action-label">Edit</span>
                </button>
                <button
                  className="dm-action-card dm-action-delete"
                  onClick={() => handleDeleteProduct(item.id)}
                >
                  <span className="dm-action-icon"><FaTrash /></span>
                  <span className="dm-action-label">Hapus</span>
                </button>
              </div>
            </td>
          </tr>
        );
      case "kategori":
        return (
          <tr key={item.id}>
            <td className="dm-no-cell">{indexOfFirst + index + 1}</td>
            <td className="dm-img-cell">
              {item.image ? (
                <img
                  src={`/admin/category/${item.id}/image`}
                  alt={item.name}
                  className="dm-img"
                />
              ) : (
                <div className="dm-img" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: "10px"
                }}>
                  No Img
                </div>
              )}
            </td>
            <td>{item.name}</td>
            <td>{item._count?.products || 0} Produk</td>
            <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-"}</td>
            <td>
              <div className="dm-action-group">
                <button
                  className="dm-action-card dm-action-edit"
                  onClick={() => {
                    setSelectedCategory(item);
                    setShowEditCategoryModal(true);
                  }}
                >
                  <span className="dm-action-icon">✏️</span>
                  <span className="dm-action-label">Edit</span>
                </button>
                <button
                  className="dm-action-card dm-action-delete"
                  onClick={() => handleDeleteCategory(item.id)}
                >
                  <span className="dm-action-icon"><FaTrash /></span>
                  <span className="dm-action-label">Hapus</span>
                </button>
              </div>
            </td>
          </tr>
        );
      case "user":
        return (
          <tr key={item.id}>
            <td className="dm-no-cell">{indexOfFirst + index + 1}</td>
            <td>{item.username}</td>
            <td>{item.email}</td>
            <td>
              <span style={{
                padding: "4px 10px",
                borderRadius: "6px",
                background: item.role === "ADMIN" ? "#fef3c7" : "#e0f2fe",
                color: item.role === "ADMIN" ? "#f59e0b" : "#0ea5e9",
                fontWeight: 600,
                fontSize: "12px"
              }}>
                {item.role}
              </span>
            </td>
            <td>
              <span style={{
                padding: "4px 10px",
                borderRadius: "6px",
                background: item.status === "AKTIF" ? "#dcfce7" : "#fee2e2",
                color: item.status === "AKTIF" ? "#22c55e" : "#ef4444",
                fontWeight: 600,
                fontSize: "12px"
              }}>
                {item.status}
              </span>
            </td>
            <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-"}</td>
            <td>
              <div className="dm-action-group">
                <button
                  className="dm-action-card dm-action-edit"
                  onClick={() => {
                    setSelectedUser(item);
                    setShowEditUserModal(true);
                  }}
                >
                  <span className="dm-action-icon">✏️</span>
                  <span className="dm-action-label">Edit</span>
                </button>
                <button
                  className="dm-action-card dm-action-delete"
                  onClick={() => handleDeleteUser(item.id)}
                >
                  <span className="dm-action-icon"><FaTrash /></span>
                  <span className="dm-action-label">Hapus</span>
                </button>
              </div>
            </td>
          </tr>
        );
      case "satuan":
        return (
          <tr key={item.id}>
            <td className="dm-no-cell">{indexOfFirst + index + 1}</td>
            <td>{item.product?.name || "-"}</td>
            <td>{item.unitName}</td>
            <td>{item.multiplier} Pcs</td>
            <td className="dm-price">
              {"Rp " + Number(item.price ?? 0).toLocaleString("id-ID")}
            </td>
            <td>
              <div className="dm-action-group">
                <button
                  className="dm-action-card dm-action-edit"
                  onClick={() => {
                    setSelectedUnit(item);
                    setShowEditUnitModal(true);
                  }}
                >
                  <span className="dm-action-icon">✏️</span>
                  <span className="dm-action-label">Edit</span>
                </button>
                <button
                  className="dm-action-card dm-action-delete"
                  onClick={() => handleDeleteUnit(item.id)}
                >
                  <span className="dm-action-icon"><FaTrash /></span>
                  <span className="dm-action-label">Hapus</span>
                </button>
              </div>
            </td>
          </tr>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dm-page">
      {/* SUCCESS NOTIFICATION TOAST */}
      {notification.show && (
        <div className="dm-notification" style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          borderRadius: "16px",
          background: notification.type === "success"
            ? "linear-gradient(135deg, #059669 0%, #10b981 100%)"
            : "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
          color: "#fff",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          animation: "slideInRight 0.4s ease-out",
          minWidth: "300px"
        }}>
          <FaCheckCircle style={{ fontSize: "24px" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", fontSize: "14px" }}>
              {notification.type === "success" ? "Berhasil!" : "Error!"}
            </div>
            <div style={{ fontSize: "13px", opacity: 0.9 }}>{notification.message}</div>
          </div>
          <button
            onClick={() => setNotification({ show: false, message: "", type: "success" })}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "8px",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff"
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* MAIN BOX - Contains everything */}
      <div className="dm-main-box">
        {/* HEADER TABS */}
        <div className="dm-header">
          <div className="dm-tabs">
            {/* TAB PRODUK */}
            <button
              className={"dm-newtab " + (activeTab === "produk" ? "active" : "")}
              onClick={() => setActiveTab("produk")}
            >
              <span className="dm-newtab-text">Data Produk</span>
              <span className="dm-newtab-circle">
                <img src="/img/dataproduk.png" alt="produk" />
              </span>
            </button>

            {/* TAB USER */}
            <button
              className={"dm-newtab " + (activeTab === "user" ? "active" : "")}
              onClick={() => setActiveTab("user")}
            >
              <span className="dm-newtab-text">Data User</span>
              <span className="dm-newtab-circle">
                <img src="/img/datauser.png" alt="user" />
              </span>
            </button>

            {/* TAB KATEGORI */}
            <button
              className={"dm-newtab " + (activeTab === "kategori" ? "active" : "")}
              onClick={() => setActiveTab("kategori")}
            >
              <span className="dm-newtab-text">Kategori Produk</span>
              <span className="dm-newtab-circle">
                <img src="/img/kategoriproduk.png" alt="kategori" />
              </span>
            </button>

            {/* TAB SATUAN */}
            <button
              className={"dm-newtab " + (activeTab === "satuan" ? "active" : "")}
              onClick={() => setActiveTab("satuan")}
            >
              <span className="dm-newtab-text">Data Satuan</span>
              <span className="dm-newtab-circle">
                <img src="/img/datasatuan.png" alt="satuan" />
              </span>
            </button>
          </div>
        </div>

        {/* SEARCH + COPY/EXCEL + TAMBAH + TOTAL - No container box */}
        <div className="dm-search-row">
          {/* SEARCH */}
          <div className="dm-search-field">
            <FaSearch />
            <input
              type="text"
              className="dm-search-input"
              placeholder={getSearchPlaceholder()}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* COPY & EXCEL */}
          <div className="dm-header-actions">
            <button className="dm-top-btn" onClick={handleCopy}>Copy</button>
            {activeTab === "produk" && (
              <button className="dm-top-btn" onClick={handleExportExcel}>Excel</button>
            )}
          </div>

          {/* TAMBAH BUTTON */}
          <button
            className="dm-top-btn dm-top-btn-orange dm-add-btn"
            onClick={() => {
              if (activeTab === "produk") {
                setShowAddProductModal(true);
              } else if (activeTab === "user") {
                setShowAddUserModal(true);
              } else if (activeTab === "kategori") {
                setShowAddCategoryModal(true);
              } else if (activeTab === "satuan") {
                setShowAddUnitModal(true);
              }
            }}
          >
            <span className="dm-plus">
              <FaPlus />
            </span>
            <span>{getAddButtonText()}</span>
          </button>

          {/* TOTAL */}
          <div className="dm-total">
            {getTotalLabel()} : <span>{totalItems}</span>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#64748b",
            fontSize: "14px"
          }}>
            Memuat data...
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div style={{
            textAlign: "center",
            padding: "20px",
            color: "#ef4444",
            background: "#fee2e2",
            borderRadius: "12px",
            margin: "10px 0"
          }}>
            {error}
            <button
              onClick={fetchData}
              style={{ marginLeft: "10px", cursor: "pointer" }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* TABLE + PAGINATION CONTAINER */}
        {!loading && !error && (
          <div className="dm-content-box">
            <div className="dm-table-wrapper">
              <table className="dm-table">
                <thead>
                  {renderTableHeader()}
                </thead>

                <tbody>
                  {paginatedData.map((item, index) => renderTableRow(item, index))}

                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>
                        Tidak ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="dm-pagination">
              <div className="dm-page-info">
                {currentData.length === 0
                  ? "0–0 dari 0 item"
                  : `${indexOfFirst + 1}–${Math.min(
                    indexOfLast,
                    currentData.length
                  )} dari ${currentData.length} item`}
              </div>

              <div className="dm-pages">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  «
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ‹
                </button>

                <span className="dm-page-number">{currentPage}</span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  ›
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  »
                </button>
              </div>

              <div className="dm-page-size">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={40}>40</option>
                </select>
                <span>items per page</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* END dm-main-box */}

      {/* ADD PRODUCT MODAL */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSuccess={() => {
          fetchData();
          showNotification("Produk berhasil ditambahkan!");
        }}
      />

      {/* EDIT PRODUCT MODAL */}
      <EditProductModal
        isOpen={showEditProductModal}
        onClose={() => {
          setShowEditProductModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          fetchData();
          showNotification("Produk berhasil diperbarui!");
        }}
        product={selectedProduct}
      />

      {/* ADD USER MODAL */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={() => {
          fetchData();
          showNotification("User berhasil ditambahkan!");
        }}
      />

      {/* EDIT USER MODAL */}
      <EditUserModal
        isOpen={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          fetchData();
          showNotification("User berhasil diperbarui!");
        }}
        user={selectedUser}
      />

      {/* ADD CATEGORY MODAL */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSuccess={() => {
          fetchData();
          showNotification("Kategori berhasil ditambahkan!");
        }}
      />

      {/* EDIT CATEGORY MODAL */}
      <EditCategoryModal
        isOpen={showEditCategoryModal}
        onClose={() => {
          setShowEditCategoryModal(false);
          setSelectedCategory(null);
        }}
        onSuccess={() => {
          fetchData();
          showNotification("Kategori berhasil diperbarui!");
        }}
        category={selectedCategory}
      />

      {/* ADD UNIT MODAL */}
      <AddUnitModal
        isOpen={showAddUnitModal}
        onClose={() => setShowAddUnitModal(false)}
        onSuccess={() => {
          fetchData();
          showNotification("Satuan berhasil ditambahkan!");
        }}
      />

      {/* EDIT UNIT MODAL */}
      <EditUnitModal
        isOpen={showEditUnitModal}
        onClose={() => {
          setShowEditUnitModal(false);
          setSelectedUnit(null);
        }}
        onSuccess={() => {
          fetchData();
          showNotification("Satuan berhasil diperbarui!");
        }}
        unit={selectedUnit}
      />
    </div>
  );
}


