import React, { useRef, useEffect, useState} from "react"
import * as d3 from "d3"
import { PieBakery } from "./PieBakery"


function PieChart({ width, height, data }) {
  const svgRef = useRef()

  useEffect(() => {
    console.log("data", data)
    const depth = PieBakery.getDepth(data, 1)

    const factorize = (num) => {
      if(num === 1){
        return 1
      }
      return num * factorize(num - 1)
    }
    const max_entries = 10
    console.log(max_entries)

    console.log("depth: ",  depth)
    const pieTree = {}
    const prepArgs = {
      inputData: data,
      blankTree: pieTree,
      config: {radiusChange: 50, Depth: depth},
      key: [],
      ParentRadius: 50,
      Angles: {startAngle: 0, endAngle: 2*Math.PI},
      TEMP_color_index: max_entries
    }


    PieBakery.PrepPie(prepArgs)

    pieTree.temporary = false
    pieTree.direction = true
    pieTree.root = true

    console.log("final tree: ", pieTree)



    const svg = d3
      .select(svgRef.current)
      .selectAll("#Chart-Render")
      .data([null])
      .join("g")
      .attr("id", "Chart-Render")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    
    PieBakery.BakePie(pieTree, false, svg)

  })

  return (
    <svg
      ref={svgRef}
      style={{
        height: height,
        width: width,
      }}
    ></svg>
  )
}

export default PieChart
