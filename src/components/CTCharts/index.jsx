import React, { useEffect, useState } from "react"
import SizeOverTime from "../LineGraph"
import { Circle } from "react-shapes"
import { default_key_to_color } from "../../utils"
import PieChart from "../PieChart"
import "./index.css"

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

const wineByCountry = require("./mock_data/winebycountry.json")

function RenderDataPreview({ dataPreview, dataArr }) {
  return dataArr.map((d) => {
    return (
      <div key={d.key} className="previewRow">
        <Circle
          r={10}
          fill={{ color: d.color ?? default_key_to_color(d.key) }}
        />
        <p>
          {d.name}: {dataPreview[d.key]}{" "}
        </p>
      </div>
    )
  })
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

  const [dataPreview, setDataPreview] = useState({ 0: 0, 1: 1 })

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
    <div>
      <RenderDataPreview dataPreview={dataPreview} dataArr={dataArr} />
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
              key: 1,
            },
          ])
        }}
      >
        Change Dataset
      </button>
    </div>
      <PieChart height={500} width={500} data={wineByCountry} />
    </div>
  )
}

export default CTCharts
