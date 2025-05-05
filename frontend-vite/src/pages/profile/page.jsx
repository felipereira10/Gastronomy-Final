import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@mui/material"
import useAuthServices from "../../services/auth"

export default function Profile() {
  const { logout } = useAuthServices()
  const navigate = useNavigate()
  const authData = JSON.parse(localStorage.getItem('auth')) || {};

 useEffect(() => {
        if(!authData) {
            return navigate('/auth')
        } else if(refetchOrders) {
            getUserOrders(authData?.user?._id)
        }
    }, [authData, refetchOrders])

    if(orderLoading) {
        return( <Loading /> )
    }

  const handleLogout = () => {
    logout()
    return navigate('/')
  }

  return (
    <>
      {authData.user ? (
        <>
          <h1>{authData.user.fullname}</h1>
          <h3>{authData.user.email}</h3>
          <Button variant="contained" onClick={handleLogout}>Logout</Button>
        </>
      ) : (
        <p>Usuário não logado</p>
      )}
    </>
  )
  
}