const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const OpenAI = require('openai');
const dotenv = require('dotenv');

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