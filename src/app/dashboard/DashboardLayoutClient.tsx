"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayoutClient({
  children,
  userName,
  userEmail
}: {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={closeMenu}
      ></div>

      {/* Sidebar */}
      <aside className={`hide-on-print sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'center' }}>
          <img src="/logo.svg" alt="NJ Fence and Railing Logo" style={{ maxWidth: '100%', height: 'auto', maxHeight: '50px' }} />
        </div>
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/dashboard/crm", label: "Customers" },
            { href: "/dashboard/estimates", label: "Estimates" },
            { href: "/dashboard/invoices", label: "Invoices" },
            { href: "/dashboard/payments", label: "Payments" },
            { href: "/dashboard/projects", label: "Projects" },
            { href: "/dashboard/inventory", label: "Inventory" },
            { href: "/dashboard/contracts", label: "Contracts" },
          ].map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={closeMenu}
              style={{ 
                padding: '0.75rem', 
                borderRadius: '4px', 
                display: 'block', 
                textDecoration: 'none', 
                color: '#e5e7eb',
                backgroundColor: pathname === link.href ? '#374151' : 'transparent'
              }}>
              {link.label}
            </Link>
          ))}
          <Link 
            href="/dashboard/settings" 
            onClick={closeMenu}
            style={{ 
              padding: '0.75rem', 
              borderRadius: '4px', 
              display: 'block', 
              textDecoration: 'none', 
              color: '#e5e7eb', 
              marginTop: 'auto',
              backgroundColor: pathname === "/dashboard/settings" ? '#374151' : 'transparent'
            }}>
            Settings
          </Link>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #1f2937', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{userName}</div>
          <div>{userEmail}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="print-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="hide-on-print" style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
          <Link href="/api/auth/signout" style={{ fontSize: '0.875rem', color: '#4b5563', textDecoration: 'none' }}>
            Sign Out
          </Link>
        </header>
        <div className="print-main-content-inner dashboard-main-content" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
