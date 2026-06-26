import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'
import FieldMessage from '@/components/FieldMessage'

const inputBase = [
  'w-full min-h-[2.625rem] py-[0.5625rem] pl-[0.875rem] pr-10',
  'border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)]',
  'text-body text-[var(--color-text-primary)] bg-[var(--color-surface-0)]',
  'outline-none transition-[border-color,box-shadow] duration-[160ms] ease-[ease]',
  'placeholder:text-[var(--color-text-disabled)] placeholder:font-normal',
  'hover:border-[var(--color-accent)]',
  'focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)]',
].join(' ')

const inputError = [
  '!border-[var(--color-danger-strong)]',
  'focus:!border-[var(--color-danger-dark)] focus:[box-shadow:var(--shadow-focus-danger)]',
].join(' ')

/**
 * Campo de texto com label, validação (props `isInvalid`/`error` via FieldMessage)
 * e toggle de visibilidade quando `type="password"`.
 */
const Input = ({ label, type, name, value, onChange, onBlur, placeholder, min, max, step, required, isInvalid, error, errorTone = 'error', ...rest }) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordField = type === 'password'
  const isEmpty = required && !value
  const invalid = isInvalid || Boolean(error)

  return (
    <div className="flex flex-col mb-[1.125rem] relative">
      <label className="mb-[0.375rem] font-semibold text-[var(--color-text-subtle)] text-body tracking-[0.005em] mr-auto">
        {label}
        {required && (
          <span className={`ml-[2px] font-bold ${isEmpty ? 'text-[var(--color-danger-strong)]' : 'text-[var(--color-text-disabled)]'}`}>*</span>
        )}
      </label>

      <div className="relative flex items-center">
        <input
          type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={cn(inputBase, invalid && inputError)}
          {...rest}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-[0.625rem] bg-transparent border-none cursor-pointer text-[var(--color-text-muted)] p-1 flex items-center justify-center transition-[color,transform] duration-[160ms] ease-[ease] hover:text-[var(--color-accent)] hover:scale-[1.08] active:scale-[0.94]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <FieldMessage tone={errorTone} className="mt-[0.375rem] mb-0">{error}</FieldMessage>}
    </div>
  )
}

export default Input