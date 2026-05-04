// src/components/FormularioRegistro.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Formulario.css'; 
import BASE_URL from '../config/api'; 
import { FiMail, FiLock, FiEyeOff, FiUser, FiCreditCard, FiPhone } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';


const FormularioRegistro = ({ cambiarVista, volverCatalogo }) => {
  // Estados para guardar lo que el usuario escriba en los campos
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargandoPadron, setCargandoPadron] = useState(false);
  const [telefono, setTelefono] = useState('');
  const location = useLocation();
  

  // EFECTO Capturar datos de Google desde la URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailGoogle = params.get('email');
        const nameGoogle = params.get('name');

        if (emailGoogle) setEmail(decodeURIComponent(emailGoogle));
        if (nameGoogle) setNombre(decodeURIComponent(nameGoogle));
    }, [location.search]);

  // FUNCIÓN para Consultar el API de PHP del Padrón
  const consultarPadron = async () => {
    if (cedula.length !== 9) return; 

    setCargandoPadron(true);
    try {
      const respuesta = await fetch(`http://localhost/padron/cedula/${cedula}`);
      const datos = await respuesta.json();

      if (datos.nombre) {
        const nombreOficial = `${datos.nombre} ${datos.apellidoPaterno} ${datos.apellidoMaterno}`;
        setNombre(nombreOficial);
      } else {
        alert('La cédula no se encuentra en el padrón electoral.');
        setNombre('');
      }
    } catch (error) {
      console.error('Error al consultar padrón:', error);
      alert('No se pudo conectar con el servicio de validación.');
    } finally {
      setCargandoPadron(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault(); 
    if (!nombre) return alert('Se debe usar una cédula real.');

    try {
      const respuesta = await fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nombre, email, password, cedula, telefono }), 
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        alert('¡Usuario registrado con éxito!');
        // Se limpian todos los campos del formulario
        setNombre(''); setCedula(''); setEmail(''); setPassword(''); setTelefono('');
        cambiarVista(); 
      } else {
        alert('Error: ' + (datos.mensaje || 'No se pudo registrar'));
      }
    } catch (error) {
      alert('Hubo un problema de conexión con el Backend.');
    }
  };

  return (
    <div className="pantalla-completa">
      <form className="contenedor-formulario" onSubmit={manejarEnvio}>
        <button type="button" onClick={volverCatalogo} className="btn-back" style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
          ⬅ Volver al Catálogo
        </button>

        <p className="texto-subtitulo">Start your journey</p>
        <h1 className="texto-titulo">Sign Up to InsideBox</h1> 

        {/* Campo para la Cédula */}
        <div className="grupo-input">
          <label className="label-input">Identification (9 digits)</label>
          <div className="contenedor-input-icono">
            <FiCreditCard className="icono-input" /> 
            <input 
              type="text" 
              className="input-estilizado" 
              placeholder="Ej. 111110222"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              onBlur={consultarPadron} 
              required 
            />
          </div>
          {cargandoPadron && <small style={{color: '#3498db'}}>Verificando en el padrón...</small>}
        </div>

        {/* Campo para el Nombre*/}
        <div className="grupo-input">
          <label className="label-input">Official Name (From Padron)</label>
          <div className="contenedor-input-icono">
            <FiUser className="icono-input" /> 
            <input 
              type="text" 
              className="input-estilizado" 
              placeholder="Name will appear here"
              value={nombre}
              readOnly 
              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
              required 
            />
          </div>
        </div>

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
          </div>
        </div>

        {/* Campo para el Teléfono */}
        <div className="grupo-input">
          <label className="label-input">Phone Number</label>
          <div className="contenedor-input-icono">
            <FiPhone className="icono-input" />
            <input
              type="tel"
              className="input-estilizado"
              placeholder="+50688887777"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="boton-enviar">Sign Up</button> 

        {/* Botón de Google */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p className="texto-subtitulo">Or register with</p>
          <a 
            href={`${BASE_URL}/api/users/auth/google`} 
            className="boton-enviar" 
            style={{ 
                backgroundColor: '#ffffff', color: '#444', border: '1px solid #ddd', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '12px', textDecoration: 'none', fontWeight: 'bold', marginTop: '10px'
            }}
          >
            <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" style={{ width: '20px' }} 
            />
            Continue with Google
          </a>
        </div>

        <div className="contenedor-enlace">
          <p>Already have an account? <span className="texto-enlace" onClick={cambiarVista} style={{cursor: 'pointer'}}>Sign In</span></p>
        </div>
      </form>
    </div>
  );
};

export default FormularioRegistro;