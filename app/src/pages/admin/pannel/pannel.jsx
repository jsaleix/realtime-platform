import React from 'react';
import styles from "./pannel.module.scss";

import NotificationForm from '../../../components/notification-form/notification-form';
import RoomForm from '../../../components/room-form/room-form';

export default function Pannel(){
    return(
        <div className={styles.container}>
            <NotificationForm/>
            <RoomForm className={styles.room}/>
        </div>
    )
}