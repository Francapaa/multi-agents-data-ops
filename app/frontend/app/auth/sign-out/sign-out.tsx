import { authClient } from "@/lib/auth/client";
import { auth } from "@/lib/auth/server";


export async function SignOut(){
 
    const BACKEND_URL: string | undefined= process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = await authClient.token()
    
    if (!BACKEND_URL || !token ){
        console.warn("ENV VAR doesnt exist OR token doesnt exist");
        console.log(BACKEND_URL, token)
        return
    }



    try{
        
    }catch(error){
        throw error
    }


}