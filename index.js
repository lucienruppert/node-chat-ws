const WebSocket = require("ws");

// Maintain a set of connected clients
const clients = new Set();
let lastMessage = null;

// Define the port
const port = 8080;

// Create WebSocket server
const server = new WebSocket.Server({ port });

// Log when the chat service starts
console.log("Chat service started!");

// Handle new client connections
server.on("connection", (ws) => {
  // Add the client to the set of active clients
  clients.add(ws);
  console.log(
    `New connection opened: ${ws._socket.remoteAddress}:${ws._socket.remotePort}`
  );

  // Handle incoming messages from clients
  ws.on("message", (message) => {
    console.log(
      `Incoming message from ${ws._socket.remoteAddress}:${ws._socket.remotePort} => ${message}`
    );

    // Save the last message
    lastMessage = {
      timestamp: Date.now(),
      client: `${ws._socket.remoteAddress}:${ws._socket.remotePort}`,
      message: message.toString(),
    };

    // Broadcast the message to other clients
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "lastMessage", data: lastMessage }));
        console.log(
          `Message forwarded to ${client._socket.remoteAddress}:${client._socket.remotePort}`
        );
      }
    });
  });

  // Handle client disconnections
  ws.on("close", () => {
    clients.delete(ws);
    console.log(
      `Connection closed: ${ws._socket.remoteAddress}:${ws._socket.remotePort}`
    );
  });

  // Handle errors for a specific client
  ws.on("error", (error) => {
    console.error(
      `Error for ${ws._socket.remoteAddress}:${ws._socket.remotePort} => ${error.message}`
    );
    ws.close();
  });
});

console.log(`Server is running on port ${port}.`);
