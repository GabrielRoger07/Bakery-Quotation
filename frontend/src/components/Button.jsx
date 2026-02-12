import './Button.css'

const Button = ({ children, onClick, disabled, type = 'button', loading = false, className = '', variant = 'primary' }) => {
  const buttonClassName = `btn btn-${variant} ${className}`.trim()

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={buttonClassName}>
        {loading ? 'Loading...' : children}
    </button>
  )
}

export default Button