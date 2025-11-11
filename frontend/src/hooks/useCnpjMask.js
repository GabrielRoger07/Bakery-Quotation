import { useState } from "react";
import { formatCnpj } from "../utils/formatCnpj";

export default function useCnpjMask() {
    const [value, setValue] = useState("")
    const [isInvalid, setIsInvalid] = useState(false)

    const handleChange = (e) => {
        const formatted = formatCnpj(e.target.value)
        setValue(formatted)

        const digits = formatted.replace(/\D/g, "")
        if(isInvalid && digits.length === 14) {
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