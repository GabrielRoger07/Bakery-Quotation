import { useState } from "react";

export default function useCharLimit(limit, fieldName) {
    const [value, setValue] = useState("")
    const [warning, setWarning] = useState("")
    const [isInvalid, setIsInvalid] = useState(false)

    const handleChange = (e) => {
        const newValue = e.target.value
        setValue(newValue)

        if(newValue.length <= limit){
            if(warning) setWarning("")
            if(isInvalid) setIsInvalid(false)
        }
    }

    const handleBlur = () => {
        if(value.length > limit){
            setWarning(`Maximum of ${limit} characters allowed for ${fieldName}.`)
            setIsInvalid(true)
        } else {
            setIsInvalid(false)
        }
    }

    return { value, setValue, onChange: handleChange, onBlur: handleBlur, warning, isInvalid }
}