const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Jeopardish API',
            version: '1.0.0',
            description: 'API documentation for the Jeopardish game server',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
        ],
    },
    apis: ['./server.js'], // Path to the API docs in your server file
};

const specs = swaggerJsdoc(options);

module.exports = specs;