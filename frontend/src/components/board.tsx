
import { useEffect, useState } from "react";

function Board({ socket,loading, turn }: { socket: WebSocket|null, loading:boolean, turn:string }){

    const [gameState,setGameState]=useState({
        currentTurn:"X" as "X"|"O",
        board:["","","","","","","","",""],
        status:"in-progress"
    })

    useEffect(() => {
        // Listen for game state updates
        if (!socket) {
            return;
        }
    
        const handleState = (event: any) => {
            console.log("Received data in Board:", event.data);
            const data = JSON.parse(event.data);
            if (data.res === "game-state") {
                console.log("Received state:", data);
                setGameState({
                    currentTurn:data.currentTurn,
                    board:data.message,
                    status:data.status
                })
            }
        };
    
        socket.addEventListener("message", handleState);
    
        return () => {
            socket.removeEventListener("message", handleState);
        };
    }, [socket]);
    

    function check(state:any){
        //column
        for(let i=0;i<3;i++){
            if(state[i]!=""&&(state[i]==state[i+3]&&state[i+3]==state[i+6])){
                console.log("won");
                return `${state[i]}-won`;
            }
        }

        //row
        for(let i=0;i<3;i++){
            if(state[i*3]!=""&&(state[i*3]==state[(i*3)+1]&&state[(i*3)+1]==state[(i*3)+2])){
                console.log("won");
                return `${state[i*3]}-won`;
            }
        }


        //diagnol

        if(state[0]!=""&&(state[0]==state[4]&&state[4]==state[8])){
            console.log("win");
            return `${state[0]}-won`;
        }

        if(state[2]!=""&&(state[2]==state[4]&&state[4]==state[6])){
            console.log("win");
            return `${state[2]}-won`;
        }


        //draw
        let flag:boolean=true;

        for(let i=0;i<9;i++){
            if(state[i]==""){
                flag=false;
                break;
            }
        }

        if(flag){
            return "draw";
        }

        return "in-progress";

    }

    function handleClick(i: number) {
        if (!socket || gameState.currentTurn !== turn || gameState.board[i] !== "" || gameState.status !== "in-progress") {
            return;
        }
    
        // Update the board and calculate the new status
        const updatedBoard = gameState.board.map((item, index) => (index === i ? turn : item));
        const status = check(updatedBoard);
    
        // Update the game state
        setGameState({
            ...gameState,
            currentTurn: gameState.currentTurn === "X" ? "O" : "X",
            board: updatedBoard,
            status,
        });
    
        // Send the updated game state to the server
        socket.send(
            JSON.stringify({
                event: "game-state",
                message: updatedBoard,
                currentTurn: turn === "X" ? "O" : "X",
                roomid: localStorage.getItem("roomid"),
                status,
            })
        );
    
        console.log("Move sent to server");
    }
    

    function reset(){

        if(!socket){
            return;
        }

        setGameState({
            currentTurn:"X",
            board:["","","","","O","","","",""],
            status:"in-progress"
        });

        socket.send(JSON.stringify({
            event:"game-state",
            message:["","","","","O","","","",""],
            currentTurn:"X",
            roomid:localStorage.getItem("roomid"),
            status:'in-progress'
        }));

    }

    

    return(
        <>
            {loading?<div>Loading board</div>:            
            <div className="w-full h-full flex justify-between items-center">
                <div>P1</div>

                <div className="w-full h-full flex items-center justify-center flex-col">
                    <div className="border w-[50%] h-[80%] grid grid-cols-3">
                        {
                            gameState.board.map((move,index)=>(
                                <button onClick={()=>handleClick(index)}>{move}</button>
                            ))                 
                        }
                    </div>   
                    <div>{gameState.status}</div>
                    {gameState.status!='in-progress'?<div><button onClick={reset}>RESET</button></div>:null}      
                </div>

                <div>P2</div>
            </div>}

        </>
    )
}

export default Board;