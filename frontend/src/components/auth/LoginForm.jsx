import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { axiosInstance } from '../../lib/axios';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';

const LoginForm = () => {
    const [username, setUsername]=useState("");
    const [password, setPassword]=useState("");
    const queryClient= useQueryClient();

    const {mutate : loginMutation, isLoading}= useMutation({
      mutationFn: (userData) => axiosInstance.post("/auth/login",userData),
      onSuccess:()=>{
        toast.success("Logged in Successfully");
        queryClient.invalidateQueries({queryKey: ["authUser"]});
      },
      onError:(err)=>{
        toast.error(err.response.data.message || "something went wrong");
      }
    })

    const handelSubmit=(e)=>{
      e.preventDefault();
      loginMutation({username, password});
      console.log("Login",username,password);
    }
  return (
    <form className='space-y-4 w-full max-w-md' onSubmit={handelSubmit}>
        <input
           type='text'
           placeholder='Username'
           value={username}
           onChange={(e)=>setUsername(e.target.value)}
           className='input input-bordered w-full'
           required
        />
        <input 
           type='password'
           placeholder='Password'
           value={password}
           onChange={(e)=>setPassword(e.target.value)}
           className='input input-bordered w-full'
           required
        />
        <button type='submit' className='btn btn-primary w-full'>
           {isLoading ? <Loader  className='size-5 animate-spin'/> : "Login"}
        </button>

    </form>
  )
}

export default LoginForm