"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditCustomerForm({ customer }: { customer: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: customer.name || "",
    email: customer.email || "",
    phone: customer.phone || "",
    company: customer.company || "",
    address: customer.address || ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push(`/dashboard/crm/${customer.id}`);
        router.refresh();
      } else {
        alert("Error al actualizar cliente");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>Editar Perfil de {customer.name}</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Nombre Completo *</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Email *</label>
            <input 
              type="email" 
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Teléfono</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Empresa (Opcional)</label>
            <input 
              type="text" 
              name="company"
              value={formData.company}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Dirección Principal</label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical' }}
            />
          </div>

        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={() => router.back()}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', border: '1px solid #d1d5db', borderRadius: '4px', color: '#374151', cursor: 'pointer', fontWeight: '500' }}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}
          >
            {loading ? 'Guardando...' : 'Actualizar Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
