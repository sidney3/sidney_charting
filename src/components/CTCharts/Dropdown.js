import React, { useState } from 'react'

export function Dropdown(){

  const [value, setValue] = useState(1)

  const handleChange = (event) => {
    setValue(event.target.value)
  }

  const options = [[1, "Fruit"], [2, "Dog"], [3, "Cat"]]
  return(
    <div>
      <select onChange = {handleChange}>
        {options.map((option) => (
          <option value={option[0]}> {option[1]} </option>
        ))}
      </select>
      <p>{value}</p>
    </div>
  )
}