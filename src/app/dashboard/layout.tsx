import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar */}
      <aside style={{ width: '256px', backgroundColor: '#111827', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #1f2937' }}>
          NJ FENCE
        </div>
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/dashboard" style={{ padding: '0.75rem', borderRadius: '4px', display: 'block', textDecoration: 'none', color: '#e5e7eb' }}>
            Dashboard
          </Link>
          <Link href="/dashboard/crm" style={{ padding: '0.75rem', borderRadius: '4px', display: 'block', textDecoration: 'none', color: '#e5e7eb' }}>
            Clientes
          </Link>
          <Link href="/dashboard/estimates" style={{ padding: '0.75rem', borderRadius: '4px', display: 'block', textDecoration: 'none', color: '#e5e7eb' }}>
            Cotizaciones
          </Link>
          <Link href="/dashboard/invoices" style={{ padding: '0.75rem', borderRadius: '4px', display: 'block', textDecoration: 'none', color: '#e5e7eb' }}>
            Facturas
          </Link>
          <Link href="/dashboard/payments" style={{ padding: '0.75rem', borderRadius: '4px', display: 'block', textDecoration: 'none', color: '#e5e7eb' }}>
            Pagos
          </Link>
          <Link href="/dashboard/projects" style={{ padding: '0.75rem', borderRadius: '4px', display: 'block', textDecoration: 'none', color: '#e5e7eb' }}>
            Proyectos
          </Link>
          <Link href="/dashboard/inventory" style={{ padding: '0.75rem', borderRadius: '4px', display: 'block', textDecoration: 'none', color: '#e5e7eb' }}>
            Inventario
          </Link>
          <Link href="/dashboard/contracts" style={{ padding: '0.75rem', borderRadius: '4px', display: 'block', textDecoration: 'none', color: '#e5e7eb' }}>
            Contratos
          </Link>
          <Link href="/dashboard/settings" style={{ padding: '0.75rem', borderRadius: '4px', display: 'block', textDecoration: 'none', color: '#e5e7eb', marginTop: 'auto' }}>
            Configuración
          </Link>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #1f2937', fontSize: '0.875rem' }}>
          {session.user?.email}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 2rem', justifyContent: 'flex-end' }}>
          <Link href="/api/auth/signout" style={{ fontSize: '0.875rem', color: '#4b5563', textDecoration: 'none' }}>
            Cerrar Sesión
          </Link>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
