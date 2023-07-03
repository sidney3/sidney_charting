import { useState, React, useEffect, useRef } from "react"
import * as d3 from "d3"

function BarChart({total_height, total_width, data}){
  const svgRef = useRef()

  useEffect(() => {
    // set the dimensions and margins of the graph
      var margin = {top: 30, right: 30, bottom: 70, left: 60},
      width = total_width - margin.left - margin.right,
      height = total_height - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3.select(svgRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

      // Parse the Data
      // X axis
      var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(data.map(function(d) { return d.label; }))
      .padding(0.2);
      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

      // Add Y axis
      var y = d3.scaleLinear()
      .domain([0, Math.max(...data.map((d) => d.Cellared))])
      .range([ height, 0]);
      svg.append("g")
      .call(d3.axisLeft(y));

      // Bars
      svg.selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(d.label); })
      .attr("y", function(d) { return y(d.Cellared); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.Cellared); })
      .attr("fill", "#69b3a2")

  })

  return(
    <div>
      <svg ref={svgRef} style={{ height: total_height, width: total_width }}></svg>
    </div>
  )
}

export default BarChart