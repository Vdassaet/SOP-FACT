"use client";

export default function MobileInstallerApp() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      {/* Mobile Header */}
      <header style={{ backgroundColor: '#2563eb', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>NJ FENCE - Field App</h1>
        <div style={{ width: '32px', height: '32px', backgroundColor: 'white', borderRadius: '50%', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          T
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>Mis Trabajos de Hoy</h2>

        {/* Job Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#111827' }}>8:00 AM - 12:00 PM</span>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>En Progreso</span>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#2563eb' }}>Instalación Vinyl 6ft</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1rem 0' }}>📍 123 Main St, Newark, NJ</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: '500', color: '#374151' }}>Ver Planos</button>
            <button style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: '500', color: '#374151' }}>Materiales</button>
            <button style={{ padding: '0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '500', gridColumn: 'span 2' }}>Llegada al Sitio (GPS)</button>
          </div>
        </div>

        {/* Job Card 2 */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#111827' }}>1:00 PM - 5:00 PM</span>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>Programado</span>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#2563eb' }}>Reparación Aluminum Fence</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1rem 0' }}>📍 456 Elm Ave, Jersey City, NJ</p>
        </div>

      </main>

      {/* Bottom Tab Bar */}
      <nav style={{ position: 'fixed', bottom: 0, width: '100%', backgroundColor: 'white', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-around', padding: '0.75rem 0', paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div style={{ textAlign: 'center', color: '#2563eb', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>📋</div>
          <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Agenda</span>
        </div>
        <div style={{ textAlign: 'center', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>📷</div>
          <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Fotos</span>
        </div>
        <div style={{ textAlign: 'center', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>⚙️</div>
          <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Ajustes</span>
        </div>
      </nav>
    </div>
  );
}
