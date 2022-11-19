import React from 'react';
import { Link } from 'react-router-dom';
import style from './navbar.module.scss';

export default function Navbar(){
    return (
        <div className={style.navbar}>
            <Link to={"/"} className={style.logo}>
                <img src={null} alt="logo" />
            </Link>

            <div className={style.actions}>
                <Link to={"/login"} className={style.login}>
                    <button className='btn blue'>Login</button>
                </Link>
                <Link to={"/sign-up"} className={style.signUp}>
                    <button className='btn blue'>Sign Up</button>
                </Link>
            </div>
        </div>
    )
}