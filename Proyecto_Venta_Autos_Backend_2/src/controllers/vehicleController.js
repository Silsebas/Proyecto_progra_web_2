// src/controllers/vehicleController.js
const { construirQueryFiltros } = require('../utils/filterHelper');
const Vehicle = require('../models/Vehicle');

// 1. Crear un vehículo (Solo para usuarios logueados)
exports.crearVehiculo = async (req, res) => {
    try {
        // Creamos el auto con los datos que manda el Frontend (req.body)
        const nuevoVehiculo = new Vehicle({
            ...req.body,
            // req.usuario.id existirá gracias al Token de seguridad que configuraremos
            vendedor: req.usuario.id 
        });

        // Si multer atajó una imagen, guardamos su ruta web
        if (req.file) {
            // Guardamos la ruta estática para que el frontend la pueda leer
            nuevoVehiculo.imagenes = [`http://localhost:4000/uploads/${req.file.filename}`];
        }

        await nuevoVehiculo.save();
        res.status(201).json({ mensaje: 'Vehículo publicado con éxito', vehiculo: nuevoVehiculo });
        
    } catch (error) {
        console.error('Error al crear vehículo:', error);
        res.status(500).json({ mensaje: 'Hubo un error al publicar el vehículo' });
    }
};

// 2. Obtener todos los vehículos (Público, para el catálogo)
/*exports.obtenerVehiculos = async (req, res) => {
    try {
        // .populate() en lugar de traernos solo el ID del vendedor, 
        // busca en la tabla Users y nos trae su nombre y correo para mostrarlo en el frontend.
        const vehiculos = await Vehicle.find().populate('vendedor', 'name email');
        res.json(vehiculos);
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        res.status(500).json({ mensaje: 'Hubo un error al obtener los vehículos' });
    }
};*/
// 2. Obtener vehículos con FILTROS y PAGINACIÓN (Requerimiento UTN)
exports.obtenerVehiculos = async (req, res) => {
    try {
        // 1. Extraemos la página y los filtros de los query params
        // Si no viene 'pagina', por defecto es la 1
        const { pagina = 1, ...filtrosParams } = req.query;
        
        // 2. Construimos la query usando nuestro helper modular
        const query = construirQueryFiltros(filtrosParams);

        // 3. Configuración de paginación
        const limite = 6; // Cantidad de autos por página
        const saltar = (pagina - 1) * limite;
        
        // 4. Ejecutamos la búsqueda y el conteo total en paralelo para más velocidad
        const [vehiculos, total] = await Promise.all([
            Vehicle.find(query)
                .populate('vendedor', 'name email')
                .limit(limite)
                .skip(saltar)
                .sort({ createdAt: -1 }), // Los más nuevos primero
            Vehicle.countDocuments(query)
        ]);

        // 5. Respondemos con la estructura necesaria para el frontend
        res.json({
            vehiculos,
            totalPaginas: Math.ceil(total / limite),
            paginaActual: Number(pagina),
            totalResultados: total
        });

    } catch (error) {
        console.error('Error al obtener vehículos con filtros:', error);
        res.status(500).json({ mensaje: 'Hubo un error al procesar la búsqueda' });
    }
};

exports.actualizarEstado = async (req, res) => {
    try {
        const { estado } = req.body;

        // Validar que el estado recibido sea uno de los permitidos
        const estadosPermitidos = ['disponible', 'vendido'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                mensaje: `Estado inválido. Los valores permitidos son: ${estadosPermitidos.join(', ')}`
            });
        }

        const vehiculo = await Vehicle.findById(req.params.id);

        if (!vehiculo) {
            return res.status(404).json({ mensaje: 'Vehículo no encontrado' });
        }

        if (vehiculo.vendedor.toString() !== req.usuario.id) {
            return res.status(403).json({ mensaje: 'No autorizado' });
        }

        vehiculo.estado = estado;
        await vehiculo.save();

        res.status(200).json({ mensaje: `Vehículo marcado como ${estado}`, vehiculo });

    } catch (error) {
        console.error("Error en actualizarEstado:", error);
        res.status(500).json({ mensaje: 'Error al actualizar el estado del vehículo' });
    }
};

// ELIMINAR VEHÍCULO
exports.eliminarVehiculo = async (req, res) => {
    try {
        const vehiculo = await Vehicle.findById(req.params.id);
        if (!vehiculo) return res.status(404).json({ mensaje: 'No existe' });

        // Seguridad: ¿Es el dueño?
        if (vehiculo.vendedor.toString() !== req.usuario.id) {
            return res.status(401).json({ mensaje: 'No autorizado' });
        }

        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Vehículo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar' });
    }
};

// EDITAR VEHÍCULO
exports.actualizarVehiculo = async (req, res) => {
    try {
        let vehiculo = await Vehicle.findById(req.params.id);
        if (!vehiculo) return res.status(404).json({ mensaje: 'Vehículo no encontrado' });

        if (vehiculo.vendedor.toString() !== req.usuario.id) {
            return res.status(401).json({ mensaje: 'No autorizado' });
        }

        //Usamos || vehiculo.campo para que si el body llega vacío, mantenga lo anterior
        const datosActualizados = {
            marca: req.body.marca || vehiculo.marca,
            modelo: req.body.modelo || vehiculo.modelo,
            anio: req.body.anio ? Number(req.body.anio) : vehiculo.anio,
            precio: req.body.precio ? Number(req.body.precio) : vehiculo.precio,
            kilometraje: req.body.kilometraje ? Number(req.body.kilometraje) : vehiculo.kilometraje,
            motor: req.body.motor || vehiculo.motor,
            combustible: req.body.combustible || vehiculo.combustible,
            transmision: req.body.transmision || vehiculo.transmision,
            descripcion: req.body.descripcion || vehiculo.descripcion
        };

        // Si hay una foto nueva
        if (req.file) {
            datosActualizados.imagenes = [`http://localhost:4000/uploads/${req.file.filename}`];
        }

        const vehiculoEditado = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { $set: datosActualizados },
            { returnDocument: 'after' } 
        );

        res.json(vehiculoEditado);
    } catch (error) {
        console.error("Error al editar:", error);
        res.status(500).json({ mensaje: 'Error interno al actualizar' });
    }
};