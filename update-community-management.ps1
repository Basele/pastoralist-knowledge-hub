# ============================================================
#  PIKH — Update Community Management & Push to GitHub
#  Run from PowerShell in the project root folder
# ============================================================

$BASE = "C:\Users\HP\Downloads\pastoralist-knowledge-hub-appplatform (1)\pastoralist-knowledge-hub"
Set-Location $BASE

Write-Host "Updating files..." -ForegroundColor Green

# ── File 1: Backend combined routes (adds PATCH + DELETE for communities) ─────
$routes = @'
const express = require("express");

// ── Media routes ──────────────────────────────────────────────────────────────
const mediaRouter = express.Router();
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const prisma = new PrismaClient();

const s3 = new AWS.S3({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.DO_SPACES_BUCKET || "pikh-media",
    acl: "public-read",
    key: (req, file, cb) => {
      const ext = file.originalname.split(".").pop();
      cb(null, `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg","image/png","image/webp","audio/mpeg","audio/wav","video/mp4","application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  },
});

mediaRouter.post("/upload", authenticate, upload.single("file"), async (req, res, next) => {
  try {
    const { recordId, caption, captionSwahili, accessTier = "PUBLIC" } = req.body;
    const f = req.file;
    const mediaType = f.mimetype.startsWith("image") ? "IMAGE"
      : f.mimetype.startsWith("audio") ? "AUDIO"
      : f.mimetype.startsWith("video") ? "VIDEO" : "DOCUMENT";
    const media = await prisma.mediaFile.create({
      data: {
        filename: f.key, originalName: f.originalname, mimeType: f.mimetype,
        size: f.size, url: f.location,
        cdnUrl: `${process.env.DO_SPACES_CDN_ENDPOINT}/${f.key}`,
        mediaType, caption, captionSwahili, accessTier,
        uploadedById: req.user.userId, recordId,
      },
    });
    res.status(201).json(media);
  } catch (err) { next(err); }
});

mediaRouter.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const media = await prisma.mediaFile.findUnique({ where: { id: req.params.id } });
    if (!media) return res.status(404).json({ error: "Not found" });
    await s3.deleteObject({ Bucket: process.env.DO_SPACES_BUCKET, Key: media.filename }).promise();
    await prisma.mediaFile.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
});

// ── Community routes ──────────────────────────────────────────────────────────
const communityRouter = express.Router();

communityRouter.get("/", async (req, res, next) => {
  try {
    const communities = await prisma.community.findMany({
      where: { isActive: true },
      include: { _count: { select: { members: true, knowledgeRecords: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(communities);
  } catch (err) { next(err); }
});

communityRouter.get("/:id", async (req, res, next) => {
  try {
    const c = await prisma.community.findUnique({
      where: { id: req.params.id },
      include: {
        members: { select: { id: true, name: true, role: true, profileImage: true }, take: 10 },
        _count: { select: { members: true, knowledgeRecords: true, locations: true } },
      },
    });
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json(c);
  } catch (err) { next(err); }
});

communityRouter.post("/", authenticate, requireRole("ADMIN", "SUPER_ADMIN"), async (req, res, next) => {
  try {
    const community = await prisma.community.create({ data: req.body });
    res.status(201).json(community);
  } catch (err) { next(err); }
});

communityRouter.patch("/:id", authenticate, requireRole("ADMIN", "SUPER_ADMIN"), async (req, res, next) => {
  try {
    const community = await prisma.community.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(community);
  } catch (err) { next(err); }
});

communityRouter.delete("/:id", authenticate, requireRole("ADMIN", "SUPER_ADMIN"), async (req, res, next) => {
  try {
    await prisma.community.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ message: "Community deactivated" });
  } catch (err) { next(err); }
});

// ── Search routes ─────────────────────────────────────────────────────────────
const searchRouter = express.Router();
const { search } = require("../services/search.service");

searchRouter.get("/", async (req, res, next) => {
  try {
    const { q, category, communityId, page, limit } = req.query;
    const TIER_ORDER = { PUBLIC: 0, COMMUNITY: 1, ELDER: 2, SACRED: 3 };
    const userTier = req.user?.accessTier || "PUBLIC";
    const accessTiers = Object.entries(TIER_ORDER)
      .filter(([, v]) => v <= TIER_ORDER[userTier])
      .map(([k]) => k);
    const results = await search({ q, category, communityId, accessTiers, page, limit });
    res.json(results);
  } catch (err) { next(err); }
});

// ── Notification routes ───────────────────────────────────────────────────────
const notifRouter = express.Router();

notifRouter.get("/", authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(notifications);
  } catch (err) { next(err); }
});

notifRouter.patch("/:id/read", authenticate, async (req, res, next) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── User routes ───────────────────────────────────────────────────────────────
const userRouter = express.Router();

userRouter.get("/", authenticate, requireRole("ADMIN", "SUPER_ADMIN"), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, accessTier: true, isVerified: true, createdAt: true },
    });
    res.json(users);
  } catch (err) { next(err); }
});

userRouter.patch("/:id", authenticate, async (req, res, next) => {
  try {
    const isOwner = req.params.id === req.user.userId;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });
    const { passwordHash, role, ...safe } = req.body;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: safe });
    res.json(user);
  } catch (err) { next(err); }
});

module.exports = { mediaRouter, communityRouter, searchRouter, notifRouter, userRouter };
'@
Set-Content -Path "backend\src\routes\_combined.routes.js" -Value $routes -Encoding UTF8
Write-Host "  [OK] _combined.routes.js" -ForegroundColor Cyan

# ── File 2: Frontend AdminPage.jsx ────────────────────────────────────────────
$admin = @'
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div className="card p-6 w-full" style={{ maxWidth: "32rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.25rem", fontWeight: 600 }}>
            {community ? "Edit Community" : "Add New Community"}
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: "0.25rem 0.5rem" }}>x</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#523D1C", marginBottom: "0.375rem" }}>Name (English) *</label>
              <input className="input" value={form.name} onChange={set("name")} placeholder="e.g. Rendille Community" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#523D1C", marginBottom: "0.375rem" }}>Name (Swahili)</label>
              <input className="input" value={form.nameSwahili} onChange={set("nameSwahili")} placeholder="e.g. Jamii ya Warendille" />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#523D1C", marginBottom: "0.375rem" }}>Description (English)</label>
            <textarea className="input" rows={3} value={form.description} onChange={set("description")} placeholder="Describe the community..." style={{ resize: "vertical" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#523D1C", marginBottom: "0.375rem" }}>Description (Swahili)</label>
            <textarea className="input" rows={3} value={form.descriptionSwahili} onChange={set("descriptionSwahili")} placeholder="Maelezo kwa Kiswahili..." style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#523D1C", marginBottom: "0.375rem" }}>Region</label>
              <input className="input" value={form.region} onChange={set("region")} placeholder="e.g. Marsabit County" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#523D1C", marginBottom: "0.375rem" }}>Country</label>
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

  const { mutate: review } = useMutation({
    mutationFn: ({ id, decision }) => knowledgeApi.review(id, { decision }),
    onSuccess: () => { qc.invalidateQueries(["knowledge", "pending"]); toast.success("Review submitted"); },
    onError: () => toast.error("Review failed"),
  });

  const TABS = [
    { id: "review", label: "Review Queue" + (pending ? " (" + pending.length + ")" : "") },
    { id: "users", label: "Users" },
    { id: "communities", label: "Communities" },
  ];

  const tabStyle = (id) => ({
    padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 500,
    borderRadius: "0.5rem 0.5rem 0 0", border: "1px solid transparent",
    cursor: "pointer", transition: "all 0.15s",
    background: tab === id ? "white" : "transparent",
    color: tab === id ? "#2D5616" : "#6E5528",
    borderColor: tab === id ? "#D9C9A8" : "transparent",
    borderBottom: tab === id ? "1px solid white" : "1px solid transparent",
    marginBottom: tab === id ? "-1px" : "0",
  });

  return (
    <div>
      <PageHeader title={t("nav.admin")} subtitle="Manage knowledge records, users, and communities" />
      <div className="page-container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>

        <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid #D9C9A8", marginBottom: "2rem" }}>
          {TABS.map(t_ => (
            <button key={t_.id} onClick={() => setTab(t_.id)} style={tabStyle(t_.id)}>{t_.label}</button>
          ))}
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
                <div key={r.id} className="card p-6">
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
                      <button onClick={() => review({ id: r.id, decision: "REJECTED" })} className="btn-secondary" style={{ fontSize: "0.875rem", color: "#C44420", borderColor: "#F1B398" }}>Reject</button>
                      <button onClick={() => review({ id: r.id, decision: "APPROVED" })} className="btn-primary" style={{ fontSize: "0.875rem" }}>Approve</button>
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
                      <td style={{ padding: "0.75rem 1rem" }}><span className="badge badge-elder">{u.role.replace(/_/g, " ")}</span></td>
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
                  <div key={c.id} className="card p-5">
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
                        <button onClick={() => { if (window.confirm("Remove " + c.name + "?")) { api.delete("/communities/" + c.id).then(() => { qc.invalidateQueries(["communities"]); toast.success("Community removed"); }).catch(() => toast.error("Failed")); }}} className="btn-ghost" style={{ fontSize: "0.875rem", color: "#C44420" }}>Remove</button>
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
          onSave={async (data) => {
            if (communityModal === "new") {
              await communityApi.create(data);
            } else {
              await api.patch("/communities/" + communityModal.id, data);
            }
            qc.invalidateQueries(["communities"]);
          }}
        />
      )}
    </div>
  );
}
'@
Set-Content -Path "frontend\src\pages\AdminPage.jsx" -Value $admin -Encoding UTF8
Write-Host "  [OK] AdminPage.jsx" -ForegroundColor Cyan

# ── Also add communityApi.create to api.js ────────────────────────────────────
$apiPatch = Get-Content "frontend\src\services\api.js" -Raw
if ($apiPatch -notmatch "communityApi.create") {
  $apiPatch = $apiPatch -replace "export const communityApi = \{", "export const communityApi = {
  create: (data) => api.post('/communities', data),
  update: (id, data) => api.patch(`/communities/`+id, data),"
  Set-Content -Path "frontend\src\services\api.js" -Value $apiPatch -Encoding UTF8
  Write-Host "  [OK] api.js patched with communityApi.create" -ForegroundColor Cyan
} else {
  Write-Host "  [OK] api.js already has communityApi.create" -ForegroundColor Cyan
}

# ── Git commit and push ───────────────────────────────────────────────────────
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git add .
git commit -m "feat: full community management - add, edit, remove via admin panel"
git push origin main

Write-Host ""
Write-Host "Done! Wait 2-3 minutes for DO to redeploy." -ForegroundColor Green
Write-Host "Then go to /admin -> Communities tab to add Rendille and rename Samburu." -ForegroundColor Yellow
