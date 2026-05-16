"use client";
import { useEffect, useState } from "react";
import { complianceApi } from "@/lib/api";
import { ComplianceRecord, Property } from "@/types";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Pencil, X, Save } from "lucide-react";

const DPE_CONFIG: Record<string, { bg: string; text: string }> = {
  A: { bg: "bg-green-600", text: "text-white" },
  B: { bg: "bg-green-500", text: "text-white" },
  C: { bg: "bg-lime-400", text: "text-white" },
  D: { bg: "bg-yellow-400", text: "text-white" },
  E: { bg: "bg-orange-400", text: "text-white" },
  F: { bg: "bg-red-400", text: "text-white" },
  G: { bg: "bg-red-600", text: "text-white" },
};

const REGIME_LABELS: Record<string, string> = {
  micro_bic: "Micro-BIC",
  reel: "Réel",
  lmnp: "LMNP",
  lmp: "LMP",
};

export default function CompliancePage() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/compliance").then(r => r.json()),
      fetch("/api/v1/properties").then(r => r.json()),
    ]).then(([c, p]) => {
      setRecords(Array.isArray(c) ? c : []);
      setProperties(Array.isArray(p) ? p : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const propMap = Object.fromEntries(properties.map((p) => [p.id, p.name]));
  const alertCount = records.reduce((n, r) => n + (r.alerts?.length || 0), 0);

  const startEdit = (r: ComplianceRecord) => {
    setEditing(r.property_id);
    setEditForm({
      registration_number: r.registration_number || "",
      registration_city: r.registration_city || "",
      registration_expiry: r.registration_expiry || "",
      nuitees_limit: r.nuitees_limit,
      dpe_class: r.dpe_class || "",
      dpe_expiry: r.dpe_expiry || "",
      fiscal_regime: r.fiscal_regime || "",
      siret: r.siret || "",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    await complianceApi.update(editing, editForm);
    const updated = await complianceApi.list();
    setRecords(updated.data);
    setEditing(null);
  };

  const inputClass =
    "border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-[#717171] focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 w-full transition-all";

  return (
    <div>
      {/* Status banner */}
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium mb-6 ${
        alertCount > 0
          ? "bg-red-50 border border-red-200 text-red-700"
          : "bg-green-50 border border-green-200 text-green-700"
      }`}>
        {alertCount > 0 ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
        {alertCount > 0
          ? `${alertCount} alerte${alertCount > 1 ? "s" : ""} de conformité détectée${alertCount > 1 ? "s" : ""} — Action requise`
          : "Toutes vos propriétés sont en conformité"}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-neutral-200 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 flex flex-col items-center justify-center py-24 shadow-sm">
          <ShieldCheck size={40} className="text-[#DDDDDD] mb-4" />
          <h3 className="font-semibold text-neutral-900 mb-2">Aucune donnée de conformité</h3>
          <p className="text-neutral-500 text-sm">Ajoutez des propriétés pour suivre leur conformité</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((r) => {
            const pct = Math.min(100, (r.nuitees_year / r.nuitees_limit) * 100);
            const barColor =
              r.nuitees_year >= r.nuitees_limit
                ? "bg-red-500"
                : r.nuitees_year >= r.nuitees_alert_at
                ? "bg-amber-500"
                : "bg-green-500";

            return (
              <div
                key={r.property_id}
                className={`bg-white rounded-2xl border p-6 shadow-sm ${
                  r.is_compliant ? "border-neutral-200" : "border-amber-200"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-neutral-900 text-lg">{propMap[r.property_id] || "Propriété"}</h3>
                      {r.is_compliant ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <AlertTriangle size={18} className="text-amber-500" />
                      )}
                    </div>
                    {r.alerts && r.alerts.length > 0 && (
                      <div className="space-y-0.5">
                        {r.alerts.map((a, i) => (
                          <p key={i} className="text-xs text-amber-700 flex items-center gap-1">
                            <AlertTriangle size={10} /> {a}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  {editing === r.property_id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(null)}
                        className="flex items-center gap-1.5 border border-neutral-200 text-neutral-500 font-medium px-3 py-1.5 rounded-xl hover:bg-neutral-100 transition-all text-sm"
                      >
                        <X size={14} /> Annuler
                      </button>
                      <button
                        onClick={saveEdit}
                        className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-3 py-1.5 rounded-xl transition-all text-sm"
                      >
                        <Save size={14} /> Enregistrer
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(r)}
                      className="flex items-center gap-1.5 border border-neutral-200 text-neutral-900 font-medium px-3 py-1.5 rounded-xl hover:bg-neutral-100 transition-all text-sm"
                    >
                      <Pencil size={14} /> Gérer
                    </button>
                  )}
                </div>

                {editing === r.property_id ? (
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: "registration_number", label: "N° enregistrement", type: "text", placeholder: "XXXXXXXXXXXXXXX" },
                      { key: "registration_city", label: "Commune", type: "text", placeholder: "Nice" },
                      { key: "registration_expiry", label: "Expiration enregistrement", type: "date" },
                      { key: "dpe_class", label: "Classe DPE", type: "text", placeholder: "A, B, C..." },
                      { key: "dpe_expiry", label: "Expiration DPE", type: "date" },
                      { key: "siret", label: "SIRET", type: "text", placeholder: "12345678901234" },
                    ].map(({ key, label, type, placeholder }) => (
                      <div key={key}>
                        <label className="text-neutral-900 text-sm font-semibold mb-2 block">{label}</label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          className={inputClass}
                          value={editForm[key] || ""}
                          onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-neutral-900 text-sm font-semibold mb-2 block">Régime fiscal</label>
                      <select
                        className={inputClass}
                        value={editForm.fiscal_regime}
                        onChange={(e) => setEditForm({ ...editForm, fiscal_regime: e.target.value })}
                      >
                        <option value="">—</option>
                        {Object.entries(REGIME_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-6">
                    {/* Nuitées progress */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                        Nuitées {r.current_year || new Date().getFullYear()}
                      </div>
                      <div className="flex items-end gap-1 mb-2">
                        <span className="text-3xl font-bold text-neutral-900">{r.nuitees_year}</span>
                        <span className="text-neutral-500 text-sm mb-0.5">/ {r.nuitees_limit}</span>
                      </div>
                      <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-xs text-neutral-500">{r.nuitees_limit - r.nuitees_year} nuitées restantes</div>
                    </div>

                    {/* Registration */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                        Enregistrement
                      </div>
                      {r.registration_number ? (
                        <>
                          <div className="font-mono text-sm font-semibold text-neutral-900">{r.registration_number}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">{r.registration_city}</div>
                          {r.registration_expiry && (
                            <div className="text-xs text-neutral-500 mt-0.5">Exp. {r.registration_expiry}</div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 text-sm font-medium">
                          <AlertTriangle size={14} /> Non renseigné
                        </div>
                      )}
                    </div>

                    {/* DPE */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">DPE</div>
                      {r.dpe_class ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                              DPE_CONFIG[r.dpe_class]?.bg || "bg-[#DDDDDD]"
                            } ${DPE_CONFIG[r.dpe_class]?.text || "text-white"}`}
                          >
                            {r.dpe_class}
                          </span>
                          {r.dpe_expiry && <div className="text-xs text-neutral-500">Exp. {r.dpe_expiry}</div>}
                        </div>
                      ) : (
                        <div className="text-sm text-neutral-500">Non renseigné</div>
                      )}
                    </div>

                    {/* Fiscal */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                        Régime fiscal
                      </div>
                      {r.fiscal_regime ? (
                        <>
                          <div className="text-sm font-semibold text-neutral-900">
                            {REGIME_LABELS[r.fiscal_regime] || r.fiscal_regime}
                          </div>
                          {r.siret && (
                            <div className="font-mono text-xs text-neutral-500 mt-0.5">SIRET: {r.siret}</div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-neutral-500">Non renseigné</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
