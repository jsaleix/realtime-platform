import React, { useState }  from "react";
import styles from "./room-form.module.scss";
import { useSocketContext } from "../../contexts/socket-context";
import { ROOM_EMITTED_EVENTS, ROOM_RECEIVED_EVENTS } from "../../constants/wss-events";

export default function RoomForm() {
    const { socket } = useSocketContext();

    const [ form, setForm ] = useState({
        displayName: '',
        maxParticipants: 0,
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!form.displayName || typeof form.displayName !== "string"){
            alert('Le champ "Nom de la room" est obligatoire et doit être une chaîne de caractères');
            return;
        }
        if(!form.maxParticipants || isNaN(form.maxParticipants) || form.maxParticipants < 1){
            alert('Le champ "Nombre de participants maximum" est obligatoire et doit être un nombre supérieur ou égal à 1');
            return;
        }
        console.log(socket);
        socket.emit(ROOM_EMITTED_EVENTS.CREATE_ROOM, {});
        console.log("challah emited")
        socket.on(ROOM_RECEIVED_EVENTS.ROOM_CREATED, (room) => {
            console.log(room);
            setForm({
                displayName: '',
                maxParticipants: 0,
            });
        })
        socket.on(ROOM_RECEIVED_EVENTS.ROOM_ALREADY_EXISTS, () => {
            alert('Une room avec ce nom existe déjà');
        })
        socket.on(ROOM_RECEIVED_EVENTS.ROOM_CREATION_MISSING_PARAMETERS, () => {
            alert('Il manque des paramètres pour créer la room');
        });
        //sendForm
        socket.off(ROOM_RECEIVED_EVENTS.ROOM_CREATED);
        socket.off(ROOM_RECEIVED_EVENTS.ROOM_ALREADY_EXISTS);
        socket.off(ROOM_RECEIVED_EVENTS.ROOM_CREATION_MISSING_PARAMETERS);
    }

    const modifyForm = (e) => {
        if( e.target.name === "maxParticipants" && ( isNaN(e.target.value) || e.target.value < 0)){
            return;
        }
        setForm(old => ({
            ...old,
            [e.target.name]: e.target.value,
        }));
    }

    return (
        <div className={styles.container}>
            Pour créer une room
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.controlledInputs} >
                    <label htmlFor="displayName">Nom de la room :</label>
                    <input type="text" name="displayName" value={form.displayName} onInput={modifyForm}/>
                </div>
                <div className={styles.controlledInputs}>
                    <label htmlFor="maxParticipants">Nombre de participants simultanés maximum :</label>
                    <input type="number" name="maxParticipants" value={form.maxParticipants} onInput={modifyForm}/>
                </div>
                <button type="submit">Envoyer</button>
            </form>
        </div>
    );
}
