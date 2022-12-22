import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "../../contexts/app-context";
import style from "./home.module.scss";
import ChatBotCta from "../../components/chatbot-cta";
import ConversationCta from "../../components/conversation-cta";
import Rooms from "./rooms";

export default function Home() {
    const { appState } = useAppContext();
   
    useEffect(() => {
        document.title = "RealTime app";
    }, []);

    return (
        <div className={`${style.main} container`}>
            {appState.auth.token ? (
              <Rooms/>
            ) : (
                <p>Please login to see the rooms</p>
            )}
            <ChatBotCta />
            <ConversationCta />
        </div>
    );
}
