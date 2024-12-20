"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
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
//clientA will connect to the ws along with a roomid
//server will store clientA ws along w this string in a map
//clientB will connect using this room id, server will store clientB ws along w this roomid
//so the roomid will have clientA and clientB ws in an array against this string
//now when clientA sends a msg, it also sends the roomid along so msg is sent to everyone(clientB) in the room
const rooms = {};
const BaseMessageSchema = zod_1.z.object({
    event: zod_1.z.string(),
    roomid: zod_1.z.string().min(1, "roomId is required"),
});
// Schema for "send message" event
const SendMessageSchema = BaseMessageSchema.extend({
    event: zod_1.z.literal('send-message'),
    message: zod_1.z.string().min(1, "Message cannot be empty"),
});
// Schema for "create room" and "join room" events
const RoomEventSchema = BaseMessageSchema.extend({
    event: zod_1.z.union([zod_1.z.literal('create-room'), zod_1.z.literal('join-room')]),
});
//Schema for game state event
const GameStateSchema = BaseMessageSchema.extend({
    event: zod_1.z.literal("game-state"),
    message: zod_1.z
        .string()
        .regex(/^[XO ]*$/, "Message can only contain 'X', 'O', or blank spaces")
        .refine((msg) => msg.length === 9, "Message must be exactly 9 characters long"),
    currentTurn: zod_1.z.enum(['X', 'O']),
    status: zod_1.z.enum(['in-progress', 'won', 'draw'])
});
wss.on('connection', (ws) => {
    console.log("Client connected!");
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            const baseValidate = BaseMessageSchema.safeParse(data);
            if (!baseValidate.success) {
                ws.send("Invalid Format");
                return;
            }
            const { event, roomid } = data;
            //check event: create room/join room/send message/send state
            //create room
            if (event == 'create-room') {
                const roomValidate = RoomEventSchema.safeParse(data);
                if (!roomValidate.success) {
                    ws.send("Invalid input");
                    return;
                }
                if (rooms[roomid]) {
                    console.log("room exists!");
                    return;
                }
                rooms[roomid] = [];
                rooms[roomid].push(ws);
                ws.send(JSON.stringify({ res: "connected" }));
                return;
            }
            //join room
            if (event == "join-room") {
                const roomValidate = RoomEventSchema.safeParse(data);
                if (!roomValidate.success) {
                    ws.send("Invalid Inputs");
                    return;
                }
                if (!rooms[roomid]) {
                    ws.send("Invalid Room id");
                    return;
                }
                rooms[roomid].push(ws);
                ws.send("joined room");
                //change started to true(start the game)
                rooms[roomid].forEach((client) => {
                    if (client != ws) {
                        client.send("started");
                    }
                });
                return;
            }
            //send message
            if (event == "send-message") {
                const messageValidate = SendMessageSchema.safeParse(data);
                if (!messageValidate.success) {
                    ws.send("Invalid input");
                    return;
                }
                rooms[roomid].forEach((client) => {
                    if (client != ws) {
                        client.send(JSON.stringify({ res: "chat", message: data.message }));
                    }
                });
                return;
            }
            //game state
            if (event == "game-state") {
                const stateValidate = GameStateSchema.safeParse(data);
                if (!stateValidate.success) {
                    ws.send("Invalid Inputs");
                    return;
                }
                rooms[roomid].forEach((clients) => {
                    if (clients != ws) {
                        ws.send(JSON.stringify({
                            message: data.string,
                            status: data.status,
                            turn: data.currentTurn
                        }));
                    }
                });
                return;
            }
            //If no event matches
            ws.send("Invalid event");
            return;
        }
        catch (error) {
            ws.send("error");
            console.log(error);
        }
    });
});
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
