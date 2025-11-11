import { useState } from "react";

export default function useCharLimit(max, fieldName, min = 0) {
    const [value, setValue] = useState("")
    const [warning, setWarning] = useState("")
    const [isInvalid, setIsInvalid] = useState(false)

    const handleChange = (e) => {
        const newValue = e.target.value
        setValue(newValue)

        if(newValue.length >= min && newValue.length <= max){
            if(warning) setWarning("")
            if(isInvalid) setIsInvalid(false)
        }
    }

    const handleBlur = () => {
        if(value.length < min) {
            setWarning(`Minimum of ${min} characters required for ${fieldName}.`)
            setIsInvalid(true)
        } else if(value.length > max){
            setWarning(`Maximum of ${max} characters allowed for ${fieldName}.`)
            setIsInvalid(true)
        } else {
            setIsInvalid(false)
            setWarning("")
        }
    }

    return { value, setValue, onChange: handleChange, onBlur: handleBlur, warning, isInvalid }
}