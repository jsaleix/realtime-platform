import React, { useState }  from "react";
import styles from "./room-form.module.scss";
import { useSocketContext } from "../../contexts/socket-context";
import { ROOM_EMITTED_EVENTS, ROOM_RECEIVED_EVENTS } from "../../constants/wss-events";
import { useEffect } from "react";
import { displayMsg } from "../../utils/toast";

export default function RoomForm() {
    const { socket } = useSocketContext();
    const [ socketSetup, setSocketSetup ] = useState(false);

    const [ form, setForm ] = useState({
        displayName: '',
        maxParticipants: 1,
    })

    useEffect(() => {
        if(!socketSetup){
            socket.on(ROOM_RECEIVED_EVENTS.ROOM_CREATED, (room) => {
                setForm({
                    displayName: '',
                    maxParticipants: 1,
                });
                console.log("room created", room);
                displayMsg("Room created successfully", "success");
            })
            socket.on(ROOM_RECEIVED_EVENTS.ROOM_ALREADY_EXISTS, () => {
                displayMsg('Une room avec ce nom existe déjà', "error");
            })
            socket.on(ROOM_RECEIVED_EVENTS.ROOM_CREATION_MISSING_PARAMETERS, () => {
                displayMsg("Il manque des paramètres", "error");
            });
            setSocketSetup(true);
        }

        return () => {
            socket.off(ROOM_RECEIVED_EVENTS.ROOM_CREATED);
            socket.off(ROOM_RECEIVED_EVENTS.ROOM_ALREADY_EXISTS);
            socket.off(ROOM_RECEIVED_EVENTS.ROOM_CREATION_MISSING_PARAMETERS);
        }

    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!form.displayName || typeof form.displayName !== "string"){
            displayMsg('Le champ "Nom de la room" est obligatoire et doit être une chaîne de caractères', "error");
            return;
        }
        if(!form.maxParticipants || isNaN(form.maxParticipants) || form.maxParticipants < 1){
            displayMsg('Le champ "Nombre de participants maximum" est obligatoire et doit être un nombre supérieur ou égal à 1', "error");
            return;
        }
        console.log(socket);
        socket.emit(ROOM_EMITTED_EVENTS.CREATE_ROOM, form);
        //sendForm
    }

    const modifyForm = (e) => {
        if( e.target.name === "maxParticipants" && ( isNaN(e.target.value) || e.target.value < 0)){
            displayMsg("Le nombre de participants maximum doit être un nombre supérieur ou égal à 0", "error");
            return;
        }
        setForm(old => ({
            ...old,
            [e.target.name]: e.target.value,
        }));
    }

    return (
        <div className={styles.container}>
            Room creation
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.controlledInputs} >
                    <label htmlFor="displayName">Nom de la room :</label>
                    <input type="text" placeholder="Example: let's talk about Elm" name="displayName" value={form.displayName} onInput={modifyForm}/>
                </div>
                <div className={styles.controlledInputs}>
                    <label htmlFor="maxParticipants">Maximum number of simultaneous participants:</label>
                    <input type="number" min={1} name="maxParticipants" value={form.maxParticipants} onInput={modifyForm}/>
                </div>
                <button type="submit" className="btn blue">Send</button>
            </form>
        </div>
    );
}
