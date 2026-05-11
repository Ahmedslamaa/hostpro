"use client";
import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-black text-[#FF5A5F]">{value}{suffix}</div>
      <div className="text-sm text-[#717171] mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Comment fonctionne l'essai gratuit de 14 jours ?", a: "Accès complet à toutes les fonctionnalités de votre plan pendant 14 jours, sans carte bancaire requise. À l'issue, choisissez de continuer ou résiliez en un clic." },
    { q: "Quelles plateformes sont synchronisées avec HOSTPRO ?", a: "HOSTPRO se connecte via APIs officielles à Airbnb, Booking.com et Abritel/Vrbo. La synchronisation est bidirectionnelle et en temps réel." },
    { q: "Comment HOSTPRO assure-t-il la conformité loi Le Meur ?", a: "HOSTPRO gère automatiquement les numéros d'enregistrement, les déclarations en mairie, le suivi des plafonds de nuitées et la taxe de séjour." },
    { q: "Puis-je ajouter plusieurs membres à mon équipe ?", a: "Oui. Le plan Pro inclut 3 utilisateurs. Le plan Business offre des utilisateurs illimités avec gestion fine des droits d'accès." },
    { q: "Mes données sont-elles hébergées en France ?", a: "Absolument. HOSTPRO héberge l'intégralité de vos données sur des serveurs en France, conformément au RGPD." },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#222222]">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#DDDDDD]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <LogoMark variant="light" size="md" />
          <nav className="hidden md:flex items-center gap-8">
            {[["Fonctionnalités","#fonctionnalites"],["Tarifs","#tarifs"],["Avis clients","#avisclients"],["FAQ","#faq"]].map(([l, h]) => (
              <a key={l} href={h} className="hp-navlink text-sm text-[#717171] hover:text-[#222222] font-medium transition-colors">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-[#222222] hover:text-[#FF5A5F] transition-colors px-4 py-2">
              Connexion
            </Link>
            <Link href="/register" className="hp-btn-press bg-[#FF5A5F] hover:bg-[#E00B41] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-[#FF5A5F]/30">
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO — animations CSS keyframes uniquement ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <h1 className="hero-title text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6 text-[#222222]">
          Gérez vos locations<br />
          <span className="hp-shimmer">saisonnières sans effort</span>
        </h1>
        <p className="hero-sub text-lg text-[#717171] max-w-xl mx-auto mb-10 leading-relaxed">
          HOSTPRO automatise votre gestion locative, synchronise vos annonces sur toutes les plateformes et garantit votre conformité légale.
        </p>
        <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link href="/register"
            className="hp-btn-press hp-pulse-btn bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors">
            Commencer gratuitement →
          </Link>
          <a href="#fonctionnalites"
            className="hp-btn-press border border-[#DDDDDD] text-[#222222] font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#F7F7F7] transition-colors">
            Voir les fonctionnalités
          </a>
        </div>
        <p className="hero-note text-sm text-[#717171]">14 jours gratuits · Sans carte bancaire · Résiliation en 1 clic</p>

        {/* Partners */}
        <div className="hero-partners mt-14 w-full">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#BBBBBB] mb-6">Nos partenaires</p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            {[
              { src: "/airbnb.svg", alt: "Airbnb", h: "h-9" },
              { src: "/booking.svg", alt: "Booking.com", h: "h-8" },
              { src: "/abritel.svg", alt: "Abritel", h: "h-9" },
            ].map((logo, i) => (
              <div key={i} className="flex items-center gap-12">
                {i > 0 && <div className="w-px h-8 bg-[#DDDDDD]" />}
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className={`${logo.h} object-contain opacity-70 hover:opacity-100 transition-opacity duration-300`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="bg-[#F7F7F7] border-y border-[#DDDDDD]">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCounter value={73} suffix="%" label="de temps économisé" />
          <StatCounter value={28} suffix="%" label="de revenus en plus" />
          <StatCounter value={100} suffix="%" label="conforme loi Le Meur" />
          <div className="text-center">
            <div className="text-3xl font-black text-[#FF5A5F]">4.9★</div>
            <div className="text-sm text-[#717171] mt-1">satisfaction clients</div>
          </div>
        </div>
      </div>

      {/* ── PAIN POINTS ── */}
      <section className="max-w-6xl mx-auto px-6 py-24" id="fonctionnalites">
        <div className="text-center mb-14">
          <div className="text-[#FF5A5F] text-sm font-semibold uppercase tracking-widest mb-3">Pourquoi HOSTPRO</div>
          <h2 className="text-4xl font-black tracking-tight mb-4">
            Fini les nuits blanches<br />à gérer votre patrimoine
          </h2>
          <p className="text-[#717171] text-base max-w-md mx-auto">
            Trois problèmes majeurs. Une solution intégrée.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🗓️", bad: "Doubles réservations & calendriers désynchronisés", title: "Synchronisation temps réel", desc: "Disponibilités mises à jour instantanément sur Airbnb, Booking et Abritel. Zéro conflit, zéro stress." },
            { icon: "⚖️", bad: "Amendes, déclarations oubliées, numéros manquants", title: "Conformité automatique", desc: "Numéros d'enregistrement, déclarations en mairie, taxe de séjour — tout géré automatiquement." },
            { icon: "💬", bad: "Messages perdus, réponses tardives, voyageurs mécontents", title: "Communication centralisée", desc: "Une boîte de réception unifiée pour toutes vos plateformes, avec réponses automatiques en français." },
          ].map((c, i) => (
            <div key={i} className="hp-card bg-white border border-[#DDDDDD] rounded-2xl p-7">
              <div className="text-3xl mb-4">{c.icon}</div>
              <p className="text-xs text-[#DDDDDD] line-through mb-3 font-medium">{c.bad}</p>
              <h3 className="text-lg font-bold text-[#222222] mb-2">{c.title}</h3>
              <p className="text-sm text-[#717171] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-[#F7F7F7] border-y border-[#DDDDDD]">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="text-[#FF5A5F] text-sm font-semibold uppercase tracking-widest mb-3">Fonctionnalités</div>
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Tout ce dont vous avez besoin<br />dans un seul outil
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: "🤖", title: "IA Francophone", desc: "Réponses automatiques personnalisées, optimisation dynamique des prix et prédictions d'occupation." },
              { icon: "⚖️", title: "Conformité loi Le Meur", desc: "Numéros d'enregistrement, déclarations en mairie, taxe de séjour et plafonds gérés automatiquement." },
              { icon: "🔄", title: "Sync Multi-plateformes", desc: "Calendriers, tarifs et disponibilités synchronisés en temps réel via APIs officielles certifiées." },
              { icon: "⚙️", title: "Automatisation totale", desc: "Check-in/out automatisés, coordination des équipes, planification de la maintenance." },
              { icon: "📊", title: "Reporting & Analytics", desc: "Tableaux de bord en temps réel, revenus par bien, taux d'occupation, exports comptables." },
              { icon: "💬", title: "Messagerie Unifiée", desc: "Inbox centralisé pour toutes vos plateformes, templates intelligents et historique complet." },
            ].map((f, i) => (
              <div key={i} className="hp-card bg-white border border-[#DDDDDD] rounded-2xl p-6">
                <div className="w-12 h-12 bg-[#FF5A5F]/10 rounded-xl flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-[#222222] mb-2">{f.title}</h3>
                <p className="text-sm text-[#717171] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD MOCKUP ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="text-[#FF5A5F] text-sm font-semibold uppercase tracking-widest mb-3">Interface</div>
          <h2 className="text-4xl font-black tracking-tight mb-4">
            Un tableau de bord<br />pensé pour la performance
          </h2>
          <p className="text-[#717171] max-w-md mx-auto">
            Toutes vos propriétés, vos revenus et vos alertes en un coup d'œil.
          </p>
        </div>

        <div className="hp-float border border-[#DDDDDD] rounded-2xl overflow-hidden shadow-2xl shadow-[#222222]/8">
          <div className="bg-[#F7F7F7] border-b border-[#DDDDDD] px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5A5F]" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="ml-3 bg-white border border-[#DDDDDD] rounded-lg px-4 py-1.5 text-xs text-[#717171] flex-1 max-w-xs">
              app.hostpro.fr/dashboard
            </div>
          </div>
          <div className="flex min-h-[420px]">
            <div className="w-48 bg-white border-r border-[#DDDDDD] p-3 hidden md:block">
              <div className="px-3 py-3 border-b border-[#DDDDDD] mb-2">
                <LogoMark variant="light" size="sm" />
              </div>
              {[["📊","Dashboard",true],["🏠","Propriétés",false],["📅","Calendrier",false],["💬","Messages",false],["⚖️","Conformité",false],["👥","Équipe",false]].map(([icon, label, active], i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium mb-0.5 cursor-pointer ${active ? "bg-[#FF5A5F]/10 text-[#FF5A5F]" : "text-[#717171] hover:bg-[#F7F7F7]"}`}>
                  <span>{icon}</span> {label}
                </div>
              ))}
            </div>
            <div className="flex-1 bg-[#F7F7F7] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-[#222222] text-sm">Bonjour, Marie-Christine 👋</div>
                <div className="text-xs text-[#717171] bg-white border border-[#DDDDDD] rounded-lg px-3 py-1.5">Mai 2026 ▾</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[["Revenus","12 840 €","↑ +18%"],["Occupation","87%","↑ +12pts"],["Réservations","24","↑ +6"],["Note","4.91 ★","stable"]].map(([l,v,c],i) => (
                  <div key={i} className="bg-white border border-[#DDDDDD] rounded-xl p-3">
                    <div className="text-xs text-[#717171] mb-1">{l}</div>
                    <div className="text-lg font-black text-[#222222]">{v}</div>
                    <div className="text-xs text-green-600 font-medium">{c}</div>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white border border-[#DDDDDD] rounded-xl p-3">
                  <div className="text-xs font-semibold text-[#717171] uppercase tracking-wide mb-3">Propriétés</div>
                  {[["Villa Azur · Nice","92%","5 200 €"],["Apt. Bellevue · Cannes","84%","3 840 €"],["Studio Antibes","79%","1 980 €"]].map(([n,o,r],i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#F7F7F7] last:border-0 text-xs px-1">
                      <span className="font-medium text-[#222222] truncate">{n}</span>
                      <span className="text-[#FF5A5F] font-bold ml-2">{o}</span>
                      <span className="text-[#222222] font-bold ml-2">{r}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-[#DDDDDD] rounded-xl p-3">
                  <div className="text-xs font-semibold text-[#717171] uppercase tracking-wide mb-3">Alertes</div>
                  {[["🤖","Prix optimisé +12% — Jazz à Nice le 15/05","IA Revenue"],["⚖️","Taxe de séjour Nice T2 — Échéance 8 jours","Conformité"],["🧹","Ménage planifié · Bellevue · Demain 11h","Auto"]].map(([icon,text,tag],i) => (
                    <div key={i} className="flex gap-2 p-2 mb-2 bg-[#FF5A5F]/5 border-l-2 border-[#FF5A5F] rounded-r-lg">
                      <span className="text-sm">{icon}</span>
                      <div>
                        <div className="text-xs text-[#222222] leading-snug">{text}</div>
                        <span className="text-xs font-semibold text-[#FF5A5F]">{tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-[#F7F7F7] border-y border-[#DDDDDD]" id="tarifs">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="text-[#FF5A5F] text-sm font-semibold uppercase tracking-widest mb-3">Tarifs</div>
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Des plans adaptés<br />à votre patrimoine
            </h2>
            <p className="text-[#717171]">Sans engagement. Sans frais cachés. Changez de plan à tout moment.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Starter", price: "49", biens: "Jusqu'à 4 propriétés", popular: false,
                feats: ["Sync Airbnb + Booking + Abritel","Calendrier unifié","Messagerie centralisée","Conformité loi Le Meur","Reporting de base"],
                no: ["IA de pricing dynamique","Multi-utilisateurs"] },
              { name: "Pro", price: "99", biens: "5 à 12 propriétés", popular: true,
                feats: ["Tout le plan Starter","IA de pricing dynamique","Automatisations avancées","Analytics complets","3 utilisateurs inclus","Export comptable","Support prioritaire"],
                no: [] },
              { name: "Business", price: "179", biens: "13 à 20 propriétés", popular: false,
                feats: ["Tout le plan Pro","Utilisateurs illimités","API personnalisée","Onboarding dédié","Manager de compte","SLA 99,9%","White-label"],
                no: [] },
            ].map((plan, i) => (
              <div key={plan.name} className={`hp-card relative bg-white rounded-2xl p-8 border-2 ${plan.popular ? "border-[#FF5A5F] shadow-lg shadow-[#FF5A5F]/10" : "border-[#DDDDDD]"}`}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF5A5F] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    ✦ Le plus populaire
                  </div>
                )}
                <div className="text-xs font-bold uppercase tracking-widest text-[#717171] mb-2">{plan.name}</div>
                <div className="text-5xl font-black text-[#222222] mb-1">
                  {plan.price}<span className="text-base font-normal text-[#717171]">€/mois</span>
                </div>
                <div className="text-sm text-[#717171] mb-6">{plan.biens}</div>
                <div className="border-t border-[#DDDDDD] mb-6" />
                <ul className="space-y-2.5 mb-8">
                  {plan.feats.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#222222]">
                      <span className="text-[#FF5A5F] font-bold">✓</span> {f}
                    </li>
                  ))}
                  {plan.no.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#DDDDDD]">
                      <span className="font-bold">✗</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`hp-btn-press block w-full text-center font-semibold py-3 rounded-xl transition-all text-sm ${plan.popular ? "bg-[#FF5A5F] hover:bg-[#E00B41] text-white" : "border border-[#DDDDDD] text-[#222222] hover:bg-[#F7F7F7]"}`}>
                  Commencer gratuitement
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-6xl mx-auto px-6 py-24" id="avisclients">
        <div className="text-center mb-14">
          <div className="text-[#FF5A5F] text-sm font-semibold uppercase tracking-widest mb-3">Avis clients</div>
          <h2 className="text-4xl font-black tracking-tight mb-4">
            Ils ont transformé<br />leur gestion locative
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { txt: "En 3 semaines, j'ai récupéré plus de 15h par semaine. La synchronisation des calendriers seule vaut l'abonnement. L'IA a augmenté mes revenus de 22%.", name: "Marie-Christine L.", role: "7 villas · Cannes & Antibes", init: "M" },
            { txt: "La conformité loi Le Meur, c'était mon cauchemar. HOSTPRO gère tout automatiquement. Je dors tranquille.", name: "Jean-Marc D.", role: "12 appartements · Nice & Monaco", init: "J" },
            { txt: "Gérer les biens de mes clients avec une vue consolidée était impossible avant. HOSTPRO l'a rendu trivial.", name: "Sophie R.", role: "Co-hôte · 18 biens · Côte d'Azur", init: "S" },
          ].map((t, i) => (
            <div key={i} className="hp-card bg-white border border-[#DDDDDD] rounded-2xl p-7">
              <div className="text-[#FF5A5F] text-sm mb-4 tracking-widest">★★★★★</div>
              <p className="text-[#222222] text-sm leading-relaxed italic mb-6">"{t.txt}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF5A5F] rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {t.init}
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#222222]">{t.name}</div>
                  <div className="text-xs text-[#717171]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[#F7F7F7] border-y border-[#DDDDDD]" id="faq">
        <div className="max-w-2xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <div className="text-[#FF5A5F] text-sm font-semibold uppercase tracking-widest mb-3">FAQ</div>
            <h2 className="text-4xl font-black tracking-tight">Questions fréquentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${openFaq === i ? "border-[#FF5A5F]/40 shadow-sm" : "border-[#DDDDDD]"}`}>
                <button
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#F7F7F7]/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm text-[#222222]">{f.q}</span>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full border border-[#DDDDDD] flex items-center justify-center text-[#FF5A5F] font-bold text-base transition-transform duration-300 ${openFaq === i ? "rotate-45 bg-[#FF5A5F]/10 border-[#FF5A5F]/30" : ""}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40" : "max-h-0"}`}>
                  <div className="px-6 pb-5 text-sm text-[#717171] leading-relaxed border-t border-[#F7F7F7] pt-3">
                    {f.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="bg-[#FF5A5F] rounded-3xl px-10 py-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Prêt à reprendre<br />le contrôle ?
            </h2>
            <p className="text-white/80 mb-8 text-base">
              Rejoignez +350 propriétaires qui gèrent leurs biens avec HOSTPRO
            </p>
            <Link href="/register"
              className="hp-btn-press inline-block bg-white text-[#FF5A5F] font-bold px-8 py-4 rounded-xl text-base hover:bg-[#F7F7F7] transition-all shadow-lg shadow-black/10">
              Démarrer mon essai gratuit →
            </Link>
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {["14 jours gratuits","Sans carte bancaire","Config en 10 min","Support en français"].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-white/80 text-sm">
                  <span className="font-bold text-white">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#DDDDDD] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <LogoMark variant="light" size="md" className="mb-3" />
              <p className="text-sm text-[#717171] leading-relaxed mb-4">
                La plateforme SaaS de gestion locative saisonnière pour les propriétaires de la Côte d'Azur.
              </p>
              <span className="text-xs px-3 py-1 bg-[#F7F7F7] border border-[#DDDDDD] rounded-full text-[#717171]">
                🔒 Données hébergées en France · RGPD
              </span>
            </div>
            {[
              { title: "Produit", links: ["Fonctionnalités","Tarifs","Intégrations","Nouveautés"] },
              { title: "Ressources", links: ["Blog","Guide loi Le Meur","Centre d'aide","API Docs"] },
              { title: "Entreprise", links: ["À propos","Contact","Partenaires","Carrières"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#222222] mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-[#717171] hover:text-[#FF5A5F] transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#DDDDDD] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#717171]">© 2026 HOSTPRO SAS · Tous droits réservés · Made with ♥ en Côte d'Azur</span>
            <div className="flex gap-6">
              {["Mentions légales","CGU","Confidentialité"].map((l) => (
                <a key={l} href="#" className="text-xs text-[#717171] hover:text-[#FF5A5F] transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
