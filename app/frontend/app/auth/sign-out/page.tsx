import {redirect} from 'next/navigation'
import { authClient } from '@/lib/auth/client' 



export default async function SignOut(){

    const {error} = await authClient.signOut();

    if (error){
        console.error("THE USER CANT SIGN OUT");
        return
    }
    
    redirect("/")

}