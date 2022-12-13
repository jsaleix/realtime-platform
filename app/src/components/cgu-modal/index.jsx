import React from "react";
import style from "./index.module.scss";
import Modal from 'react-modal';
import { useAppContext } from "../../contexts/app-context";
import { useCallback } from "react";

const CGUModal = ({visible, setVisible, children}) => {
    const {appState, dispatch} = useAppContext();

    const acceptCGU = useCallback(()=>{
        dispatch({action: 'ACCEPT_CGU'});
        setVisible(false);
    }, []);

    return(
        <Modal
            isOpen={visible}
            onRequestClose={() => setVisible(false)}
            className={style.modal}
            disableAutoFocus={true}
            ariaHideApp={false}
            style={{ overlay: { zIndex: 1000, background: 'rgba(0, 0, 0, 0.8)' } }}>
            <div className={style.content}>
                <div className={style.text}>
                    <h2>Please accept our CGU</h2>
                    <p>We will spy you if you allow it, so please accept</p>
                </div>
                <div className={style.actions}>
                    <button className={"btn blue reverse"} onClick={() => setVisible(false)}>Refuse</button>
                    <button className={"btn blue"} onClick={acceptCGU}>Accept</button>
                </div>
            </div>
        </Modal>
    )
}

export default CGUModal;