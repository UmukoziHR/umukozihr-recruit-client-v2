"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { cn } from "@/lib/utils";
import { formatCredits } from "@/lib/utils";
import {
  Search,
  LayoutDashboard,
  FileText,
  Settings,
  User,
  Shield,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Coins,
  ChevronDown,
  Sparkles,
  Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Nav link definitions                                               */
/* ------------------------------------------------------------------ */
const navLinks = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/results", label: "Results", icon: FileText },
  { href: "/history", label: "History", icon: Clock },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */
export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { balance } = useCredits();
  const { theme, setTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  // Hydration guard for theme icon
  useEffect(() => setMounted(true), []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [userMenuOpen]);

  // Close user menu on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  const toggleUserMenu = useCallback(() => setUserMenuOpen((v) => !v), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  if (!user) return null;

  const userInitial = user.full_name?.charAt(0)?.toUpperCase() ?? "U";

  /* helper: is a nav link active? */
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ---- Sticky Navbar ---- */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "color-mix(in srgb, var(--color-surface-elevated) 85%, transparent)",
          borderBottom: "1px solid var(--color-border-light)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* ---- Left: Logo ---- */}
          <Link
            href="/search"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            {/* Logo */}
            <img
              src="/umukozi-logo.png"
              alt="UmukoziHR"
              className="h-9 w-9 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            />
            {/* Wordmark */}
            <span className="hidden text-lg font-bold tracking-tight sm:inline-flex items-baseline gap-0">
              <span style={{ color: "var(--color-text)" }}>Umukozi</span>
              <span
                className="font-extrabold"
                style={{ color: "var(--color-brand-orange)" }}
              >
                HR
              </span>
            </span>
          </Link>

          {/* ---- Center: Desktop Nav Links ---- */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                    active
                      ? "font-semibold"
                      : "opacity-70 hover:opacity-100"
                  )}
                  style={{
                    color: active
                      ? "var(--color-brand-orange)"
                      : "var(--color-text-secondary)",
                    background: active
                      ? "color-mix(in srgb, var(--color-brand-orange) 8%, transparent)"
                      : "transparent",
                  }}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  {label}
                  {/* Active indicator bar */}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: "var(--color-brand-orange)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ---- Right: Actions ---- */}
          <div className="flex items-center gap-2">

            {/* Credit Balance Badge */}
            <Link
              href="/settings"
              className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: "color-mix(in srgb, var(--color-brand-orange) 12%, transparent)",
                color: "var(--color-brand-orange)",
                border: "1px solid color-mix(in srgb, var(--color-brand-orange) 20%, transparent)",
              }}
            >
              <Coins size={13} strokeWidth={2.5} />
              <span>{formatCredits(balance ?? 0)}</span>
              <Sparkles
                size={10}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                color: "var(--color-text-secondary)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-surface-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? <Sun size={18} /> : <Moon size={18} />
              ) : (
                <div className="h-4.5 w-4.5" />
              )}
            </button>

            {/* ---- User Avatar + Dropdown (Desktop) ---- */}
            <div className="relative hidden md:block">
              <button
                ref={userButtonRef}
                onClick={toggleUserMenu}
                className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2.5 transition-all duration-200"
                style={{
                  background: userMenuOpen
                    ? "var(--color-surface-tertiary)"
                    : "transparent",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!userMenuOpen) {
                    e.currentTarget.style.background = "var(--color-surface-tertiary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!userMenuOpen) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {/* Avatar */}
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg, var(--color-brand-teal), var(--color-brand-teal-hover))",
                    color: "var(--color-text-inverse)",
                    boxShadow: "var(--shadow-xs)",
                  }}
                >
                  {userInitial}
                </div>
                <span
                  className="max-w-25 truncate text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {user.full_name}
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform duration-200",
                    userMenuOpen && "rotate-180"
                  )}
                  style={{ color: "var(--color-text-muted)" }}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div
                  ref={userMenuRef}
                  className="absolute right-0 mt-2 w-64 origin-top-right animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{
                    background: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                  role="menu"
                >
                  {/* User info header */}
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid var(--color-border-light)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                        style={{
                          background: "linear-gradient(135deg, var(--color-brand-teal), var(--color-brand-teal-hover))",
                          color: "var(--color-text-inverse)",
                        }}
                      >
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-semibold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {user.full_name}
                        </p>
                        <p
                          className="truncate text-xs"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <DropdownItem
                      href="/settings"
                      icon={User}
                      label="Profile"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <DropdownItem
                      href="/settings"
                      icon={Settings}
                      label="Settings"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    {user.is_admin && (
                      <DropdownItem
                        href="/admin"
                        icon={Shield}
                        label="Admin Panel"
                        onClick={() => setUserMenuOpen(false)}
                        badge="Admin"
                      />
                    )}
                  </div>

                  {/* Logout */}
                  <div
                    className="py-1.5"
                    style={{ borderTop: "1px solid var(--color-border-light)" }}
                  >
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium transition-colors duration-150"
                      style={{ color: "#ef4444" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "color-mix(in srgb, #ef4444 8%, transparent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      role="menuitem"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ---- Mobile Hamburger ---- */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 md:hidden"
              style={{
                color: "var(--color-text-secondary)",
                background: mobileOpen ? "var(--color-surface-tertiary)" : "transparent",
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ---- Mobile Slide-Out Drawer ---- */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300 md:hidden"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
            }}
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            className="fixed inset-y-0 right-0 z-50 w-75 max-w-[85vw] animate-in slide-in-from-right duration-300 md:hidden"
            style={{
              background: "var(--color-surface-elevated)",
              borderLeft: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {/* Drawer header */}
            <div
              className="flex h-16 items-center justify-between px-5"
              style={{ borderBottom: "1px solid var(--color-border-light)" }}
            >
              <span
                className="text-base font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Menu
              </span>
              <button
                onClick={closeMobile}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-tertiary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* User card */}
            <div
              className="mx-4 mt-4 flex items-center gap-3 rounded-xl p-3"
              style={{
                background: "var(--color-surface-secondary)",
                border: "1px solid var(--color-border-light)",
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, var(--color-brand-teal), var(--color-brand-teal-hover))",
                  color: "var(--color-text-inverse)",
                }}
              >
                {userInitial}
              </div>
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  {user.full_name}
                </p>
                <p
                  className="truncate text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {user.email}
                </p>
              </div>
            </div>

            {/* Credit badge (mobile) */}
            <div className="mx-4 mt-3">
              <Link
                href="/settings"
                onClick={closeMobile}
                className="flex items-center justify-between rounded-xl p-3 transition-colors"
                style={{
                  background: "color-mix(in srgb, var(--color-brand-orange) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-brand-orange) 15%, transparent)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Coins size={16} style={{ color: "var(--color-brand-orange)" }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    Credits
                  </span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  {formatCredits(balance ?? 0)}
                </span>
              </Link>
            </div>

            {/* Nav links */}
            <div className="mt-4 px-3">
              <p
                className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)" }}
              >
                Navigation
              </p>
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMobile}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
                    style={{
                      color: active
                        ? "var(--color-brand-orange)"
                        : "var(--color-text-secondary)",
                      background: active
                        ? "color-mix(in srgb, var(--color-brand-orange) 10%, transparent)"
                        : "transparent",
                    }}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                    {label}
                    {active && (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full"
                        style={{ background: "var(--color-brand-orange)" }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Admin & extras */}
            {user.is_admin && (
              <div className="mt-2 px-3">
                <div
                  className="my-2 mx-3"
                  style={{ borderTop: "1px solid var(--color-border-light)" }}
                />
                <Link
                  href="/admin"
                  onClick={closeMobile}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <Shield size={18} />
                  Admin Panel
                  <span
                    className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{
                      background: "color-mix(in srgb, var(--color-brand-teal) 15%, transparent)",
                      color: "var(--color-brand-teal)",
                    }}
                  >
                    Admin
                  </span>
                </Link>
              </div>
            )}

            {/* Bottom actions */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4"
              style={{ borderTop: "1px solid var(--color-border-light)" }}
            >
              {/* Theme toggle row */}
              <div
                className="mb-3 flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ background: "var(--color-surface-secondary)" }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{
                    background: "var(--color-surface-elevated)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border-light)",
                  }}
                  aria-label="Toggle theme"
                >
                  {mounted ? (
                    theme === "dark" ? <Sun size={16} /> : <Moon size={16} />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Sign out */}
              <button
                onClick={() => {
                  closeMobile();
                  logout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-150"
                style={{
                  color: "#ef4444",
                  background: "color-mix(in srgb, #ef4444 6%, transparent)",
                  border: "1px solid color-mix(in srgb, #ef4444 12%, transparent)",
                }}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Dropdown menu item sub-component                                   */
/* ------------------------------------------------------------------ */
interface DropdownItemProps {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
  badge?: string;
}

function DropdownItem({ href, icon: Icon, label, onClick, badge }: DropdownItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors duration-150"
      style={{ color: "var(--color-text-secondary)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--color-surface-tertiary)";
        e.currentTarget.style.color = "var(--color-text)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--color-text-secondary)";
      }}
      role="menuitem"
    >
      <Icon size={16} />
      {label}
      {badge && (
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
          style={{
            background: "color-mix(in srgb, var(--color-brand-teal) 15%, transparent)",
            color: "var(--color-brand-teal)",
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
