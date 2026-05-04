import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { knowledgeApi, communityApi } from "../services/api";
import api from "../services/api";
import { PageHeader, Spinner, TierBadge, CategoryBadge } from "../components/common/UI";
import { format } from "date-fns";
import toast from "react-hot-toast";

function CommunityModal({ community, onClose, onSave }) {
  const [form, setForm] = useState({
    name: community?.name || "",
    nameSwahili: community?.nameSwahili || "",
    description: community?.description || "",
    descriptionSwahili: community?.descriptionSwahili || "",
    region: community?.region || "",
    country: community?.country || "Kenya",
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed to save"); }
    finally { setSaving(false); }
  };

  const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" };
  const label = { display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#523D1C", marginBottom: "0.375rem" };

  return (
    <div style={overlay}>
      <div className="card" style={{ padding: "1.5rem", width: "100%", maxWidth: "32rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.25rem", fontWeight: 600, color: "#1A1008" }}>
            {community ? "Edit Community" : "Add New Community"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "#8B6F35" }}>x</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={label}>Name (English) *</label>
              <input className="input" value={form.name} onChange={set("name")} placeholder="e.g. Rendille Community" />
            </div>
            <div>
              <label style={label}>Name (Swahili)</label>
              <input className="input" value={form.nameSwahili} onChange={set("nameSwahili")} placeholder="e.g. Jamii ya Warendille" />
            </div>
          </div>
          <div>
            <label style={label}>Description (English)</label>
            <textarea className="input" rows={3} value={form.description} onChange={set("description")} placeholder="Describe the community..." style={{ resize: "vertical" }} />
          </div>
          <div>
            <label style={label}>Description (Swahili)</label>
            <textarea className="input" rows={3} value={form.descriptionSwahili} onChange={set("descriptionSwahili")} placeholder="Maelezo kwa Kiswahili..." style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={label}>Region</label>
              <input className="input" value={form.region} onChange={set("region")} placeholder="e.g. Marsabit County" />
            </div>
            <div>
              <label style={label}>Country</label>
              <input className="input" value={form.country} onChange={set("country")} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #EDE4D3" }}>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Saving..." : community ? "Save Changes" : "Add Community"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState("review");
  const [communityModal, setCommunityModal] = useState(null);

  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ["knowledge", "pending"],
    queryFn: () => knowledgeApi.list({ status: "PENDING_REVIEW", limit: 50 }).then(r => r.data.data),
    enabled: tab === "review",
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/users").then(r => r.data),
    enabled: tab === "users",
  });

  const { data: communities, isLoading: commLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: () => communityApi.list().then(r => r.data),
    enabled: tab === "communities",
  });

  const handleReview = async (id, decision) => {
    try {
      await knowledgeApi.review(id, { decision });
      qc.invalidateQueries(["knowledge", "pending"]);
      toast.success("Review submitted");
    } catch { toast.error("Review failed"); }
  };

  const handleSaveCommunity = async (data) => {
    if (communityModal === "new") {
      await communityApi.create(data);
      toast.success("Community added!");
    } else {
      await api.patch("/communities/" + communityModal.id, data);
      toast.success("Community updated!");
    }
    qc.invalidateQueries(["communities"]);
  };

  const handleRemoveCommunity = async (c) => {
    if (!window.confirm("Remove " + c.name + "?")) return;
    try {
      await api.delete("/communities/" + c.id);
      qc.invalidateQueries(["communities"]);
      toast.success("Community removed");
    } catch { toast.error("Failed to remove"); }
  };

  const TABS = [
    { id: "review", label: "Review Queue" + (pending ? " (" + pending.length + ")" : "") },
    { id: "users", label: "Users" },
    { id: "communities", label: "Communities" },
  ];

  const tabBtn = (id) => ({
    padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 500,
    borderRadius: "0.5rem 0.5rem 0 0", cursor: "pointer", border: "1px solid transparent",
    background: tab === id ? "white" : "transparent",
    color: tab === id ? "#2D5616" : "#6E5528",
    borderColor: tab === id ? "#D9C9A8" : "transparent",
    borderBottom: tab === id ? "1px solid white" : "none",
    marginBottom: tab === id ? "-1px" : "0",
  });

  return (
    <div>
      <PageHeader title={t("nav.admin")} subtitle="Manage knowledge records, users, and communities" />
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem 1.5rem" }}>

        <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid #D9C9A8", marginBottom: "2rem" }}>
          {TABS.map(t_ => <button key={t_.id} onClick={() => setTab(t_.id)} style={tabBtn(t_.id)}>{t_.label}</button>)}
        </div>

        {/* Review Queue */}
        {tab === "review" && (
          pendingLoading ? <Spinner /> : !pending?.length ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#A88B50" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>OK</div>
              <p>No records pending review</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {pending.map(r => (
                <div key={r.id} className="card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <TierBadge tier={r.accessTier} />
                        <CategoryBadge category={r.category} />
                      </div>
                      <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.125rem", fontWeight: 600, color: "#1A1008" }}>{r.title}</h3>
                      <p style={{ color: "#6E5528", fontSize: "0.875rem", marginTop: "0.25rem" }}>{r.description}</p>
                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.75rem", color: "#A88B50" }}>
                        <span>By: {r.contributor?.name}</span>
                        <span>Community: {r.community?.name}</span>
                        <span>{format(new Date(r.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <a href={"/knowledge/" + r.id} target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: "0.875rem" }}>View</a>
                      <button onClick={() => handleReview(r.id, "REJECTED")} className="btn-secondary" style={{ fontSize: "0.875rem", color: "#C44420", borderColor: "#F1B398" }}>Reject</button>
                      <button onClick={() => handleReview(r.id, "APPROVED")} className="btn-primary" style={{ fontSize: "0.875rem" }}>Approve</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Users */}
        {tab === "users" && (
          usersLoading ? <Spinner /> : (
            <div className="card" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                <thead style={{ background: "#F7F3ED", borderBottom: "1px solid #EDE4D3" }}>
                  <tr>
                    {["Name", "Email", "Role", "Access Tier", "Verified", "Joined"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#8B6F35", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #EDE4D3", background: i % 2 === 0 ? "white" : "#FDFAF6" }}>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 500, color: "#1A1008" }}>{u.name}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#6E5528" }}>{u.email}</td>
                      <td style={{ padding: "0.75rem 1rem" }}><span style={{ background: "#D9C9A8", color: "#362612", padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem" }}>{u.role.replace(/_/g, " ")}</span></td>
                      <td style={{ padding: "0.75rem 1rem" }}><TierBadge tier={u.accessTier} /></td>
                      <td style={{ padding: "0.75rem 1rem" }}><span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", display: "inline-block", background: u.isVerified ? "#538C1A" : "#C4AD7C" }} /></td>
                      <td style={{ padding: "0.75rem 1rem", color: "#A88B50" }}>{format(new Date(u.createdAt), "MMM d, yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Communities */}
        {tab === "communities" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <button onClick={() => setCommunityModal("new")} className="btn-primary">+ Add Community</button>
            </div>
            {commLoading ? <Spinner /> : !communities?.length ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#A88B50" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🌍</div>
                <p>No communities yet. Add one above.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {communities.map(c => (
                  <div key={c.id} className="card" style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                          <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", background: "#D9EBB8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Playfair Display, serif", fontWeight: 700, color: "#2D5616", fontSize: "1.125rem", flexShrink: 0 }}>
                            {c.name[0]}
                          </div>
                          <div>
                            <h3 style={{ fontWeight: 600, color: "#1A1008", fontSize: "1rem" }}>{c.name}</h3>
                            {c.nameSwahili && <p style={{ fontSize: "0.75rem", color: "#8B6F35" }}>{c.nameSwahili}</p>}
                          </div>
                        </div>
                        {c.description && <p style={{ fontSize: "0.875rem", color: "#6E5528", marginTop: "0.5rem", lineHeight: 1.5 }}>{c.description}</p>}
                        <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.75rem", color: "#A88B50" }}>
                          <span>📍 {c.region}, {c.country}</span>
                          <span>👥 {c._count?.members || 0} members</span>
                          <span>📚 {c._count?.knowledgeRecords || 0} records</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                        <button onClick={() => setCommunityModal(c)} className="btn-secondary" style={{ fontSize: "0.875rem", padding: "0.375rem 0.875rem" }}>Edit</button>
                        <button onClick={() => handleRemoveCommunity(c)} className="btn-ghost" style={{ fontSize: "0.875rem", color: "#C44420" }}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {communityModal && (
        <CommunityModal
          community={communityModal === "new" ? null : communityModal}
          onClose={() => setCommunityModal(null)}
          onSave={handleSaveCommunity}
        />
      )}
    </div>
  );
}
