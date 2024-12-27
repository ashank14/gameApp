
import { useEffect, useState } from "react";

function Board({ socket,loading, turn }: { socket: WebSocket|null, loading:boolean, turn:string }){


    const [move,setMove]=useState<"X"|"O">("X");
    const [state,setState]=useState(["","O","","","","","","",""]); 

    useEffect(()=>{
        //listen for game state updates

        if(!socket){
            return;
        }

        socket.addEventListener("message",(event)=>{
            const data=JSON.parse(event.data);
            if(data.res="game-state"){
                console.log("received state:",data);
                setMove(data.currentTurn);
                setState(data.message);
            }
        })


    },[]);

    function handleClick(i:number){
        if(!socket){
            return;
        }
        if(move!=turn||state[i]!=""){
            return;
        }
        //change move after placing
        //the listener will update the move after p2 makes a move

        setState(state.map((item, index) => index === i ? turn : item));
        
        move==="X"?setMove("O"):setMove("X");

        socket.send(JSON.stringify({
            event:"game-state",
            message:state,
            currentTurn:move,
            roomid:localStorage.getItem("roomid")

        }))
    }

    function check(){

    }

    return(
        <>
            {loading?<div>Loading board</div>:            
            <div className="w-full h-full flex justify-between items-center">
                <div>P1</div>

                <div className="border w-[50%] h-[80%] grid grid-cols-3">
                    {
                        state.map((move,index)=>(
                            <button onClick={()=>handleClick(index)}>{move}</button>
                        ))                 
                    }
                </div>

                <div>P2</div>
            </div>}

        </>
    )
}

export default Board;