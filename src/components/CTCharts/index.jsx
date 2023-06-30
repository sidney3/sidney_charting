import React, { useEffect, useState } from "react"
import SizeOverTime from "../LineGraph"
import { Circle } from "react-shapes"
import Test from "../PieChart/test_transition"
import { default_key_to_color } from "../../utils"
import PieChart from "../PieChart/oldIndex"
import PieCharts from "../PieChart"
import BarChart from "../BarChart"
import "./index.css"

const CellaredSOTdata = require("./mock_data/bottlesovertime.json").map(
  (d) => [Math.max(0, d.Date), Math.max(0, d.Cellared)]
)
const PriceSOTdata = require("./mock_data/priceovertime.json").map((d) => [
  Math.max(0, d.Date),
  Math.max(0, d.Price),
])

const largeCellaredOTdata =
  require("./mock_data/largebottlesovertime.json").map((d) => [
    Math.max(0, d.Date),
    Math.max(0, d.Cellared),
  ])

const wineByYear = require("./mock_data/winebyyear.json")
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
      data: CellaredSOTdata,
      name: "Cellared over Time",
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
              data: largeCellaredOTdata,
              name: "Large Cellared over time data",
              key: 1,
            },
          ])
        }}
      >
        Change Dataset
      </button>
    </div>
      <Test />
      {/* <BarChart height={500} width={500} data={wineByYear} /> */}
      <PieCharts height={500} width={500} data={wineByCountry} />
      {/* <PieChart height={500} width={500} data={wineByCountry} /> */}
    </div>
  )
}

export default CTCharts
