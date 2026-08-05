"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "VINYL_FENCE",
    supplier: "",
    cost: "0",
    salePrice: "0",
    stock: "0",
    minLevel: "10"
  });

  const categories = [
    "VINYL_FENCE", "ALUMINUM_FENCE", "WOOD", "POSTS", "RAILS", "HARDWARE", "GATES", "TOOLS"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push('/dashboard/inventory');
      } else {
        alert('Error saving product');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Agregar Material a Inventario</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div className="grid-responsive" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Nombre del Material / Producto</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Código SKU</label>
            <input 
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({...formData, sku: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
        </div>

        <div className="grid-responsive" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Categoría</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            >
              {categories.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Proveedor (Opcional)</label>
            <input 
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
        </div>

        <div className="grid-responsive" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Costo (USD)</label>
            <input 
              required
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Precio Venta Sugerido (USD)</label>
            <input 
              required
              type="number"
              step="0.01"
              value={formData.salePrice}
              onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
        </div>

        <div className="grid-responsive" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Stock Inicial</label>
            <input 
              required
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Nivel Mínimo (Alerta)</label>
            <input 
              required
              type="number"
              value={formData.minLevel}
              onChange={(e) => setFormData({...formData, minLevel: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Link 
            href="/dashboard/inventory"
            style={{ padding: '0.75rem 1.5rem', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontWeight: '500', textDecoration: 'none', color: 'black' }}
          >
            Cancelar
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Guardando...' : 'Guardar Material'}
          </button>
        </div>
      </form>
    </div>
  );
}
