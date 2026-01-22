import { Children, createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export const  AuthContex = createContext();

export const AuthContexProvider = ({Children}) =>{

    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const login = async (inputs) => {

        try {
            const res = await api.post('auth/login', inputs);
            setCurrentUser(res.data);
            localStorage.setItem("appToken", res.data,token)

            return res.data;


            
        }
        
        catch (error) {
             console.log(err);
      toast.error("Username or Password is incorrect");
            
        }
    }


     useEffect (()=> {
            localStorage.setItem("user", JSON.stringify(currentUser));
        }, [currentUser]);









 return (
    < AuthContex.Provider value={{ currentUser, login }}>
      {Children}
    </ AuthContex.Provider>
  );

}
