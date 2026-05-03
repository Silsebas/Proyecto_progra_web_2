import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import VehicleCard from './VehicleCard';
import '../styles/catalog.css';
import BASE_URL from '../config/api';

const Catalog = ({ irALogin, irARegistro, irAPublicar, verDetalles }) => {
  // 1. Creamos un espacio en la memoria para guardar los autos que vengan del backend
  const [vehiculos, setVehiculos] = useState([]);

  // 2. Creamos un estado para manejar la paginación 
  const [paginacion, setPaginacion] = useState({ actual: 1, total: 1 });

  // Revisamos si hay un token guardado para saber si el usuario está logueado
  const token = localStorage.getItem('token');
  const nombreUsuario = localStorage.getItem('nombreUsuario');

  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('token'); // Borramos el carnet
    localStorage.removeItem('nombreUsuario'); // Borramos el nombre del usuario
    localStorage.removeItem('idUsuario'); // Borramos el ID del usuario
    window.location.reload(); // Recargamos la página para actualizar los botones
  };

  // 2. Usamos useEffect para ir a buscar los autos apenas cargue la página
  //Sacamos la función afuera para que el Sidebar pueda usarla
  // Ahora acepta un objeto de "filtros"
  const obtenerAutos = async (filtros = {}) => {
    try {
      // Convertimos el objeto {marca: 'Toyota'} en texto '?marca=Toyota'
      const queryParams = new URLSearchParams(filtros).toString();
      
      const respuesta = await fetch(`${BASE_URL}/api/vehicles`);
      const datos = await respuesta.json();
      
      // Ajustamos la lectura porque ahora el backend responde con un objeto
      const listaReal = datos.vehiculos || [];
      setVehiculos(listaReal);
      
      // Guardamos info de la paginación
      if (datos.totalPaginas) {
        setPaginacion({ actual: datos.paginaActual, total: datos.totalPaginas });
      }
    } catch (error) {
      console.error('Error al conectar con el backend:', error);
    }
  };
  
  useEffect(() => {
    obtenerAutos();
  }, []); // Los corchetes vacíos significan que esto solo se ejecuta una vez al inicio

  return (
    <div>
      <header className="catalog-header">
        <h1>AutoMarket</h1>
        <div className="auth-buttons">
          {token ? (
            // SI ESTÁ LOGUEADO: Mostramos Publicar, su Nombre y el botón de Cerrar Sesión
            <>
              <button onClick={irAPublicar} className="btn-register" style={{backgroundColor: '#2e7d32', marginRight: '10px'}}>
                + Publicar Auto
              </button>
              
              <span style={{marginRight: '15px', fontWeight: 'bold', color: 'white'}}>
                ¡Hola, {nombreUsuario}!
              </span>
              
              {/*BOTÓN DE CERRAR SESIÓN */}
              <button onClick={cerrarSesion} className="btn-login" style={{backgroundColor: '#dc3545', color: 'white', border: 'none'}}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            // SI NO ESTÁ LOGUEADO: Mostramos Iniciar Sesión y Registro
            <>
              <button onClick={irALogin} className="btn-login">Iniciar Sesión</button>
              <button onClick={irARegistro} className="btn-register">Registrarse</button>
            </>
          )}
          
         {/* <button onClick={irAPublicar} className="btn-register" style={{backgroundColor: '#2e7d32', marginRight: '10px'}}>+ Publicar Auto</button>
          <button onClick={irALogin} className="btn-login">Iniciar Sesión</button>
          <button onClick={irARegistro} className="btn-register">Registrarse</button>*/}
        </div>
      </header>

      <div className="catalog-container">
        {/* Le pasamos la función al Sidebar */}
        <Sidebar aplicarFiltros={obtenerAutos} />
        
        <main className="catalog-main">
          <h2>Vehículos Destacados</h2>
          
          <div className="vehicle-grid">
            {/* 3. Por cada vehículo en la lista, dibujamos una tarjeta */}
            {vehiculos.length === 0 ? (
              <p>No hay vehículos publicados todavía.</p>
            ) : (
              vehiculos.map((auto) => (
                <div key={auto._id} style={{ opacity: auto.estado === 'vendido' ? 0.6 : 1, position: 'relative' }}>
                  {auto.estado === 'vendido' && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'black', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', zIndex: 2, fontWeight: 'bold' }}>
                      VENDIDO
                </div>
                  )}
                 <VehicleCard 
                  //key={auto._id} 
                  auto={auto} 
                  verDetalles={verDetalles} 
                />
                </div>
              ))
            )}
          </div>
        {/* Botones de Paginación */}
          {paginacion.total > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                disabled={paginacion.actual === 1}
                onClick={() => obtenerAutos({ pagina: paginacion.actual - 1 })}
              >
                Anterior
              </button>
              <span>Página {paginacion.actual} de {paginacion.total}</span>
              <button 
                disabled={paginacion.actual === paginacion.total}
                onClick={() => obtenerAutos({ pagina: paginacion.actual + 1 })}
              >
                Siguiente
              </button>
            </div>
          )}  
        </main>
      </div>
    </div>
  );
};

export default Catalog;