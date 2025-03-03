# Learn Websockets from Scratch

Google Gemini explanation

```
// Client-side implementation (in a browser environment)
function connectWebSocket(url) {
  let socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("WebSocket connection established");
    // Send initial message if needed
    socket.send("Hello from client!");
  };

  socket.onmessage = (event) => {
    console.log("Received message from server:", event.data);
    // Handle received message
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };

  // Function to send a message to the server
  function sendMessage(data) {
    socket.send(data);
  }
}

// Example usage:
connectWebSocket("ws://localhost:8080");
```

Explanation: 

• Creating a WebSocket connection: 
	• let socket = new WebSocket(url);: Initializes a new WebSocket object and attempts to connect to the specified URL (ws://localhost:8080 in the example). 

• Event Handlers: 
	• onopen: Triggered when the connection is successfully established, allowing you to send initial data if needed. 
	• onmessage: Triggered when a message is received from the server, providing the message data in the event.data property. 
	• onerror: Triggered when an error occurs during the connection. 
	• onclose: Triggered when the connection is closed. 

• Sending a message: 
	• socket.send(data): Sends the specified data to the server. 

Server-side implementation (using Node.js): 
```
const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  // Handle HTTP requests if needed
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received message:', message);
    // Process message and send response if needed
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
  console.log('WebSocket server listening on port 8080');
});
```

Key points: 

• WebSocket library: In a real-world application, you would typically use a dedicated WebSocket library (like ws for Node.js) to handle the complexities of the WebSocket protocol. 
• Handshake: The initial connection establishment involves an HTTP handshake where the client requests an upgrade to a WebSocket connection. 
• Message framing: WebSockets use a specific framing format to send data efficiently, including message length and optional masking for security. 
• Security: For production use, ensure you use a secure WebSocket connection (wss://) to encrypt communication. 

Important considerations when building a full WebSocket implementation from scratch: 

• Error handling: Implement robust error handling to manage potential connection issues, unexpected data, and server-side errors. 
• Data serialization/deserialization: Decide how to format data (JSON, custom protocol) and handle the conversion between JavaScript objects and byte arrays. 
• Scalability: If building a large-scale application, consider techniques to manage multiple connections and optimize performance. 
• Protocol details: Thoroughly understand the WebSocket protocol specifications to correctly handle different message types and options. 

Generative AI is experimental.

[-] https://github.com/srujan-landeri/HACX[-] https://github.com/vikasRanjann/socket
