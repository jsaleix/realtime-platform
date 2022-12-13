import React from "react";
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { AppContextProvider } from './contexts/app-context';
import { SocketContextProvider } from "./contexts/socket-context";
import "react-toastify/dist/ReactToastify.css";
import AppRouter from './app-router';
import LogRocket from 'logrocket';

function App() {
  return (
    <AppContextProvider>
      <SocketContextProvider>
        <BrowserRouter>
          <AppRouter/>
          <ToastContainer />
        </BrowserRouter>
      </SocketContextProvider>
    </AppContextProvider>
  )
}

export default App
