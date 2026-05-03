import React, { useState } from 'react';

const Sidebar = ({ aplicarFiltros }) => {
  // 1. Estado local para capturar los valores de los filtros
  const [filtros, setFiltros] = useState({
    marca: '',
    minPrecio: '',
    maxPrecio: '',
    minAnio: '',
    maxAnio: '',
    estado: ''
  });

  // 2. Función para actualizar el estado cuando el usuario escribe o selecciona
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  // 3. Función para limpiar y resetear la búsqueda
  const limpiarFiltros = () => {
    const estadoLimpio = {
      marca: '',
      minPrecio: '',
      maxPrecio: '',
      minAnio: '',
      maxAnio: '',
      estado: ''
    };
    setFiltros(estadoLimpio);
    aplicarFiltros(estadoLimpio); // Recarga el catálogo completo
  };

  return (
    <aside className="sidebar" style={{ padding: '20px', minWidth: '250px' }}>
      <h3>Filtros de Búsqueda</h3>
      <hr />
      
      {/* Filtro de Marca */}
      <div className="filter-group" style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Marca</label>
        <input 
          type="text" 
          name="marca"
          placeholder="Ej: Toyota, Nissan..." 
          value={filtros.marca}
          onChange={manejarCambio}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      {/* Rango de Precios */}
      <div className="filter-group" style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Precio</label>
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <input 
            type="number" 
            name="minPrecio"
            placeholder="Min" 
            value={filtros.minPrecio}
            onChange={manejarCambio}
            style={{ width: '50%', padding: '8px' }}
          />
          <input 
            type="number" 
            name="maxPrecio"
            placeholder="Max" 
            value={filtros.maxPrecio}
            onChange={manejarCambio}
            style={{ width: '50%', padding: '8px' }}
          />
        </div>
      </div>

      {/* Rango de Años */}
      <div className="filter-group" style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Año</label>
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <input 
            type="number" 
            name="minAnio"
            placeholder="Desde" 
            value={filtros.minAnio}
            onChange={manejarCambio}
            style={{ width: '50%', padding: '8px' }}
          />
          <input 
            type="number" 
            name="maxAnio"
            placeholder="Hasta" 
            value={filtros.maxAnio}
            onChange={manejarCambio}
            style={{ width: '50%', padding: '8px' }}
          />
        </div>
      </div>

      {/* Estado (Disponible/Vendido) */}
      <div className="filter-group" style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Estado</label>
        <select 
          name="estado" 
          value={filtros.estado} 
          onChange={manejarCambio}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        >
          <option value="">Todos</option>
          <option value="disponible">Disponibles</option>
          <option value="vendido">Vendidos</option>
        </select>
      </div>
      
      {/* Botones de Acción */}
      <button 
        className="btn-filter" 
        onClick={() => aplicarFiltros(filtros)}
        style={{ width: '100%', padding: '10px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Aplicar Filtros
      </button>

      <button 
        onClick={limpiarFiltros}
        style={{ width: '100%', padding: '10px', marginTop: '10px', backgroundColor: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
      >
        Limpiar Filtros
      </button>
    </aside>
  );
};

export default Sidebar;