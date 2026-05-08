import { useState } from "react";
import { formatPhone } from "@/utils/formatPhone";

export default function usePhoneMask() {
    const [value, setValue] = useState("")
    const [isInvalid, setIsInvalid] = useState(false)

    const handleChange = (e) => {
        const formatted = formatPhone(e.target.value)
        setValue(formatted)

        const digits = formatted.replace(/\D/g, "")
        if(isInvalid && (digits.length === 10 || digits.length === 11)) {
            setIsInvalid(false)
        }
    }

    const handleBlur = () => {
        const digits = value.replace(/\D/g, "")
        setIsInvalid((digits.length !== 10 && digits.length !== 11))
    }

    const getNumericValue = () => value.replace(/\D/g, "")

    return { value, handleChange, handleBlur, setValue, getNumericValue, isInvalid }
}