import React, { useState, useEffect, useCallback } from "react";
import style from "./sign-up.module.scss";
import { toast } from "react-toastify";
import AuthService from "../../services/auth.service";
import { useAppContext } from "../../contexts/app-context";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const { appState } = useAppContext();
  const [ disableBtn, setDisableBtn ] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setDisableBtn(true);
      try {
        if (
          formData.email === "" ||
          formData.password === "" ||
          formData.firstName === "" ||
          formData.lastName === ""
        )
          throw new Error("Empty field(s)");

        const res = await AuthService.register(formData);
        if(res === true){
          toast.success('Registration successful', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          navigate('/login');
        }else{
          throw new Error('An error occured');
        }
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
        setDisableBtn(false);
        return;
      }
    },
    [formData]
  );

  const updateField = useCallback(
    (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    },
    [formData]
  );

  useEffect(() => {
    document.title = "RealTime app | Sign Up";
  }, []);

  return (
    <div className={`${style.main} container`}>
      <h1>Sign-up</h1>
      <form className={style.form} onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email*"
          value={formData.email}
          onChange={updateField}
        />
        <input
          name="firstName"
          type="text"
          placeholder="First Name*"
          value={formData.firstName}
          onChange={updateField}
        />
        <input
          name="lastName"
          type="text"
          placeholder="Last Name*"
          value={formData.lastName}
          onChange={updateField}
        />
        <input
          name="password"
          type="password"
          placeholder="Password*"
          value={formData.password}
          onChange={updateField}
        />
        <input disabled={disableBtn} className={`btn ${disableBtn ? 'disabled' : 'blue'}`} type="submit" value="Sign-up now" />
      </form>
    </div>
  );
}
