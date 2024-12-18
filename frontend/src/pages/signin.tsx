
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Signin(){

    interface res{
        msg:string,
        token:string,
        username:string
    }
    interface User{
        username:string,
        password:string
    }

    const [user,setUser]=useState<User>({
        username:'',
        password:''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);


    async function sendReq(){
        setLoading(true);
        setError(null);

        try{
            const response=await axios.post<res>('http://localhost:3000/api/user/signin',user);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userId", response.data.username);
            navigate('/home');

        }catch(e){
            setError("Error Signing In");
        }finally{
            setLoading(false);
        }
    }

    const handleChange = (e:any)=>{
        setUser({...user,[e.target.name]:e.target.value});
    }

    const navigate=useNavigate();

    return(
        <div className="bg-black h-screen flex w-full items-center justify-center text-white">
            <div className="rounded-lg px-6 w-[90%] border border-white flex flex-col align-center gap-10 px-8 py-12 md:w-[60%] lg:w-[35%]">
                <div className="w-full flex align-center justify-around font-bold text-3xl">Sign-In</div>

                
                <div className="w-full flex flex-col gap-3">
                    <div>Username</div>
                    <input className="text-white bg-transparent border border-slate-500 rounded-md h-12 px-3" type="text" name="username" onChange={handleChange} />                    
                </div>
    
                <div className="w-full flex flex-col gap-3">
                    <div>Password</div>
                    <input className="px-3 text-white bg-transparent border border-slate-500 rounded-md h-12" type="password" name="password" onChange={handleChange}/>                    
                </div>

                {loading?(<button className="bg-blue-600 h-12 rounded-md" onClick={sendReq}>Loading</button>):(<button className="bg-blue-600 h-12 rounded-md" onClick={sendReq}>Sign-In</button>)}
                {error?<div className="w-full flex align-center justify-center text-red-500">{error}</div>:<div></div>}
            </div>
        </div>
    )
}

export default Signin