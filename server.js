const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger-config');

dotenv.config({ path: path.resolve(__dirname, './.env') });

const openaiToken = process.env["GITHUB_TOKEN"];
const openaiEndpoint = "https://models.inference.ai.azure.com";
const openaiModelName = "gpt-4o";

const client = new OpenAI({ baseURL: openaiEndpoint, apiKey: openaiToken });

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// Helmet for security headers
app.use(helmet());

/**
 * @openapi
 * /games:
 *   get:
 *     tags:
 *       - Games
 *     summary: Retrieve a list of available games.
 *     responses:
 *       200:
 *         description: A list of game metadata.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   file:
 *                     type: string
 */
app.get('/games', (req, res) => {
    var games = fs.readdirSync(path.join(__dirname, 'content', 'full-games'));
    games = games.filter(game => game.endsWith('.json') && game !== 'template.json');

    let gamesMetadata = [];
    games.forEach(game => {
        let gameData = fs.readFileSync(path.join(__dirname, 'content', 'full-games', game));
        let gameJson = JSON.parse(gameData).metadata;
        gameJson.file = game;
        gamesMetadata.push(gameJson);
    });
    res.json(gamesMetadata);
});

/**
 * @openapi
 * /games/random:
 *   get:
 *     tags:
 *       - Games
 *     summary: Retrieve a random game file.
 *     responses:
 *       200:
 *         description: A random game file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     file:
 *                       type: string
 */
app.get('/games/random', (req, res) => {
    var games = fs.readdirSync(path.join(__dirname, 'content', 'full-games'));
    games = games.filter(game => game.endsWith('.json') && game !== 'template.json');
    const randomGame = games[Math.floor(Math.random() * games.length)];
    res.sendFile(path.join(__dirname, 'content', 'full-games', randomGame));
});

/**
 * @openapi
 * /games/{gameFile}:
 *   get:
 *     tags:
 *       - Games
 *     summary: Retrieve a specific game file.
 *     parameters:
 *       - in: path
 *         name: gameFile
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the game file.
 *     responses:
 *       200:
 *         description: The requested game file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     file:
 *                       type: string
 *       404:
 *         description: Game file not found.
 */
app.get('/games/:gameFile', (req, res) => {
    const gameFile = decodeURIComponent(req.params.gameFile);

    if (fs.existsSync(path.join(__dirname, 'content', 'full-games', gameFile))) {
        res.sendFile(path.join(__dirname, 'content', 'full-games', gameFile));
    } else {
        res.status(404).json({ error: 'Game file not found.' });
    }
});

/**
 * @openapi
 * /chatgpt:
 *   post:
 *     tags:
 *       - ChatGPT
 *     summary: Interact with the ChatGPT model.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [system, user]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: The ChatGPT response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 object:
 *                   type: string
 *                 created:
 *                   type: integer
 *                 model:
 *                   type: string
 *                 choices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: object
 *                         properties:
 *                           role:
 *                             type: string
 *                           content:
 *                             type: string
 *       400:
 *         description: Invalid input.
 */
app.post('/chatgpt', async (req, res) => {
    const client = new OpenAI({ baseURL: openaiEndpoint, apiKey: openaiToken });

    var messagesObj = {
        "messages": [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "" }
        ]
    };

    if (req.body && req.body.messages && req.body.messages.length > 0) {
        for (const message of req.body.messages) {
            if (message.role === "system") {
                messagesObj.messages[0] = { role: "system", content: message.content };
            }
            if (message.role === "user") {
                if (message.content === "") {
                    res.status(400).json({ "error": 'Please provide a message.  It cannot be blank.' });
                    return;
                }
                messagesObj.messages[0] = { role: "user", content: message.content };
            }
        }
        console.log('Body received', messagesObj);
    } else {
        res.status(400).json({ "error": 'Please provide a message.' });
        return;
    }

    const response = await client.chat.completions.create({
        messages: messagesObj.messages,
        temperature: 1.0,
        top_p: 1.0,
        max_tokens: 1000,
        model: openaiModelName
    });

    res.status(200).json(JSON.stringify(response));
    return;
});

/**
 * @openapi
 * /openapi.json:
 *   get:
 *     tags:
 *       - OpenAPI
 *     summary: Retrieve the OpenAPI specification.
 *     responses:
 *       200:
 *         description: The OpenAPI specification in JSON format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 openapi:
 *                   type: string
 *                 info:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     version:
 *                       type: string
 *                 paths:
 *                   type: object
 */
// Serve the OpenAPI specification as JSON
app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});