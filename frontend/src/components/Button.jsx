import React from 'react'
import './Button.css'

const Button = ({ children, onClick, disabled, type = 'button', loading = false }) => {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className='btn'>
        {loading ? 'Loading...' : children}
    </button>
  )
}

export default Button