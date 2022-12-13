import React, { lazy, useState } from "react";
import { useSocketContext } from "../../contexts/socket-context";
import { CHATBOT_EMITTED_EVENTS, CHATBOT_RECEIVED_EVENTS } from "../../constants/wss-events";
import { useEffect } from "react";
import style from "./index.module.scss";
import BotIcon from "../../assets/bot-icon.svg";
import { useCallback } from "react";

const ChatBot = lazy(() => import("../chatbot"));

export default function ChatBotCta(){
    const [ isOpen, setIsOpen ] = useState(true);

    return(
        <div className={style.chatbot}>
            {isOpen 
            ? 
            (<div className={style.chatbot_container}>
                <ChatBot close={() => setIsOpen(false)}/>
            </div>)
            :
                (<div className={style.chatbot_cta}>
                        <div className={style.icon_container} onClick={() => setIsOpen(true)}>
                            <img src={BotIcon} alt="bot-icon" />
                        </div>
                        <div className={style.bot_taking}>
                            <p>Need any assistance?</p>
                        </div>
                </div>)
            }
        </div>
    )
}