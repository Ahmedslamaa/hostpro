import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function ReservationPDFPage({ params }: { params: { id: string } }) {
  const reservation = await db.reservation.findUnique({
    where: { id: params.id },
    include: { property: true },
  });

  if (!reservation) notFound();

  const nights = reservation.nights;
  const cleaningFee = reservation.cleaning_fee ?? 0;
  const total = reservation.total_amount ?? 0;
  const base = total - cleaningFee;

  return (
    <html>
      <head>
        <title>Confirmation — {reservation.reference ?? reservation.id}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, Arial, sans-serif; color: #222; background: white; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #FF5A5F; padding-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; }
          .logo span { background: #FF5A5F; color: white; padding: 2px 8px; border-radius: 6px; margin-left: 4px; }
          .ref { font-size: 12px; color: #717171; text-align: right; }
          .ref strong { font-size: 16px; color: #222; display: block; }
          h1 { font-size: 22px; font-weight: 800; margin-bottom: 24px; color: #FF5A5F; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .card { background: #F7F7F7; border-radius: 12px; padding: 20px; }
          .card h3 { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #717171; margin-bottom: 12px; font-weight: 700; }
          .card p { font-size: 14px; margin-bottom: 6px; }
          .card p strong { color: #222; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #717171; border-bottom: 1px solid #DDD; }
          td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #F0F0F0; }
          .total-row td { font-weight: 800; font-size: 16px; border-top: 2px solid #222; border-bottom: none; padding-top: 14px; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #DCFCE7; color: #16A34A; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #DDD; font-size: 11px; color: #717171; text-align: center; }
          @media print { body { padding: 20px; } button { display: none; } }
        `}</style>
      </head>
      <body>
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, borderBottom: "2px solid #FF5A5F", paddingBottom: 24 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1 }}>
              HOST <span style={{ background: "#FF5A5F", color: "white", padding: "2px 8px", borderRadius: 6, marginLeft: 4 }}>PRO</span>
            </div>
            <div style={{ fontSize: 12, color: "#717171", marginTop: 4 }}>Gestion locative IA</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#717171" }}>Confirmation de réservation</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#222", marginTop: 2 }}>{reservation.reference ?? reservation.id}</div>
            <div style={{ fontSize: 11, color: "#717171", marginTop: 2 }}>{new Date().toLocaleDateString("fr-FR")}</div>
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: "#FF5A5F" }}>
          Confirmation de séjour
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div style={{ background: "#F7F7F7", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: "#717171", marginBottom: 12, fontWeight: 700 }}>Voyageur</h3>
            <p style={{ fontSize: 14, marginBottom: 6 }}><strong style={{ color: "#222" }}>{reservation.guest_name}</strong></p>
            {reservation.guest_email && <p style={{ fontSize: 14, marginBottom: 6, color: "#717171" }}>{reservation.guest_email}</p>}
            {reservation.guest_phone && <p style={{ fontSize: 14, color: "#717171" }}>{reservation.guest_phone}</p>}
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: "#717171", marginBottom: 12, fontWeight: 700 }}>Propriété</h3>
            <p style={{ fontSize: 14, marginBottom: 6 }}><strong style={{ color: "#222" }}>{reservation.property.name}</strong></p>
            {reservation.property.address && <p style={{ fontSize: 14, color: "#717171" }}>{reservation.property.address}</p>}
            {reservation.property.city && <p style={{ fontSize: 14, color: "#717171" }}>{reservation.property.city}, {reservation.property.country}</p>}
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: "#717171", marginBottom: 12, fontWeight: 700 }}>Dates du séjour</h3>
            <p style={{ fontSize: 14, marginBottom: 6 }}>
              <strong style={{ color: "#717171", fontWeight: 600, marginRight: 8 }}>Arrivée</strong>
              {new Date(reservation.check_in).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p style={{ fontSize: 14, marginBottom: 6 }}>
              <strong style={{ color: "#717171", fontWeight: 600, marginRight: 8 }}>Départ</strong>
              {new Date(reservation.check_out).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p style={{ fontSize: 14 }}>
              <strong style={{ color: "#717171", fontWeight: 600, marginRight: 8 }}>Durée</strong>
              {nights} nuit{nights > 1 ? "s" : ""}
            </p>
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: "#717171", marginBottom: 12, fontWeight: 700 }}>Voyageurs</h3>
            <p style={{ fontSize: 14, marginBottom: 6 }}>{reservation.adults} adulte{reservation.adults > 1 ? "s" : ""}{reservation.children > 0 ? `, ${reservation.children} enfant${reservation.children > 1 ? "s" : ""}` : ""}</p>
            <p style={{ fontSize: 14 }}>
              Source : <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#FFE4E6", color: "#FF5A5F", textTransform: "capitalize" }}>{reservation.source}</span>
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Récapitulatif financier</h2>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", color: "#717171", borderBottom: "1px solid #DDD" }}>Description</th>
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", color: "#717171", borderBottom: "1px solid #DDD" }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "10px 12px", fontSize: 14, borderBottom: "1px solid #F0F0F0" }}>Hébergement ({nights} nuit{nights > 1 ? "s" : ""})</td>
              <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right", borderBottom: "1px solid #F0F0F0" }}>{base.toFixed(2)} €</td>
            </tr>
            {cleaningFee > 0 && (
              <tr>
                <td style={{ padding: "10px 12px", fontSize: 14, borderBottom: "1px solid #F0F0F0" }}>Frais de ménage</td>
                <td style={{ padding: "10px 12px", fontSize: 14, textAlign: "right", borderBottom: "1px solid #F0F0F0" }}>{cleaningFee.toFixed(2)} €</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: "14px 12px", fontSize: 16, fontWeight: 800, borderTop: "2px solid #222" }}>Total</td>
              <td style={{ padding: "14px 12px", fontSize: 16, fontWeight: 800, textAlign: "right", borderTop: "2px solid #222" }}>{total.toFixed(2)} €</td>
            </tr>
          </tbody>
        </table>

        {reservation.property.check_in_time && (
          <div style={{ background: "#FFF5F5", border: "1px solid #FFCDD2", borderRadius: 12, padding: 16, marginTop: 24 }}>
            <p style={{ fontSize: 13, color: "#717171" }}>
              🕐 <strong style={{ color: "#222" }}>Horaires</strong> — Arrivée à partir de {reservation.property.check_in_time} · Départ avant {reservation.property.check_out_time}
            </p>
          </div>
        )}

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid #DDD", fontSize: 11, color: "#717171", textAlign: "center" }}>
          <p>Document généré par HOST PRO — Gestion locative IA · hostpro.fr</p>
          <p style={{ marginTop: 4 }}>Ce document vaut confirmation de séjour. Conservez-le pour votre dossier.</p>
        </div>

        <script dangerouslySetInnerHTML={{ __html: "window.onload = () => window.print();" }} />
      </body>
    </html>
  );
}
