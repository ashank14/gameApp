import { useNavigate } from "react-router-dom"

function Home(){
    const navigate=useNavigate();
    return(
        <div className="bg-black w-full h-[100vh] text-white flex flex-col items-center justify-center gap-6">
            <div>
                <button className="bg-blue-500 px-10 py-2 rounded-3xl text-white text-xl" onClick={()=>{navigate('/game')}}>Create Room</button> 
            </div>
            <div>
                <button className="bg-blue-500 px-12 py-2 rounded-3xl text-white text-xl">Join Room</button> 
            </div>
        </div>
    )
}

export default Home