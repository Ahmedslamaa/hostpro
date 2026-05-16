// Tests utilitaires métier

describe("nights calculation", () => {
  const calcNights = (checkIn: string, checkOut: string) =>
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);

  test("séjour 5 nuits", () => {
    expect(calcNights("2026-05-14", "2026-05-19")).toBe(5);
  });

  test("séjour 1 nuit", () => {
    expect(calcNights("2026-06-01", "2026-06-02")).toBe(1);
  });

  test("même jour = 0", () => {
    expect(calcNights("2026-06-01", "2026-06-01")).toBe(0);
  });
});

describe("compliance alerts", () => {
  const computeAlerts = (data: {
    registration_number?: string;
    dpe_class?: string;
    nuitees_year: number;
    nuitees_limit: number;
    nuitees_alert_at: number;
  }) => {
    const alerts: string[] = [];
    if (!data.registration_number) alerts.push("Numéro d'enregistrement manquant");
    if (["E", "F", "G"].includes(data.dpe_class ?? ""))
      alerts.push(`DPE classe ${data.dpe_class} — mise à niveau recommandée`);
    if (data.nuitees_year >= data.nuitees_limit) alerts.push("Plafond de nuitées atteint");
    else if (data.nuitees_year >= data.nuitees_alert_at) alerts.push("Seuil d'alerte nuitées approché");
    return alerts;
  };

  test("propriété conforme — aucune alerte", () => {
    expect(computeAlerts({ registration_number: "12345", dpe_class: "B", nuitees_year: 50, nuitees_limit: 120, nuitees_alert_at: 96 })).toHaveLength(0);
  });

  test("numéro manquant  alerte", () => {
    const alerts = computeAlerts({ nuitees_year: 50, nuitees_limit: 120, nuitees_alert_at: 96 });
    expect(alerts).toContain("Numéro d'enregistrement manquant");
  });

  test("DPE E  alerte", () => {
    const alerts = computeAlerts({ registration_number: "12345", dpe_class: "E", nuitees_year: 50, nuitees_limit: 120, nuitees_alert_at: 96 });
    expect(alerts.some((a) => a.includes("DPE classe E"))).toBe(true);
  });

  test("seuil nuitées atteint  alerte", () => {
    const alerts = computeAlerts({ registration_number: "12345", nuitees_year: 100, nuitees_limit: 120, nuitees_alert_at: 96 });
    expect(alerts.some((a) => a.includes("Seuil"))).toBe(true);
  });

  test("plafond nuitées dépassé  alerte critique", () => {
    const alerts = computeAlerts({ registration_number: "12345", nuitees_year: 120, nuitees_limit: 120, nuitees_alert_at: 96 });
    expect(alerts).toContain("Plafond de nuitées atteint");
  });
});
