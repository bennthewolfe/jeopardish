const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/games/:gameFile', (req, res) => {
    const gameFile = decodeURIComponent(req.params.gameFile);

    if (gameFile === 'random') {
    } else if (fs.existsSync(path.join(__dirname,'content','full-games',gameFile))) {
        res.sendFile(path.join(__dirname, 'content','full-games', gameFile));
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});