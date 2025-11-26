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
            setWarning({ type: "too_short", min, fieldName })
            setIsInvalid(true)
        } else if(value.length > max){
            setWarning({ type: "too_long", max, fieldName })
            setIsInvalid(true)
        } else {
            setIsInvalid(false)
            setWarning(null)
        }
    }

    return { value, setValue, onChange: handleChange, onBlur: handleBlur, warning, isInvalid }
}