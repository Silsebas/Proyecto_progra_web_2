// src/utils/filterHelper.js

const construirQueryFiltros = (params) => {
    const { marca, modelo, minAnio, maxAnio, minPrecio, maxPrecio, estado } = params;
    let query = {};

    // Búsqueda por texto (marca y modelo)
    if (marca) query.marca = new RegExp(marca, 'i');
    if (modelo) query.modelo = new RegExp(modelo, 'i');
    
    // Estado (disponible / vendido)
    if (estado) {
        if (estado === 'disponible') {
            // Busca los que digan 'disponible' O los que no tengan el campo definido aún
            query.$or = [
                { estado: 'disponible' },
                { estado: { $exists: false } },
                { estado: '' }
            ];
        } else {
            query.estado = estado;
        }
    };

    // Rango de Año
    if (minAnio || maxAnio) {
        query.anio = {};
        if (minAnio) query.anio.$gte = Number(minAnio);
        if (maxAnio) query.anio.$lte = Number(maxAnio);
    }

    // Rango de Precio
    if (minPrecio || maxPrecio) {
        query.precio = {};
        if (minPrecio) query.precio.$gte = Number(minPrecio);
        if (maxPrecio) query.precio.$lte = Number(maxPrecio);
    }

    return query;
};

// Usamos module.exports para que Node no explote
module.exports = { construirQueryFiltros };