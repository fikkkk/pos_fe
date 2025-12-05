import React, { useState, useMemo } from "react";
import "./DataMaster.css";
import { FaSearch, FaPlus, FaTrash } from "react-icons/fa";

// 🔹 DATA DUMMY – mengikuti produk di Transaksi
const dummyProducts = [
  {
    id: 1,
    imageUrl: "/img/minyak.png",
    productCode: "PRD-0001",
    barcode: "1110000000001",
    name: "Minyak Fortune 2L",
    category: { name: "Sembako" },
    discountPercent: 20,
    price: 32900,
    stock: 60,
    supplier: { name: "PT Sembako Jaya" },
  },
  {
    id: 2,
    imageUrl: "/img/indomie.png",
    productCode: "PRD-0002",
    barcode: "1110000000002",
    name: "Mie Goreng Indomie",
    category: { name: "Makanan" },
    discountPercent: 0,
    price: 3500,
    stock: 110,
    supplier: { name: "PT Indofood" },
  },
  {
    id: 3,
    imageUrl: "/img/beras.png",
    productCode: "PRD-0003",
    barcode: "1110000000003",
    name: "Beras Ramos 5Kg",
    category: { name: "Sembako" },
    discountPercent: 10,
    price: 78000,
    stock: 30,
    supplier: { name: "PT Sembako Jaya" },
  },
  {
    id: 4,
    imageUrl: "/img/sabun.png",
    productCode: "PRD-0004",
    barcode: "1110000000004",
    name: "Sabun Lifebuoy 450ml",
    category: { name: "Perawatan Tubuh" },
    discountPercent: 0,
    price: 20000,
    stock: 50,
    supplier: { name: "PT Unilever" },
  },
  {
    id: 5,
    imageUrl: "/img/aqua.png",
    productCode: "PRD-0005",
    barcode: "1110000000005",
    name: "Aqua Botol 600ml",
    category: { name: "Minuman" },
    discountPercent: 0,
    price: 3500,
    stock: 200,
    supplier: { name: "PT Tirta Investama" },
  },
  {
    id: 6,
    imageUrl: "/img/rinso.png",
    productCode: "PRD-0006",
    barcode: "1110000000006",
    name: "Rinso 900gr",
    category: { name: "Kebutuhan Rumah Tangga" },
    discountPercent: 5,
    price: 24000,
    stock: 80,
    supplier: { name: "PT Unilever" },
  },
  {
    id: 7,
    imageUrl: "/img/gula.png",
    productCode: "PRD-0007",
    barcode: "1110000000007",
    name: "Gula Pasir 1Kg",
    category: { name: "Sembako" },
    discountPercent: 0,
    price: 14000,
    stock: 40,
    supplier: { name: "PT Gula Nusantara" },
  },
  {
    id: 8,
    imageUrl: "/img/telur.png",
    productCode: "PRD-0008",
    barcode: "1110000000008",
    name: "Telur Ayam 1Kg",
    category: { name: "Sembako" },
    discountPercent: 0,
    price: 28000,
    stock: 50,
    supplier: { name: "PT Peternakan Jaya" },
  },
  {
    id: 9,
    imageUrl: "/img/dancow.png",
    productCode: "PRD-0009",
    barcode: "1110000000009",
    name: "Susu Dancow 400gr",
    category: { name: "Produk Bayi" },
    discountPercent: 0,
    price: 52000,
    stock: 30,
    supplier: { name: "PT Nestle Indonesia" },
  },
  {
    id: 10,
    imageUrl: "/img/choki.png",
    productCode: "PRD-0010",
    barcode: "1110000000010",
    name: "Choki-Choki 5pc",
    category: { name: "Snack" },
    discountPercent: 0,
    price: 6000,
    stock: 100,
    supplier: { name: "PT Mayora" },
  },
  {
    id: 11,
    imageUrl: "/img/kecap.png",
    productCode: "PRD-0011",
    barcode: "1110000000011",
    name: "Kecap ABC 600ml",
    category: { name: "Bumbu Dapur" },
    discountPercent: 0,
    price: 18000,
    stock: 90,
    supplier: { name: "PT ABC" },
  },
  {
    id: 12,
    imageUrl: "/img/tepung.png",
    productCode: "PRD-0012",
    barcode: "1110000000012",
    name: "Tepung Segitiga Biru 1Kg",
    category: { name: "Sembako" },
    discountPercent: 0,
    price: 12500,
    stock: 70,
    supplier: { name: "PT Bogasari" },
  },
  {
    id: 13,
    imageUrl: "/img/sprite.png",
    productCode: "PRD-0013",
    barcode: "1110000000013",
    name: "Sprite Botol 390ml",
    category: { name: "Minuman" },
    discountPercent: 0,
    price: 4500,
    stock: 150,
    supplier: { name: "PT Coca Cola" },
  },
  {
    id: 14,
    imageUrl: "/img/sarden.png",
    productCode: "PRD-0014",
    barcode: "1110000000014",
    name: "Sarden ABC 425gr",
    category: { name: "Makanan" },
    discountPercent: 0,
    price: 22000,
    stock: 45,
    supplier: { name: "PT ABC" },
  },
  {
    id: 15,
    imageUrl: "/img/pucuk.png",
    productCode: "PRD-0015",
    barcode: "1110000000015",
    name: "Teh Pucuk 500ml",
    category: { name: "Minuman" },
    discountPercent: 0,
    price: 4000,
    stock: 160,
    supplier: { name: "PT Mayora" },
  },
  {
    id: 16,
    imageUrl: "/img/gas.png",
    productCode: "PRD-0016",
    barcode: "1110000000016",
    name: "Gas Elpiji 3Kg",
    category: { name: "Kebutuhan Rumah Tangga" },
    discountPercent: 0,
    price: 23000,
    stock: 25,
    supplier: { name: "Pertamina" },
  },
  {
    id: 17,
    imageUrl: "/img/roti.png",
    productCode: "PRD-0017",
    barcode: "1110000000017",
    name: "Roti Tawar Sari Roti",
    category: { name: "Makanan" },
    discountPercent: 0,
    price: 16500,
    stock: 35,
    supplier: { name: "PT Nippon Indosari" },
  },
  {
    id: 18,
    imageUrl: "/img/ultramilk.png",
    productCode: "PRD-0018",
    barcode: "1110000000018",
    name: "Susu Ultramilk 1L",
    category: { name: "Minuman" },
    discountPercent: 0,
    price: 19500,
    stock: 45,
    supplier: { name: "PT Ultrajaya" },
  },
  {
    id: 19,
    imageUrl: "/img/silverqueen.png",
    productCode: "PRD-0019",
    barcode: "1110000000019",
    name: "SilverQueen 65gr",
    category: { name: "Snack" },
    discountPercent: 0,
    price: 14500,
    stock: 60,
    supplier: { name: "PT Petra" },
  },
  {
    id: 20,
    imageUrl: "/img/downy.png",
    productCode: "PRD-0020",
    barcode: "1110000000020",
    name: "Downy 650ml",
    category: { name: "Perawatan Kain" },
    discountPercent: 0,
    price: 21000,
    stock: 40,
    supplier: { name: "PT P&G" },
  },
  {
    id: 21,
    imageUrl: "/img/japotamadu.png",
    productCode: "PRD-0021",
    barcode: "1110000000021",
    name: "Japota Honey Butter",
    category: { name: "Snack" },
    discountPercent: 0,
    price: 23000,
    stock: 25,
    supplier: { name: "PT Calbee" },
  },
];

export default function DataMaster() {
  const [activeTab, setActiveTab] = useState("produk");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const products = dummyProducts;
  const totalProduk = products.length;

  // 🔍 filter pencarian (nama, kode produk, barcode)
  const filteredProducts = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return products;

    return products.filter((p) => {
      const name = (p.name ?? "").toLowerCase();
      const code = (p.productCode ?? "").toLowerCase();
      const barcode = (p.barcode ?? "").toLowerCase();
      return name.includes(s) || code.includes(s) || barcode.includes(s);
    });
  }, [search, products]);

  // PAGINATION (mengikuti Transaksi)
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  return (
    <div className="dm-page">
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

      {/* SEARCH + COPY/EXCEL + TAMBAH + TOTAL PRODUK */}
      <div className="dm-search-row">
        {/* SEARCH */}
        <div className="dm-search-field">
          <FaSearch />
          <input
            type="text"
            className="dm-search-input"
            placeholder="Cari Produk"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* COPY & EXCEL */}
        <div className="dm-header-actions">
          <button className="dm-top-btn">Copy</button>
          <button className="dm-top-btn">Excel</button>
        </div>

        {/* TAMBAH PRODUK */}
        <button className="dm-top-btn dm-top-btn-orange dm-add-btn">
          <span className="dm-plus">
            <FaPlus />
          </span>
          <span>Tambah Produk</span>
        </button>

        {/* TOTAL PRODUK */}
        <div className="dm-total">
          Total Produk : <span>{totalProduk}</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="dm-table-wrapper">
        <table className="dm-table">
          <thead>
            <tr>
              <th className="dm-no-head">No</th>
              <th>Gambar</th>
              <th>Kode Produk & Barcode</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Diskon</th>
              <th>Harga Jual</th>
              <th>Stok</th>
              <th>Supplier</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((item, index) => (
              <tr key={item.id}>
                <td className="dm-no-cell">{indexOfFirst + index + 1}</td>

                <td className="dm-img-cell">
                  <img src={item.imageUrl} alt={item.name} className="dm-img" />
                </td>

                <td className="dm-code-cell">
                  {item.productCode} <br />
                  <small>{item.barcode}</small>
                </td>

                <td>{item.name}</td>
                <td>{item.category?.name}</td>

                <td>{item.discountPercent ? item.discountPercent + "%" : "0%"}</td>

                <td className="dm-price">
                  {"Rp " + Number(item.price ?? 0).toLocaleString("id-ID")}
                </td>

                <td>{item.stock}</td>
                <td>{item.supplier?.name}</td>

                <td>
                  <div className="dm-action-group">
                    <button className="dm-action-card dm-action-edit">
                      <span className="dm-action-icon">✏️</span>
                      <span className="dm-action-label">Edit</span>
                    </button>

                    <button className="dm-action-card dm-action-delete">
                      <span className="dm-action-icon">
                        <FaTrash />
                      </span>
                      <span className="dm-action-label">Hapus</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {currentProducts.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>
                  Tidak ada produk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION – mengikuti gaya Transaksi */}
      <div className="dm-pagination">
        <div className="dm-page-info">
          {filteredProducts.length === 0
            ? "0–0 dari 0 item"
            : `${indexOfFirst + 1}–${Math.min(
                indexOfLast,
                filteredProducts.length
              )} dari ${filteredProducts.length} item`}
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
  );
}
