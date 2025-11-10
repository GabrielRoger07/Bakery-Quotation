import { useState } from "react";

export default function usePhoneMask () {
    const [maskedValue, setMaskedValue] = useState("")
    const [rawValue, setRawValue] = useState("")

    const handleChange = (e) => {
        let input = e.target.value.replace(/\D/g, "")
        if(input.length > 11){
            input = input.slice(0, 11)
        }
        
        setRawValue(input)

        if(input.length === 0){
            setMaskedValue("")
            return
        }

        const ddd = input.slice(0, 2)
        const number = input.slice(2)

        let formatted = `(${ddd}) `

        if(number.length <= 4){
            formatted += number
        } else if(number.length === 8){
            formatted += number.slice(0, 4) + "-" + number.slice(4)
        } else if(number.length >= 9){
            formatted += number.slice(0, 5) + "-" + number.slice(5)
        } else {
            formatted += number
        }

        setMaskedValue(formatted)
    }

    return { maskedValue, rawValue, onChange: handleChange }
}