import { useState } from "react";

export default function usePhoneMask(initialValue = "") {
    const [value, setValue] = useState(initialValue)
    const [isInvalid, setIsInvalid] = useState(false)

    const formatPhone = (input) => {
        const digits = input.replace(/\D/g, "").slice(0, 11)
        
        if(digits.length === 0) return ""
        if(digits.length <= 2) return `(${digits})`
        if(digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
        if(digits.length <= 10){
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
        }
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    }

    const handleChange = (e) => {
        const formatted = formatPhone(e.target.value)
        setValue(formatted)

        if(isInvalid && (formatted.replace(/\D/g, "").length === 10 || formatted.replace(/\D/g, "").length === 11)) {
            setIsInvalid(false)
        }
    }

    const handleBlur = () => {
        const digits = value.replace(/\D/g, "")
        console.log(digits.length)
        setIsInvalid((digits.length !== 10 && digits.length !== 11))
    }

    const getNumericValue = () => value.replace(/\D/g, "")

    return { value, handleChange, handleBlur, setValue, getNumericValue, isInvalid }
}