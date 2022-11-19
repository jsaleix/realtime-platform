import React from "react";
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { AppContextProvider, useAppContext } from './contexts/app-context';
import "react-toastify/dist/ReactToastify.css";
import AppRouter from './app-router';

function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <AppRouter/>
        <ToastContainer />
      </BrowserRouter>
    </AppContextProvider>
  )
}

export default App
