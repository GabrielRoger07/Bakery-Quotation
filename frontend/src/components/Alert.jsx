import React from 'react'

const Alert = ({ message }) => {
    if(!message) return null;
  return (
    <div className="alert">{message}</div>
  )
}

export default Alert