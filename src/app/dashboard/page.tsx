import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  // In a real scenario we'd query actual metrics.
  // For the demo / scaffolding we'll try to query or fallback to 0.
  let customersCount = 0;
  let quotesCount = 0;
  let invoicesCount = 0;

  try {
    customersCount = await prisma.customer.count();
    quotesCount = await prisma.estimate.count();
    invoicesCount = await prisma.invoice.count();
  } catch (e) {
    // If DB is not connected yet, it will fail gracefully
    console.error("DB not connected yet", e);
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>Dashboard General</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ventas del Mes</h2>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginTop: '0.5rem' }}>$0.00</p>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clientes Activos</h2>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginTop: '0.5rem' }}>{customersCount}</p>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cotizaciones Abiertas</h2>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginTop: '0.5rem' }}>{quotesCount}</p>
        </div>

        {/* Card 4 */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Facturas Pendientes</h2>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginTop: '0.5rem' }}>{invoicesCount}</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Gráfico de Ingresos (Espacio Reservado)</p>
      </div>
    </div>
  );
}
