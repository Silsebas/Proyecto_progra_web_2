import React, { useState, useEffect } from 'react';
import '../styles/Inbox.css';
import BASE_URL from '../config/api';

const Inbox = ({ volverCatalogo }) => {
  const [chats, setChats] = useState([]);
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const miId = localStorage.getItem('idUsuario');

  // 1. Cargar todos los chats del usuario
  useEffect(() => {
    const obtenerChats = async () => {
      try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch(`${BASE_URL}/api/chats`, {
          headers: { 'x-auth-token': token }
        });
        const datos = await respuesta.json();
        if (respuesta.ok) {
          setChats(datos);
          // Opcional: Seleccionar el primero por defecto
          if (datos.length > 0) setChatSeleccionado(datos[0]);
        }
      } catch (error) {
        console.error("Error al obtener chats:", error);
      }
    };
    obtenerChats();
  }, []);

  // 2. Función para enviar un mensaje nuevo
  const enviarMensaje = async () => {
    // Validamos que el mensaje no esté vacío y que haya un chat seleccionado
    if (!nuevoMensaje.trim() || !chatSeleccionado) return;

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${BASE_URL}/api/chats/${chatSeleccionado._id}/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          mensajeInicial: nuevoMensaje
        })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        // Actualizamos el chat seleccionado para ver el mensaje nuevo
        setChatSeleccionado(datos);
        // Actualizamos la lista general
        setChats(chats.map(c => c._id === datos._id ? datos : c));
        setNuevoMensaje('');
      } else {
        // Manejamos el error (por ejemplo, la regla de turnos del backend)
        alert(datos.mensaje || "Error al enviar mensaje");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Error de conexión al enviar el mensaje.");
    }
  };

  return (
    <div className="inbox-wrapper">
      <div className="inbox-header">
        <button onClick={volverCatalogo} className="btn-back">⬅ Volver al Catálogo</button>
        <h2>Bandeja de Mensajes</h2>
      </div>

      <div className="inbox-container">
        {/* PANEL IZQUIERDO: Lista de Conversaciones Reales */}
        <aside className="chat-sidebar">
          {chats.map(chat => (
            <div 
              key={chat._id} 
              className={`chat-item ${chatSeleccionado?._id === chat._id ? 'active' : ''}`}
              onClick={() => setChatSeleccionado(chat)}
            >
              <img 
                src={chat.vehiculo.imagenes?.[0] || "https://via.placeholder.com/150"} 
                alt="Auto" 
                className="chat-item-img"
              />
              <div className="chat-item-details">
                <h4>{chat.vehiculo.marca} {chat.vehiculo.modelo}</h4>
                {/* Comparación de ID segura para mostrar Comprador o Vendedor */}
                <p>{String(miId) === String(chat.vendedor._id) ? `Comprador: ${chat.comprador?.name}` : `Vendedor: ${chat.vendedor?.name}`}</p>
              </div>
            </div>
          ))}
        </aside>

        {/* PANEL DERECHO: El Chat Activo */}
        <main className="chat-window">
          {chatSeleccionado ? (
            <>
              <div className="chat-messages">
                {chatSeleccionado.mensajes.map((m, index) => (
                  /* Comparamos el emisor con miId para decidir si el mensaje es 'sent' o 'received' */
                  <div key={index} className={`message ${m.esOrdenCompra ? 'system-message' : (String(m.emisor) === String(miId) ? 'sent' : 'received')}`}>
                    <div className={m.esOrdenCompra ? "system-box" : "message-bubble"}>
                      {m.esOrdenCompra && <span className="system-icon">🛒</span>}
                      <p>{m.texto}</p>
                      {!m.esOrdenCompra && <span className="message-time">{new Date(m.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input-area">
                <input 
                  type="text" 
                  placeholder="Escribe un mensaje..." 
                  className="chat-input" 
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                />
                <button className="btn-send" onClick={enviarMensaje}>Enviar</button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">Selecciona una conversación para empezar</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Inbox;