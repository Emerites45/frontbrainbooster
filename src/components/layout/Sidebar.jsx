import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HelpCircle,
  LogOut,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";

import aaprovidirMark from "../../assets/aaprovidir-mark.png";

const ACCENTS = {
  blue: {
    activeBg: "bg-[var(--color-blue-pale)]",
    activeText: "text-[var(--color-blue-deep)]",
    cta: "bg-[var(--color-blue)] hover:bg-[var(--color-blue-deep)]",
    iconBg: "bg-[var(--color-blue-pale)]",
    iconText: "text-[var(--color-blue)]",
  },

  green: {
    activeBg: "bg-green-50",
    activeText: "text-green-700",
    cta: "bg-green-600 hover:bg-green-700",
    iconBg: "bg-green-50",
    iconText: "text-green-600",
  },

  yellow: {
    activeBg: "bg-yellow-50",
    activeText: "text-yellow-800",
    cta: "bg-yellow-400 hover:bg-yellow-500 text-slate-900",
    iconBg: "bg-yellow-50",
    iconText: "text-yellow-600",
  },
};

function Sidebar({
  navSections = [],
  logoSubtitle,
  ctaLabel,
  ctaPath,
  onLogout,
  accent = "blue",
  mobileOpen = false,
  onMobileClose,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const theme = ACCENTS[accent] ?? ACCENTS.blue;

  return (
    <>
      {/* ================================
          MOBILE BACKDROP
      ================================= */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 flex flex-col shrink-0 h-screen z-40 bg-white border-r border-slate-100 transition-all duration-200 w-[264px] ${
          collapsed ? "md:w-[76px]" : "md:w-[264px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* ================================
            HEADER / LOGO
        ================================= */}
        <div className="flex items-center justify-between px-5 pt-5 pb-9">
          <div className="flex items-center gap-3 min-w-0">
            {/* Aaprovidir logo */}
            <div className="flex items-center justify-center shrink-0">
              <img
                src={aaprovidirMark}
                alt="Aaprovidir"
                className="w-[40px] h-[40px] object-contain"
              />
            </div>

            {/* Brand information */}
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <div className="text-[15px] font-semibold text-slate-900 truncate">
                  Aaprovidir
                </div>

                <div className="mt-1 text-[11px] text-slate-500 truncate">
                  {logoSubtitle}
                </div>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden ml-2 flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-600 shrink-0 transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>

          {/* Collapse button (desktop only) */}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="hidden md:flex ml-2 items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 shrink-0 transition-colors"
              aria-label="Réduire la barre latérale"
            >
              <ChevronsLeft size={15} />
            </button>
          )}
        </div>

        {/* ================================
            EXPAND BUTTON
        ================================= */}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="hidden md:block mx-auto mb-4 text-slate-400 hover:text-blue-600 transition-colors"
            aria-label="Étendre la barre latérale"
          >
            <ChevronsRight size={16} />
          </button>
        )}

        {/* ================================
            NAVIGATION
        ================================= */}
        <nav
          className="flex-1 px-3 space-y-6 overflow-y-auto"
          onClick={onMobileClose}
        >
          {navSections.map((section) => (
            <div key={section.label}>
              {/* Section title */}
              {!collapsed && (
                <div className="px-3 mb-2 text-[12px] text-slate-400">
                  {section.label}
                </div>
              )}

              {/* Section links */}
              <div className="space-y-0.5">
                {section.items?.map(({ label, icon: Icon, path }) => (
                  <NavLink
                    key={path}
                    to={path}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-[11px] rounded-lg text-[14px] transition-colors ${
                        isActive
                          ? `${theme.activeBg} ${theme.activeText} font-medium`
                          : "text-slate-600 hover:bg-slate-50 font-normal"
                      } ${collapsed ? "md:justify-center md:px-0" : ""}`
                    }
                  >
                    <Icon size={18} strokeWidth={1.8} />

                    <span className={collapsed ? "md:hidden" : ""}>
                      {label}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ================================
            CTA BUTTON
        ================================= */}
        {ctaLabel && ctaPath && (
          <div className="px-3 pb-3">
            <NavLink
              to={ctaPath}
              onClick={onMobileClose}
              className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-medium text-white transition-colors ${theme.cta}`}
            >
              <Plus size={18} strokeWidth={2} />

              <span className={collapsed ? "md:hidden" : ""}>{ctaLabel}</span>
            </NavLink>
          </div>
        )}

        {/* ================================
            BOTTOM ACTIONS
        ================================= */}
        <div
          className={`px-6 pt-4 pb-2 border-t border-slate-100 flex flex-col gap-4 ${
            collapsed ? "md:items-center md:px-0" : ""
          }`}
        >
          {/* Help */}
          <NavLink
            to="/help"
            title={collapsed ? "Centre d'aide" : undefined}
            className="flex items-center gap-2.5 text-[13px] text-slate-500 hover:text-blue-600 transition-colors"
          >
            <HelpCircle size={16} />

            <span className={collapsed ? "md:hidden" : ""}>
              Centre d'aide
            </span>
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? "Déconnexion" : undefined}
            className="flex items-center gap-2.5 text-[13px] text-slate-500 hover:text-red-600 w-full transition-colors"
          >
            <LogOut size={16} />

            <span className={collapsed ? "md:hidden" : ""}>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;