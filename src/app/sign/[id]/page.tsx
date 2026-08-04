"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export default function SignaturePage() {
  const params = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
      }
    }
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    
    const rect = canvas.getBoundingClientRect();
    if ("touches" in event) {
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top,
      };
    }
    return {
      offsetX: (event as React.MouseEvent).nativeEvent.offsetX,
      offsetY: (event as React.MouseEvent).nativeEvent.offsetY,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const { offsetX, offsetY } = getCoordinates(event);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault(); // Prevent scrolling on mobile
    const { offsetX, offsetY } = getCoordinates(event);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSubmit = async () => {
    if (!signerName) {
      alert("Por favor ingrese su nombre completo.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL("image/png");

    // Verificar si el canvas está vacío (simplificado, asume que toDataURL genera algo de tamaño si dibujaron)
    if (signatureData.length < 5000) {
       alert("Por favor dibuje su firma.");
       return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/sign/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData, signerName })
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '400px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534', marginBottom: '1rem' }}>Contrato Firmado</h1>
          <p style={{ color: '#4b5563' }}>Gracias por confiar en NJ FENCE. Hemos registrado su firma exitosamente. Recibirá una copia del documento en breve.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Firma de Contrato</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>ID: {params.id}</p>
        </div>
        
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
              Al firmar este documento electrónico, usted acepta los términos y condiciones estipulados en su cotización y contrato de instalación con NJ FENCE AND RAILING.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Nombre Completo del Firmante</label>
            <input 
              type="text" 
              placeholder="Ej. John Doe"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              <span>Firma (Dibuje aquí)</span>
              <button onClick={clearCanvas} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}>Limpiar</button>
            </label>
            <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', touchAction: 'none' }}>
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                style={{ width: '100%', height: '200px', cursor: 'crosshair' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', padding: '1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Procesando...' : 'Aceptar y Firmar Contrato'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' }}>
            Se registrará su IP y marca de tiempo por seguridad.
          </p>
        </div>
      </div>
    </div>
  );
}
