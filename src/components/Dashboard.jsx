import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  FaBars, FaCalendarAlt, FaTachometerAlt, FaCashRegister,
  FaDatabase, FaChartBar, FaUserCircle, FaChevronDown, FaChevronUp, FaSearch,
} from "react-icons/fa";
import "./Dashboard.css";

/* ========= DATA DUMMY ========= */
const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const sales2024 = [250,300,340,260,360,430,400,400,500,490,480,440];
const sales2025 = [150,200,200,250,280,490,450,400,350,330,310,260];
const yearly = { 2024: sales2024.reduce((a,b)=>a+b,0), 2025: sales2025.reduce((a,b)=>a+b,0) };

const payments = [
  { label:"Cash",  val:40, color:"#2BB673" },
  { label:"Debit", val:25, color:"#1D8CF8" },
  { label:"Kredit",val:15, color:"#F6B21C" },
  { label:"Qris",  val:20, color:"#EF5350" },
];
const TOTAL_TRANSAKSI = 30000;

/* ========= DATA PRODUK ========= */
const topProducts = [
  { no: 1, nama: "Aqua Botol 600ml",            terjual: 1250, total: 6250000, persen: 18, img: "Gambar", color:"#1E88E5" },
  { no: 2, nama: "Indomie Goreng",              terjual: 1000, total: 4500000, persen: 13, img: "Gambar", color:"#29B6F6" },
  { no: 3, nama: "Kopi Kapal Api Special 65g",  terjual:  850, total: 3400000, persen: 10, img: "Gambar", color:"#43A047" },
  { no: 4, nama: "SilverQueen Chunky Bar 65g",  terjual:  700, total: 4200000, persen: 12, img: "Gambar", color:"#81C784" },
  { no: 5, nama: "Roti Sari Roti Coklat",       terjual:  680, total: 3400000, persen: 10, img: "Gambar", color:"#FDD835" },
  { no: 6, nama: "Teh Pucuk Harum 350ml",       terjual:  640, total: 3200000, persen:  9, img: "Gambar", color:"#FB8C00" },
  { no: 7, nama: "Beng-Beng Wafer",             terjual:  620, total: 2480000, persen:  7, img: "Gambar", color:"#E53935" },
  { no: 8, nama: "Tisu Paseo 250 Sheets",       terjual:  400, total: 3200000, persen:  9, img: "Gambar", color:"#F06292" },
  { no: 9, nama: "Pepsodent 190g",              terjual:  320, total: 2880000, persen:  8, img: "Gambar", color:"#8E24AA" },
  { no:10, nama: "Lifebuoy Sabun Cair 250ml",   terjual:  280, total: 2240000, persen:  6, img: "Gambar", color:"#B0BEC5" },
];

const produkTerbaruRows = Array.from({length:10}, (_,i)=>({ no:i+1, img:"Gambar", nama:"Nama Barang", stok:"Stok" }));
const semuaProdukRows   = Array.from({length:10}, (_,i)=>({
  no:i+1, kode:"Kode Produk", nama:"Nama Produk", harga:"Harga Satuan", satuan:"Satuan", stok:"Stok", supplier:"Supplier"
}));

const formatRp     = (n) => n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const formatNumber = (n) => n.toLocaleString("id-ID");

/* Utils */
function useClickOutside(onClose){
  const ref = useRef(null);
  useEffect(()=>{
    const h=(e)=>{ if(ref.current && !ref.current.contains(e.target)) onClose?.(); };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[onClose]);
  return ref;
}
const idFmt=(n)=>Number(n).toLocaleString("id-ID");

/* Profile (opsional) */
function ProfilePill(){
  const [open,setOpen]=useState(false);
  const ref=useClickOutside(()=>setOpen(false));
  return (
    <div className="profile" ref={ref}>
      <button className={`profile-pill ${open?"is-open":""}`} onClick={()=>setOpen(v=>!v)}>
        <span className="avatar"><FaUserCircle/></span>
        <span className="caret">{open ? <FaChevronUp/> : <FaChevronDown/>}</span>
      </button>
      {open && (
        <div className="profile-menu">
          <button className="menu-item"><span>Profil</span></button>
          <button className="menu-item"><span>Pengaturan</span></button>
          <div className="menu-sep"/>
          <button className="menu-item danger"><span>Logout</span></button>
        </div>
      )}
    </div>
  );
}

function ChartHeader({ title, rightTitle }){
  return (
    <div className="panel-header panel-header--chart">
      <div className="ph-leftwrap">
        <div className="ph-title">{title}</div>
      </div>
      <div className="ph-righttitle">{rightTitle}</div>
    </div>
  );
}

/* ===== Chart Bulanan (garis) ===== */
function SalesChartMonthly(){
  const W=700,H=270,PL=68,PR=18,PT=16,PB=30;
  const innerW=W-PL-PR, innerH=H-PT-PB;

  const datasets=[
    {label:"2024",color:"#f6b21c",data:sales2024},
    {label:"2025",color:"#1560d9",data:sales2025},
  ];

  const allVals=datasets.flatMap(d=>d.data);
  const rawMax=Math.max(...allVals);
  const maxY=Math.ceil(rawMax/50)*50;
  const yStep=50;
  const yTicks=Array.from({length:Math.floor(maxY/yStep)+1},(_,i)=>i*yStep);

  const toXY=(i,v)=>[PL+(i/(months.length-1))*innerW, PT+innerH-(v/maxY)*innerH];
  const pathFor=(arr)=>arr.map((v,i)=>{const [x,y]=toXY(i,v);return `${i===0?"M":"L"}${x},${y}`;}).join(" ");
  const fmtAxis=(m)=>`${m.toLocaleString("id-ID")}.000.000`;
  const fmtMoney=(v)=>`Rp ${v.toLocaleString("id-ID")}.000.000`;

  const [activeKey,setActiveKey] = React.useState(null);
  const [tip,setTip] = React.useState(null);

  const Tooltip=({x,y,text,bg,appearKey})=>{
    const pad=8,h=26,r=6;
    const w=Math.max(60,text.length*7+pad*2);
    let ty=y-h-10, pointerUp=true;
    if(ty<PT+6){ ty=y+14; pointerUp=false; }
    const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    const tx=clamp(x-w/2, PL+4, W-PR-w-4);
    const px=clamp(x, tx+10, tx+w-10);
    const py=pointerUp ? (ty+h) : ty;

    const [show,setShow]=React.useState(false);
    React.useEffect(()=>{ const id=requestAnimationFrame(()=>setShow(true)); return ()=>cancelAnimationFrame(id); },[]);
    return (
      <g key={appearKey} pointerEvents="none" style={{opacity:show?1:0, transform:`translateY(${show?0:6}px)`, transition:"opacity .18s ease, transform .18s ease"}}>
        <rect x={tx} y={ty} width={w} height={h} rx={r} fill={bg} opacity="0.95" stroke="rgba(0,0,0,.15)"/>
        <text x={tx+w/2} y={ty+h/2+4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" style={{paintOrder:'stroke'}} stroke="rgba(0,0,0,.35)" strokeWidth="1">{text}</text>
        <path d={pointerUp?`M ${px-6} ${py} L ${px+6} ${py} L ${px} ${py+6} Z`:`M ${px-6} ${py} L ${px+6} ${py} L ${px} ${py-6} Z`} fill={bg} opacity="0.95" stroke="rgba(0,0,0,.15)"/>
      </g>
    );
  };

  return (
    <div className="chart-container" onMouseLeave={()=>{ setActiveKey(null); setTip(null); }}>
      <div className="chart-overlay">
        <label className="filter-label">Pilih Periode</label>
        <div className="filter-row">
          <div className="overlay-legend">
            <span className="pill pill-2024"></span><span className="legend-text">2024</span>
            <span className="pill pill-2025" style={{marginLeft:12}}></span><span className="legend-text">2025</span>
          </div>
          <select className="chart-filter" defaultValue="">
            <option value="" disabled>Select Value</option>
            <option>2023–2025</option>
            <option>2024–2025</option>
            <option>2025</option>
          </select>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
        {months.map((_,i)=>{const x=PL+(i/(months.length-1))*innerW;return <line key={`vx${i}`} x1={x} y1={PT} x2={x} y2={PT+innerH} stroke="#cfd8e3" opacity=".9"/>;})}
        {yTicks.map((t,i)=>{const y=PT+innerH-(t/maxY)*innerH;return <line key={`hy${i}`} x1={PL} y1={y} x2={W-PR} y2={y} stroke="#cfd8e3" opacity=".9"/>;})}
        <rect x={PL} y={PT} width={innerW} height={innerH} fill="none" stroke="#cfd8e3"/>
        {months.map((m,i)=>{const [x]=toXY(i,0);return <text key={m} x={x} y={H-8} textAnchor="middle" fontSize="10" fill="#7b8aa0">{m}</text>;})}
        {yTicks.map((t,i)=>{const y=PT+innerH-(t/maxY)*innerH;return <text key={`yt${i}`} x={PL-8} y={y+3} textAnchor="end" fontSize="10" fill="#7b8aa0">{fmtAxis(t)}</text>;})}
        {datasets.map((ds,di)=>(
          <g key={ds.label}>
            <path d={pathFor(ds.data)} fill="none" stroke={ds.color} strokeWidth="2.6"/>
            {ds.data.map((v,i)=>{
              const [cx,cy]=toXY(i,v);
              const key=`${di}-${i}`;
              const active = activeKey===key;
              return (
                <g key={key}>
                  <circle cx={cx} cy={cy} r={active?5.2:4.2} fill={ds.color} stroke="#fff" strokeWidth="1.5"/>
                  <circle
                    cx={cx} cy={cy} r="12" fill="transparent" style={{cursor:'pointer'}}
                    onMouseEnter={()=>{ setActiveKey(key); setTip({x:cx,y:cy,text:`${ds.label} ${months[i]} · ${fmtMoney(v)}`, color: ds.color}); }}
                    onMouseLeave={()=>{ setActiveKey(null); setTip(null); }}
                  />
                </g>
              );
            })}
          </g>
        ))}
        {tip && <Tooltip x={tip.x} y={tip.y} text={tip.text} bg={tip.color} appearKey={activeKey} />}
      </svg>
    </div>
  );
}

/* ===== Chart Pertahun (bar) ===== */
function SalesChartYearly(){
  const W=420,H=270,PL=48,PR=16,PT=16,PB=30;
  const innerW=W-PL-PR, innerH=H-PT-PB;

  const data=[{year:2024,val:yearly[2024]},{year:2025,val:yearly[2025]}];
  const step=500;
  const rawMax=Math.max(...data.map(d=>d.val));
  const maxY=Math.ceil(rawMax/step)*step;
  const ticks=Array.from({length:Math.floor(maxY/step)+1},(_,i)=>i*step);

  const barW=50,gap=60;
  const startX=PL+(innerW-(data.length*barW+(data.length-1)*gap))/2;
  const fmtAxis=(m)=>`${m.toLocaleString("id-ID")}.000.000`;
  const fmtMoney=(v)=>`Rp ${v.toLocaleString("id-ID")}.000.000`;

  const [activeKey,setActiveKey] = React.useState(null);
  const [tip,setTip] = React.useState(null);

  const Tooltip=({x,y,text,bg,appearKey})=>{
    const pad=8,h=26,r=6;
    const w=Math.max(60,text.length*7+pad*2);
    let ty=y-h-10, pointerUp=true;
    if(ty<PT+6){ ty=y+14; pointerUp=false; }
    const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    const tx=clamp(x-w/2, PL+4, W-PR-w-4);
    const px=clamp(x, tx+10, tx+w-10);
    const py=pointerUp ? (ty+h) : ty;

    const [show,setShow]=React.useState(false);
    React.useEffect(()=>{ const id=requestAnimationFrame(()=>setShow(true)); return ()=>cancelAnimationFrame(id); },[]);
    return (
      <g key={appearKey} pointerEvents="none" style={{opacity:show?1:0, transform:`translateY(${show?0:6}px)`, transition:"opacity .18s ease, transform .18s ease"}}>
        <rect x={tx} y={ty} width={w} height={h} rx={r} fill={bg} opacity="0.95" stroke="rgba(0,0,0,.15)"/>
        <text x={tx+w/2} y={ty+h/2+4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" style={{paintOrder:'stroke'}} stroke="rgba(0,0,0,.35)" strokeWidth="1">{text}</text>
        <path d={pointerUp?`M ${px-6} ${py} L ${px+6} ${py} L ${px} ${py+6} Z`:`M ${px-6} ${py} L ${px+6} ${py} L ${px} ${py-6} Z`} fill={bg} opacity="0.95" stroke="rgba(0,0,0,.15)"/>
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" onMouseLeave={()=>{ setActiveKey(null); setTip(null); }}>
      {ticks.map((t,i)=>{const y=PT+innerH-(t/maxY)*innerH;return <line key={`hy${i}`} x1={PL} y1={y} x2={W-PR} y2={y} stroke="#cfd8e3" opacity=".9"/>;})}
      <rect x={PL} y={PT} width={innerW} height={innerH} fill="none" stroke="#cfd8e3"/>
      {ticks.map((t,i)=>{const y=PT+innerH-(t/maxY)*innerH;return <text key={`yt${i}`} x={PL-8} y={y+3} textAnchor="end" fontSize="10" fill="#7b8aa0">{fmtAxis(t)}</text>;})}
      {data.map((d,i)=>{
        const h=(d.val/maxY)*innerH;
        const x=startX+i*(barW+gap);
        const y=PT+innerH-h;
        const color=i===0?"#f6b21c":"#1560d9";
        const cx=x+barW/2, cy=y;
        const active = activeKey===i;
        return (
          <g key={d.year}>
            <rect
              x={x} y={y} width={barW} height={h} rx="6"
              fill={color} opacity={active?1:0.95}
              style={{cursor:'pointer', transition:'opacity .15s'}}
              onMouseEnter={()=>{ setActiveKey(i); setTip({x:cx,y:cy,text:`${d.year} · ${fmtMoney(d.val)}`, color}); }}
              onMouseMove={()=>{ setActiveKey(i); setTip({x:cx,y:cy,text:`${d.year} · ${fmtMoney(d.val)}`, color}); }}
              onMouseLeave={()=>{ setActiveKey(null); setTip(null); }}
            />
            <text x={x+barW/2} y={H-8} textAnchor="middle" fontSize="12" fill="#4b5b71">{d.year}</text>
          </g>
        );
      })}
      {tip && <Tooltip x={tip.x} y={tip.y} text={tip.text} bg={tip.color} appearKey={activeKey} />}
    </svg>
  );
}

/* ===== Donut Metode Pembayaran ===== */
function PaymentDonut(){
  const size=240, stroke=26, pad=24;
  const r=(size-stroke)/2, W=size+pad*2, H=size+pad*2, cx=pad+size/2, cy=pad+size/2;
  const C=2*Math.PI*r, gapArc=4, totalPct=payments.reduce((a,b)=>a+b.val,0);
  let accPct=0; const pctLabels=[];
  const rings=payments.map((p)=>{
    const frac=p.val/totalPct, dash=Math.max(0,(frac*C)-gapArc), offset=(C*0.25)-(accPct*C)-(gapArc/2);
    const start=-Math.PI/2+(accPct*2*Math.PI), mid=start+(frac*2*Math.PI)/2, txtR=r+18;
    const tx=cx+txtR*Math.cos(mid), ty=cy+txtR*Math.sin(mid)+4;
    pctLabels.push({x:tx,y:ty,text:`${p.val}%`}); accPct+=frac;
    return <circle key={p.label} cx={cx} cy={cy} r={r} fill="none" stroke={p.color} strokeWidth={stroke}
      strokeLinecap="butt" strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={offset}/>;
  });
  return (
    <div className="donut-wrap">
      <div className="donut-box">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e9eef5" strokeWidth={stroke}/>
          {rings}
          {pctLabels.map((pt,i)=>(<text key={i} x={pt.x} y={pt.y} textAnchor="middle" className="donut-pct">{pt.text}</text>))}
        </svg>
        <div className="donut-center" style={{inset:`${24}px`}}>
          <div>
            <div className="dc-top">Total Transaksi</div>
            <div className="dc-big">{idFmt(TOTAL_TRANSAKSI)}</div>
            <div className="dc-sub">semua metode</div>
          </div>
        </div>
      </div>
      <ul className="donut-legend">
        {payments.map((p)=>{
          const jumlah = Math.round((p.val/100)*TOTAL_TRANSAKSI);
          return (
            <li key={p.label}>
              <span className="dot" style={{background:p.color}}/>
              <div className="dl-text">
                <div className="dl-label">{p.label}</div>
                <div className="dl-sub">Jumlah Transaksi Sebanyak</div>
              </div>
              <div className="dl-count">{idFmt(jumlah)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ===== Table Transaksi Terbaru (10/hal) ===== */
function TransactionsTable(){
  const base10=[
    { dt:"2025-10-22 08:45", kasir:"Andi Pratama", items:3, harga:245000, method:"Cash" },
    { dt:"2025-10-22 09:10", kasir:"Rina Setiawan", items:5, harga:132000, method:"Cash" },
    { dt:"2025-10-22 09:35", kasir:"Budi Santoso", items:6, harga:480000, method:"Cash" },
    { dt:"2025-10-22 10:05", kasir:"Nasyila Putri Ardita", items:3, harga: 76000, method:"Cash" },
    { dt:"2025-10-22 10:20", kasir:"Andi Pratama", items:7, harga:310000, method:"Debit" },
    { dt:"2025-10-22 11:20", kasir:"Rina Setiawan", items:4, harga:158000, method:"Cash" },
    { dt:"2025-10-22 13:00", kasir:"Dita Rahmawati", items:2, harga:420000, method:"Debit" },
    { dt:"2025-10-22 14:25", kasir:"Budi Santoso", items:5, harga:420000, method:"Credit Card" },
    { dt:"2025-10-22 16:10", kasir:"Andi Pratama", items:10, harga:690000, method:"Debit" },
    { dt:"2025-10-22 16:45", kasir:"Rina Setiawan", items:5, harga:250000, method:"Cash" },
  ];
  const TOTAL_ROWS=100, PAGE_SIZE=10;
  const allRows=useMemo(()=>Array.from({length:TOTAL_ROWS},(_,i)=>{const b=base10[i%base10.length];return { no:i+1,id:`TRX20251022${String(i+1).padStart(3,"0")}`,dt:b.dt,kasir:b.kasir,items:b.items,harga:b.harga,method:b.method };}),[]);
  const [page,setPage]=useState(1); const [q,setQ]=useState(""); const [copied,setCopied]=useState(false);
  const fmtIDR=(n)=>"Rp "+Number(n).toLocaleString("id-ID");
  const filtered=useMemo(()=>{const s=q.trim().toLowerCase(); if(!s) return allRows; return allRows.filter(r=>r.id.toLowerCase().includes(s)||r.dt.toLowerCase().includes(s)||r.kasir.toLowerCase().includes(s)||r.method.toLowerCase().includes(s)||String(r.items).includes(s)||String(r.harga).includes(s));},[q,allRows]);
  const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)); useEffect(()=>{if(page>pageCount) setPage(pageCount);},[pageCount,page]);
  const start=(page-1)*PAGE_SIZE; const rows=filtered.slice(start,start+PAGE_SIZE);
  const handleCopy=async()=>{const header=["No","ID Transaksi","Tanggal & Waktu","Nama Kasir","Total Item","Total Harga","Metode Pembayaran","Aksi"].join("\t");const lines=rows.map(r=>[r.no,r.id,r.dt,r.kasir,r.items,fmtIDR(r.harga),r.method,"Detail"].join("\t"));await navigator.clipboard.writeText(header+"\n"+lines.join("\n"));setCopied(true);setTimeout(()=>setCopied(false),1500);};
  const csvEscape=(v)=>{const s=String(v??"");return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;};
  const handleExcel=()=>{const header=["No","ID Transaksi","Tanggal & Waktu","Nama Kasir","Total Item","Total Harga","Metode Pembayaran","Aksi"];const rowsCsv=filtered.map(r=>[r.no,r.id,r.dt,r.kasir,r.items,fmtIDR(r.harga),r.method,"Detail"].map(csvEscape).join(","));const blob=new Blob([header.join(",")+"\n"+rowsCsv.join("\n")],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="TransaksiTerbaru.csv";a.click();URL.revokeObjectURL(url);};
  const getPages=(curr,total)=>{const pages=[];const add=(p)=>pages.push(p);add(1);let s=Math.max(2,curr-1),e=Math.min(total-1,curr+1);if(curr<=3){s=2;e=Math.min(5,total-1);}if(curr>=total-2){s=Math.max(total-4,2);e=total-1;}if(s>2) add("…");for(let i=s;i<=e;i++) add(i);if(e<total-1) add("…");if(total>1) add(total);return pages;};
  const pages=getPages(page,pageCount);
  return (
    <div className="table-shell">
      <div className="table-controls">
        <div className="table-buttons">
          <button className="btn" onClick={handleCopy}>{copied?"Copied":"Copy"}</button>
          <button className="btn btn-green" onClick={handleExcel}>Excel</button>
        </div>
        <div className="tc-right">
          <FaSearch/><input value={q} onChange={(e)=>{setQ(e.target.value);setPage(1);}} placeholder="Cari Transaksi"/>
        </div>
      </div>

      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th style={{width:56}}>No</th>
              <th>ID Transaksi</th>
              <th>Tanggal & Waktu</th>
              <th>Nama Kasir</th>
              <th>Total Item</th>
              <th>Total Harga</th>
              <th>Metode Pembayaran</th>
              <th style={{width:76}}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,idx)=>(
              <tr key={start+idx}>
                <td>{r.no}</td><td>{r.id}</td><td>{r.dt}</td><td>{r.kasir}</td>
                <td>{r.items}</td><td>{fmtIDR(r.harga)}</td><td>{r.method}</td>
                <td><button className="aksi-link">Detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="tf-left">showing <b>{rows.length}</b> to <b>{start+rows.length}</b> of <b>{filtered.length}</b> entries</div>
        <div className="tf-right pager">
          <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Previous</button>
          {pages.map((p,i)=> p==="…" ? <span key={`e${i}`} className="ellipsis">…</span>
            : <button key={p} className={p===page?"active":""} onClick={()=>setPage(p)}>{p}</button>)}
          <button disabled={page===pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))}>Next</button>
        </div>
      </div>
    </div>
  );
}

/* ===== Pie Chart Top 10 Produk Terlaris (di SAMPING tabel) ===== */
function TopProductsPie(){
  // pakai data yang sama dengan tabel, supaya tidak dobel
  const data = topProducts.map(p => ({
    label: p.nama,
    color: p.color,
    val: p.persen,
  }));

  const total = data.reduce((a,b)=>a+b.val,0);
  const size = 260, stroke = 65, pad = 8;
  const r = (size - stroke)/2, W = size + pad*2, H = size + pad*2;
  const cx = pad + size/2, cy = pad + size/2;
  const C = 2*Math.PI*r, gapArc = 0;

  let acc = 0;
  const rings = data.map(d=>{
    const frac = d.val / total;
    const dash = Math.max(0, frac*C - gapArc);
    const offset = (C*0.25) - (acc*C) - (gapArc/2);
    const startA = -Math.PI/2 + acc*2*Math.PI;
    const midA   = startA + frac*Math.PI;
    const tx = cx + (r + stroke*0.12) * Math.cos(midA);
    const ty = cy + (r + stroke*0.12) * Math.sin(midA) + 4;
    acc += frac;
    return (
      <g key={d.label}>
        <circle cx={cx} cy={cy} r={r} fill="none"
  stroke={d.color} strokeWidth={stroke} strokeLinecap="butt"
  strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={offset}/>
        <text x={tx} y={ty} className="pie-pct" textAnchor="middle">{d.val}%</text>
      </g>
    );
  });

  const left  = data.slice(0,5);
  const right = data.slice(5);

  return (
    <div className="pie-wrap">
      <div className="pie-box">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e9eef5" strokeWidth={stroke}/>
          {rings}
        </svg>
        <div className="pie-center" style={{ inset: "24px" }}>
          <div>
            <div className="pc-top">Top 10</div>
            <div className="pc-sub">Produk Terlaris</div>
          </div>
        </div>
      </div>

      <div className="pie-legend2c">
        <ul>
          {left.map(d=>(
            <li key={d.label}>
              <span className="dot" style={{background:d.color}}/><span className="name">{d.label}</span>
            </li>
          ))}
        </ul>
        <ul>
          {right.map(d=>(
            <li key={d.label}>
              <span className="dot" style={{background:d.color}}/><span className="name">{d.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ===== Placeholder supaya tidak white screen kalau SkillsWheel belum dibuat ===== */
function SkillsWheel(){
  return (
    <div className="ps-placeholder">
      (Skills Wheel placeholder)
    </div>
  );
}

/* ===== PAGE ===== */
export default function Dashboard(){
  const today="Kamis, 2 Oktober 2025";
  const stats=[
    {color:"blue",value:"7.020",label:"Total Item Terjual",year:"2025"},
    {color:"green",value:"2.190",label:"Total Transaksi",year:"2025"},
    {color:"orange",value:"3.304.040.560",label:"Total Income",year:"2025"},
    {color:"red",value:"2.190",label:"Total Pelanggan",year:"2025"},
  ];

  /* ====== SEMUA DATA PRODUK – kanan, full height 10 baris ====== */
  const MAX_PROD_ROWS = 10;
  const rightWrapRef = useRef(null);
  const [rowHRight, setRowHRight] = useState(0);

  /* ====== PRODUK TERBARU – kiri, full height 10 baris ====== */
  const leftWrapRef = useRef(null);
  const [rowHLeft, setRowHLeft] = useState(0);

  // data & helper untuk card “Semua Data Produk”
  const [qProduk,setQProduk] = useState("");
  const filteredProduk = useMemo(()=>{
    const s=qProduk.trim().toLowerCase();
    if(!s) return semuaProdukRows;
    return semuaProdukRows.filter(r =>
      r.kode.toLowerCase().includes(s) || r.nama.toLowerCase().includes(s) ||
      r.harga.toLowerCase().includes(s) || r.satuan.toLowerCase().includes(s) ||
      r.stok.toLowerCase().includes(s) || r.supplier.toLowerCase().includes(s)
    );
  },[qProduk]);

  const produkRows10 = useMemo(()=>filteredProduk.slice(0, MAX_PROD_ROWS),[filteredProduk]);

  // helper hitung tinggi baris agar pas 10 baris penuh
  const calcRowH = (wrapEl, setter) => {
    if (!wrapEl) return;
    const thead = wrapEl.querySelector("thead");
    const wrapH = wrapEl.clientHeight;
    const headH = thead ? thead.offsetHeight : 0;
    const innerH = Math.max(0, wrapH - headH - 1);
    const h = Math.max(36, Math.floor(innerH / MAX_PROD_ROWS));
    setter(h);
  };

  useLayoutEffect(() => {
    const calcRight = () => calcRowH(rightWrapRef.current, setRowHRight);
    const calcLeft  = () => calcRowH(leftWrapRef.current,  setRowHLeft);
    const ro1 = new ResizeObserver(calcRight);
    const ro2 = new ResizeObserver(calcLeft);
    if (rightWrapRef.current) ro1.observe(rightWrapRef.current);
    if (leftWrapRef.current)  ro2.observe(leftWrapRef.current);
    window.addEventListener("resize", calcRight);
    window.addEventListener("resize", calcLeft);
    calcRight(); calcLeft();
    return () => {
      ro1.disconnect(); ro2.disconnect();
      window.removeEventListener("resize", calcRight);
      window.removeEventListener("resize", calcLeft);
    };
  }, []);

  const copySemuaProduk = async () => {
    const header = ["No","Kode Produk","Nama Produk","Harga Satuan","Satuan","Stok","Supplier"].join("\t");
    const lines = filteredProduk.map(r => [r.no,r.kode,r.nama,r.harga,r.satuan,r.stok,r.supplier].join("\t"));
    await navigator.clipboard.writeText(header+"\n"+lines.join("\n"));
  };
  const excelSemuaProduk = () => {
    const header = ["No","Kode Produk","Nama Produk","Harga Satuan","Satuan","Stok","Supplier"];
    const rowsCsv = filteredProduk.map(r => [r.no,r.kode,r.nama,r.harga,r.satuan,r.stok,r.supplier].join(","));
    const blob=new Blob([header.join(",")+"\n"+rowsCsv.join("\n")],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download="SemuaDataProduk.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">
      <aside className="ds-sidebar">
        <div className="ds-side-header"><FaBars/></div>
        <nav className="ds-nav">
          <a className="ds-nav-item active"><span className="ico"><FaTachometerAlt/></span><span>Dashboard</span></a>
          <a className="ds-nav-item"><span className="ico"><FaCashRegister/></span><span>Transaksi</span></a>
          <a className="ds-nav-item"><span className="ico"><FaDatabase/></span><span>Master Data</span></a>
          <a className="ds-nav-item"><span className="ico"><FaChartBar/></span><span>Laporan Manajemen</span></a>
        </nav>
      </aside>

      <main className="ds-main">
        <header className="ds-topbar">
          <div className="left">
            <div className="brand">POS NUKA</div>
            <div className="date"><FaCalendarAlt/> {today}</div>
          </div>
          <div className="right">{/* <ProfilePill/> dsb jika perlu */}</div>
        </header>

        <section className="ds-inner">
          <div className="ds-section-title"><FaChartBar/><span>Statistik Bisnis</span></div>

          {/* Kartu ringkas */}
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

          {/* Penjualan Bulanan & Tahunan */}
          <div className="panel-combo">
            <ChartHeader title="Penjualan Perbulan" rightTitle="Penjualan Pertahun"/>
            <div className="pc-body">
              <div className="pc-col"><SalesChartMonthly/></div>
              <div className="pc-col">
                <div className="mini-title">Penjualan Pertahun</div>
                <SalesChartYearly/>
              </div>
            </div>
          </div>

          {/* Metode Pembayaran & Transaksi Terbaru */}
          <div className="ds-panels ds-panels--bottom">
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

          {/* ===== Produk Terlaris (tabel kiri, PIE kanan) ===== */}
          <div className="panel-single">
            <div className="panel-header panel-header--chart">
              <div className="ph-leftwrap"><div className="ph-title">Produk Terlaris</div></div>
            </div>

            <div className="ps-body">
              {/* GRID 2 KOLOM: kiri tabel ~620px, kanan slot pie 420px */}
              <div
                className="pt-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(620px,1fr) 420px",
                  gap: "24px",
                  alignItems: "start"
                }}
              >
                {/* KIRI: TABEL */}
                <div className="pt-left">
                  <div className="pt-toolbar">
                    <button className="btn btn-gray">Copy</button>
                    <button className="btn btn-gray">Excel</button>
                  </div>

                  <div className="table-wrap">
                    <table className="pt-table pt-table--top">
  <thead>
    <tr>
      <th className="col-no">No</th>
      <th className="col-img">Gambar</th>
      <th>Nama Barang</th>
      <th className="col-terjual">Terjual</th>
      <th className="col-total">Total (Rp)</th>
      <th className="col-persentase">Persentase Penjualan</th>
    </tr>
  </thead>

                      <tbody>
  {topProducts.map(p => (
    <tr key={p.no}>
      <td className="col-no">{p.no}</td>
      <td className="col-img"><div className="img-pill">{p.img}</div></td>
      <td>{p.nama}</td>
      <td className="col-terjual">{formatNumber(p.terjual)}</td>
      <td className="col-total">{formatRp(p.total)}</td>
      <td className="col-persentase">{p.persen}%</td>
    </tr>
  ))}
</tbody>

                    </table>
                  </div>
                </div>

                {/* KANAN: PIE — dipaksa nempel kanan */}
                <div className="pt-right" style={{ justifySelf: "end" }}>
                  <TopProductsPie/>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Produk Terbaru (kiri) + Semua Data Produk (kanan) ===== */}
          <div className="panel-single">
            <div className="panel-header panel-header--chart">
              <div className="ph-leftwrap"><div className="ph-title">Produk Terbaru</div></div>
              <div className="ph-righttitle">Semua Data Produk</div>
            </div>

            <div className="ps-body">
              <div
                className="pj-grid"
                style={{display:"grid", gridTemplateColumns:"minmax(420px,480px) 1fr", gap:"24px"}}
              >
                {/* KIRI: Produk Terbaru – penuh 10 baris */}
                <div className="pj-left" style={{ display:"flex", flexDirection:"column", minHeight:0 }}>
                  <p style={{margin:"0 0 10px 0", color:"#6b7a90", fontSize:12}}>
                    Produk terbaru akan diperbarui setiap <b>2 minggu sekali</b>, berlaku
                    hingga tanggal <b>12 Oktober 2025</b>
                  </p>
                  <div className="table-wrap" ref={leftWrapRef} style={{ flex:1, minHeight:0 }}>
                    <table className="pt-table">
                      <thead>
                        <tr>
                          <th className="col-no">No</th>
                          <th className="col-img">Gambar</th>
                          <th>Nama Barang</th>
                          <th>Stok</th>
                        </tr>
                      </thead>
                      <tbody>
                        {produkTerbaruRows.map(r=>(
                          <tr key={r.no} style={rowHLeft ? { height: `${rowHLeft}px` } : undefined}>
                            <td className="col-no">{r.no}</td>
                            <td className="col-img"><div className="img-pill">{r.img}</div></td>
                            <td>{r.nama}</td>
                            <td>{r.stok}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* KANAN: Semua Data Produk – penuh 10 baris */}
                <div className="pj-right" style={{ display:"flex", flexDirection:"column", minHeight:0 }}>
                  <div className="mini-title" style={{ marginBottom: 10 }}>Semua Data Produk</div>

                  <div className="pt-toolbar" style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
                    <div>
                      <button className="btn btn-gray" onClick={copySemuaProduk}>Copy</button>
                      <button className="btn btn-gray" onClick={excelSemuaProduk} style={{marginLeft:8}}>Excel</button>
                    </div>
                    <div style={{display:"flex", alignItems:"center", gap:10}}>
                      <span style={{fontSize:12, color:"#6b7a90"}}>Search</span>
                      <div className="tc-right" style={{gap:6}}>
                        <FaSearch/>
                        <input value={qProduk} onChange={(e)=>setQProduk(e.target.value)} placeholder="Cari Transaksi"/>
                      </div>
                    </div>
                  </div>

                  <div className="table-wrap" ref={rightWrapRef} style={{ flex:1, minHeight:0 }}>
                    <table className="pt-table">
                      <thead>
                        <tr>
                          <th className="col-no">No</th>
                          <th>Kode Produk</th>
                          <th>Nama Produk</th>
                          <th>Harga Satuan</th>
                          <th>Satuan</th>
                          <th>Stok</th>
                          <th>Supplier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {produkRows10.map(r=>(
                          <tr key={r.no} style={rowHRight ? { height: `${rowHRight}px` } : undefined}>
                            <td className="col-no">{r.no}</td>
                            <td>{r.kode}</td>
                            <td>{r.nama}</td>
                            <td>{r.harga}</td>
                            <td>{r.satuan}</td>
                            <td>{r.stok}</td>
                            <td>{r.supplier}</td>
                          </tr>
                        ))}
                        {Array.from({length: Math.max(0, 10 - produkRows10.length)}).map((_,i)=>(
                          <tr key={`empty-${i}`} style={rowHRight ? { height: `${rowHRight}px` } : undefined}>
                            <td className="col-no">&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>
          {/* ===== /Produk Terbaru + Semua Data Produk ===== */}
        </section>
      </main>
    </div>
  );
}
