import React, { useEffect, useState } from "react"
import SizeOverTime from "../sizeOverTime"

const BottlesSOTdata = require("./mock_data/bottlesovertime.json").map((d) => [
  Math.max(0, d.Date),
  Math.max(0, d.Cellared),
])
const PriceSOTdata = require("./mock_data/priceovertime.json").map((d) => [
  Math.max(0, d.Date),
  Math.max(0, d.Price),
])

function CTCharts() {
  const [SOTData, setSOTData] = useState([
    {
      data: BottlesSOTdata,
      name: "Bottles over Time",
    },
    {
      data: PriceSOTdata,
      name: "Price over Time",
    },
  ])

  //we pass data in the form
  /*
  [
    {
      name: str,
      data: [[a,b], [a,b]]
    },
    ...
  ]
  */

  return (
    <div>
      <p>{SOTData[0].name}</p>
      <SizeOverTime h={200} w={600} data={SOTData} />
      <SizeOverTime h={200} w={600} data={SOTData} />
      <button
        onClick={() => {
          setSOTData([
            {
              data: PriceSOTdata,
              name: "Price over Time",
            },
          ])
        }}
      >
        Change Dataset
      </button>
    </div>
  )
}

export default CTCharts
