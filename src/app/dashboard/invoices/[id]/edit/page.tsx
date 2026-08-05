"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type Item = {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [formData, setFormData] = useState({
    customerId: "",
    dueDate: "",
    status: "UNPAID"
  });
  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [items, setItems] = useState<Item[]>([]);
  const [taxRate, setTaxRate] = useState(6.625); // Default NJ tax

  useEffect(() => {
    if (invoiceId) {
      fetch(`/api/invoices/${invoiceId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setFormData({
              customerId: data.customerId || "",
              dueDate: data.dueDate ? data.dueDate.split('T')[0] : "",
              status: data.status || "UNPAID"
            });
            setCustomerName(data.customer?.name || "Unknown");
            setInvoiceNumber(data.number);
            
            // Derive tax rate if possible, else stick to 6.625
            if (data.subtotal > 0 && data.tax > 0) {
                setTaxRate((data.tax / data.subtotal) * 100);
            }
            
            if (data.items && data.items.length > 0) {
              setItems(data.items.map((i: any) => ({
                name: i.name,
                description: i.description || "",
                quantity: i.quantity,
                unitPrice: i.unitPrice
              })));
            } else {
              setItems([{ name: "", description: "", quantity: 1, unitPrice: 0 }]);
            }
          }
          setInitialLoad(false);
        })
        .catch(err => {
          console.error(err);
          setInitialLoad(false);
        });
    }
  }, [invoiceId]);

  const handleItemChange = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: "", description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items,
          subtotal,
          tax,
          total
        })
      });
      if (res.ok) {
        router.push(`/dashboard/invoices/${invoiceId}`);
        router.refresh();
      } else {
        alert('Error updating invoice');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating invoice');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Edit Invoice {invoiceNumber}</h1>
        <span style={{ fontSize: '1.125rem', color: '#6b7280' }}>Customer: <span style={{ color: '#111827', fontWeight: '500' }}>{customerName}</span></span>
      </div>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        {/* Header Details */}
        <div className="grid-responsive" style={{ gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Due Date</label>
            <input 
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            >
              <option value="UNPAID">UNPAID</option>
              <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
              <option value="PAID">PAID</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Line Items */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Line Items</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '500' }}>Item Name</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '500' }}>Description</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '500', width: '100px' }}>Qty</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500', width: '150px' }}>Unit Price ($)</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500', width: '150px' }}>Total</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem' }}>
                  <input type="text" required value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input type="number" min="1" required value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', textAlign: 'center' }} />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input type="number" min="0" step="0.01" required value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', textAlign: 'right' }} />
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500' }}>
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" onClick={addItem} style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '2rem' }}>
          + Add Item
        </button>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: '300px', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#4b5563' }}>Subtotal:</span>
              <span style={{ fontWeight: '500' }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ color: '#4b5563' }}>Tax Rate (%):</span>
              <input type="number" step="0.001" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} style={{ width: '80px', padding: '0.25rem', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#4b5563' }}>Tax:</span>
              <span style={{ fontWeight: '500' }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Total:</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={() => router.back()}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontWeight: '500' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '500' }}
          >
            {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
