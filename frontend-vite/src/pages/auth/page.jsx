import { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import styles from './page.module.css'
import authServices from "../../services/auth";
import { useNavigate } from "react-router-dom"

export default function Auth() {
    const [formType, setFormType] = useState('login')
    const [formData, setFormData] = useState(null)
    const { login, signup, authLoading } = authServices()


    const handleChangeFormType = () => {
        setFormData(null)
        if(formType === 'login') {
            setFormType('signup')
        } else {
            setFormType('login')
        }
        console.log(formType)
    }

    const handleFormDataChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        console.log(formData)
    }

    const handleSubmitForm = (e) => {
        e.preventDefault()
        
        switch (formType) {
            case 'login':
                login(formData)
                break;
            case 'signup':
                if(formData.password !== formData.confirmPassword) {
                    console.log('Password do not match')
                    return
                }
                signup(formData)
            break;
        }
    }

    if(formType === 'login') {
        return (
            <div className={styles.authPagesContainer}>
                <h1>Login</h1>
                <button onClick={handleChangeFormType}>Don't you have a account? Click here</button>
                <form onSubmit={handleSubmitForm}>
                    <TextField 
                    required
                    label="Email"
                    type="email"
                    name="email"
                    onChange={handleFormDataChange}
                    />
                     <TextField 
                    required
                    label="Password"
                    type="password"
                    name="password"
                    onChange={handleFormDataChange}
                    />
                    <Button type="submit" variant="contained">Login</Button>
                </form>
            </div>
            
        )
    }

    if(formType === 'signup') {
        return (
            <div className={styles.authPagesContainer}>
                <h1>Signup</h1>
                <button onClick={handleChangeFormType}>Already have an account? Click here</button>
                <form onSubmit={handleSubmitForm}>
                    <TextField 
                    required
                    label="Fullname"
                    type="fullname"
                    name="fullname"
                    onChange={handleFormDataChange}
                    />
                    <TextField 
                    required
                    label="Email"
                    type="email"
                    name="email"
                    onChange={handleFormDataChange}
                    />
                    <TextField 
                    required
                    label="Password"
                    type="password"
                    name="password"
                    />
                    <TextField 
                    required
                    label="Confirm password"
                    type="password"
                    name="confirmPassword"
                    />
                    <Button type="submit" variant="contained">Signup</Button>
                </form>
            </div>
        )
    }
}