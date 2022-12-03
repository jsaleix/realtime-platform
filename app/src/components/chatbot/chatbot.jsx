import React, { useState } from "react";
import { useSocketContext } from "../../contexts/socket-context";
import { CHATBOT_EMITTED_EVENTS, CHATBOT_RECEIVED_EVENTS } from "../../constants/wss-events";
import { useEffect } from "react";

export default function ChatBot(){
    const [ isOpen, setIsOpen ] = useState(false);
    const { socket } = useSocketContext();

    useEffect(() => {
        socket.on(CHATBOT_RECEIVED_EVENTS.CONTACT_EMAIL, (email) => {
            console.log(email);
        })
        return () => {
            socket.off(CHATBOT_RECEIVED_EVENTS.CONTACT_EMAIL);
        }
    })

    const startChat = () => {
        socket.emit(CHATBOT_EMITTED_EVENTS.APPOINTMENT_DISPONIBILITY);
        setIsOpen(true);
    }

    const closeChat = () => {
        socket.emit(CHATBOT_EMITTED_EVENTS.END);
        setIsOpen(false);
    }

    return(
        isOpen !== true ? 
            <button onClick={startChat}>Besoin d'aide ?</button> : 
            <div>
                <button onClick={closeChat}>close</button>
            </div>
    )
}