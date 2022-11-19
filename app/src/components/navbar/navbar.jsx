import React from 'react';
import style from './navbar.module.scss';

export default function Navbar(){
    return (
        <div className={style.navbar}>
            <div className={style.logo}>
                <img src={null} alt="logo" />
            </div>
        </div>
    )
}