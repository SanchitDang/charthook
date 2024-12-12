const express = require('express');
const serverles = require('serverless-http');
const app = express();

app.use(express.json()); // Middleware to parse JSON data

// Variable to store the latest incoming POST data with timestamp
let latestData = null;

// List of connected clients for SSE
let clients = [];

// POST endpoint to handle webhook
app.post('/webhook', (req, res) => {
    const timestamp = new Date().toISOString(); // Get the current timestamp
    latestData = { data: req.body, timestamp }; // Store the latest data with timestamp
    console.log('Received Data:', latestData);

    // Send the latest data to all connected clients
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(latestData)}\n\n`));

    res.status(200).send({ message: 'Data received successfully' });
});

// GET endpoint for server-sent events (SSE)
app.get('/events', (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send the latest data if available
    if (latestData) {
        res.write(`data: ${JSON.stringify(latestData)}\n\n`);
    }

    // Save client connection
    const client = { res };
    clients.push(client);

    // Remove client when they disconnect
    req.on('close', () => {
        clients = clients.filter(c => c !== client);
    });
});

// Start the server
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
module.exports.handler = serverless(app)