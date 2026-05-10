"""
Service d'envoi d'emails via Resend.com
Configuration : RESEND_API_KEY dans les variables d'environnement
"""
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, html: str, from_email: Optional[str] = None) -> bool:
    """Envoie un email. Retourne True si succès, False sinon."""
    if not settings.RESEND_API_KEY:
        logger.info(f"[EMAIL - DEV] To: {to} | Sujet: {subject}")
        return True  # En dev, on simule l'envoi

    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": from_email or settings.EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        return True
    except Exception as e:
        logger.error(f"Erreur envoi email à {to}: {e}")
        return False


# Templates d'emails

def email_welcome(full_name: str, tenant_name: str) -> str:
    return f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
      <div style="background:#0B1826;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px">
        <h1 style="color:#14B8C8;font-size:28px;margin:0">HOST<span style="color:white">PRO</span></h1>
      </div>
      <div style="background:white;border-radius:12px;padding:32px">
        <h2 style="color:#0f172a">Bienvenue, {full_name} !</h2>
        <p style="color:#475569">Votre espace <strong>{tenant_name}</strong> est prêt. Commencez par ajouter vos premiers biens.</p>
        <a href="{settings.FRONTEND_URL}/dashboard"
           style="display:inline-block;background:#14B8C8;color:#0B1826;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px">
          Accéder au dashboard →
        </a>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px">HOST PRO • Gestion locative saisonnière • Côte d'Azur</p>
    </div>
    """


def email_new_reservation(guest_name: str, property_name: str, check_in: str, check_out: str,
                           nights: int, total: float, source: str) -> str:
    return f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
      <div style="background:#0B1826;border-radius:12px;padding:24px 32px;margin-bottom:24px">
        <h1 style="color:#14B8C8;font-size:22px;margin:0">HOSTPRO — Nouvelle réservation</h1>
      </div>
      <div style="background:white;border-radius:12px;padding:32px">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="color:#166534;margin:0;font-weight:600">✅ Réservation confirmée</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Voyageur</td><td style="font-weight:600;color:#0f172a">{guest_name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Bien</td><td style="font-weight:600;color:#0f172a">{property_name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Check-in</td><td style="font-weight:600;color:#0f172a">{check_in}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Check-out</td><td style="font-weight:600;color:#0f172a">{check_out}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Durée</td><td style="font-weight:600;color:#0f172a">{nights} nuit{"s" if nights > 1 else ""}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Source</td><td style="font-weight:600;color:#0f172a">{source.capitalize()}</td></tr>
          <tr style="border-top:1px solid #e2e8f0">
            <td style="padding:12px 0;color:#0f172a;font-weight:700">Total</td>
            <td style="font-weight:700;color:#14B8C8;font-size:18px">{total:.0f} €</td>
          </tr>
        </table>
        <a href="{settings.FRONTEND_URL}/dashboard/reservations"
           style="display:inline-block;background:#0B1826;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px">
          Voir la réservation →
        </a>
      </div>
    </div>
    """


def email_compliance_alert(property_name: str, nuitees_used: int, nuitees_limit: int, days_left: int) -> str:
    pct = int((nuitees_used / nuitees_limit) * 100) if nuitees_limit else 0
    color = "#dc2626" if pct >= 90 else "#f59e0b"
    return f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
      <div style="background:#0B1826;border-radius:12px;padding:24px 32px;margin-bottom:24px">
        <h1 style="color:#14B8C8;font-size:22px;margin:0">HOSTPRO — Alerte Conformité</h1>
      </div>
      <div style="background:white;border-radius:12px;padding:32px">
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="color:#c2410c;margin:0;font-weight:600">⚠️ Plafond de nuitées approché — {property_name}</p>
        </div>
        <p style="color:#475569">{property_name} a utilisé <strong style="color:{color}">{nuitees_used} nuitées sur {nuitees_limit}</strong> autorisées ({pct}%).</p>
        {"<p style='color:#dc2626;font-weight:600'>⛔ ATTENTION : Vous approchez du plafond légal loi Le Meur (120 nuitées/an).</p>" if pct >= 90 else ""}
        <a href="{settings.FRONTEND_URL}/dashboard/compliance"
           style="display:inline-block;background:#0B1826;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
          Voir la conformité →
        </a>
      </div>
    </div>
    """


def email_task_assigned(assignee_name: str, task_title: str, property_name: str, due_date: str, task_type: str) -> str:
    icons = {"cleaning": "🧹", "maintenance": "🔧", "checkin": "🏠", "checkout": "🚪", "other": "📋"}
    icon = icons.get(task_type, "📋")
    return f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px">
      <div style="background:#0B1826;border-radius:12px;padding:24px 32px;margin-bottom:24px">
        <h1 style="color:#14B8C8;font-size:22px;margin:0">HOSTPRO — Nouvelle tâche</h1>
      </div>
      <div style="background:white;border-radius:12px;padding:32px">
        <h2 style="color:#0f172a">{icon} {task_title}</h2>
        <p style="color:#475569">Bonjour {assignee_name}, une tâche vous a été assignée :</p>
        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0;color:#64748b;font-size:14px">Bien : <strong style="color:#0f172a">{property_name}</strong></p>
          <p style="margin:4px 0;color:#64748b;font-size:14px">À faire pour le : <strong style="color:#0f172a">{due_date}</strong></p>
        </div>
        <a href="{settings.FRONTEND_URL}/dashboard/tasks"
           style="display:inline-block;background:#0B1826;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">
          Voir mes tâches →
        </a>
      </div>
    </div>
    """
