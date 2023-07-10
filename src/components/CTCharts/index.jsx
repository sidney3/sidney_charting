import React, { useEffect, useState } from "react"
import SizeOverTime from "../LineGraph"
import { Circle } from "react-shapes"
import Test from "../PieChart/test_transition"
import { default_key_to_color } from "../../utils"
import PieChart from "../PieChart/oldIndex"
import PieCharts from "../PieChart"
import BarChart from "../BarChart"
import "./index.css"

const CellaredSOTdata = require("./mock_data/bottlesovertime.json").map((d) => [
  Math.max(0, d.Date),
  Math.max(0, d.Cellared),
])
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
const wineByCountryForBarChart = require("./mock_data/winebycountry.json").Children

//console.log(manyLayers)

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

  const [barChartData, setBarChartData] = useState(wineByYear)

  //very temp idea lol
  const [barChartIndex, setBarChartIndex] = useState(0)

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
          Change Line Graph Dataset
        </button>
      </div>
      <Test />
      <div>
      <BarChart total_height={500} total_width={500} data={barChartData} />
      <button onClick={() => {
        if(barChartIndex % 2 === 0){
          setBarChartData(wineByCountryForBarChart)
        }
        else {
          setBarChartData(wineByYear)
        }
        setBarChartIndex((index) => index + 1)
      }}>
        Change Bar Chart Dataset</button>

      <div>
      <PieCharts height={500} width={500} data={wineByCountry} />
      </div>
      {/* <PieChart height={500} width={500} data={wineByCountry} /> */}
      </div>
    </div>
  )
}

export default CTCharts
