const Alert = ({ message }) => {
    if (!message) return null
    return (
        <div className="text-[var(--color-danger)] font-medium mb-[0.875rem] text-[0.875rem]">{message}</div>
    )
}

export default Alert