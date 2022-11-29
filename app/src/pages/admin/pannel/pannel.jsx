import React, {useEffect} from 'react';
import styles from "./pannel.module.scss";
import { useSocketContext } from "../../../contexts/socket-context";
import { useAppContext } from '../../../contexts/app-context';

import NotificationForm from '../../../components/notification-form/notification-form';
import RoomForm from '../../../components/room-form/room-form';
import { useNavigate } from 'react-router-dom';


export default function Pannel(){
    const { appState } = useAppContext();
    const { socket, closeSocket, openSocket } = useSocketContext();
    const navigate = useNavigate();

    useEffect(() => {
        if(!appState.auth.token || !appState.auth.isAdmin){
            navigate('/');
            return;
        }

        if(!socket?.connected){
            openSocket();
        }

        return () => {
            closeSocket();
        };
    }, []);

    return(
        <div className={styles.container}>
            <NotificationForm/>
            <RoomForm/>
        </div>
    )
}