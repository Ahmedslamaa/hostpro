import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import { Shield, Lock, Eye, Database, Server, Globe, Mail } from "lucide-react";

export const metadata = {
  title: "Politique de confidentialité — HOST PRO",
  description: "Comment HOST PRO collecte, utilise et protège vos données personnelles.",
};

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-[#FF5A5F]/10 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-[#FF5A5F]" />
        </div>
        <h2 className="text-lg font-bold text-[#222222]">{title}</h2>
      </div>
      <div className="text-sm text-[#717171] leading-relaxed space-y-3 pl-11">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white border-b border-[#DDDDDD] px-8 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <LogoMark variant="light" size="md" />
          <Link href="/dashboard" className="text-sm text-[#717171] hover:text-[#222222] transition-colors font-medium">
            ← Tableau de bord
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-8 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">
              Conforme RGPD · Mai 2025
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#222222] tracking-tight mb-3">Politique de confidentialité</h1>
          <p className="text-[#717171]">
            Dernière mise à jour : <strong className="text-[#222222]">11 mai 2026</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDDDDD] shadow-sm p-8">

          <Section icon={Shield} title="1. Qui sommes-nous ?">
            <p>
              <strong className="text-[#222222]">HOST PRO</strong> est une plateforme SaaS de gestion locative
              destinée aux gestionnaires immobiliers professionnels, éditée par la société HOST PRO SAS.
            </p>
            <p>
              <strong className="text-[#222222]">DPO (Délégué à la Protection des Données) :</strong>{" "}
              <a href="mailto:dpo@hostpro.fr" className="text-[#FF5A5F] hover:underline">dpo@hostpro.fr</a>
            </p>
          </Section>

          <Section icon={Database} title="2. Données collectées">
            <p>Nous collectons uniquement les données strictement nécessaires à la fourniture du service :</p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li><strong className="text-[#222222]">Compte :</strong> nom, adresse email, mot de passe hashé (bcrypt)</li>
              <li><strong className="text-[#222222]">Propriétés :</strong> adresses, descriptions, photos, tarifs</li>
              <li><strong className="text-[#222222]">Réservations :</strong> nom du voyageur, email, téléphone, dates</li>
              <li><strong className="text-[#222222]">Usage :</strong> logs de connexion, adresse IP, user-agent (sécurité)</li>
              <li><strong className="text-[#222222]">Analytics :</strong> pages visitées (anonymisé, si consentement)</li>
            </ul>
            <p>
              Nous ne collectons <strong className="text-[#222222]">jamais</strong> de données bancaires,
              numéros de carte, ou documents d'identité via notre interface.
            </p>
          </Section>

          <Section icon={Eye} title="3. Pourquoi utilisons-nous vos données ?">
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Fournir et sécuriser l'accès à votre espace HOST PRO (base légale : <em>exécution du contrat</em>)</li>
              <li>Vous envoyer des notifications de service essentielles (base légale : <em>intérêt légitime</em>)</li>
              <li>Améliorer la plateforme via analytics anonymisés (base légale : <em>consentement</em>)</li>
              <li>Respecter nos obligations légales comptables et fiscales (base légale : <em>obligation légale</em>)</li>
            </ul>
          </Section>

          <Section icon={Server} title="4. Hébergement et transferts de données">
            <p>
              Toutes vos données sont hébergées sur <strong className="text-[#222222]">Microsoft Azure Europe
              (région West Europe — Pays-Bas)</strong>, garantissant que vos données restent dans l'
              <strong className="text-[#222222]">Espace Économique Européen (EEE)</strong>.
            </p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li><strong className="text-[#222222]">Base de données :</strong> Azure Database for PostgreSQL (chiffrement AES-256 au repos)</li>
              <li><strong className="text-[#222222]">Fichiers :</strong> Azure Blob Storage (HTTPS TLS 1.3)</li>
              <li><strong className="text-[#222222]">Secrets :</strong> Azure Key Vault (HSM hardware)</li>
              <li><strong className="text-[#222222]">Monitoring :</strong> Azure Application Insights (données anonymisées)</li>
            </ul>
            <p>
              Aucun transfert vers des pays tiers sans garanties adéquates (décision d'adéquation ou CCT).
            </p>
          </Section>

          <Section icon={Lock} title="5. Sécurité des données">
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Chiffrement TLS 1.3 en transit sur toutes les connexions</li>
              <li>Chiffrement AES-256 au repos (PostgreSQL + Azure Blob)</li>
              <li>Tokens d'authentification httpOnly (protection XSS)</li>
              <li>Rate limiting anti-brute force sur l'API d'authentification</li>
              <li>Headers de sécurité HTTP (CSP, HSTS, X-Frame-Options…)</li>
              <li>Audit de sécurité périodique et monitoring 24/7</li>
              <li>Sauvegardes automatiques chiffrées avec rétention 30 jours</li>
            </ul>
          </Section>

          <Section icon={Globe} title="6. Vos droits RGPD">
            <p>Conformément au RGPD (Art. 15 à 22), vous disposez des droits suivants :</p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li><strong className="text-[#222222]">Accès :</strong> obtenir une copie de vos données</li>
              <li><strong className="text-[#222222]">Rectification :</strong> corriger des données inexactes</li>
              <li><strong className="text-[#222222]">Suppression :</strong> demander l'effacement de votre compte</li>
              <li><strong className="text-[#222222]">Portabilité :</strong> exporter vos données en JSON/CSV</li>
              <li><strong className="text-[#222222]">Opposition :</strong> vous opposer au traitement à des fins marketing</li>
              <li><strong className="text-[#222222]">Limitation :</strong> demander la suspension du traitement</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez{" "}
              <a href="mailto:privacy@hostpro.fr" className="text-[#FF5A5F] hover:underline">privacy@hostpro.fr</a>.
              Réponse garantie sous 30 jours. Vous pouvez également introduire une réclamation auprès de la{" "}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#FF5A5F] hover:underline">
                CNIL (www.cnil.fr)
              </a>.
            </p>
          </Section>

          <Section icon={Mail} title="7. Contact">
            <p>
              <strong className="text-[#222222]">HOST PRO SAS</strong><br />
              DPO : <a href="mailto:dpo@hostpro.fr" className="text-[#FF5A5F] hover:underline">dpo@hostpro.fr</a><br />
              Confidentialité : <a href="mailto:privacy@hostpro.fr" className="text-[#FF5A5F] hover:underline">privacy@hostpro.fr</a>
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
