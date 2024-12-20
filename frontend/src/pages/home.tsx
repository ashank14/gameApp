import { useState } from "react";
import { useNavigate } from "react-router-dom"

function Home(){
    const [input,setInput]=useState("");
    const username=localStorage.getItem("userId")||"";
    const navigate=useNavigate();
    return(
        <div className="bg-black w-full h-[100vh] text-white flex flex-col items-center justify-center gap-6">
            <div>
                <button className="bg-blue-500 px-10 py-2 rounded-3xl text-white text-xl" onClick={()=>{localStorage.setItem("roomid",username);navigate(`/game/${"create-room"}`)}}>Create Room</button> 
            </div>
            <div>
                <input className="bg-blue-500" onChange={(e)=>{setInput(e.target.value)}}/>
                <button className="bg-blue-500 px-12 py-2 rounded-3xl text-white text-xl" onClick={()=>{localStorage.setItem("roomid",input);navigate(`/game/${"join-room"}`)}}>Join Room</button> 
            </div>
        </div>
    )
}

export default Home