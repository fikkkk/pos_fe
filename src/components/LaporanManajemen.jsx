import React, { useState, useEffect } from "react";
import { FaChartBar, FaCalendarAlt, FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCheckCircle } from "react-icons/fa";
import { api } from "../api";
import "./LaporanManajemen.css";

// Demo data - akan diganti dengan API call jika backend sudah siap
const DEMO_DAILY_SALES = [
    { day: "01", value: 25000000 },
    { day: "03", value: 32000000 },
    { day: "05", value: 28000000 },
    { day: "07", value: 45000000 },
    { day: "09", value: 38000000 },
    { day: "11", value: 42000000 },
    { day: "13", value: 35000000 },
    { day: "15", value: 48000000 },
    { day: "17", value: 52000000 },
    { day: "19", value: 39000000 },
    { day: "21", value: 44000000 },
    { day: "23", value: 51000000 },
    { day: "25", value: 47000000 },
    { day: "27", value: 55000000 },
    { day: "29", value: 58000000 },
];

const DEMO_PAYMENT_METHODS = [
    { name: "Cash", value: 45, color: "#10b981" },
    { name: "Debit", value: 30, color: "#3b82f6" },
    { name: "Credit", value: 15, color: "#8b5cf6" },
    { name: "QRIS", value: 10, color: "#f59e0b" },
];

const DEMO_TRANSACTIONS = [
    { id: 1, date: "12-12-2024 14:30", invoice: "TRX20241212001", customer: "Umum", cashier: "Admin", payment: "Cash", subtotal: 350000, discount: 0, total: 350000 },
    { id: 2, date: "12-12-2024 15:45", invoice: "TRX20241212002", customer: "Banu", cashier: "Kasir1", payment: "Debit", subtotal: 520000, discount: 20000, total: 500000 },
    { id: 3, date: "12-12-2024 16:20", invoice: "TRX20241212003", customer: "Maya", cashier: "Admin", payment: "QRIS", subtotal: 180000, discount: 0, total: 180000 },
    { id: 4, date: "12-12-2024 17:00", invoice: "TRX20241212004", customer: "Umum", cashier: "Kasir2", payment: "Cash", subtotal: 275000, discount: 25000, total: 250000 },
    { id: 5, date: "12-12-2024 17:30", invoice: "TRX20241212005", customer: "Andi", cashier: "Admin", payment: "Credit", subtotal: 890000, discount: 0, total: 890000 },
];

const DEMO_PRODUCTS = [
    { id: 1, name: "Kopi Susu Gula Aren", category: "Minuman", qty: 156, total: 3120000, profit: 1560000 },
    { id: 2, name: "Nasi Goreng Spesial", category: "Makanan", qty: 89, total: 2225000, profit: 890000 },
    { id: 3, name: "Teh Tarik", category: "Minuman", qty: 234, total: 1170000, profit: 702000 },
    { id: 4, name: "Mie Ayam Bakso", category: "Makanan", qty: 67, total: 1005000, profit: 402000 },
    { id: 5, name: "Es Jeruk Segar", category: "Minuman", qty: 189, total: 945000, profit: 567000 },
];

const DEMO_CASHIERS = [
    { name: "Admin", transactions: 45, total: 8500000, avgTransaction: 188889 },
    { name: "Kasir1", transactions: 38, total: 6200000, avgTransaction: 163158 },
    { name: "Kasir2", transactions: 29, total: 4800000, avgTransaction: 165517 },
];

export default function LaporanManajemen() {
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
    const [period, setPeriod] = useState("daily");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [loading, setLoading] = useState(false);

    // Summary values (demo)
    const [summary, setSummary] = useState({
        totalSales: 3304040560,
        totalTransactions: 2380,
        totalProfit: 480230000,
        ppn: 383444461,
        netProfit: 2915298099,
        avgTime: "00:02:15"
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const maxSale = Math.max(...DEMO_DAILY_SALES.map(d => d.value));

    return (
        <div className="laporan-page">
            {/* Header */}
            <div className="laporan-header">
                <h1 className="laporan-title">
                    <span className="laporan-title-icon">📊</span>
                    Laporan Manajemen
                </h1>
                <p className="laporan-subtitle">
                    Ringkasan penjualan, kasir, metode pembayaran, pajak, dan performa operasional POS Anda
                </p>
            </div>

            {/* Filters */}
            <div className="laporan-filters">
                <div className="filter-group">
                    <label className="filter-label">Periode Awal</label>
                    <input
                        type="date"
                        className="filter-input"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">Periode Akhir</label>
                    <input
                        type="date"
                        className="filter-input"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">Kasir</label>
                    <select className="filter-input">
                        <option value="all">Semua Kasir</option>
                        <option value="admin">Admin</option>
                        <option value="kasir1">Kasir1</option>
                        <option value="kasir2">Kasir2</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Metode Pembayaran</label>
                    <select
                        className="filter-input"
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                        <option value="all">Semua Metode</option>
                        <option value="cash">Cash</option>
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                        <option value="qris">QRIS</option>
                    </select>
                </div>
                <div className="filter-actions">
                    <button className="btn-reset">Reset</button>
                    <button className="btn-apply">Terapkan Filter</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="laporan-summary">
                <div className="summary-card highlight">
                    <div className="summary-label">Total Penjualan (Sales Total)</div>
                    <div className="summary-value">{formatCurrency(summary.totalSales)}</div>
                    <div className="summary-period">Periode: {dateFrom} - {dateTo}</div>
                </div>
                <div className="summary-card">
                    <div className="summary-label">Total Transaksi</div>
                    <div className="summary-value">{formatNumber(summary.totalTransactions)}</div>
                    <div className="summary-period">Rata-rata {Math.round(summary.totalTransactions / 30)}/hari</div>
                </div>
                <div className="summary-card">
                    <div className="summary-label">Perkiraan Laba Kotor</div>
                    <div className="summary-value money">{formatCurrency(summary.totalProfit)}</div>
                    <div className="summary-period">Periode: {dateFrom} - {dateTo}</div>
                </div>
                <div className="summary-card">
                    <div className="summary-label">Total PPN (Estimasi PKP)</div>
                    <div className="summary-value">{formatCurrency(summary.ppn)}</div>
                    <div className="summary-period">Persentase PPN = 11% dari total</div>
                </div>
                <div className="summary-card">
                    <div className="summary-label">Net Profit (Setelah PPh)</div>
                    <div className="summary-value money">{formatCurrency(summary.netProfit)}</div>
                    <div className="summary-period">Laba bersih setelah pajak penghasilan badan</div>
                </div>
                <div className="summary-card">
                    <div className="summary-label">Rata-rata Durasi Transaksi</div>
                    <div className="summary-value">{summary.avgTime}</div>
                    <div className="summary-period">Durasi dari mulai transaksi hingga pembayaran selesai</div>
                </div>
            </div>

            {/* Charts */}
            <div className="laporan-charts">
                {/* Sales Chart */}
                <div className="chart-box">
                    <div className="chart-header">
                        <div className="chart-title">
                            <FaChartBar style={{ color: "#f59e0b" }} />
                            Grafik Penjualan Harian
                        </div>
                        <div className="chart-period-tabs">
                            <button
                                className={`period-tab ${period === 'daily' ? 'active' : ''}`}
                                onClick={() => setPeriod('daily')}
                            >
                                Bulan
                            </button>
                            <button
                                className={`period-tab ${period === 'yearly' ? 'active' : ''}`}
                                onClick={() => setPeriod('yearly')}
                            >
                                Tahun
                            </button>
                        </div>
                    </div>
                    <div className="chart-area">
                        {DEMO_DAILY_SALES.map((d, i) => (
                            <div key={i} className="chart-bar-wrapper">
                                <div
                                    className="chart-bar"
                                    style={{ height: `${(d.value / maxSale) * 220}px` }}
                                >
                                    <span className="chart-bar-value">{formatCurrency(d.value)}</span>
                                </div>
                                <span className="chart-bar-label">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Method Chart */}
                <div className="chart-box">
                    <div className="chart-header">
                        <div className="chart-title">Metode Pembayaran</div>
                    </div>
                    <div className="donut-chart-wrapper">
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            {/* Simple visual representation */}
                            <div style={{
                                width: "180px",
                                height: "180px",
                                borderRadius: "50%",
                                background: `conic-gradient(
                  ${DEMO_PAYMENT_METHODS[0].color} 0% ${DEMO_PAYMENT_METHODS[0].value}%,
                  ${DEMO_PAYMENT_METHODS[1].color} ${DEMO_PAYMENT_METHODS[0].value}% ${DEMO_PAYMENT_METHODS[0].value + DEMO_PAYMENT_METHODS[1].value}%,
                  ${DEMO_PAYMENT_METHODS[2].color} ${DEMO_PAYMENT_METHODS[0].value + DEMO_PAYMENT_METHODS[1].value}% ${DEMO_PAYMENT_METHODS[0].value + DEMO_PAYMENT_METHODS[1].value + DEMO_PAYMENT_METHODS[2].value}%,
                  ${DEMO_PAYMENT_METHODS[3].color} ${100 - DEMO_PAYMENT_METHODS[3].value}% 100%
                )`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
                            }}>
                                <div style={{
                                    width: "110px",
                                    height: "110px",
                                    borderRadius: "50%",
                                    background: "#fff",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <div className="donut-center-label">Total Transaksi</div>
                                    <div className="donut-center-value">{formatNumber(summary.totalTransactions)}</div>
                                </div>
                            </div>
                            <div className="donut-legend">
                                {DEMO_PAYMENT_METHODS.map((m, i) => (
                                    <div key={i} className="legend-item">
                                        <span className="legend-color" style={{ background: m.color }}></span>
                                        <span>{m.name}: {m.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="laporan-tables">
                <div className="table-box">
                    <div className="table-header">
                        <div className="table-title">📋 Laporan Transaksi</div>
                        <div className="table-actions">
                            <button className="table-btn active">
                                <FaFileExcel /> Excel
                            </button>
                            <button className="table-btn">
                                <FaFilePdf /> PDF
                            </button>
                            <button className="table-btn">
                                <FaPrint /> Cetak
                            </button>
                        </div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="laporan-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Tanggal & Waktu</th>
                                    <th>No Invoice</th>
                                    <th>Kasir</th>
                                    <th>Pelanggan</th>
                                    <th>Metode</th>
                                    <th>Subtotal</th>
                                    <th>Diskon</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DEMO_TRANSACTIONS.map((t, i) => (
                                    <tr key={t.id}>
                                        <td>{i + 1}</td>
                                        <td>{t.date}</td>
                                        <td><strong>{t.invoice}</strong></td>
                                        <td>{t.cashier}</td>
                                        <td>{t.customer}</td>
                                        <td>{t.payment}</td>
                                        <td>{formatCurrency(t.subtotal)}</td>
                                        <td className={t.discount > 0 ? "negative" : ""}>{t.discount > 0 ? `-${formatCurrency(t.discount)}` : "-"}</td>
                                        <td className="money">{formatCurrency(t.total)}</td>
                                        <td>
                                            <span className="status-badge success">
                                                <FaCheckCircle /> Selesai
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Products Table */}
                <div className="table-box">
                    <div className="table-header">
                        <div className="table-title">📦 Laporan Penjualan per Produk</div>
                        <div className="table-actions">
                            <button className="table-btn active">
                                <FaFileExcel /> Excel
                            </button>
                        </div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="laporan-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Produk</th>
                                    <th>Kategori</th>
                                    <th>Qty Terjual</th>
                                    <th>Total Penjualan</th>
                                    <th>Perk. Laba Kotor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DEMO_PRODUCTS.map((p, i) => (
                                    <tr key={p.id}>
                                        <td>{i + 1}</td>
                                        <td><strong>{p.name}</strong></td>
                                        <td>{p.category}</td>
                                        <td>{p.qty}</td>
                                        <td className="money">{formatCurrency(p.total)}</td>
                                        <td className="money">{formatCurrency(p.profit)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cashier Summary */}
                <div className="table-box">
                    <div className="table-header">
                        <div className="table-title">👤 Ringkasan per Kasir</div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="laporan-table">
                            <thead>
                                <tr>
                                    <th>Nama Kasir</th>
                                    <th>Jumlah Transaksi</th>
                                    <th>Total Penjualan</th>
                                    <th>Rata-rata/Transaksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DEMO_CASHIERS.map((c, i) => (
                                    <tr key={i}>
                                        <td><strong>{c.name}</strong></td>
                                        <td>{c.transactions}</td>
                                        <td className="money">{formatCurrency(c.total)}</td>
                                        <td>{formatCurrency(c.avgTransaction)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment Method Summary */}
                <div className="table-box">
                    <div className="table-header">
                        <div className="table-title">💳 Ringkasan per Metode Pembayaran</div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="laporan-table">
                            <thead>
                                <tr>
                                    <th>Metode Pembayaran</th>
                                    <th>Jumlah Transaksi</th>
                                    <th>Total Penjualan</th>
                                    <th>Persentase</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Cash</strong></td>
                                    <td>1,068</td>
                                    <td className="money">{formatCurrency(1500000000)}</td>
                                    <td>45%</td>
                                </tr>
                                <tr>
                                    <td><strong>Debit</strong></td>
                                    <td>714</td>
                                    <td className="money">{formatCurrency(1000000000)}</td>
                                    <td>30%</td>
                                </tr>
                                <tr>
                                    <td><strong>Credit</strong></td>
                                    <td>357</td>
                                    <td className="money">{formatCurrency(500000000)}</td>
                                    <td>15%</td>
                                </tr>
                                <tr>
                                    <td><strong>QRIS</strong></td>
                                    <td>238</td>
                                    <td className="money">{formatCurrency(300000000)}</td>
                                    <td>10%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
