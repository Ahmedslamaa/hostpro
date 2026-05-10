"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [navShadow, setNavShadow] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Navbar shadow on scroll
    const onScroll = () => setNavShadow(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    // Fade-up animation observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("hp-vis");
            observerRef.current?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(".hp-fade").forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${(i % 3) * 0.1}s`;
      observerRef.current?.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observerRef.current?.disconnect();
    };
  }, []);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  const faqs = [
    {
      q: "Comment fonctionne l'essai gratuit de 14 jours ?",
      a: "Accès complet à toutes les fonctionnalités de votre plan pendant 14 jours, sans carte bancaire requise. À l'issue, choisissez de continuer ou résiliez en un clic. Vos données restent exportables à tout moment.",
    },
    {
      q: "Quelles plateformes sont synchronisées avec HOST PRO ?",
      a: "HOST PRO se connecte via APIs officielles à Airbnb, Booking.com et Abritel/Vrbo. La synchronisation est bidirectionnelle et en temps réel : calendriers, tarifs, messages et disponibilités.",
    },
    {
      q: "Comment HOST PRO assure-t-il la conformité loi Le Meur ?",
      a: "HOST PRO gère automatiquement les numéros d'enregistrement, les déclarations en mairie, le suivi des plafonds de nuitées par bien et la collecte + remise de la taxe de séjour. Des alertes sont envoyées avant chaque échéance.",
    },
    {
      q: "Puis-je ajouter plusieurs membres à mon équipe ?",
      a: "Oui. Le plan Pro inclut 3 utilisateurs (co-hôtes, agents de ménage, assistants). Le plan Business offre des utilisateurs illimités avec gestion fine des droits d'accès par rôle et par propriété.",
    },
    {
      q: "Mes données sont-elles hébergées en France ?",
      a: "Absolument. HOST PRO héberge l'intégralité de vos données sur des serveurs en France, conformément au RGPD. Chiffrement de bout en bout, authentification à deux facteurs et sauvegardes quotidiennes inclus dans tous les plans.",
    },
    {
      q: "Que se passe-t-il si j'ai plus de 20 propriétés ?",
      a: "Pour les parcs de plus de 20 biens ou les conciergeries professionnelles, contactez-nous pour un plan Enterprise sur mesure avec tarifs dégressifs, intégration personnalisée et SLA garanti.",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');
        :root{--hp-navy:#0B1826;--hp-navy-l:#111E2E;--hp-navy-c:#152234;--hp-teal:#14B8C8;--hp-teal-d:#0E9DAB;--hp-gold:#C9A84C;--hp-gold-l:#E2C070;--hp-white:#F0F4F8;--hp-muted:#6B8099;--hp-border:rgba(255,255,255,0.08)}
        .hp-root{font-family:'Inter',sans-serif;background:var(--hp-navy);color:var(--hp-white);overflow-x:hidden;line-height:1.6;min-height:100vh}
        .hp-root a{text-decoration:none}
        /* NAV */
        .hp-nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;background:rgba(11,24,38,0.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--hp-border);transition:box-shadow .3s}
        .hp-nav.shadow{box-shadow:0 4px 30px rgba(0,0,0,.4)}
        .hp-logo{font-weight:800;font-size:22px;letter-spacing:-0.5px;color:var(--hp-white)}
        .hp-logo span{color:var(--hp-teal)}
        .hp-navlinks{display:flex;gap:32px;list-style:none}
        .hp-navlinks a{color:var(--hp-muted);font-size:14px;font-weight:500;transition:color .2s}
        .hp-navlinks a:hover{color:var(--hp-white)}
        .hp-nav-cta{display:flex;gap:12px;align-items:center}
        .hp-btn-ghost{padding:10px 20px;border:1px solid var(--hp-border);border-radius:8px;color:var(--hp-white);font-size:14px;font-weight:500;cursor:pointer;background:transparent;transition:all .2s;display:inline-block}
        .hp-btn-ghost:hover{border-color:var(--hp-teal);color:var(--hp-teal)}
        .hp-btn-primary{padding:10px 22px;background:var(--hp-teal);border:none;border-radius:8px;color:var(--hp-navy);font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-block}
        .hp-btn-primary:hover{background:var(--hp-teal-d);transform:translateY(-1px)}
        /* HERO */
        .hp-hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 40px 80px;position:relative;overflow:hidden}
        .hp-hero::before{content:'';position:absolute;width:900px;height:900px;background:radial-gradient(circle,rgba(20,184,200,.13) 0%,transparent 68%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
        .hp-hero::after{content:'';position:absolute;width:400px;height:400px;background:radial-gradient(circle,rgba(201,168,76,.09) 0%,transparent 70%);bottom:10%;right:8%;pointer-events:none}
        .hp-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 18px;background:rgba(20,184,200,.11);border:1px solid rgba(20,184,200,.3);border-radius:100px;font-size:13px;font-weight:500;color:var(--hp-teal);margin-bottom:28px}
        .hp-badge-dot{width:6px;height:6px;background:var(--hp-teal);border-radius:50%;animation:hpPulse 2s infinite}
        @keyframes hpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
        .hp-h1{font-family:'Playfair Display',serif;font-size:clamp(40px,6vw,74px);font-weight:800;line-height:1.1;letter-spacing:-1px;margin-bottom:24px;max-width:880px}
        .hp-grad{background:linear-gradient(135deg,var(--hp-teal) 0%,var(--hp-gold) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hp-sub{font-size:18px;color:rgba(240,244,248,.65);max-width:600px;margin-bottom:40px;line-height:1.75}
        .hp-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:16px}
        .hp-btn-hero{padding:16px 32px;background:var(--hp-teal);border:none;border-radius:10px;color:var(--hp-navy);font-size:16px;font-weight:700;cursor:pointer;transition:all .25s;display:inline-flex;align-items:center;gap:8px}
        .hp-btn-hero:hover{background:var(--hp-gold);transform:translateY(-2px);box-shadow:0 16px 40px rgba(20,184,200,.3)}
        .hp-btn-hero-out{padding:16px 32px;background:transparent;border:1.5px solid rgba(240,244,248,.18);border-radius:10px;color:var(--hp-white);font-size:16px;font-weight:600;cursor:pointer;transition:all .25s;display:inline-flex;align-items:center;gap:8px}
        .hp-btn-hero-out:hover{border-color:var(--hp-teal);color:var(--hp-teal)}
        .hp-note{font-size:13px;color:var(--hp-muted)}
        .hp-badges{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:60px}
        .hp-tbadge{display:flex;align-items:center;gap:10px;padding:10px 18px;background:var(--hp-navy-c);border:1px solid var(--hp-border);border-radius:10px;font-size:13px;font-weight:500;color:rgba(240,244,248,.7)}
        /* STATS */
        .hp-stats{padding:30px 40px;background:var(--hp-navy-l);border-top:1px solid var(--hp-border);border-bottom:1px solid var(--hp-border)}
        .hp-stats-in{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
        .hp-stat{text-align:center;flex:1;min-width:120px}
        .hp-stat-num{font-size:30px;font-weight:800;color:var(--hp-teal);line-height:1}
        .hp-stat-lbl{font-size:12px;color:var(--hp-muted);margin-top:5px}
        .hp-sdiv{width:1px;height:38px;background:var(--hp-border);flex-shrink:0}
        .hp-integ{display:flex;align-items:center;gap:12px}
        .hp-integ-lbl{font-size:11px;color:var(--hp-muted);text-transform:uppercase;letter-spacing:1px;white-space:nowrap}
        .hp-integ-logos{display:flex;gap:10px}
        .hp-ilogo{padding:7px 13px;background:rgba(255,255,255,.06);border:1px solid var(--hp-border);border-radius:7px;font-size:12px;font-weight:600;color:rgba(240,244,248,.65)}
        /* SECTIONS */
        .hp-sec{padding:96px 40px}
        .hp-sec-in{max-width:1100px;margin:0 auto}
        .hp-sec-tag{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:var(--hp-teal);margin-bottom:14px}
        .hp-sec-title{font-family:'Playfair Display',serif;font-size:clamp(30px,4vw,46px);font-weight:800;line-height:1.15;letter-spacing:-0.5px;margin-bottom:18px}
        .hp-sec-sub{font-size:16px;color:rgba(240,244,248,.6);max-width:560px;line-height:1.75}
        /* PAIN */
        .hp-pain{background:var(--hp-navy-l)}
        .hp-pain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:52px}
        .hp-pain-card{padding:30px;background:var(--hp-navy-c);border:1px solid var(--hp-border);border-radius:16px;position:relative;transition:transform .3s,border-color .3s}
        .hp-pain-card:hover{transform:translateY(-5px);border-color:rgba(20,184,200,.3)}
        .hp-emoji{font-size:34px;margin-bottom:18px;display:block}
        .hp-pain-problem{font-size:12px;color:rgba(240,244,248,.35);text-decoration:line-through;margin-bottom:10px;font-style:italic}
        .hp-pain-title{font-size:17px;font-weight:700;margin-bottom:10px}
        .hp-pain-desc{font-size:14px;color:var(--hp-muted);line-height:1.7}
        .hp-pain-arr{position:absolute;top:28px;right:28px;color:var(--hp-teal);font-size:18px}
        /* FEATURES */
        .hp-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:52px}
        .hp-feat-card{padding:30px;background:var(--hp-navy-c);border:1px solid var(--hp-border);border-radius:16px;transition:all .3s;position:relative;overflow:hidden}
        .hp-feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--hp-teal),var(--hp-gold));opacity:0;transition:opacity .3s}
        .hp-feat-card:hover::before{opacity:1}
        .hp-feat-card:hover{transform:translateY(-5px);border-color:rgba(20,184,200,.2)}
        .hp-feat-icon{width:46px;height:46px;background:rgba(20,184,200,.11);border:1px solid rgba(20,184,200,.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:18px}
        .hp-feat-title{font-size:16px;font-weight:700;margin-bottom:9px}
        .hp-feat-desc{font-size:14px;color:var(--hp-muted);line-height:1.7}
        /* DASHBOARD */
        .hp-db-sec{background:var(--hp-navy-l)}
        .hp-db-wrap{margin-top:52px;background:var(--hp-navy-c);border:1px solid var(--hp-border);border-radius:20px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.5)}
        .hp-db-topbar{background:#0D1A27;padding:13px 18px;display:flex;align-items:center;gap:7px;border-bottom:1px solid var(--hp-border)}
        .hp-dot{width:11px;height:11px;border-radius:50%}
        .hp-dot-r{background:#FF5F56}.hp-dot-y{background:#FFBD2E}.hp-dot-g{background:#27C93F}
        .hp-db-url{margin-left:14px;padding:5px 14px;background:rgba(255,255,255,.05);border-radius:6px;font-size:12px;color:var(--hp-muted);flex:1;max-width:360px}
        .hp-db-body{display:grid;grid-template-columns:210px 1fr;min-height:460px}
        .hp-db-side{background:#0D1A27;border-right:1px solid var(--hp-border);padding:18px 0}
        .hp-db-slogo{padding:0 18px 18px;font-weight:800;font-size:15px;border-bottom:1px solid var(--hp-border);margin-bottom:14px}
        .hp-db-slogo span{color:var(--hp-teal)}
        .hp-db-sitem{padding:9px 18px;font-size:13px;color:var(--hp-muted);display:flex;align-items:center;gap:9px;cursor:pointer;transition:all .2s}
        .hp-db-sitem:hover,.hp-db-sitem-on{background:rgba(20,184,200,.08);color:var(--hp-teal)}
        .hp-db-sitem-on{border-right:2px solid var(--hp-teal)}
        .hp-db-main{padding:22px}
        .hp-db-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
        .hp-db-htitle{font-size:17px;font-weight:700}
        .hp-db-period{font-size:12px;color:var(--hp-muted);padding:5px 12px;border:1px solid var(--hp-border);border-radius:6px}
        .hp-db-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .hp-db-kpi{padding:14px;background:rgba(255,255,255,.03);border:1px solid var(--hp-border);border-radius:10px}
        .hp-db-klbl{font-size:11px;color:var(--hp-muted);margin-bottom:7px;text-transform:uppercase;letter-spacing:.4px}
        .hp-db-kval{font-size:20px;font-weight:800}
        .hp-db-kchg{font-size:11px;color:#4CAF50;margin-top:3px}
        .hp-db-bot{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .hp-db-panel{background:rgba(255,255,255,.03);border:1px solid var(--hp-border);border-radius:10px;padding:14px}
        .hp-db-ptitle{font-size:11px;font-weight:600;color:var(--hp-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px}
        .hp-db-prow{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px}
        .hp-db-prow:last-child{border-bottom:none}
        .hp-db-pname{font-weight:500}
        .hp-db-pocc{color:var(--hp-teal);font-size:11px}
        .hp-db-prev{color:var(--hp-gold);font-weight:700}
        .hp-db-alert{display:flex;align-items:flex-start;gap:9px;padding:9px 10px;background:rgba(20,184,200,.06);border-left:2px solid var(--hp-teal);border-radius:0 7px 7px 0;margin-bottom:7px}
        .hp-db-atext{font-size:12px;color:rgba(240,244,248,.75);line-height:1.5}
        .hp-db-atag{font-size:10px;font-weight:600;background:rgba(20,184,200,.15);color:var(--hp-teal);padding:2px 7px;border-radius:4px;margin-top:3px;display:inline-block}
        /* PRICING */
        .hp-price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:52px}
        .hp-price-card{padding:34px 30px;background:var(--hp-navy-c);border:1px solid var(--hp-border);border-radius:20px;position:relative;transition:transform .3s}
        .hp-price-card:hover{transform:translateY(-5px)}
        .hp-price-card-pop{border-color:var(--hp-teal);background:linear-gradient(145deg,#152234,#0F1E2E)}
        .hp-pop-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);padding:4px 18px;background:linear-gradient(90deg,var(--hp-teal),var(--hp-gold));border-radius:100px;font-size:12px;font-weight:700;color:var(--hp-navy);white-space:nowrap}
        .hp-plan-name{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--hp-muted);margin-bottom:7px}
        .hp-plan-price{font-size:46px;font-weight:800;line-height:1;margin-bottom:3px}
        .hp-plan-price small{font-size:16px;font-weight:400;color:var(--hp-muted)}
        .hp-plan-biens{font-size:13px;color:var(--hp-muted);margin-bottom:26px}
        .hp-pdiv{height:1px;background:var(--hp-border);margin-bottom:22px}
        .hp-plan-feats{list-style:none;margin-bottom:28px}
        .hp-plan-feats li{padding:6px 0;font-size:14px;color:rgba(240,244,248,.8);display:flex;align-items:center;gap:9px}
        .hp-ck{color:var(--hp-teal)}.hp-cx{color:rgba(240,244,248,.2)}
        .hp-btn-plan{width:100%;padding:13px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;transition:all .25s;text-align:center;display:block;border:none}
        .hp-btn-out{background:transparent;border:1.5px solid var(--hp-border)!important;color:var(--hp-white)}
        .hp-btn-out:hover{border-color:var(--hp-teal)!important;color:var(--hp-teal)}
        .hp-btn-solid{background:var(--hp-teal);color:var(--hp-navy)}
        .hp-btn-solid:hover{background:var(--hp-gold);box-shadow:0 8px 24px rgba(20,184,200,.3)}
        /* TESTIMONIALS */
        .hp-testi-sec{background:var(--hp-navy-l)}
        .hp-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:52px}
        .hp-testi-card{padding:30px;background:var(--hp-navy-c);border:1px solid var(--hp-border);border-radius:16px;transition:all .3s}
        .hp-testi-card:hover{transform:translateY(-5px);border-color:rgba(201,168,76,.3)}
        .hp-stars{color:var(--hp-gold);font-size:15px;margin-bottom:18px;letter-spacing:2px}
        .hp-testi-txt{font-size:15px;color:rgba(240,244,248,.8);line-height:1.75;font-style:italic;margin-bottom:22px}
        .hp-testi-auth{display:flex;align-items:center;gap:13px}
        .hp-tav{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--hp-navy)}
        .hp-av1{background:var(--hp-teal)}.hp-av2{background:var(--hp-gold)}.hp-av3{background:linear-gradient(135deg,var(--hp-teal),var(--hp-gold))}
        .hp-tname{font-size:14px;font-weight:700}
        .hp-trole{font-size:12px;color:var(--hp-muted)}
        /* FAQ */
        .hp-faq-list{margin-top:52px;max-width:780px;margin-left:auto;margin-right:auto}
        .hp-faq-item{border:1px solid var(--hp-border);border-radius:12px;margin-bottom:10px;overflow:hidden;transition:border-color .3s}
        .hp-faq-item-open{border-color:rgba(20,184,200,.3)}
        .hp-faq-q{padding:18px 22px;font-size:15px;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:14px;background:var(--hp-navy-c);transition:background .2s;list-style:none;color:var(--hp-white);border:none;width:100%;text-align:left}
        .hp-faq-q:hover{background:rgba(20,184,200,.05)}
        .hp-faq-chev{flex-shrink:0;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border:1px solid var(--hp-border);border-radius:50%;color:var(--hp-teal);font-size:15px;transition:transform .3s}
        .hp-faq-chev-open{transform:rotate(45deg)}
        .hp-faq-a{padding:0 22px;font-size:14px;color:var(--hp-muted);line-height:1.8;max-height:0;overflow:hidden;transition:max-height .4s ease,padding .3s;background:var(--hp-navy-c)}
        .hp-faq-a-open{max-height:180px;padding:0 22px 18px}
        /* CTA */
        .hp-cta-sec{text-align:center;position:relative;overflow:hidden;padding:96px 40px}
        .hp-cta-sec::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(20,184,200,.09) 0%,transparent 68%)}
        .hp-cta-box{max-width:680px;margin:0 auto;padding:72px 40px;background:var(--hp-navy-c);border:1px solid rgba(20,184,200,.2);border-radius:24px;position:relative}
        .hp-cta-title{font-family:'Playfair Display',serif;font-size:clamp(26px,4vw,42px);font-weight:800;margin-bottom:14px}
        .hp-cta-sub{color:var(--hp-muted);font-size:15px;margin-bottom:32px}
        .hp-cta-feats{display:flex;gap:22px;justify-content:center;flex-wrap:wrap;margin-top:22px}
        .hp-cta-f{display:flex;align-items:center;gap:7px;font-size:13px;color:var(--hp-muted)}
        /* FOOTER */
        .hp-footer{background:#070F1A;border-top:1px solid var(--hp-border);padding:56px 40px 28px}
        .hp-ft-in{max-width:1100px;margin:0 auto}
        .hp-ft-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:44px;margin-bottom:44px}
        .hp-ft-logo{font-size:20px;font-weight:800;margin-bottom:13px}
        .hp-ft-logo span{color:var(--hp-teal)}
        .hp-ft-tag{font-size:13px;color:var(--hp-muted);line-height:1.7;margin-bottom:18px}
        .hp-rgpd{font-size:11px;padding:4px 12px;background:rgba(20,184,200,.1);border:1px solid rgba(20,184,200,.2);border-radius:6px;color:var(--hp-teal);display:inline-block}
        .hp-ft-col h4{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(240,244,248,.45);margin-bottom:14px}
        .hp-ft-col ul{list-style:none;padding:0;margin:0}
        .hp-ft-col li{margin-bottom:9px}
        .hp-ft-col a{font-size:14px;color:var(--hp-muted);transition:color .2s}
        .hp-ft-col a:hover{color:var(--hp-teal)}
        .hp-ft-bot{display:flex;justify-content:space-between;align-items:center;padding-top:22px;border-top:1px solid var(--hp-border);flex-wrap:wrap;gap:14px}
        .hp-ft-copy{font-size:12px;color:var(--hp-muted)}
        .hp-ft-legal{display:flex;gap:22px}
        .hp-ft-legal a{font-size:12px;color:var(--hp-muted)}
        .hp-ft-legal a:hover{color:var(--hp-teal)}
        /* ANIMATIONS */
        .hp-fade{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}
        .hp-vis{opacity:1;transform:translateY(0)}
        /* RESPONSIVE */
        @media(max-width:768px){
          .hp-nav{padding:13px 18px}
          .hp-navlinks{display:none}
          .hp-sec{padding:56px 18px}
          .hp-pain-grid,.hp-feat-grid,.hp-price-grid,.hp-testi-grid{grid-template-columns:1fr}
          .hp-db-body{grid-template-columns:1fr}
          .hp-db-side{display:none}
          .hp-db-kpis{grid-template-columns:repeat(2,1fr)}
          .hp-db-bot{grid-template-columns:1fr}
          .hp-ft-top{grid-template-columns:1fr;gap:28px}
          .hp-stats-in{justify-content:center}
          .hp-sdiv{display:none}
          .hp-cta-sec{padding:56px 18px}
          .hp-footer{padding:40px 18px 24px}
        }
      `}</style>

      <div className="hp-root">

        {/* NAV */}
        <nav className={`hp-nav${navShadow ? " shadow" : ""}`}>
          <div className="hp-logo">HOST<span>PRO</span></div>
          <ul className="hp-navlinks">
            <li><a href="#feat">Fonctionnalités</a></li>
            <li><a href="#tarifs">Tarifs</a></li>
            <li><a href="#testi">Avis clients</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="hp-nav-cta">
            <Link href="/login" className="hp-btn-ghost">Connexion</Link>
            <Link href="/register" className="hp-btn-primary">Essai gratuit →</Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="hp-hero">
          <h1 className="hp-h1">Gérez vos locations<br />saisonnières <span className="hp-grad">sans effort</span></h1>
          <p className="hp-sub">HOST PRO automatise votre gestion locative, synchronise vos annonces sur toutes les plateformes et garantit votre conformité légale — en toute sérénité.</p>
          <div className="hp-ctas">
            <Link href="/register" className="hp-btn-hero">✦ Commencer gratuitement</Link>
            <a href="#db" className="hp-btn-hero-out">▶ Voir la démo</a>
          </div>
          <p className="hp-note">14 jours gratuits · Sans carte bancaire · Résiliation en 1 clic</p>
          <div className="hp-badges">
            <div className="hp-tbadge">🔗 Airbnb API officielle</div>
            <div className="hp-tbadge">🔗 Booking.com Partner</div>
            <div className="hp-tbadge">🔗 Abritel / Vrbo</div>
            <div className="hp-tbadge">⚖️ Loi Le Meur</div>
            <div className="hp-tbadge">🤖 IA Francophone</div>
          </div>
        </section>

        {/* STATS BAND */}
        <div className="hp-stats">
          <div className="hp-stats-in">
            <div className="hp-stat"><div className="hp-stat-num">-73%</div><div className="hp-stat-lbl">de temps de gestion</div></div>
            <div className="hp-sdiv" />
            <div className="hp-stat"><div className="hp-stat-num">+28%</div><div className="hp-stat-lbl">de revenus locatifs</div></div>
            <div className="hp-sdiv" />
            <div className="hp-stat"><div className="hp-stat-num">100%</div><div className="hp-stat-lbl">conforme loi Le Meur</div></div>
            <div className="hp-sdiv" />
            <div className="hp-stat"><div className="hp-stat-num">4.9★</div><div className="hp-stat-lbl">satisfaction clients</div></div>
            <div className="hp-sdiv" />
            <div className="hp-integ">
              <span className="hp-integ-lbl">Synchronisé avec</span>
              <div className="hp-integ-logos">
                <div className="hp-ilogo">Airbnb</div>
                <div className="hp-ilogo">Booking</div>
                <div className="hp-ilogo">Abritel</div>
              </div>
            </div>
          </div>
        </div>

        {/* PAIN / SOLUTION */}
        <section className="hp-sec hp-pain" id="feat">
          <div className="hp-sec-in">
            <div className="hp-sec-tag">Pourquoi HOST PRO</div>
            <h2 className="hp-sec-title">Fini les nuits blanches<br />à gérer votre patrimoine</h2>
            <p className="hp-sec-sub">Trois problèmes majeurs que vivent vos confrères propriétaires. Une solution intégrée.</p>
            <div className="hp-pain-grid">
              {[
                { emoji: "🗓️", problem: "Doubles réservations, calendriers désynchronisés", title: "Synchronisation temps réel", desc: "Disponibilités mises à jour instantanément sur Airbnb, Booking et Abritel. Zéro conflit, zéro double réservation, zéro stress." },
                { emoji: "⚖️", problem: "Amendes, numéros manquants, déclarations oubliées", title: "Conformité automatique", desc: "Numéros d'enregistrement, déclarations en mairie, taxe de séjour, plafonds de nuitées — HOST PRO gère tout automatiquement." },
                { emoji: "💬", problem: "Messages perdus, réponses tardives, voyageurs mécontents", title: "Communication centralisée", desc: "Une boîte de réception unifiée pour tous vos voyageurs et toutes vos plateformes, avec réponses automatiques par IA francophone." },
              ].map((p, i) => (
                <div className="hp-pain-card hp-fade" key={i}>
                  <span className="hp-emoji">{p.emoji}</span>
                  <div className="hp-pain-problem">{p.problem}</div>
                  <div className="hp-pain-title">{p.title}</div>
                  <div className="hp-pain-desc">{p.desc}</div>
                  <div className="hp-pain-arr">→</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="hp-sec">
          <div className="hp-sec-in">
            <div className="hp-sec-tag">Fonctionnalités</div>
            <h2 className="hp-sec-title">Tout ce dont vous avez besoin<br />dans un seul outil</h2>
            <p className="hp-sec-sub">Conçu pour les propriétaires exigeants de la Côte d&apos;Azur et au-delà.</p>
            <div className="hp-feat-grid">
              {[
                { icon: "🤖", title: "IA Francophone", desc: "Réponses automatiques personnalisées en français, optimisation dynamique des prix, prédictions d'occupation basées sur la saisonnalité et les événements locaux." },
                { icon: "⚖️", title: "Conformité loi Le Meur", desc: "Numéros d'enregistrement, déclarations en mairie, taxe de séjour et plafonds de nuitées gérés automatiquement. Aucune amende possible." },
                { icon: "🔄", title: "Sync Multi-plateformes", desc: "Calendriers, tarifs et disponibilités synchronisés en temps réel sur Airbnb, Booking.com et Abritel via APIs officielles certifiées." },
                { icon: "⚙️", title: "Automatisation totale", desc: "Check-in/out automatisés, coordination des équipes de ménage, planification de la maintenance et envoi des contrats de location." },
                { icon: "📊", title: "Reporting & Analytics", desc: "Tableaux de bord en temps réel, revenus par bien, taux d'occupation, comparatifs saisonniers et exports comptables CSV/Excel." },
                { icon: "💬", title: "Messagerie Unifiée", desc: "Inbox centralisé pour toutes vos plateformes, templates intelligents, réponses automatiques IA et historique complet des échanges." },
              ].map((f, i) => (
                <div className="hp-feat-card hp-fade" key={i}>
                  <div className="hp-feat-icon">{f.icon}</div>
                  <div className="hp-feat-title">{f.title}</div>
                  <div className="hp-feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DASHBOARD MOCKUP */}
        <section className="hp-sec hp-db-sec" id="db">
          <div className="hp-sec-in">
            <div className="hp-sec-tag">Interface</div>
            <h2 className="hp-sec-title">Un tableau de bord<br />pensé pour la performance</h2>
            <p className="hp-sec-sub">Toutes vos propriétés, vos revenus et vos alertes en un coup d&apos;œil.</p>
            <div className="hp-db-wrap hp-fade">
              <div className="hp-db-topbar">
                <div className="hp-dot hp-dot-r" /><div className="hp-dot hp-dot-y" /><div className="hp-dot hp-dot-g" />
                <div className="hp-db-url">app.hostpro.fr/dashboard</div>
              </div>
              <div className="hp-db-body">
                <div className="hp-db-side">
                  <div className="hp-db-slogo">HOST<span>PRO</span></div>
                  {[["📊","Dashboard",true],["🏠","Propriétés",false],["📅","Calendrier",false],["💬","Messages",false],["⚙️","Automatisations",false],["📈","Analytics",false],["⚖️","Conformité",false],["👥","Équipe",false]].map(([icon, label, active], i) => (
                    <div key={i} className={`hp-db-sitem${active ? " hp-db-sitem-on" : ""}`}>{icon} {label}</div>
                  ))}
                </div>
                <div className="hp-db-main">
                  <div className="hp-db-hdr">
                    <div className="hp-db-htitle">Bonjour, Marie-Christine 👋</div>
                    <div className="hp-db-period">Mai 2025 ▾</div>
                  </div>
                  <div className="hp-db-kpis">
                    {[["Revenus du mois","12 840€","↑ +18% vs avril"],["Taux d'occupation","87%","↑ +12pts vs N-1"],["Réservations","24","↑ +6 vs avril"],["Note moyenne","4.91★","↑ stable"]].map(([lbl, val, chg], i) => (
                      <div className="hp-db-kpi" key={i}>
                        <div className="hp-db-klbl">{lbl}</div>
                        <div className="hp-db-kval">{val}</div>
                        <div className="hp-db-kchg">{chg}</div>
                      </div>
                    ))}
                  </div>
                  <div className="hp-db-bot">
                    <div className="hp-db-panel">
                      <div className="hp-db-ptitle">Mes propriétés</div>
                      {[["Villa Azur · Nice","92% occ.","5 200€"],["Apt. Bellevue · Cannes","84% occ.","3 840€"],["Studio Vieux-Port · Antibes","79% occ.","1 980€"],["Mas Provençal · Mougins","95% occ.","1 820€"]].map(([name, occ, rev], i) => (
                        <div className="hp-db-prow" key={i}>
                          <span className="hp-db-pname">{name}</span>
                          <span className="hp-db-pocc">{occ}</span>
                          <span className="hp-db-prev">{rev}</span>
                        </div>
                      ))}
                    </div>
                    <div className="hp-db-panel">
                      <div className="hp-db-ptitle">Alertes & Actions IA</div>
                      {[["🤖","Prix optimisé +12% pour Villa Azur — Jazz à Nice le 15/05","IA Revenue"],["⚖️","Déclaration taxe de séjour Nice T2 — Échéance dans 8 jours","Conformité"],["🧹","Ménage planifié · Apt. Bellevue · Demain 11h · Équipe confirmée","Automatisation"]].map(([icon, text, tag], i) => (
                        <div className="hp-db-alert" key={i}>
                          <div style={{fontSize:14}}>{icon}</div>
                          <div><div className="hp-db-atext">{text}</div><div className="hp-db-atag">{tag}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="hp-sec" id="tarifs">
          <div className="hp-sec-in">
            <div className="hp-sec-tag">Tarifs</div>
            <h2 className="hp-sec-title">Des plans adaptés<br />à votre patrimoine</h2>
            <p className="hp-sec-sub">Sans engagement. Sans frais cachés. Changez de plan à tout moment.</p>
            <div className="hp-price-grid">
              <div className="hp-price-card hp-fade">
                <div className="hp-plan-name">Starter</div>
                <div className="hp-plan-price">49<small>€/mois</small></div>
                <div className="hp-plan-biens">Jusqu&apos;à 4 propriétés</div>
                <div className="hp-pdiv" />
                <ul className="hp-plan-feats">
                  {["Sync Airbnb + Booking + Abritel","Calendrier unifié","Messagerie centralisée","Conformité loi Le Meur","Reporting de base"].map((f,i)=><li key={i}><span className="hp-ck">✓</span> {f}</li>)}
                  {["IA de pricing dynamique","Multi-utilisateurs"].map((f,i)=><li key={i}><span className="hp-cx">✗</span> {f}</li>)}
                </ul>
                <Link href="/register" className="hp-btn-plan hp-btn-out">Commencer gratuitement</Link>
              </div>
              <div className="hp-price-card hp-price-card-pop hp-fade">
                <div className="hp-pop-badge">✦ Le plus populaire</div>
                <div className="hp-plan-name">Pro</div>
                <div className="hp-plan-price">99<small>€/mois</small></div>
                <div className="hp-plan-biens">5 à 12 propriétés</div>
                <div className="hp-pdiv" />
                <ul className="hp-plan-feats">
                  {["Tout le plan Starter","IA de pricing dynamique","Automatisations avancées","Analytics complets","3 utilisateurs inclus","Export comptable","Support prioritaire"].map((f,i)=><li key={i}><span className="hp-ck">✓</span> {f}</li>)}
                </ul>
                <Link href="/register" className="hp-btn-plan hp-btn-solid">Essai gratuit 14 jours →</Link>
              </div>
              <div className="hp-price-card hp-fade">
                <div className="hp-plan-name">Business</div>
                <div className="hp-plan-price">179<small>€/mois</small></div>
                <div className="hp-plan-biens">13 à 20 propriétés</div>
                <div className="hp-pdiv" />
                <ul className="hp-plan-feats">
                  {["Tout le plan Pro","Utilisateurs illimités","API personnalisée","Onboarding dédié","Manager de compte","SLA garanti 99,9%","White-label disponible"].map((f,i)=><li key={i}><span className="hp-ck">✓</span> {f}</li>)}
                </ul>
                <Link href="/register" className="hp-btn-plan hp-btn-out">Commencer gratuitement</Link>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="hp-sec hp-testi-sec" id="testi">
          <div className="hp-sec-in">
            <div className="hp-sec-tag">Avis clients</div>
            <h2 className="hp-sec-title">Ils ont transformé<br />leur gestion locative</h2>
            <p className="hp-sec-sub">Des propriétaires de la Côte d&apos;Azur qui nous font confiance au quotidien.</p>
            <div className="hp-testi-grid">
              {[
                { txt: "En 3 semaines, j'ai récupéré plus de 15h par semaine. La synchronisation des calendriers seule vaut l'abonnement. L'IA a augmenté mes revenus de 22% sur la saison estivale.", name: "Marie-Christine L.", role: "7 villas · Cannes & Antibes", av: "hp-av1", init: "M" },
                { txt: "La conformité loi Le Meur, c'était mon cauchemar. HOST PRO gère tout automatiquement — numéros d'enregistrement, déclarations, taxe de séjour. Je dors tranquille.", name: "Jean-Marc D.", role: "12 appartements · Nice & Monaco", av: "hp-av2", init: "J" },
                { txt: "En tant que co-hôte, gérer les biens de mes clients avec une vue consolidée était impossible avant. HOST PRO l'a rendu trivial. Mes clients sont ravis, mes revenus aussi.", name: "Sophie R.", role: "Co-hôte · 18 biens · Côte d'Azur", av: "hp-av3", init: "S" },
              ].map((t, i) => (
                <div className="hp-testi-card hp-fade" key={i}>
                  <div className="hp-stars">★★★★★</div>
                  <p className="hp-testi-txt">&ldquo;{t.txt}&rdquo;</p>
                  <div className="hp-testi-auth">
                    <div className={`hp-tav ${t.av}`}>{t.init}</div>
                    <div><div className="hp-tname">{t.name}</div><div className="hp-trole">{t.role}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="hp-sec" id="faq">
          <div className="hp-sec-in" style={{textAlign:"center"}}>
            <div className="hp-sec-tag">FAQ</div>
            <h2 className="hp-sec-title">Questions fréquentes</h2>
            <p className="hp-sec-sub" style={{margin:"0 auto"}}>Tout ce que vous devez savoir avant de commencer.</p>
            <div className="hp-faq-list" style={{textAlign:"left"}}>
              {faqs.map((f, i) => (
                <div className={`hp-faq-item${openFaq === i ? " hp-faq-item-open" : ""}`} key={i}>
                  <button className="hp-faq-q" onClick={() => toggleFaq(i)}>
                    {f.q}
                    <div className={`hp-faq-chev${openFaq === i ? " hp-faq-chev-open" : ""}`}>+</div>
                  </button>
                  <div className={`hp-faq-a${openFaq === i ? " hp-faq-a-open" : ""}`}>{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <div className="hp-cta-sec">
          <div className="hp-sec-in">
            <div className="hp-cta-box hp-fade">
              <div className="hp-sec-tag" style={{textAlign:"center"}}>Passez à l&apos;action</div>
              <h2 className="hp-cta-title">Prêt à reprendre<br />le contrôle ?</h2>
              <p className="hp-cta-sub">Rejoignez +350 propriétaires qui gèrent leurs biens avec HOST PRO</p>
              <Link href="/register" className="hp-btn-hero" style={{display:"inline-flex"}}>✦ Démarrer mon essai gratuit</Link>
              <div className="hp-cta-feats">
                {["14 jours gratuits","Sans carte bancaire","Configuration en 10 min","Support en français"].map((f,i)=>(
                  <div className="hp-cta-f" key={i}><span className="hp-ck">✓</span> {f}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="hp-footer">
          <div className="hp-ft-in">
            <div className="hp-ft-top">
              <div>
                <div className="hp-ft-logo">HOST<span>PRO</span></div>
                <p className="hp-ft-tag">La plateforme SaaS premium de gestion locative saisonnière, conçue pour les propriétaires exigeants de la Côte d&apos;Azur et au-delà.</p>
                <div className="hp-rgpd">🔒 Données hébergées en France · RGPD</div>
              </div>
              <div className="hp-ft-col"><h4>Produit</h4><ul>{["Fonctionnalités","Tarifs","Intégrations","Nouveautés","Roadmap"].map((l,i)=><li key={i}><a href="#">{l}</a></li>)}</ul></div>
              <div className="hp-ft-col"><h4>Ressources</h4><ul>{["Blog","Guide loi Le Meur","Centre d'aide","API Docs","Webinaires"].map((l,i)=><li key={i}><a href="#">{l}</a></li>)}</ul></div>
              <div className="hp-ft-col"><h4>Entreprise</h4><ul>{["À propos","Contact","Partenaires","Presse","Carrières"].map((l,i)=><li key={i}><a href="#">{l}</a></li>)}</ul></div>
            </div>
            <div className="hp-ft-bot">
              <div className="hp-ft-copy">© 2025 HOST PRO SAS · Tous droits réservés · Made with ♥ en Côte d&apos;Azur</div>
              <div className="hp-ft-legal">
                <a href="#">Mentions légales</a><a href="#">CGU</a><a href="#">Confidentialité</a><a href="#">Cookies</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
