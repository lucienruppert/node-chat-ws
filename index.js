const WebSocket = require("ws");

const clients = new Set();
let lastMessage = null;

const port = 8080;
const server = new WebSocket.Server({ port });
console.log("Chat service started!");

server.on("connection", (ws) => {
  clients.add(ws);
  console.log(
    `New connection opened: ${ws._socket.remoteAddress}:${ws._socket.remotePort}`
  );

  ws.on("message", (message) => {
    console.log(
      `Incoming message from ${ws._socket.remoteAddress}:${ws._socket.remotePort} => ${message}`
    );

    lastMessage = {
      timestamp: Date.now(),
      client: `${ws._socket.remoteAddress}:${ws._socket.remotePort}`,
      message: message.toString(),
    };

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
