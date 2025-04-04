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
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// Helmet for security headers
app.use(helmet());

/**
 * @openapi
 * /games:
 *   get:
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
 * /games/{gameFile}:
 *   get:
 *     summary: Retrieve a specific game file or a random game.
 *     parameters:
 *       - in: path
 *         name: gameFile
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the game file or 'random' for a random game.
 *     responses:
 *       200:
 *         description: The requested game file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Game file not found.
 */
app.get('/games/:gameFile', (req, res) => {
    const gameFile = decodeURIComponent(req.params.gameFile);

    if (gameFile === 'random') {
        var games = fs.readdirSync(path.join(__dirname, 'content', 'full-games'));
        games = games.filter(game => game.endsWith('.json') && game !== 'template.json');
        const randomGame = games[Math.floor(Math.random() * games.length)];
        res.sendFile(path.join(__dirname, 'content', 'full-games', randomGame));
    } else if (fs.existsSync(path.join(__dirname, 'content', 'full-games', gameFile))) {
        res.sendFile(path.join(__dirname, 'content', 'full-games', gameFile));
    }
});

/**
 * @openapi
 * /chatgpt:
 *   post:
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

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});