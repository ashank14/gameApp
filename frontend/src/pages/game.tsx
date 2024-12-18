import Board from "../components/board";
import Chat from "../components/chatwindow";


function Game(){
    return(    
        <>
            <div className="bg-black w-full h-screen text-white grid lg:grid-cols-[2fr,1.5fr] grid-rows-none">
                <div>
                    <Board/>
                </div>
                <div>
                    <Chat/>
                </div>
            </div>
        </>
    )

}

export default Game;