const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const conectarDB = require('./config/db');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers/resolvers');

dotenv.config();

const app = express();
app.use(express.json());

const obtenerUsuario = (token) => {
    if (!token) return null;
    try {
        const tokenLimpio = token.startsWith('Bearer ')
            ? token.slice(7)
            : token;
        const decoded = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};

const iniciarServidor = async () => {
    await conectarDB();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            const token = req.headers['x-auth-token'] ||
                          req.headers['authorization'] ||
                          null;
            const usuario = obtenerUsuario(token);
            return { usuario };
        }
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    const PORT = process.env.PORT || 4001;
    app.listen(PORT, () => {
        console.log(`Servidor GraphQL corriendo en http://localhost:${PORT}/graphql`);
    });
};

iniciarServidor();