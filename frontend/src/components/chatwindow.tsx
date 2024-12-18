

function Chat(){
    return(
        <div className="bg-black h-full flex flex-col p-2 border-l border-gray-500 rounded-lg">
            <div>Chat</div>
            <div className="h-[90%]">
                
            </div>
            <div className="flex items-center justify-center w-full p-2 gap-2">
                <input className="w-[100%] p-2 rounded-lg border bg-transparent"/>
                <button className="rounded-lg p-2 mb-0.5 bg-blue-500">Send</button>
            </div>
        </div>
    )
}

export default Chat;