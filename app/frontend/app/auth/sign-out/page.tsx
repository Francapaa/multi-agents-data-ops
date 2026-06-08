'use server'
import {redirect} from 'next/navigation'
import {auth} from '@/lib/auth/server'



export default async function SignOut(){

    await auth.signOut();
    redirect("/")

}