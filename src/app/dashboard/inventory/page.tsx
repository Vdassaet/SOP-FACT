import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function InventoryPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
  } catch(e) {
    console.error(e);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Inventario y Materiales</h1>
        <Link 
          href="/dashboard/inventory/new" 
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}
        >
          + Agregar Producto
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Material / Producto</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>SKU</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Categoría</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Costo Unitario</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Stock Actual</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  El inventario está vacío o la BD no está conectada.
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>{prod.name}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{prod.sku || '-'}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{prod.category}</td>
                  <td style={{ padding: '1rem', color: '#111827' }}>${prod.costPrice?.toString()}</td>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: 'bold' }}>{prod.quantity}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      backgroundColor: prod.quantity <= prod.minLevel ? '#fee2e2' : '#dcfce7', 
                      color: prod.quantity <= prod.minLevel ? '#991b1b' : '#166534', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '500' 
                    }}>
                      {prod.quantity <= prod.minLevel ? 'Stock Bajo' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
