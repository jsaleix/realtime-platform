import React, { useState }  from "react";
import styles from "./notification-form.module.scss";

import NotificationService from "../../services/notification.service";

export default function NotificationForm() {
    const [ notificationMessage, setNotificationMessage ] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault();
        NotificationService.send(notificationMessage);
        setNotificationMessage('');
    }

    return (
        <div className={styles.container}>
            Pour envoyer une notification
            <form className={styles.form} onSubmit={handleSubmit}>
                <input type="text" value={notificationMessage} onInput={(e) => setNotificationMessage(e.target.value)}/>
                <button type="submit">Envoyer</button>
            </form>
        </div>
    );
}
