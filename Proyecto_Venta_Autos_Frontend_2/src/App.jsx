// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import FormularioLogin from './components/FormularioLogin';
import FormularioRegistro from './components/FormularioRegistro';
import Catalog from './components/Catalog';
import PublicarAuto from './components/PublicarAuto';
import DetalleAuto from './components/DetalleAuto';
import Inbox from './components/Inbox';
import BASE_URL from './config/api';
import Verificacion2FA from './components/Verificacion2FA';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [autoSeleccionado, setAutoSeleccionado] = useState(null);
  const [autoAEditar, setAutoAEditar] = useState(null);

  // EFECTO PARA CAPTURAR RESPUESTA DE GOOGLE OAUTH
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenGoogle = params.get('token');
    const nombreGoogle = params.get('nombre');
    const emailNuevo = params.get('email');
    const [email2FA, setEmail2FA] = useState('');

    if (tokenGoogle) {
      localStorage.setItem('token', tokenGoogle);
      localStorage.setItem('nombreUsuario', nombreGoogle);
      navigate('/', { replace: true });
    } else if (emailNuevo) {
      navigate('/registro', { replace: false });
    }
  }, []);

  // Función para activar la edición
  const prepararEdicion = (auto) => {
    setAutoAEditar(auto);
    navigate('/publicar');
  };

  // Función para manejar compras y chats
  const manejarAccionAuto = async (accion) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert("Debes iniciar sesión o registrarte para poder comprar o chatear.");
      navigate('/login');
      return;
    }

    if (accion === 'ver') {
      navigate('/inbox');
      return;
    }

    const esOrden = accion === 'comprar';
    const mensajeInicial = esOrden
      ? `¡Hola! He generado una orden de compra por el ${autoSeleccionado.marca} ${autoSeleccionado.modelo}.`
      : `¡Hola! Estoy interesado en tu ${autoSeleccionado.marca} ${autoSeleccionado.modelo}. ¿Sigue disponible?`;

    try {
      const respuesta = await fetch(`${BASE_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          vehiculoId: autoSeleccionado._id,
          vendedorId: autoSeleccionado.vendedor._id || autoSeleccionado.vendedor,
          mensajeInicial,
          esOrden,
          soloAbrir: true
        })
      });

      const datos = await respuesta.json();

      if (respuesta.ok || respuesta.status === 400) {
        navigate('/inbox');
      } else {
        alert("Error al iniciar chat: " + (datos.mensaje || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error en la conexión:", error);
      alert("Hubo un problema de conexión con el servidor.");
    }
  };

  return (
    <Routes>
      <Route path="/" element={
        <Catalog
          irALogin={() => navigate('/login')}
          irARegistro={() => navigate('/registro')}
          irAPublicar={() => navigate('/publicar')}
          verDetalles={(auto) => {
            setAutoSeleccionado(auto);
            navigate(`/vehicles/${auto._id}`);
          }}
        />
      } />

      <Route path="/vehicles/:id" element={
        <DetalleAuto
          auto={autoSeleccionado}
          volverCatalogo={() => navigate('/')}
          irAInbox={manejarAccionAuto}
          prepararEdicion={prepararEdicion}
        />
      } />

      <Route path="/login" element={
        <FormularioLogin
          cambiarVista={() => navigate('/registro')}
          volverCatalogo={() => navigate('/')}
          alRequerir2FA={(email) => {
            setEmail2FA(email);
            navigate('/verificar');
          }}
        />
      } />

      <Route path="/verificar" element={
        <Verificacion2FA
          email={email2FA}
          volverCatalogo={() => navigate('/')}
          alVerificar={() => navigate('/')}
        />
      } />

      <Route path="/registro" element={
        <FormularioRegistro
          cambiarVista={() => navigate('/login')}
          volverCatalogo={() => navigate('/')}
        />
      } />

      <Route path="/publicar" element={
        <PublicarAuto
          volverCatalogo={() => {
            setAutoAEditar(null);
            navigate('/');
          }}
          autoAEditar={autoAEditar}
        />
      } />

      <Route path="/inbox" element={
        <Inbox volverCatalogo={() => navigate('/')} />
      } />
    </Routes>
  );
}

export default App;