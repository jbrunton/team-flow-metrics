import { createApp } from "./app";
import WebSocket from "ws";
import { bus, Event } from "./bus";
import { Application } from "express";

const port = 5000;

function initializeApp(app: Application) {
  const server = app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });

  const wsServer = new WebSocket.Server({ server, path: "/ws" });

  bus.on(Event.BROADCAST, (message) => {
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
}

createApp()
  .then(initializeApp)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
