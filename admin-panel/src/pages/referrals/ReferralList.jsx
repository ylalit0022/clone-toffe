import { useState } from "react";
import { useNavigate } from "react-router-dom";



// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Converted: { bg: "#D1FAE5", color: "#047857", border: "rgba(5,150,105,0.25)", dot: "#059669" },
  Pending: { bg: "#FEF3C7", color: "#B45309", border: "rgba(180,83,9,0.2)", dot: "#D97706" },
  Expired: { bg: "#F3F4F6", color: "#6B7280", border: "rgba(107,114,128,0.2)", dot: "#9CA3AF" },
  Fraud: { bg: "#FEE2E2", color: "#B91C1C", border: "rgba(185,28,28,0.2)", dot: "#EF4444" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.04em" }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {status.toUpperCase()}
    </div>
  );
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const ALL_REFERRALS = [
  { id: 1, referrer: "Priya Sharma", referrerEmail: "priya.s@gmail.com", referred: "Kavya Reddy", referredEmail: "kavya.r@gmail.com", code: "PRIYA48X", status: "Converted", purchase: "₹1,499", commission: "₹150", date: "28 Jun 2024" },
  { id: 2, referrer: "Rahul Mehta", referrerEmail: "rahul.m@gmail.com", referred: "Ankit Joshi", referredEmail: "ankit.j@gmail.com", code: "RMEHTA7K", status: "Pending", purchase: "—", commission: "—", date: "27 Jun 2024" },
  { id: 3, referrer: "Sneha Kapoor", referrerEmail: "sneha.k@gmail.com", referred: "Mehul Shah", referredEmail: "mehul.s@gmail.com", code: "SNEHA2PL", status: "Converted", purchase: "₹2,999", commission: "₹300", date: "26 Jun 2024" },
  { id: 4, referrer: "Arjun Nair", referrerEmail: "arjun.n@gmail.com", referred: "Tanya Singh", referredEmail: "tanya.s@gmail.com", code: "ARJUN9QR", status: "Expired", purchase: "—", commission: "—", date: "25 Jun 2024" },
  { id: 5, referrer: "Deepika Verma", referrerEmail: "deepika.v@gmail.com", referred: "Rajan Patel", referredEmail: "rajan.p@gmail.com", code: "DPVMA3YZ", status: "Fraud", purchase: "₹999", commission: "—", date: "24 Jun 2024" },
  { id: 6, referrer: "Priya Sharma", referrerEmail: "priya.s@gmail.com", referred: "Nishant Kumar", referredEmail: "nishant.k@gmail.com", code: "PRIYA48X", status: "Converted", purchase: "₹1,999", commission: "₹200", date: "23 Jun 2024" },
  { id: 7, referrer: "Karan Malhotra", referrerEmail: "karan.m@gmail.com", referred: "Simran Kaur", referredEmail: "simran.k@gmail.com", code: "KMLH5TW", status: "Pending", purchase: "—", commission: "—", date: "22 Jun 2024" },
  { id: 8, referrer: "Rahul Mehta", referrerEmail: "rahul.m@gmail.com", referred: "Pooja Iyer", referredEmail: "pooja.i@gmail.com", code: "RMEHTA7K", status: "Converted", purchase: "₹4,999", commission: "₹500", date: "21 Jun 2024" },
  { id: 9, referrer: "Sneha Kapoor", referrerEmail: "sneha.k@gmail.com", referred: "Vikram Das", referredEmail: "vikram.d@gmail.com", code: "SNEHA2PL", status: "Expired", purchase: "—", commission: "—", date: "20 Jun 2024" },
  { id: 10, referrer: "Arjun Nair", referrerEmail: "arjun.n@gmail.com", referred: "Richa Gupta", referredEmail: "richa.g@gmail.com", code: "ARJUN9QR", status: "Converted", purchase: "₹2,499", commission: "₹250", date: "19 Jun 2024" },
  { id: 11, referrer: "Deepika Verma", referrerEmail: "deepika.v@gmail.com", referred: "Aditya Roy", referredEmail: "aditya.r@gmail.com", code: "DPVMA3YZ", status: "Pending", purchase: "—", commission: "—", date: "18 Jun 2024" },
  { id: 12, referrer: "Karan Malhotra", referrerEmail: "karan.m@gmail.com", referred: "Meena Nambiar", referredEmail: "meena.n@gmail.com", code: "KMLH5TW", status: "Converted", purchase: "₹3,499", commission: "₹350", date: "17 Jun 2024" },
];

const STATUSES = ["All Status", "Converted", "Pending", "Expired", "Fraud"];
const MIN_PURCHASES = ["Any Amount", "₹500+", "₹1,000+", "₹2,000+", "₹5,000+"];
const PAGE_SIZE = 8;

export default function ReferralList() {
  const navigate = useNavigate();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("all");
  const [minPurchase, setMinPurchase] = useState("Any Amount");
  const [page, setPage] = useState(1);

  // Filter logic
  const filtered = ALL_REFERRALS.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.referrerEmail.toLowerCase().includes(q) || r.referredEmail.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.referrer.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = (s) => { setStatusFilter(s); setPage(1); };

  return (
    <div style={{ background: "#F8FAFB", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(17,24,39,0.07)", padding: "16px 24px" }}
        className="sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#D1FAE5" }}>
            <svg width="16" height="16" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", color: "#111827", lineHeight: 1 }}>
              All Referrals
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} referrals found</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-bold text-white rounded-xl px-4"
          style={{ height: 36, background: "linear-gradient(135deg,#059669,#047857)", boxShadow: "0 4px 12px rgba(5,150,105,0.3)", fontFamily: "'Space Grotesk',sans-serif" }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="p-5 space-y-4">

        {/* Filters + Search */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-xl px-3"
              style={{ border: "1.5px solid rgba(17,24,39,0.1)", height: 40, background: "#F8FAFB" }}>
              <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by email or referral code…"
                className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select value={statusFilter} onChange={e => handleStatusChange(e.target.value)}
              className="text-xs font-semibold text-gray-600 rounded-xl outline-none bg-white"
              style={{ border: "1.5px solid rgba(17,24,39,0.1)", height: 40, padding: "0 12px", fontFamily: "'Space Grotesk',sans-serif" }}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>

            {/* Date Range */}
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="text-xs font-semibold text-gray-600 rounded-xl outline-none bg-white"
              style={{ border: "1.5px solid rgba(17,24,39,0.1)", height: 40, padding: "0 12px", fontFamily: "'Space Grotesk',sans-serif" }}>
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="last_7">Last 7 days</option>
              <option value="last_30">Last 30 days</option>
            </select>

            {/* Min Purchase */}
            <select value={minPurchase} onChange={e => setMinPurchase(e.target.value)}
              className="text-xs font-semibold text-gray-600 rounded-xl outline-none bg-white"
              style={{ border: "1.5px solid rgba(17,24,39,0.1)", height: 40, padding: "0 12px", fontFamily: "'Space Grotesk',sans-serif" }}>
              {MIN_PURCHASES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Active filters */}
          {(statusFilter !== "All Status" || search) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Active:</span>
              {statusFilter !== "All Status" && (
                <button onClick={() => handleStatusChange("All Status")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors hover:opacity-80"
                  style={{ background: STATUS_STYLES[statusFilter]?.bg, color: STATUS_STYLES[statusFilter]?.color, border: `1px solid ${STATUS_STYLES[statusFilter]?.border}`, fontFamily: "'Space Grotesk',sans-serif" }}>
                  {statusFilter}
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
              {search && (
                <button onClick={() => setSearch("")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "#F3F4F6", color: "#6B7280", border: "1px solid rgba(107,114,128,0.2)", fontFamily: "'Space Grotesk',sans-serif" }}>
                  "{search}"
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(17,24,39,0.07)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr style={{ borderBottom: "1px solid rgba(17,24,39,0.07)", background: "#F8FAFB" }}>
                  {["Referrer", "Referred User", "Code", "Status", "Purchase Amt", "Commission", "Date", "Action"].map((h, i) => (
                    <th key={i} className="text-left py-3 px-4 text-xs font-bold text-gray-400 whitespace-nowrap"
                      style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.04em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                          <svg width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>No referrals found</p>
                        <p className="text-xs text-gray-300">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : paged.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < paged.length - 1 ? "1px solid rgba(17,24,39,0.05)" : "none" }}
                    className="hover:bg-gray-50 transition-colors duration-150 group">
                    {/* Referrer */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#059669,#047857)", fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                          {r.referrer.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{r.referrer}</p>
                          <p className="text-xs text-gray-400">{r.referrerEmail}</p>
                        </div>
                      </div>
                    </td>
                    {/* Referred */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#6B7280,#4B5563)", fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                          {r.referred.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{r.referred}</p>
                          <p className="text-xs text-gray-400">{r.referredEmail}</p>
                        </div>
                      </div>
                    </td>
                    {/* Code */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ background: "#F3F4F6", border: "1px solid rgba(17,24,39,0.08)" }}>
                        <svg width="11" height="11" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                        </svg>
                        <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.06em" }}>{r.code}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                    {/* Purchase */}
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.01em" }}>{r.purchase}</span>
                    </td>
                    {/* Commission */}
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold" style={{
                        fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: "-0.01em",
                        color: r.commission === "—" ? "#9CA3AF" : "#059669"
                      }}>{r.commission}</span>
                    </td>
                    {/* Date */}
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500 whitespace-nowrap" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{r.date}</span>
                    </td>
                    {/* Action */}
                    <td className="py-3 px-4">
                      <button onClick={() => navigate(`/referrals/${r.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 opacity-0 group-hover:opacity-100"
                        style={{ background: "#D1FAE5", color: "#047857", border: "1px solid rgba(5,150,105,0.2)", fontFamily: "'Space Grotesk',sans-serif" }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ borderTop: "1px solid rgba(17,24,39,0.06)", padding: "12px 16px" }} className="flex items-center justify-between">
            <p className="text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              Showing <span className="font-semibold text-gray-600">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-gray-600">{filtered.length}</span> referrals
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                style={{ border: "1.5px solid rgba(17,24,39,0.08)" }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200"
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    background: page === n ? "linear-gradient(135deg,#059669,#047857)" : "transparent",
                    color: page === n ? "#fff" : "#6B7280",
                    border: page === n ? "none" : "1.5px solid rgba(17,24,39,0.08)",
                    boxShadow: page === n ? "0 2px 8px rgba(5,150,105,0.3)" : "none",
                  }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                style={{ border: "1.5px solid rgba(17,24,39,0.08)" }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(17,24,39,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#D1FAE5" }}>
                  <svg width="14" height="14" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <p style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 15, color: "#111827", letterSpacing: "-0.01em" }}>
                  Referral Details
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                style={{ border: "1.5px solid rgba(17,24,39,0.08)" }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {[
                { l: "Referrer", v: `${selected.referrer} (${selected.referrerEmail})` },
                { l: "Referred User", v: `${selected.referred} (${selected.referredEmail})` },
                { l: "Referral Code", v: selected.code },
                { l: "Status", v: selected.status, badge: true },
                { l: "Purchase Amount", v: selected.purchase },
                { l: "Commission Earned", v: selected.commission },
                { l: "Date", v: selected.date },
              ].map(({ l, v, badge }, i) => (
                <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < 6 ? "1px solid rgba(17,24,39,0.05)" : "none" }}>
                  <span className="text-xs text-gray-400" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{l}</span>
                  {badge ? <StatusBadge status={v} /> : (
                    <span className="text-sm font-semibold text-gray-900 text-right" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", maxWidth: "60%" }}>{v}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */
      }
    </div>
  );
}
