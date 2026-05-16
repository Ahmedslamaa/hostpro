"use client";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-all"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div
        ref={menuRef}
        className={`fixed left-0 top-0 h-screen w-60 bg-white z-30 lg:hidden transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>
    </>
  );
}
