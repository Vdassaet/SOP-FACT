import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function PaymentsPage() {
  let payments: any[] = [];
  try {
    payments = await prisma.payment.findMany({
      include: { invoice: { include: { customer: true } } },
      orderBy: { date: 'desc' }
    });
  } catch(e) {
    console.error(e);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Pagos Recibidos</h1>
        <button 
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', fontWeight: '500', cursor: 'pointer' }}
        >
          + Registrar Pago Manual
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Fecha</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Cliente</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Factura Relacionada</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Método</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Monto</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Referencia</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No hay pagos registrados o DB no conectada.
                </td>
              </tr>
            ) : (
              payments.map((pay) => (
                <tr key={pay.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(pay.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>{pay.invoice?.customer?.name || '-'}</td>
                  <td style={{ padding: '1rem', color: '#2563eb' }}>
                    <Link href={`/dashboard/invoices/${pay.invoiceId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {pay.invoice?.number}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{pay.paymentMethod}</td>
                  <td style={{ padding: '1rem', color: '#166534', fontWeight: '600' }}>+${pay.amount?.toString()}</td>
                  <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>{pay.reference || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
