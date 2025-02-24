const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

// Enable CORS for all routes
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/games/wings-of-fire', (req, res) => {
    res.sendFile(path.join(__dirname, 'content/full-games/wings-of-fire1.json'));
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});