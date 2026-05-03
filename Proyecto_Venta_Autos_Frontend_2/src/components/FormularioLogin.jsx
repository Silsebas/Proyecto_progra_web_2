// src/components/FormularioLogin.jsx
import React, { useState } from 'react';
import '../styles/Formulario.css'; 
import { FiMail, FiLock, FiEyeOff } from 'react-icons/fi';
import BASE_URL from '../config/api';

const FormularioLogin = ({ cambiarVista, volverCatalogo }) => {
  // 1. Estados para guardar el correo y la contraseña
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. Función para conectar con el backend
  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    try {
      const respuesta = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), 
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        alert('¡Login exitoso! Bienvenido');
        console.log('Token recibido:', datos.usuario.token); 

        // MICRÓFONO 1: Ver qué nos dio el backend
        //console.log("TOKEN RECIBIDO DEL BACKEND EXACTAMENTE ASÍ:", datos.usuario.token);
        //console.log("USUARIO RECIBIDO DEL BACKEND EXACTAMENTE ASÍ:", datos.usuario.name);

        // Guardamos el token y el usuario en la memoria del navegador
        localStorage.setItem('token', datos.usuario.token);
        localStorage.setItem('nombreUsuario', datos.usuario.name);
        localStorage.setItem('idUsuario', datos.usuario.id);

        // Limpiamos los campos
        setEmail('');
        setPassword('');
        
        // Si el login es correcto, lo mandamos al catálogo automáticamente
        volverCatalogo(); 
      } else {
        alert('Error: ' + (datos.mensaje || 'Credenciales incorrectas o usuario no registrado'));
      }

    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      alert('Hubo un problema de conexión con el Backend.');
    }
  };

  // 3. Lo que dibujamos en pantalla
  return (
    <div className="pantalla-completa">
      <form className="contenedor-formulario" onSubmit={manejarEnvio}>
        
        {/* BOTÓN PARA VOLVER AL CATÁLOGO */}
        <button type="button" onClick={volverCatalogo} className="btn-back" style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
          ⬅ Volver al Catálogo
        </button>

        <p className="texto-subtitulo">Welcome back</p>
        <h1 className="texto-titulo">Sign In to InsideBox</h1> 

        {/* Campo para el Correo */}
        <div className="grupo-input">
          <label className="label-input">E-mail</label> 
          <div className="contenedor-input-icono">
            <FiMail className="icono-input" />
            <input 
              type="email" 
              className="input-estilizado" 
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
        </div>

        {/* Campo para la Contraseña */}
        <div className="grupo-input">
          <label className="label-input">Password</label>
          <div className="contenedor-input-icono">
            <FiLock className="icono-input" />
            <input 
              type="password" 
              className="input-estilizado" 
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <FiEyeOff style={{position: 'absolute', right: '15px', color: '#adb5bd', cursor: 'pointer'}} />
          </div>
        </div>

       <button type="submit" className="boton-enviar">Sign In</button>

        {/* Separador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
          <hr style={{ flex: 1, borderColor: '#dee2e6' }} />
          <span style={{ color: '#adb5bd', fontSize: '0.85rem' }}>o</span>
          <hr style={{ flex: 1, borderColor: '#dee2e6' }} />
        </div>

        {/* Botón de Google */}
        <a
          href={`${BASE_URL}/api/users/auth/google`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '12px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            backgroundColor: 'white',
            color: '#333',
            fontWeight: '600',
            textDecoration: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: '20px' }}
          />
          Continue with Google
        </a>

        <div className="contenedor-enlace">
          <p>Don't have an account? <span className="texto-enlace" onClick={cambiarVista} style={{cursor: 'pointer'}}>Sign Up</span></p>
        </div>

      </form>
    </div>
  );
};

export default FormularioLogin;