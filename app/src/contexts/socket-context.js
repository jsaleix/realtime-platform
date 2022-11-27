import React, { createContext, useContext, useReducer } from "react";

const initData = {
    socket: null
}

const socketStateReducder = (state, {action, payload}) => {
    switch(action){
        case 'SET_SOCKET':
            if(state.socket && state.socket.connected){
                state.socket.disconnect();
            }
            return {
                ...state,
                socket: payload
            }

        case 'CLOSE_SOCKET':
            if(state.socket && state.socket.connected){
                state.socket.disconnect();
            }

            return {
                ...state,
                socket: null
            }
            
        default:
            return state;
    }
};

const SocketContext = createContext();

export const useSocketContext = () => {
    const context = useContext(SocketContext);

    if(context === undefined){
        throw new Error('Missing Socket Context Provider');
    }

    return context;
}

export const SocketContextProvider = ({children}) => {
    const [socketState, socketDispatch] = useReducer(socketStateReducder, initData);

    return (
        <SocketContext.Provider value={{socketState, socketDispatch}}>
            {children}
        </SocketContext.Provider>
    );
}
