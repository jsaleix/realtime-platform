import React, { createContext, useContext, useReducer } from "react";
import jwt_decode from "jwt-decode";
import { TOKEN_STORAGE_KEY, CLIENT_ID } from "../constants/storage-keys";

const getFromtoken = token => {
    let decoded = jwt_decode(token);
    return decoded;
}

const emptyState = {
    token: null,
    email: null,
    id: null,
    isAdmin: false
}

const authInitData = () => {
    if(localStorage.getItem(TOKEN_STORAGE_KEY)){
        return {
            token: localStorage.getItem(TOKEN_STORAGE_KEY),
            ...getFromtoken(localStorage.getItem(TOKEN_STORAGE_KEY))
        };
    }else{
        return emptyState;
    }
};

export const appInitData = {
    auth: authInitData(),
    eventSource: null,
    client_id: localStorage.getItem(CLIENT_ID)??null
};

export const useAppContext = () => {
    const context = useContext(AppContext);

    if(context === undefined){
        throw new Error('Missing App Context Provider');
    }

    return context;
}

export const appStateReducer = (previousState, { action, payload }) => {
    switch(action){            
        case "SET_TOKEN":
            const { token } = payload;
            const rest = getFromtoken(token);
            console.log(rest);
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
            return { ...previousState, auth: {...previousState.auth, token, ...rest } };

        case "SET_CLIENT_ID":
            let { client_id } = payload;
            localStorage.setItem(CLIENT_ID, client_id);
            return { ...previousState, client_id };

        case 'SET_AUTH_DATA':
            return { ...previousState, auth: {...previousState.auth, ...payload} };

        case "LOGOUT":
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            return { ...previousState, auth: emptyState};

        case "SET_EVENT_SOURCE":
            if( previousState.eventSource && previousState.eventSource.readyState !== EventSource.CLOSED){
                previousState.eventSource.close();
            }
            return { ...previousState, eventSource: payload };
        default:
            throw new Error('Undefined action');
    }
}

export const AppContext = createContext(appInitData);

export const AppContextProvider = ({children}) => {
    const [ appState, dispatch ] = useReducer(appStateReducer, appInitData);

    return(
        <AppContext.Provider value={{appState, dispatch}}>
            {children}
        </AppContext.Provider>
    )
}