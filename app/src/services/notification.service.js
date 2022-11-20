import { API_URL } from '../constants/urls.js';

class NotificationService{
    async send(message){
        const token = localStorage.getItem("token");
        let response = await fetch(`${API_URL}/notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                "Authorization":`Bearer ${token}`
            },
            body: JSON.stringify({message})
        });

        if(response.status == 201){
            return true;
        }else{
            return false;
        }
    }  

}

export default new NotificationService();