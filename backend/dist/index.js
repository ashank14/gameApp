"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const router_1 = __importDefault(require("./routes/router"));
console.log("hello");
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', router_1.default);
//http server
const server = http_1.default.createServer(app);
//attach ws to the ws server
const wss = new ws_1.WebSocketServer({ server });
const clients = [];
wss.on('connection', (ws) => {
    console.log("client connected!");
    clients.push(ws);
    ws.on('message', (message) => {
        console.log(message.toString());
        ws.send("Hello from server");
        clients.forEach((client) => {
            client.send(message.toString());
        });
    });
});
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
