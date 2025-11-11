import { useState } from "react";

export default function useCnpjMask(initialValue = "") {
    const [value, setValue] = useState(initialValue)
    const [isInvalid, setIsInvalid] = useState(false)

    const formatCnpj = (input) => {
        const digits = input.replace(/\D/g, "").slice(0, 14)

        if(digits.length <= 2) return digits
        if(digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
        if(digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
        if(digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
    }

    const handleChange = (e) => {
        const formatted = formatCnpj(e.target.value)
        setValue(formatted)

        if(isInvalid && formatted.replace(/\D/g, "").length === 14) {
            setIsInvalid(false)
        }
    }

    const handleBlur = () => {
        const digits = value.replace(/\D/g, "")
        setIsInvalid(digits.length !== 14)
    }

    const getNumericValue = () => value.replace(/\D/g, "")

    return { value, handleChange, handleBlur, setValue, getNumericValue, isInvalid }
}