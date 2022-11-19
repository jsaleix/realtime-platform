import { useState, useEffect, useCallback } from "react";
import style from "./sign-up.module.scss";
import { toast } from "react-toastify";
import AuthService from "../../services/auth.service";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try{
        if ( formData.email === "" || formData.password === "" || formData.confirmPassword === "" ) throw new Error("Empty field(s)");
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");
        
        const res = await AuthService.register(formData);
        console.log(res);

        }catch(e){
            toast.error(e.message, {
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
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={updateField}
        />
        <input className="btn blue" type="submit" value="Sign-up now" />
      </form>
    </div>
  );
}
