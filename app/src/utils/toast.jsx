import { toast } from 'react-toastify';

export function displayMsg(msg, type="success"){
    const settings = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    switch(type){
        case "success":
            toast.success(msg, settings);
            break;
        case "error":
            toast.error(msg, settings);
            break;
    }
}

export function notify(msg){
    toast.info(msg, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}