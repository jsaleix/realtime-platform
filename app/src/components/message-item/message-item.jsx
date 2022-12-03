import React from "react";
import { useAppContext } from "../../contexts/app-context";
import style from "./message-item.module.scss";

export default function MessageItem({message, displayUser = true}) {
    const {appState} = useAppContext();
    return(
        <div className={style.main}>
            {
                displayUser && 
                    <div className={style.picture}>
                        <img src={"https://images.unsplash.com/photo-1574169208507-84376144848b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=879&q=80"} alt="user"/>
                    </div>
            }
            <div className={style.content}>
                { displayUser && 
                    <h3 className={style.author}>{message.username} {appState.auth.id === message.userId && '(You)'}</h3>
                }
                <div className={`${style.message} ${appState.auth.id === message.userId && style.yours}`}>
                    <p>{message.message}</p>
                </div>
            </div>
            
        </div>
    )
}