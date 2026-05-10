"use client";
import { useEffect, useState } from "react";
import { complianceApi, propertiesApi } from "@/lib/api";
import { ComplianceRecord, Property } from "@/types";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";

const DPE_COLORS: Record<string, string> = {
  A: "bg-green-600", B: "bg-green-400", C: "bg-lime-400",
  D: "bg-yellow-400", E: "bg-orange-400", F: "bg-red-400", G: "bg-red-600",
};

const REGIME_LABELS: Record<string, string> = {
  micro_bic: "Micro-BIC", reel: "Réel", lmnp: "LMNP", lmp: "LMP",
};

export default function CompliancePage() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    Promise.all([complianceApi.list(), propertiesApi.list()]).then(([c, p]) => {
      setRecords(c.data);
      setProperties(p.data);
      setLoading(false);
    });
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conformité réglementaire</h1>
          <p className="text-slate-500 text-sm mt-0.5">Suivi loi Le Meur, DPE & obligations fiscales</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${alertCount > 0 ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {alertCount > 0 ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
          {alertCount > 0 ? `${alertCount} alerte${alertCount > 1 ? "s" : ""}` : "Tout est conforme"}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-xl border border-slate-200 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r.property_id} className={`bg-white rounded-xl border p-6 ${r.is_compliant ? "border-slate-200" : "border-amber-200 bg-amber-50/30"}`}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-lg">{propMap[r.property_id] || "Bien"}</h3>
                    {r.is_compliant ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-500" />
                    )}
                  </div>
                  {r.alerts && r.alerts.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {r.alerts.map((a, i) => (
                        <p key={i} className="text-xs text-amber-700">⚠ {a}</p>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => editing === r.property_id ? saveEdit() : startEdit(r)}
                  className="text-sm text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-slate-400 transition-colors">
                  {editing === r.property_id ? "Enregistrer" : "Modifier"}
                </button>
              </div>

              {editing === r.property_id ? (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: "registration_number", label: "N° enregistrement", type: "text", placeholder: "XXXXXXXXXXXXXXX" },
                    { key: "registration_city", label: "Commune d'enregistrement", type: "text", placeholder: "Nice" },
                    { key: "registration_expiry", label: "Expiration enregistrement", type: "date" },
                    { key: "dpe_class", label: "Classe DPE", type: "text", placeholder: "A, B, C..." },
                    { key: "dpe_expiry", label: "Expiration DPE", type: "date" },
                    { key: "siret", label: "SIRET", type: "text", placeholder: "12345678901234" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                      <input type={type} placeholder={placeholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        value={editForm[key] || ""} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Régime fiscal</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      value={editForm.fiscal_regime} onChange={(e) => setEditForm({ ...editForm, fiscal_regime: e.target.value })}>
                      <option value="">—</option>
                      {Object.entries(REGIME_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-6">
                  {/* Nuitées counter */}
                  <div className="col-span-1">
                    <div className="text-xs font-medium text-slate-500 mb-2">NUITÉES {r.current_year || new Date().getFullYear()}</div>
                    <div className="relative">
                      <div className="flex items-end gap-1 mb-1">
                        <span className="text-3xl font-bold text-slate-900">{r.nuitees_year}</span>
                        <span className="text-slate-400 text-sm mb-0.5">/ {r.nuitees_limit}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            r.nuitees_year >= r.nuitees_limit ? "bg-red-500" :
                            r.nuitees_year >= r.nuitees_alert_at ? "bg-amber-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(100, (r.nuitees_year / r.nuitees_limit) * 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{r.nuitees_limit - r.nuitees_year} restantes</div>
                    </div>
                  </div>

                  {/* Registration */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2">ENREGISTREMENT</div>
                    {r.registration_number ? (
                      <>
                        <div className="font-mono text-sm font-medium text-slate-900">{r.registration_number}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{r.registration_city}</div>
                        {r.registration_expiry && <div className="text-xs text-slate-400">Exp. {r.registration_expiry}</div>}
                      </>
                    ) : (
                      <div className="text-sm text-amber-600 font-medium">Non renseigné</div>
                    )}
                  </div>

                  {/* DPE */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2">DPE</div>
                    {r.dpe_class ? (
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${DPE_COLORS[r.dpe_class] || "bg-slate-400"}`}>
                          {r.dpe_class}
                        </span>
                        {r.dpe_expiry && <div className="text-xs text-slate-500">Exp. {r.dpe_expiry}</div>}
                      </div>
                    ) : <div className="text-sm text-slate-400">Non renseigné</div>}
                  </div>

                  {/* Fiscal */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2">RÉGIME FISCAL</div>
                    {r.fiscal_regime ? (
                      <>
                        <div className="text-sm font-medium text-slate-900">{REGIME_LABELS[r.fiscal_regime] || r.fiscal_regime}</div>
                        {r.siret && <div className="font-mono text-xs text-slate-500 mt-0.5">SIRET: {r.siret}</div>}
                      </>
                    ) : <div className="text-sm text-slate-400">Non renseigné</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
