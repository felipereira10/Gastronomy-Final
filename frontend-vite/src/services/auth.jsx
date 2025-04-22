import React, { useState } from 'react';

export default function authServices() {
    const [authLoading, setAuthLoading] =useState(true);
    
    const url = 'http://localhost:3000/auth';

    const login = (formData) => {
        setAuthLoading(true);

        fetch(`${url}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(formData)
        })
        // then = e então
        .then((response) => response.json())
        .then((result) => {
            console.log(result)
        })
        .catch((error) => {
            console.log(error)
        })
        .finally(() => {
            setAuthLoading(false)
        })
    }

    const logout = () => {
        
    }

    const signup = (formData) => {
        setAuthLoading(true);

        fetch(`${url}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(formData)
        })
        // then = e então
        .then((response) => response.json())
        .then((result) => {
            console.log(result)
            if(result.success && result.body.token) {
                localStorage.setItem('token', result.body.token)
            }
        })
        .catch((error) => {
            console.log(error)
        })
        .finally(() => {
            setAuthLoading(false)
        })
    }

    return {
        signup,
        login,
        logout,
        authLoading
    }
}