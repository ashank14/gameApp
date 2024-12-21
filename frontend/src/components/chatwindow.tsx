import { useEffect, useState } from "react";
  
function Chat({ socket,loading }: { socket: WebSocket|null, loading:boolean }) {
    const [messages, setMessages] = useState<String[]>([]);
    const [input,setInput]=useState<String>("");

    useEffect(() => {
        console.log("helloo");
        console.log(socket);
        if(!socket){
            return;
        }
        console.log(loading);

        const handleChatMessage = (event:any) => {
          const data = JSON.parse(event.data);
          if (data.res === "chat") {
            console.log("Received chat message:", data);
            setMessages((prevMessages) => [...prevMessages, data.message]);
          }
        };
    
        socket.addEventListener("message", handleChatMessage);
        return () => {
          socket.removeEventListener("message", handleChatMessage);
        };
      }, [socket]);

      function sendChat(){
        if(!socket){
            return;
        }
        setMessages((prevMessages) => [...prevMessages, input]);
        socket.send(JSON.stringify({
            event:"send-message",
            roomid:localStorage.getItem("roomid"),
            message:input
        }));

        console.log("sent");
      }

    return (
        <>
            {loading ? (
                <div>Loading Chat</div>
            ) : (
                <div className="bg-black h-full flex flex-col p-2 border-l border-gray-500 rounded-lg">
                    <div>Chat</div>
                    <div className="message-container h-[90%]">
                        {messages.map((m)=>(
                            <div>{m}</div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center w-full p-2 gap-2">
                        <input className="w-[100%] p-2 rounded-lg border bg-transparent" onChange={(e)=>{setInput(e.target.value)}} />
                        <button className="rounded-lg p-2 mb-0.5 bg-blue-500" onClick={sendChat}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Chat;