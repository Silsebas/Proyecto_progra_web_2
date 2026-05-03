import React from 'react';

// La tarjeta recibe 'verDetalles' y también los datos del 'auto'
const VehicleCard = ({ verDetalles, auto }) => {
  return (
    <div className="vehicle-card">
      {/* Usamos la primera imagen del arreglo, o una por defecto si no tiene */}
      <img 
        src={auto.imagenes && auto.imagenes.length > 0 ? auto.imagenes[0] : "https://via.placeholder.com/800x500?text=Sin+Imagen"} 
        alt={`${auto.marca} ${auto.modelo}`} 
        className="vehicle-img" 
      />
      
      <div className="vehicle-info">
        {/* Mostramos la marca y el modelo reales */}
        <h4>{auto.marca} {auto.modelo} {auto.anio}</h4>
        
        {/* Mostramos el precio real formateado */}
        <h3 className="price">$ {auto.precio.toLocaleString()}</h3>
        
        <ul className="details">
          <li><strong>Motor:</strong> {auto.motor}</li>
          <li><strong>Transmisión:</strong> {auto.transmision}</li>
          <li><strong>Kilometraje:</strong> {auto.kilometraje.toLocaleString()} km</li>
        </ul>
        
        <button onClick={() => verDetalles(auto)} className="btn-details">
          Ver Vehículo
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;