import { useState, React, useEffect, useRef } from "react"
import * as d3 from "d3"

function BarChart({height, width, data}){
  const svgRef = useRef()

  useEffect(() => {
    const svg = d3.select(svgRef.current)

    svg.append('rect').attr('x', 0).attr('y', 0).attr('height', 50).attr('width', 60)

    // x-axis

    const x_axis = d3.scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.label))
      .padding(0.2)
    console.log(data)
    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x_axis))
      // .selectAll("text")
      // .attr("transform", "translate(-10,0)rotate(-45)")
      // .style("text-anchor", "end");

  })

  return(
    <div>
      <svg ref={svgRef} style={{ height: height, width: width }}></svg>
    </div>
  )
}

export default BarChart