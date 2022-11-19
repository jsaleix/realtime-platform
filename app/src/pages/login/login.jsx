import React, { useState, useEffect, useCallback } from "react";
import style from "./login.module.scss";
import AuthService from "../../services/auth.service";
import { toast } from "react-toastify";
import { useAppContext } from "../../contexts/app-context";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const  { dispatch } = useAppContext();

  const updateField = useCallback(
    (e) => {
      console.log(e.target.name);
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    },
    [formData]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (formData.email === "" || formData.password === "") {
        toast.error("Empty field(s)", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      try {
        const response = await AuthService.login(formData);
        dispatch({ action: "SET_TOKEN", payload: { token: response.token } });

      } catch (e) {
        toast.error(e.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    },
    [formData]
  );

  useEffect(() => {
    document.title = "RealTime app | Login";
  }, []);

  return (
    <div className={`${style.main} container`}>
      <h1>Login</h1>
      <form className={style.form} onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={updateField}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={updateField}
        />
        <input className="btn blue" type="submit" value="Login" />
      </form>
    </div>
  );
}
