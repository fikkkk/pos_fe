// DashboardContent.jsx (FINAL)
import React, { useMemo, useState, useEffect } from "react";
import { FaChartBar, FaSearch } from "react-icons/fa";
import "./Dashboard.css";

/* data dummy */
const months=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const sales2024=[250,300,340,260,360,430,400,400,500,490,480,440];
const sales2025=[150,200,200,250,280,490,450,400,350,330,310,260];
const yearly={2024:sales2024.reduce((a,b)=>a+b,0),2025:sales2025.reduce((a,b)=>a+b,0)};
const payments=[
  {label:"Tunai",val:42,color:"#2BB673"},
  {label:"QRIS",val:35,color:"#1D8CF8"},
  {label:"Debit",val:15,color:"#F6B21C"},
  {label:"E-Wallet",val:8,color:"#EF5350"},
];

/* Header legend + filter */
function ChartHeader({ title }){
  return (
    <div className="panel-header panel-header--chart">
      <div className="ph-left"><span>{title}</span></div>
      <div className="ph-center">
        <div className="legend legend--pills">
          <span className="pill pill-2024" />
          <span className="legend-text">2024</span>
          <span className="pill pill-2025" style={{marginLeft:18}} />
          <span className="legend-text">2025</span>
        </div>
      </div>
      <div className="ph-right">
        <label className="filter-label">Pilih Periode</label>
        <select className="chart-filter" defaultValue="">
          <option value="" disabled>Select Value</option>
          <option>2023–2025</option>
          <option>2024–2025</option>
          <option>2025</option>
        </select>
      </div>
    </div>
  );
}

/* Chart bulanan & tahunan */
function SalesChartMonthly(){/* …(sama persis dengan yang di Dashboard.jsx)… */}
function SalesChartYearly(){/* …(sama persis)… */}

/* Donut */
function PaymentDonut(){/* …(sama persis)… */}

/* Tabel */
function TransactionsTable(){/* …(sama persis — termasuk Copy & Excel)… */}

/* PAGE */
export default function DashboardContent(){
  const stats=[
    {color:"blue",value:"7.020",label:"Total Item Terjual",year:"2025"},
    {color:"green",value:"2.190",label:"Total Transaksi",year:"2025"},
    {color:"orange",value:"3.304.040.560",label:"Total Income",year:"2025"},
    {color:"red",value:"2.190",label:"Total Pelanggan",year:"2025"},
  ];

  return (
    <>
      <div className="ds-section-title"><FaChartBar/><span>Statistik Bisnis</span></div>

      <div className="ds-cards">
        {stats.map((s,idx)=>(
          <div key={idx} className={`ds-card ${s.color}`}>
            <div className="ds-card-value">{s.value}</div>
            <div className="ds-card-sub">{s.label}</div>
            <div className="ds-card-pill"/>
            <div className="ds-card-footer"><span>Tahun {s.year}</span><span>Detail</span></div>
          </div>
        ))}
      </div>

      <div className="panel-combo">
        <ChartHeader title="Penjualan Perbulan" />
        <div className="pc-body">
          <div className="pc-col"><SalesChartMonthly/></div>
          <div className="pc-col">
            <div className="mini-title">Penjualan Pertahun</div>
            <SalesChartYearly/>
          </div>
        </div>
      </div>

      {/* Dua kartu terpisah (tanpa title gabungan & tanpa garis) */}
      <div className="ds-panels ds-panels--bottom ds-panels--raised">
        <div className="ds-panel tall">
          <div className="panel-body">
            <div className="mini-title">Metode Pembayaran</div>
            <PaymentDonut/>
          </div>
        </div>
        <div className="ds-panel tall">
          <div className="panel-body">
            <div className="mini-title">Transaksi Terbaru</div>
            <TransactionsTable/>
          </div>
        </div>
      </div>
    </>
  );
}
