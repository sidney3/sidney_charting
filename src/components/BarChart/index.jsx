import { useState, React, useEffect, useRef } from "react"
import { MakeBar } from "./MakeBar"
import * as d3 from "d3"
import { GraphLine } from "../LineGraph/GraphLine"

function BarChart({ total_height, total_width, data, fieldname }) {
  const svgRef = useRef()

  d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
      this.parentNode.appendChild(this)
    })
  }
  d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    })};

  useEffect(() => {
    
    d3.select(svgRef.current)
      .selectAll('#borderRect')
      .data([null])
      .attr('id', 'borderRect')
      .join('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', total_height)
      .attr('width', total_width)
      .attr('fill', 'transparent')
      .attr('stroke', 'black')
      .moveToBack()

    let focused_frame = -1
    const preview_frame_height = 80
    // set the dimensions and margins of the graph
    const margin = {
        top: preview_frame_height,
        right: 30,
        bottom: 70,
        left: 60,
      },
      width = total_width - margin.left - margin.right,
      height = total_height - margin.top - margin.bottom

    const colorRange = d3
      .scaleLinear()
      .domain([0, data.length])
      .range(["#851b48", "#e9a363"])

    var svg = d3
      .select(svgRef.current)
      .selectAll("#mainBarChart")
      .data("null")
      .join("g")
      .attr("id", "mainBarChart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // X axis
    var x = d3
      .scaleBand()
      .range([0, width])
      .domain(
        data.map(function (d) {
          return d.Name
        })
      )
      .padding(0.5)

    //add text and axis
    svg
      .selectAll("#x-Axis")
      .data([x])
      .join("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("id", "x-Axis")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([0, Math.max(...data.map((d) => d.Cellared))])
      .range([height, 0])
    svg
      .selectAll("#y-Axis")
      .data([null])
      .join("g")
      .attr("id", "y-Axis")
      .call(d3.axisLeft(y))

    const bar_svg = d3
      .select(svgRef.current)
      .selectAll("#barChartComponents")
      .data("null")
      .join("g")
      .attr("id", "barChartComponents")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    const barGroups = bar_svg.selectAll("g").data(data)
    
    barGroups.exit().remove()

    const newBarGroup = barGroups
      .enter()
      .append("g")
      .attr("id", (d, i) => `g${i}`)

    newBarGroup
      .append("rect")
      .attr("fill", (d, i) => {
        return colorRange(i)
      })
      .attr("x", function (d) {
        return x(d.Name)
      })
      .attr("y", function (d) {
        return y(d.Cellared)
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return height - y(d.Cellared)
      })
      .on("mouseover", (d, i) => {
        focused_frame = data.indexOf(i)
        if(focused_frame === -1){
          console.error('did not find the targeted data. See BarChart main component')
        }
        else{
          MakeBar.update_preview(svg, focused_frame, data, x, y, fieldname, preview_frame_height)
        }
      })
      


    barGroups
      .select("rect")
      .on("mouseover", (d, i) => {
        focused_frame = data.indexOf(i)
        if(focused_frame === -1){
          console.error('did not find the targeted data. See BarChart main component')
        }
        else{
          MakeBar.update_preview(svg, focused_frame, data, x, y, fieldname, preview_frame_height)
        }
      })
      .transition()
      .duration(200)
      .attr("x", function (d) {
        return x(d.Name)
      })
      .attr("y", function (d) {
        return y(d.Cellared)
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return height - y(d.Cellared)
      })
      

    MakeBar.make_preview(svg, x, y)
  }, [data, total_height, total_width])

  return (
    <div>
      <svg
        ref={svgRef}
        style={{ height: total_height, width: total_width }}
      ></svg>
    </div>
  )
}

export default BarChart
