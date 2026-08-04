"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Item = {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    dueDate: "",
  });
  const [selectedEstimateId, setSelectedEstimateId] = useState("");
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Transfer");

  const [items, setItems] = useState<Item[]>([
    { name: "", description: "", quantity: 1, unitPrice: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(6.625); // Default NJ tax

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setCustomers(data); })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (formData.customerId) {
      fetch(`/api/estimates?customerId=${formData.customerId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setEstimates(data);
          }
        })
        .catch(err => console.error(err));
    } else {
      setEstimates([]);
      setSelectedEstimateId("");
    }
  }, [formData.customerId]);

  const handleEstimateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const estId = e.target.value;
    setSelectedEstimateId(estId);
    if (estId) {
      const est = estimates.find(e => e.id === estId);
      if (est && est.items && est.items.length > 0) {
        setItems(est.items.map((i: any) => ({
          name: i.name,
          description: i.description || "",
          quantity: i.quantity,
          unitPrice: i.unitPrice
        })));
      }
    }
  };

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
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimateId: selectedEstimateId,
          depositAmount,
          paymentMethod,
          items,
          subtotal,
          tax,
          total
        })
      });
      if (res.ok) {
        router.push('/dashboard/invoices');
      } else {
        alert('Error creating invoice');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Create New Invoice</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        {/* Header Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Customer</label>
              <select 
                required
                value={formData.customerId}
                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="">Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
            </div>
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
          </div>
          
          {estimates.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Based on Estimate (Optional)</label>
              <select 
                value={selectedEstimateId}
                onChange={handleEstimateChange}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="">-- Select an Estimate to auto-fill --</option>
                {estimates.map(e => (
                  <option key={e.id} value={e.id}>{e.number} - ${e.total?.toFixed(2)} - {new Date(e.date).toLocaleDateString()}</option>
                ))}
              </select>
            </div>
          )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #e5e7eb', paddingTop: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Total:</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>${total.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>Deposit / Paid:</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.25rem' }}>$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  max={total}
                  value={depositAmount} 
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)} 
                  style={{ width: '80px', padding: '0.25rem', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#111827' }}>Balance Due:</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#111827' }}>${Math.max(0, total - depositAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        {depositAmount > 0 && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <p style={{ fontWeight: '500', marginBottom: '1rem', color: '#166534' }}>
              Recording a payment of ${depositAmount.toFixed(2)}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Payment Method:</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Transfer">Transfer</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>
        )}

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
            {loading ? 'Saving...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
