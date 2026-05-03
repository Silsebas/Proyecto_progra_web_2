// src/components/Verificacion2FA.jsx
import React, { useState } from 'react';
import '../styles/Formulario.css';
import BASE_URL from '../config/api';

const Verificacion2FA = ({ email, volverCatalogo, alVerificar }) => {
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarVerificacion = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const respuesta = await fetch(`${BASE_URL}/api/users/verificar-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        // Si la respuesta es ok guardamos el token y los datos en localStorage
        localStorage.setItem('token', datos.usuario.token);
        localStorage.setItem('nombreUsuario', datos.usuario.name);
        localStorage.setItem('idUsuario', datos.usuario.id);
        alVerificar();
      } else {
        alert('Error: ' + (datos.mensaje || 'Código incorrecto'));
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
      alert('Hubo un problema de conexión.');
    } finally {
      setCargando(false);
    }
  };
// Para este no se necesista cargar los datos de google pq ya hizo login
  return (
    <div className="pantalla-completa">
      <form className="contenedor-formulario" onSubmit={manejarVerificacion}>

        <button type="button" onClick={volverCatalogo} className="btn-back" style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
          ⬅ Volver al Catálogo
        </button>

        <p className="texto-subtitulo">Two-Factor Authentication</p>
        <h1 className="texto-titulo">Check your phone</h1>

        <p style={{ color: '#6c757d', textAlign: 'center', marginBottom: '20px' }}>
          We sent a 6-digit code to your registered phone number. Enter it below to continue.
        </p>

        <div className="grupo-input">
          <label className="label-input">Verification Code</label>
          <div className="contenedor-input-icono">
            <input
              type="text"
              className="input-estilizado"
              placeholder="123456"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              maxLength={6}
              required
            />
          </div>
        </div>

        <button type="submit" className="boton-enviar" disabled={cargando}>
          {cargando ? 'Verificando...' : 'Verify Code'}
        </button>

      </form>
    </div>
  );
};

export default Verificacion2FA;