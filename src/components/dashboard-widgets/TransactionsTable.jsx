import React, { useMemo, useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

export default function TransactionsTable({ transactions }) {
    const PAGE_SIZE = 10;

    const allRows = useMemo(
        () =>
            (transactions ?? []).map((t, i) => ({
                no: i + 1,
                id: t.transactionId,
                dt: new Date(t.createdAt).toLocaleString("id-ID"),
                kasir: t.cashierName,
                items: t.totalItem,
                harga: t.totalPrice,
                method: t.paymentMethod,
            })),
        [transactions]
    );

    const [page, setPage] = useState(1);
    const [q, setQ] = useState("");
    const [copied, setCopied] = useState(false);

    const fmtIDR = (n) => "Rp " + Number(n ?? 0).toLocaleString("id-ID");

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return allRows;

        return allRows.filter(
            (r) =>
                r.id.toLowerCase().includes(s) ||
                r.dt.toLowerCase().includes(s) ||
                r.kasir.toLowerCase().includes(s) ||
                r.method.toLowerCase().includes(s) ||
                String(r.items).includes(s) ||
                String(r.harga).includes(s)
        );
    }, [q, allRows]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    useEffect(() => {
        if (page > pageCount) setPage(pageCount);
    }, [pageCount, page]);

    const start = (page - 1) * PAGE_SIZE;
    const rows = filtered.slice(start, start + PAGE_SIZE);

    const handleCopy = async () => {
        const header = [
            "No",
            "ID Transaksi",
            "Tanggal & Waktu",
            "Nama Kasir",
            "Total Item",
            "Total Harga",
            "Metode Pembayaran",
            "Aksi",
        ].join("\t");

        const lines = rows.map((r) =>
            [
                r.no,
                r.id,
                r.dt,
                r.kasir,
                r.items,
                fmtIDR(r.harga),
                r.method,
                "Detail",
            ].join("\t")
        );

        await navigator.clipboard.writeText(header + "\n" + lines.join("\n"));

        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const csvEscape = (v) => {
        const s = String(v ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const handleExcel = () => {
        const header = [
            "No",
            "ID Transaksi",
            "Tanggal & Waktu",
            "Nama Kasir",
            "Total Item",
            "Total Harga",
            "Metode Pembayaran",
            "Aksi",
        ];

        const rowsCsv = filtered.map((r) =>
            [
                r.no,
                r.id,
                r.dt,
                r.kasir,
                r.items,
                fmtIDR(r.harga),
                r.method,
                "Detail",
            ]
                .map(csvEscape)
                .join(",")
        );

        const blob = new Blob(
            [header.join(",") + "\n" + rowsCsv.join("\n")],
            { type: "text/csv;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "TransaksiTerbaru.csv";
        a.click();

        URL.revokeObjectURL(url);
    };

    const getPages = (curr, total) => {
        const pages = [];
        const add = (p) => pages.push(p);

        add(1);
        let s = Math.max(2, curr - 1),
            e = Math.min(total - 1, curr + 1);

        if (curr <= 3) {
            s = 2;
            e = Math.min(5, total - 1);
        }
        if (curr >= total - 2) {
            s = Math.max(total - 4, 2);
            e = total - 1;
        }

        if (s > 2) add("…");
        for (let i = s; i <= e; i++) add(i);
        if (e < total - 1) add("…");

        if (total > 1) add(total);

        return pages;
    };

    const pages = getPages(page, pageCount);

    return (
        <div className="table-shell">
            <div className="table-controls">
                <div className="table-buttons">
                    <button className="btn" onClick={handleCopy}>
                        {copied ? "Copied" : "Copy"}
                    </button>
                    <button className="btn btn-green" onClick={handleExcel}>
                        Excel
                    </button>
                </div>

                <div className="tc-right">
                    <FaSearch />
                    <input
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Cari Transaksi"
                    />
                </div>
            </div>

            <div className="ds-table-wrap">
                <table className="ds-table">
                    <thead>
                        <tr>
                            <th style={{ width: 56 }}>No</th>
                            <th>ID Transaksi</th>
                            <th>Tanggal & Waktu</th>
                            <th>Nama Kasir</th>
                            <th>Total Item</th>
                            <th>Total Harga</th>
                            <th>Metode Pembayaran</th>
                            <th style={{ width: 76 }}>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((r, idx) => (
                            <tr key={start + idx}>
                                <td>{r.no}</td>
                                <td>{r.id}</td>
                                <td>{r.dt}</td>
                                <td>{r.kasir}</td>
                                <td>{r.items}</td>
                                <td>{fmtIDR(r.harga)}</td>
                                <td>{r.method}</td>
                                <td>
                                    <button className="aksi-link">Detail</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-footer">
                <div className="tf-left">
                    showing <b>{rows.length}</b> to <b>{start + rows.length}</b> of{" "}
                    <b>{filtered.length}</b> entries
                </div>

                <div className="tf-right pager">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>

                    {pages.map((p, i) =>
                        p === "…" ? (
                            <span key={`e${i}`} className="ellipsis">
                                …
                            </span>
                        ) : (
                            <button
                                key={p}
                                className={p === page ? "active" : ""}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        )
                    )}

                    <button
                        disabled={page === pageCount}
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
