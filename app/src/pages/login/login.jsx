import React, { useState, useEffect, useCallback } from "react";
import style from "./login.module.scss";
import AuthService from "../../services/auth.service";
import { useAppContext } from "../../contexts/app-context";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../../contexts/socket-context";
import { displayMsg } from "../../utils/toast";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { appState, dispatch } = useAppContext();
  const { socketState } = useSocketContext();

  const [disableBtn, setDisableBtn] = useState(false);
  const navigate = useNavigate();

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
      setDisableBtn(true);
      if (formData.email === "" || formData.password === "") {
        displayMsg("Empty field(s)", "error");
        return;
      }

      try {
        const token = await AuthService.login(formData);
        dispatch({ action: "SET_TOKEN", payload: { token } });
        navigate("/");
      } catch (e) {
        setDisableBtn(false);
        displayMsg(e.message, "error");
      }
    },
    [formData]
  );

  useEffect(() => {
    document.title = "RealTime app | Login";
  }, []);

  useEffect(() => {
    if (appState.auth.token) {
      navigate("/");
    }
  }, [appState.token]);

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
        <input
          disabled={disableBtn}
          className={`btn ${disableBtn ? "disabled" : "blue"}`}
          type="submit"
          value="Login"
        />
      </form>
    </div>
  );
}
