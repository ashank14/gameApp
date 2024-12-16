import express,{Request,Response} from 'express';
import cors from 'cors';
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

wss.on('connection',(ws)=>{
  console.log("client connected!");
  clients.push(ws);
  ws.on('message',(message)=>{
    console.log(message.toString());
    ws.send("Hello from server");
    clients.forEach((client:WebSocket)=>{
      client.send(message.toString());
    })
  })
})



server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });  

