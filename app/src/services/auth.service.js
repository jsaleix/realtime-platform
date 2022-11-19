import { API_URL } from '../constants/urls.js';

class AuthService{
    async login(user){
        let response = await fetch(`${API_URL}/security/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({user})
        });

        if(response.status == 200){
            return response.json().then(res => res.token);
        }else{
            throw new Error('Invalid username or password');
        }
    }

    async logout(token){
        let response = await fetch(`${API_URL}/security/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if(response.status == 200){
            return true
        }else{
            throw new Error('Logout failed');
        }
    }   

    async register(user){
        let response = await fetch(`${API_URL}/security/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if(response.status == 201){
            return true;
        }else{
            return false;
        }
    }

}

export default new AuthService();