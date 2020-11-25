import express from "express";
import cors from "cors";
import { argosStateService } from "./state";
import { ArgosEvent, StreamsMessage } from "./model";
import { sha3_256 } from "js-sha3";
import { v4 as uuidv4 } from "uuid";
const fetch = require("node-fetch");
const fs = require("fs");

const http_port = 8082;
const websocket_port = 3001;

export const app = express();
app.use(cors());
app.use(express.json());

let channel_id: string;

/**
 * Read config and mock location data.
 */
const config = JSON.parse(fs.readFileSync("config.json"));
console.log(config);
const mockLocations = JSON.parse(
  fs.readFileSync("src/mock-data/locations.json")
);

/**
 * Generate list with known devices and their SHA3 hash. This is used to assign hashed device ids.
 */
const device_ids = ["XDK_HTTP_1", "RASPBERRY_PI"];
const devices = new Map<string, string>();
device_ids.map((device_id) => {
  devices.set(sha3_256(device_id), device_id);
});
console.log(devices);

/**
 * Returns the current channel in use.
 */
app.get("/channel", async (req, res) => {
  console.log("Returning the current channel ...");
  if (channel_id) {
    res.send({ channel_id });
  } else {
    await switch_channel().then(() => {
      res.send({ channel_id });
    });
  }
});

/**
 * Triggers a switch to a new channel.
 */
app.post("/switch_channel", async (req, res) => {
  console.log("/switch_channel");
  await switch_channel().then(() => {
    res.send({ channel_id });
  });
});

/**
 * Switches the channel and stores the result in a variable.
 */
async function switch_channel() {
  console.log("Switching channel ...");
  await fetch(
    `${config.http_gateway.host}:${config.http_gateway.port}/switch_channel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device: "DEVICE_ID_1" }),
      // timeout: 20_000,
    }
  )
    .then((response) => response.text())
    .then((id) => {
      console.log(`Switched to channel_id: ${id}`);
      channel_id = id;
      return id;
    })
    .catch((error) => {
      console.log(error);
    });
}

/**
 * Raspberry Pi can post detected QR codes here.
 */
app.post("/qr", (req, res) => {
  console.log(`>> RECEIVED (QR Code message): ${JSON.stringify(req.body)}`);
  console.log(JSON.stringify(req.body));

  const message: StreamsMessage = {
    iot2tangle: [
      {
        sensor: "QR Code Reader",
        data: [req.body],
      },
    ],
    device: "RASPBERRY_PI",
    timestamp: new Date().getTime(), // 1558511111
  };

  console.log(message);

  /* Streams-http-gateway */
  fetch(`${config.http_gateway.host}:${config.http_gateway.port}/sensor_data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
    timeout: 10_000,
  })
    .then((data) => {
      console.log({ data });
    })
    .catch((error) => {
      console.log(error);
    });

  console.log(`<< SEND TO HTTP-GATEWAY: ${message}`);
});

/**
 * This endpoint is optional and only used for logging / debugging. The XDK 110 messages will arrive here for debugging.
 * The same data is sent to the Streams-http-gateway.
 */
app.post("/sensor_data", (req, res) => {
  console.log(`>> RECEIVED (XDK 110 message): ${JSON.stringify(req.body)}`);
  res.sendStatus(200);
});

/**
 * This endpoint returns all data from a specified channel from the Tangle. A POST should contain a body like {"channel_id": "<channel_id>"}
 * It will fetch the data available under that channel_id from a decoder (ex.: "localhost:8585/decode_channel").
 * The data from the decoder gets pushed through the xstate to create Argos business logic objects.
 * The Argos events are then returned to be displayed by the frontend.
 * We use POST for security reasons, so that the sensitive data (channel_id) does not appear as a URL parameter.
 */
app.post("/decode", (req, res) => {
  console.log(`>> RECEIVED: ${JSON.stringify(req.body)}`);

  fetch(
    `${config.decoder.host}:${config.decoder.port}/decode_channel/${req.body.channel_id}`,
    { timeout: 10_000 }
  )
    .then((response) => response.json())
    .then((data) => {
      argosStateService.send("RESET"); // reset state machine before validating all events on channel
      const argosEvents = data.messages.map((message: string) => {
        console.log(`Raw message from Tangle: ${message}`);

        const m = JSON.parse(message) as StreamsMessage;

        const device = devices.get(m.device); // look up sha3 hash to identify creator of iot2tangle message
        console.log(`Device: ${device}`);

        argosStateService.send(device == "RASPBERRY_PI" ? "SCAN" : "DROP");
        const currentState = argosStateService.state;
        console.log("Current state of delivery:", currentState.value);

        if (device == "RASPBERRY_PI") {
          const argosEvent = {
            id: uuidv4(),
            timestamp: new Date(m.timestamp * 1000),
            type: "SCAN",
            state: currentState.value,
            value: m.iot2tangle[0].data[0].qr,
          } as ArgosEvent;
          console.log(argosEvent);
          return argosEvent;
        } else if (device == "XDK_HTTP_1") {
          const randomLocation =
            mockLocations[Math.floor(Math.random() * mockLocations.length)];
          const argosEvent = {
            id: uuidv4(),
            timestamp: new Date(m.timestamp * 1000),
            type: "DROP",
            state: "?",
            location: {
              latitude: randomLocation.latitude,
              longitude: randomLocation.longitude,
            },
          } as ArgosEvent;
          return argosEvent;
        } else {
          console.warn(`Device [${device}] is not a known device.`);
        }
      });

      const response = { argosEvents };
      console.log({ response });

      console.log(`>> SENDING: ${JSON.stringify(response)}`);
      res.send(JSON.stringify(response));
    })
    .catch((error) => {
      console.log(error);
      res.send(JSON.stringify([]));
    });
});

app.listen(http_port, "0.0.0.0", () => {
  console.log(
    `${new Date()} -- Server is listening for HTTP requests on port ${http_port} ...`
  );
});

/**
 * ###################################################################
 * #                        Web socket server                        #
 * ###################################################################
 */
const WebSocket = require("ws");
const http = require("http");

const websocket_server = http.createServer(app);

const wss = new WebSocket.Server({
  server: websocket_server,
});

websocket_server.listen(websocket_port, "0.0.0.0", () => {
  console.log(
    `${new Date()} -- Server is open for WebSocket connections on port ${websocket_port} ...`
  );
});

var CLIENTS = []; // currently does nothing

// websocket events: "connection", "open", "message", "close"
wss.on("connection", (ws, req) => {
  CLIENTS.push[ws];
  const ip = req.connection.remoteAddress;
  const key = req.headers["sec-websocket-key"];
  console.log(`Connection established with ${ip} (key: ${key})`);

  ws.on("message", (data) => {
    if (typeof data !== "string") {
      const array = new Float32Array(data);
      console.log("Received binary message [" + array.length + " bytes]");
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    } else {
      console.log(data);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ id: "382938423", message: data }));
          argosStateService.send("SCAN");
        }
      });
    }
  });
});
