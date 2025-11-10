import React from 'react'
import './Input.css'

const Input = ({ label, type, name, value, onChange, onBlur, placeholder, min, max, step, required }) => {
  const isEmpty = required && !value 
  return (
    <div className='input-container'>
        <label>{label}{required && (<span className={`required-asterisk ${isEmpty ? 'empty' : 'filled'}`}>*</span>)}</label>
        <input 
            type={type} 
            name={name}
            value={value} 
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
        />
    </div>
  )
}

export default Input