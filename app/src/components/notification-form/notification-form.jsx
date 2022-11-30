import React, { useState }  from "react";
import styles from "./notification-form.module.scss";
import { displayMsg } from "../../utils/toast";

import NotificationService from "../../services/notification.service";

export default function NotificationForm() {
    const [ notificationMessage, setNotificationMessage ] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault();
        if(notificationMessage === ''){
            displayMsg("Message can't be empty", "error");
            return;
        }
        NotificationService.send(notificationMessage);
        setNotificationMessage('');
    }

    return (
        <div className={styles.container}>
            Sending a notification to all users
            <form className={styles.form} onSubmit={handleSubmit}>
                <input type="text" placeholder="Your message here" value={notificationMessage} onInput={(e) => setNotificationMessage(e.target.value)}/>
                <button type="submit" className="btn blue">Send</button>
            </form>
        </div>
    );
}
