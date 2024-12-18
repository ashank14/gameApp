import express,{Request,Response} from 'express';
import cors from 'cors';
import {z} from 'zod';
import { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';
import http from 'http';
import router from './routes/router';


console.log("hello");

const app=express();
const port=3000;

app.use(cors());
app.use(express.json());

app.use('/api',router);


//http server
const server=http.createServer(app);

//attach ws to the ws server
const wss=new WebSocketServer({server});

const clients:WebSocket[]=[]; 

//clientA will connect to the ws along with a roomid
//server will store clientA ws along w this string in a map
//clientB will connect using this room id, server will store clientB ws along w this roomid
//so the roomid will have clientA and clientB ws in an array against this string
//now when clientA sends a msg, it also sends the roomid along so msg is sent to everyone(clientB) in the room

const rooms: Record<string, WebSocket[]> = {};

const BaseMessageSchema = z.object({
  event: z.string(),
  roomid: z.string().min(1, "roomId is required"),
});

// Schema for "send message" event
const SendMessageSchema = BaseMessageSchema.extend({
  event: z.literal('send-message'),
  message: z.string().min(1, "Message cannot be empty"),
});

// Schema for "create room" and "join room" events
const RoomEventSchema = BaseMessageSchema.extend({
  event: z.union([z.literal('create-room'), z.literal('join-room')]),
});

//Schema for game state event
const GameStateSchema=BaseMessageSchema.extend({
  event:z.literal("game-state"),
  message: z
    .string()
    .regex(/^[XO ]*$/, "Message can only contain 'X', 'O', or blank spaces")
    .refine((msg) => msg.length === 9, "Message must be exactly 9 characters long"),
  currentTurn: z.enum(['X', 'O']),
  status: z.enum(['in-progress', 'won', 'draw'])
});

// Infer TypeScript types from schemas
type BaseMessage = z.infer<typeof BaseMessageSchema>;
type SendMessage = z.infer<typeof SendMessageSchema>;
type RoomEvent = z.infer<typeof RoomEventSchema>;
type GameEvent= z.infer<typeof GameStateSchema>;

wss.on('connection',(ws)=>{

  console.log("Client connected!");
  ws.on('message',(message)=>{

    try{
      const data= JSON.parse(message.toString());
          const baseValidate=BaseMessageSchema.safeParse(data);
          if(!baseValidate.success){
            ws.send("Invalid Format");
            return;
          }
          const {event,roomid}=data;

          //check event: create room/join room/send message/send state
          
          //create room
          if(event=='create-room'){

            const roomValidate=RoomEventSchema.safeParse(data);
            if(!roomValidate.success){
              ws.send("Invalid input");
              return;
            }
            if(rooms[roomid]){
              ws.send("Room already exists");
              return;
            }

            
            rooms[roomid] = [];
            rooms[roomid].push(ws);
            ws.send("room created");
            return;
            
          }

          //join room
          if(event=="join-room"){

            const roomValidate=RoomEventSchema.safeParse(data);
            if(!roomValidate.success){
              ws.send("Invalid Inputs");
              return;
            }

            if(!rooms[roomid]){
              ws.send("Invalid Room id");
              return;
            }

            rooms[roomid].push(ws);
            ws.send("joined room");

            //change started to true(start the game)
            rooms[roomid].forEach((client)=>{
              if(client!=ws){
                client.send("started");
              }
            });

            return;
            
          }
          
          //send message
          if(event=="send-message"){
            
            const messageValidate=SendMessageSchema.safeParse(data);
            if(!messageValidate.success){
              ws.send("Invalid input");
              return;
            }
            rooms[roomid].forEach((client)=>{
              if(client!=ws){
                client.send(data.message);
              }
            });
            ws.send("message sent");


            return;
          }
          
          //game state
          if(event=="game-state"){
            const stateValidate=GameStateSchema.safeParse(data);
            if(!stateValidate.success){
              ws.send("Invalid Inputs");
              return;
            }

            rooms[roomid].forEach((clients)=>{
              if(clients!=ws){
                ws.send(JSON.stringify(
                  {
                    message:data.string,
                    status:data.status,
                    turn:data.currentTurn
                  }
                ));
              }
            });

            return;
          }

          //If no event matches
          ws.send("Invalid event");
          return;

    }catch(error){
      ws.send("error");
      console.log(error);
    }
  });
});


server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });  



   