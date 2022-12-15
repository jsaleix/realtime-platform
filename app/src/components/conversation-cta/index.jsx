import React, { lazy, useState } from "react";
import { CHATBOT_EMITTED_EVENTS, CHATBOT_RECEIVED_EVENTS } from "../../constants/wss-events";
import style from "./index.module.scss";
import ConversationIcon from "../../assets/conversation-icon.svg";

const AdminConversation = lazy(() => import("../admin-conversation"));

export default function ConversationCta(){
    const [ isOpen, setIsOpen ] = useState(false);

    return(
        <div className={style.conversation}>
            {isOpen 
            ? 
            (<div className={style.chatbot_container}>
                <AdminConversation close={() => setIsOpen(false)}/>
            </div>)
            :
                (<div className={style.chatbot_cta}>
                        <div className={style.icon_container} onClick={() => setIsOpen(true)}>
                            <img src={ConversationIcon} alt="bot-icon" />
                        </div>
                        <div className={style.bot_taking}>
                            <p>Admin conversation?</p>
                        </div>
                </div>)
            }
        </div>
    )
}