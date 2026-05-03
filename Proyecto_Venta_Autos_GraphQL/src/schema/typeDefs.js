const { gql } = require('apollo-server-express');

const typeDefs = gql`

    # Tipo Usuario
    type Usuario {
        id: ID!
        name: String!
        email: String!
        cedula: String!
        telefono: String
    }

    # Tipo Mensaje dentro de un Chat
    type Mensaje {
        emisor: Usuario
        texto: String!
        esOrdenCompra: Boolean
        fecha: String
    }

    # Tipo Chat
    type Chat {
        id: ID!
        vehiculo: Vehiculo
        comprador: Usuario
        vendedor: Usuario
        mensajes: [Mensaje]
        ultimaActualizacion: String
    }

    # Tipo Vehículo
    type Vehiculo {
        id: ID!
        marca: String!
        modelo: String!
        anio: Int!
        precio: Float!
        kilometraje: Int!
        estado: String!
        descripcion: String
        imagen: String
        vendedor: Usuario
        createdAt: String
    }

    # Resultado de vehículos
    type ResultadoVehiculos {
        vehiculos: [Vehiculo]
        totalPaginas: Int
        paginaActual: Int
        total: Int
    }

    # Queries disponibles
    type Query {
        # Vehículos
        vehiculos(
            marca: String
            estado: String
            precioMin: Float
            precioMax: Float
            anioMin: Int
            anioMax: Int
            pagina: Int
        ): ResultadoVehiculos

        vehiculo(id: ID!): Vehiculo

        misVehiculos: [Vehiculo]

        # Chats
        misChats: [Chat]

        # Usuarios
        miPerfil: Usuario
    }
`;

module.exports = typeDefs;