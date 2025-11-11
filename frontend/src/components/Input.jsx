import React, { useState } from 'react'
import './Input.css'
import { Eye, EyeOff } from 'lucide-react'

const Input = ({ label, type, name, value, onChange, onBlur, placeholder, min, max, step, required, isInvalid, ...rest }) => {
  
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordField = type === "password"
  const isEmpty = required && !value 
  
  return (
    <div className="input-container">
        <label>{label}{required && (<span className={`required-asterisk ${isEmpty ? 'empty' : 'filled'}`}>*</span>)}</label>

        <div className={`input-wrapper ${isInvalid ? "error" : ""}`}>
            <input 
              type={isPasswordField ? (showPassword ? "text" : "password") : type} 
              name={name}
              value={value} 
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              className={isInvalid ? "error" : ""}
              {...rest}
            />

            {isPasswordField && (
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            )}
        </div>
    </div>
  )
}

export default Input