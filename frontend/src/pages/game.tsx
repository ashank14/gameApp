import { useState,useEffect } from "react";
import Board from "../components/board";
import Chat from "../components/chatwindow";
import { useParams } from "react-router-dom";

function Game(){

    
    const [loading,setLoading]=useState<boolean>(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);    
    const roomevent = useParams();



    useEffect(() => {
        console.log("chat rendered");

        const socket = new WebSocket("ws://localhost:3000");
        setSocket(socket);
        socket.addEventListener("open", (event) => {
            socket.send(
                JSON.stringify({
                    event: roomevent.event,
                    roomid: localStorage.getItem("roomid"),
                })
            );
        });

        socket.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);

            if (data.res === "connected") {
                setLoading(false);
            }

            console.log("Message from server:", data.res);
        });

        return () => {
            socket.close();
        };
    }, []); 


    return(    
        <>
            <div className="bg-black w-full h-screen text-white grid lg:grid-cols-[2fr,1.5fr] grid-rows-none">
                <div>
                    <Board/>
                </div>
                <div>
                    <Chat socket={socket}/>
                </div>
            </div>
        </>
    )

}

export default Game;