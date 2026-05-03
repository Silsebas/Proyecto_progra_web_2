import React, { useState } from 'react';
import '../styles/PublicarAuto.css';
import BASE_URL from '../config/api';

//Recibimos autoAEditar como prop
const PublicarAuto = ({ volverCatalogo, autoAEditar }) => {
  // Si autoAEditar existe, cargamos sus valores iniciales
  const [marca, setMarca] = useState(autoAEditar ? autoAEditar.marca : '');
  const [modelo, setModelo] = useState(autoAEditar ? autoAEditar.modelo : '');
  const [anio, setAnio] = useState(autoAEditar ? autoAEditar.anio : '');
  const [precio, setPrecio] = useState(autoAEditar ? autoAEditar.precio : '');
  const [kilometraje, setKilometraje] = useState(autoAEditar ? autoAEditar.kilometraje : '');
  const [motor, setMotor] = useState(autoAEditar ? autoAEditar.motor : '');
  const [combustible, setCombustible] = useState(autoAEditar ? autoAEditar.combustible : 'Gasolina');
  const [transmision, setTransmision] = useState(autoAEditar ? autoAEditar.transmision : 'Manual');
  const [descripcion, setDescripcion] = useState(autoAEditar ? autoAEditar.descripcion : '');
  const [imagen, setImagen] = useState(null);

  const manejarEnvio = async (e) => {
    e.preventDefault(); 
    const token = localStorage.getItem('token');// Verificamos que el usuario esté logueado antes de permitir publicar o editar
    
    if (!token) {
      alert('¡Debes iniciar sesión para poder publicar un auto!');
      return; 
    }

    // 3. Empacamos todo en un FormData
    const formData = new FormData();
    formData.append('marca', marca);
    formData.append('modelo', modelo);
    formData.append('anio', anio);
    formData.append('precio', precio);
    formData.append('kilometraje', kilometraje);
    formData.append('motor', motor);
    formData.append('combustible', combustible);
    formData.append('transmision', transmision);
    formData.append('descripcion', descripcion);
    
    if (imagen) {
      formData.append('imagen', imagen); 
    }

    try {
      // Lógica dinámica de URL y Método
      const metodo = autoAEditar ? 'PUT' : 'POST';
      const url = autoAEditar 
        ? `${BASE_URL}/api/vehicles/${autoAEditar._id}` 
        : `${BASE_URL}/api/vehicles`;

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          'x-auth-token': token // Solo el token en el header, el body es FormData
          // NOTA: No ponemos 'Content-Type' porque el navegador lo asigna automáticamente al usar FormData
        },
        body: formData
      });

      if (respuesta.ok) {
        alert(autoAEditar ? '¡Vehículo actualizado!' : '¡Vehículo publicado con éxito!');// Si la respuesta es exitosa, volvemos al catálogo
        volverCatalogo(); 
      } else {
        const datos = await respuesta.json();
        alert('Error: ' + (datos.mensaje || 'Hubo un problema'));
      }
    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="publicar-pantalla">
      <div className="publicar-contenedor">
        <button type="button" onClick={volverCatalogo} className="btn-back">
          ⬅ Volver al Catálogo
        </button>

        {/* COORDENADA: Título dinámico */}
        <h2>{autoAEditar ? 'Editar Vehículo' : 'Publicar Nuevo Vehículo'}</h2>
        <p>{autoAEditar ? 'Modifica los datos de tu auto.' : 'Ingresa los detalles del auto que deseas vender.'}</p>

        <form onSubmit={manejarEnvio} className="formulario-grid">
          <div className="campo">
            <label>Marca</label>
            <input type="text" placeholder="Ej. Toyota" required value={marca} onChange={(e) => setMarca(e.target.value)} />
          </div>

          <div className="campo">
            <label>Modelo</label>
            <input type="text" placeholder="Ej. Hilux" required value={modelo} onChange={(e) => setModelo(e.target.value)} />
          </div>

          <div className="campo">
            <label>Año</label>
            <input type="number" placeholder="Ej. 2021" required value={anio} onChange={(e) => setAnio(e.target.value)} />
          </div>

          <div className="campo">
            <label>Precio ($)</label>
            <input type="number" placeholder="Ej. 25000" required value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </div>

          <div className="campo">
            <label>Kilometraje (km)</label>
            <input type="number" placeholder="Ej. 45000" required value={kilometraje} onChange={(e) => setKilometraje(e.target.value)} />
          </div>

          <div className="campo">
            <label>Motor / Cilindraje</label>
            <input type="text" placeholder="Ej. 2.8L" required value={motor} onChange={(e) => setMotor(e.target.value)} />
          </div>

          <div className="campo">
            <label>Combustible</label>
            <select value={combustible} onChange={(e) => setCombustible(e.target.value)}>
              <option value="Gasolina">Gasolina</option>
              <option value="Diesel">Diesel</option>
              <option value="Eléctrico">Eléctrico</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          <div className="campo">
            <label>Transmisión</label>
            <select value={transmision} onChange={(e) => setTransmision(e.target.value)}>
              <option value="Manual">Manual</option>
              <option value="Automática">Automática</option>
            </select>
          </div>

          <div className="campo descripcion-auto">
            <label>Descripción</label>
            <textarea rows="4" placeholder="Describe el estado del auto..." required value={descripcion} onChange={(e) => setDescripcion(e.target.value)}></textarea>
          </div>

          <div className="campo descripcion-auto">
            <label>Foto (Opcional si ya tiene)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImagen(e.target.files[0])} 
              style={{ padding: '10px 0' }}
            />
          </div>

          <button type="submit" className="btn-publicar">
            {autoAEditar ? 'Guardar Cambios' : 'Publicar Vehículo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicarAuto;