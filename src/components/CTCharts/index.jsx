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

const largeBottlesOTdata = require("./mock_data/largebottlesovertime.json").map(
  (d) => [Math.max(0, d.Date), Math.max(0, d.Cellared)]
)

function RenderDataPreview({ dataPreview, dataArr }) {
  return(
    dataArr.map((d, index) => {
      return <span key={index}> {d.name}: {dataPreview[d.key]}</span>
    }
    )
  )
}

function CTCharts() {
  const [dataArr, setDataArr] = useState([
    {
      data: PriceSOTdata,
      name: "Price over Time",
      key: 1,
    },
    {
      data: BottlesSOTdata,
      name: "Bottles over Time",
      key: 0,
    },
  ])

  const [dataPreview, setDataPreview] = useState([2,5])

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
      <RenderDataPreview
        dataPreview={dataPreview}
        dataArr={dataArr}
      />
      <SizeOverTime
        h={600}
        w={600}
        data={dataArr}
        dataPreview={dataPreview}
        setDataPreview={setDataPreview}
      />
      <button
        onClick={() => {
          setDataArr([
            {
              data: largeBottlesOTdata,
              name: "Large Bottles over time data",
            },
            {
              data: BottlesSOTdata,
              name: "Bottles",
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
