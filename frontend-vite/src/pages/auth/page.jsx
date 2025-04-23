import { useState, useEffect } from "react"
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment
} from "@mui/material";
import styles from './page.module.css';
import authServices from "../../services/auth";
import { useNavigate } from "react-router-dom";

export default function Auth() {
    // useState é um hook do react que permite criar estados dentro de componentes funcionais
    // authServices é um hook que contém as funções de autenticação
    // authLoading é um estado que indica se a autenticação está carregando
    // login é uma função que faz o login do usuário
    // signup é uma função que faz o cadastro do usuário
    // authData é um objeto que contém os dados de autenticação do usuário
    const [formType, setFormType] = useState('login')
    const [formData, setFormData] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const { login, signup, authLoading } = authServices()
    const navigate = useNavigate()
    // useNavigate é um hook do react-router-dom que permite navegar entre páginas
    // Verifica se o usuário já está autenticado
    // Se sim, redireciona para a página de perfil
    // Se não, redireciona para a página de autenticação
    const authData = JSON.parse(localStorage.getItem('auth'))
    
    useEffect(() => {
        if(authData) {
            return navigate('/profile')
        }
    }, [])

    const handleChangeFormType = () => {
        setFormType((prev) => (prev === 'login' ? 'signup' : 'login'))
        setFormData({})
    }

    const handleFormDataChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmitForm = async (e) => {
        e.preventDefault()

        if (formType === 'login') {
            await login(formData)
            const auth = JSON.parse(localStorage.getItem('auth'))
            if (auth?.token) {
                navigate('/profile')
            }
        }

        if (formType === 'signup') {
            if (formData.password !== formData.confirmPassword) {
                console.log('Passwords do not match')
                return
            }
            await signup(formData)
            const auth = JSON.parse(localStorage.getItem('auth'))
            if (auth?.token) {
                navigate('/profile')
            }
        }
    }

    if (authLoading) {
        return <h1>Loading...</h1>
    }

    return (
        <div className={styles.authPageContainer}>
            {formType === 'login' && (
                <>
                    <h1>Login</h1>
                    <button onClick={handleChangeFormType}>Don't have an account? Click here</button>
                    <form onSubmit={handleSubmitForm}>
                        <TextField
                            required
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleFormDataChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField 
                        required
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        onChange={handleFormDataChange}
                        value={formData?.password || ""}
                        InputProps={{
                            endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                aria-label="toggle password visibility"
                                >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                            ),
                        }}
                        />
                        <Button type="submit" variant="contained">Login</Button>
                    </form>
                </>
            )}

            {formType === 'signup' && (
                <>
                    <h1>Signup</h1>
                    <button onClick={handleChangeFormType}>Already have an account? Click here</button>
                    <form onSubmit={handleSubmitForm}>
                        <TextField
                            required
                            label="Fullname"
                            name="fullname"
                            value={formData.fullname || ""}
                            onChange={handleFormDataChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            required
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleFormDataChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            required
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password || ""}
                            onChange={handleFormDataChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            required
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword || ""}
                            onChange={handleFormDataChange}
                            fullWidth
                            margin="normal"
                        />
                        <Button type="submit" variant="contained">Signup</Button>
                    </form>
                </>
            )}
        </div>
    )
}
