import React from 'react'
import './Input.css'

const Input = ({ label, type, name, value, onChange, placeholder }) => {
  return (
    <div className='input-container'>
        <label>{label}</label>
        <input 
            type={type} 
            name={name}
            value={value} 
            onChange={onChange} 
            placeholder={placeholder}
        />
    </div>
  )
}

export default Input