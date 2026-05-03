import React from 'react';
import BASE_URL from '../config/api';

// COORDENADA: Argumentos de la función (Agregamos prepararEdicion)
const DetalleAuto = ({ auto, volverCatalogo, irAInbox, prepararEdicion }) => { 
  if (!auto) return <div>Cargando detalles...</div>;

  const miId = localStorage.getItem('idUsuario');
  const idVendedor = auto.vendedor?._id || auto.vendedor;
  const esMiAuto = miId && idVendedor && String(miId) === String(idVendedor);

  // 1. FUNCIÓN: Para marcar como vendido
  const marcarComoVendido = async () => {
    if (!window.confirm("¿Estás seguro de que quieres marcar este vehículo como VENDIDO?")) return;

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${BASE_URL}/api/vehicles/${auto._id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ estado: 'vendido' })
      });

      if (respuesta.ok) {
        alert("¡Felicidades por la venta!");
        volverCatalogo();
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  // 2. FUNCIÓN: Para eliminar el vehículo
  const eliminarVehiculoReal = async () => {
    if (!window.confirm("¿ESTÁS SEGURO? Esta acción eliminará el vehículo permanentemente y no se puede deshacer.")) return;

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${BASE_URL}/api/vehicles/${auto._id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (respuesta.ok) {
        alert("Vehículo eliminado correctamente.");
        volverCatalogo(); 
      } else {
        alert("No se pudo eliminar el vehículo.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error de conexión al intentar eliminar.");
    }
  };

  return (
    <div className="detalle-pantalla" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={volverCatalogo} className="btn-back" style={{ marginBottom: '20px' }}>
        ⬅ Volver al Catálogo
      </button>

      <div style={{ display: 'flex', gap: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        
        <div style={{ flex: '1', position: 'relative' }}>
          {auto.estado === 'vendido' && (
            <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'black', color: 'white', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold', zIndex: 1 }}>
              VENDIDO
            </div>
          )}
          <img 
            src={auto.imagenes && auto.imagenes.length > 0 ? auto.imagenes[0] : "https://via.placeholder.com/800x500?text=Sin+Imagen"} 
            alt={`${auto.marca} ${auto.modelo}`} 
            style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', opacity: auto.estado === 'vendido' ? 0.5 : 1 }} 
          />
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2>{auto.marca} {auto.modelo} {auto.anio}</h2>
          <h1 style={{ color: '#2e7d32', fontSize: '2.5rem', margin: '10px 0' }}>
            ${auto.precio.toLocaleString()}
          </h1>
          
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
            <li><strong>Kilometraje:</strong> {auto.kilometraje} km</li>
            <li><strong>Motor:</strong> {auto.motor}</li>
            <li><strong>Transmisión:</strong> {auto.transmision}</li>
            <li><strong>Combustible:</strong> {auto.combustible}</li>
          </ul>

          <p><strong>Descripción:</strong> {auto.descripcion}</p>
          
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {esMiAuto ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', border: '2px dashed #ccc', textAlign: 'center', borderRadius: '5px' }}>
                  <h3 style={{ color: '#555', margin: 0 }}>Esta es tu publicación</h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#777' }}>
                    Estado actual: <strong>{auto.estado?.toUpperCase() || 'DISPONIBLE'}</strong>
                  </p>
                </div>

                {/* Cambiamos el alert por prepararEdicion */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* 🚩 SOLO mostramos Editar si el estado NO es vendido */}
                  {auto.estado !== 'vendido' && (
                  <button 
                    onClick={() => prepararEdicion(auto)} 
                    style={{ flex: 1, padding: '12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ✏️ Editar
                  </button>
                  )}
                  <button 
                    onClick={eliminarVehiculoReal}
                    style={{ flex: 1, padding: '12px', backgroundColor: '#c0392b', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    🗑️ Eliminar
                  </button>
                </div>
                
                <button 
                  onClick={() => irAInbox('ver')} 
                  style={{ width: '100%', padding: '15px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  📩 Ver Mensajes
                </button>

                {auto.estado !== 'vendido' && (
                  <button 
                    onClick={marcarComoVendido}
                    style={{ width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                    ✅ Marcar como Vendido
                  </button>
                )}
              </div>
            ) : (
              <>
                {auto.estado === 'vendido' ? (
                  <div style={{ padding: '20px', backgroundColor: '#eee', textAlign: 'center', borderRadius: '5px', fontWeight: 'bold', color: '#666' }}>
                    Este vehículo ya no está disponible
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                    <button 
                      onClick={() => irAInbox('comprar')} 
                      style={{ flex: 1, padding: '15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>
                      🛒 Comprar Ahora
                    </button>
                    <button 
                      onClick={() => irAInbox('chatear')} 
                      style={{ flex: 1, padding: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>
                      💬 Chatear con Vendedor
                    </button>
                  </div>
                )}
              </>
            )}
           {/* Sección de Compartir al final de la columna derecha */}
            <div style={{ marginTop: '20px', padding: '15px', borderTop: '1px solid #eee' }}>
              <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>🔗 Compartir este vehículo:</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/vehicles/${auto._id}`} 
                  style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9', fontSize: '0.8rem' }}
                />
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/vehicles/${auto._id}`;
                    navigator.clipboard.writeText(url);
                    alert("¡Enlace copiado al portapapeles!");
                  }}
                  style={{ padding: '8px 12px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Copiar
                </button>
              </div>
            </div> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleAuto;