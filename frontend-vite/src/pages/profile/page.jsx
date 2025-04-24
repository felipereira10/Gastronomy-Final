import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Profile() {
  const navigate = useNavigate()
  const authData = JSON.parse(localStorage.getItem('auth'))

  useEffect(() => {
    if (!authData) {
      navigate('/auth')
    }
  }, [])

  if (!authData) return null

  return (
    <>
      <h1>{authData.user?.fullname}</h1>
      <h3>{authData.user?.email}</h3>
    </>
  )
}
