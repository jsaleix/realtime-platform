import React from 'react';
import { Link } from 'react-router-dom';
import style from './navbar.module.scss';
import { useAppContext } from '../../contexts/app-context';
import { useCallback } from 'react';
import AuthService from '../../services/auth.service';
import Logo from "../../assets/logo.png";

export default function Navbar(){
    const { appState, dispatch } = useAppContext();

    const logout = useCallback(async () => {
        await AuthService.logout(appState.auth.token);
        dispatch({ action: "LOGOUT"});
    }, [appState]);

    return (
        <div className={style.navbar}>
            <Link to={"/"} className={style.logo}>
                <img src={Logo} alt="logo" />
            </Link>

            <div className={style.actions}>
                {appState.auth.token ?
                    (<>
                        <div className={style.user_information}>
                            <p>{appState.auth.email}</p>
                        </div>
                        {   appState.auth.isAdmin && 
                                <Link to={"/admin"}>
                                    <button className='btn blue'>Administration</button>
                                </Link>
                        }
                        <button className='btn red' onClick={logout}>Logout</button>
                    </>)
                : (<>
                    <Link to={"/login"} className={style.login}>
                        <button className='btn blue'>Login</button>
                    </Link>
                    <Link to={"/sign-up"} className={style.signUp}>
                        <button className='btn blue'>Sign Up</button>
                    </Link>
                </>)
                }
            </div>
        </div>
    )
}