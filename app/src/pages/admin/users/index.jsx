import React, {useEffect, useState} from 'react';
import style from "./index.module.scss";

const UsersIndex = () => {
    return(
        <div className={style.user_index}>
            <section>
                <div className="container">
                    <div className={style.list}>
                        <h1>Users</h1>
                        <p>WIP<br/>Registered users will appear here</p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default UsersIndex;