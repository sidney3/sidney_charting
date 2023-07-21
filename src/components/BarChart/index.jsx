import { useState, React, useEffect, useRef } from "react"
import { MakeBar } from "./MakeBar"
import * as d3 from "d3"
import { GraphLine } from "../LineGraph/GraphLine"
import { DEFAULT_OFFSETS } from "../../constants"

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

    console.log("data", data)

    const transformed_data = data.map((d) => [d.Name, d.Cellared])

    const colorRange = d3
      .scaleLinear()
      .domain([0, data.length])
      .range(["#851b48", "#e9a363"])

    const width = total_width - 2*DEFAULT_OFFSETS.x
    const height = total_height - 2*DEFAULT_OFFSETS.y

    var svg = d3
      .select(svgRef.current)
      .selectAll("#mainBarChart")
      .data("null")
      .join("g")
      .attr("id", "mainBarChart")
      .attr("transform", "translate(" + DEFAULT_OFFSETS.x + "," + DEFAULT_OFFSETS.y + ")")

      const y = d3.scaleBand()
        .range([0, height])
        .domain(transformed_data.map((d) => d[0]))
        .padding(.4)
      
      
      svg.selectAll('#y-axis')
        .data([y])
        .join('g')
        .attr('id', 'y-axis')
        .call(d3.axisLeft(y).tickSize(0))
        .call(g => g.select(".domain").remove())
        .selectAll('text')
        .attr('font-size', 20)
        .style('text-anchor', 'start')
        .attr('transform', `translate(4.5, ${-y.bandwidth()*.73})`)

        const x = d3.scaleLinear()
        .domain([0, Math.max(...transformed_data.map((d) => d[1]))*1.2])
        .range([0, width])

        console.log("inverted!: ", x.invert(45))

        // svg.selectAll('#x-Axis')
        // .data([x])
        // .join('g')
        // .attr('transform', `translate(0, ${height})`)
        // .attr('id', 'x-Axis')
        // .call(d3.axisBottom(x).tickValues([0, Math.max(...data.map((d) => d[1])) + 5]))
        // .selectAll("text")
        // .attr('font-size', 13)
        // .attr("transform", "translate(-10,0)")
        // .style("text-anchor", "start");

        let clicked = {}
        data.forEach((d,i) => {clicked[i] = false})

        svg.selectAll("myRect")
        .data(transformed_data)
        .enter()
        .append("rect")
        .attr("x", x(0) )
        .attr("y", function(d) { return y(d[0]); })
        .attr("width", function(d) { return x(d[1]); })
        .attr("height", y.bandwidth() )
        .attr("fill", (d, i) => colorRange(i))
        .on('click', (d,i) => {
          console.log(d, i, transformed_data.findIndex((d) => d === i))
          const box_index = transformed_data.findIndex((d) => d === i)
          
          if(clicked[box_index]) {
            console.log("hiding")
            clicked[box_index] = false
            MakeBar.hide_expander(svg, box_index)

          }
          else{
            console.log("showing")
            clicked[box_index] = true
            MakeBar.show_expander(svg, box_index, 90)
          }
          
        })

      transformed_data.forEach((d, i) => {
        const x_pos =  x(d[1])
        const y_pos = y(d[0])
        MakeBar.make_expander(svg, i, `Cellared: ${d[1]}`, y.bandwidth(), x_pos, y_pos)
      })


  })
  // useEffect(() => {

  //   let focused_frame = -1
  //   const preview_frame_height = 80
  //   // set the dimensions and margins of the graph
    // const margin = {
    //     top: preview_frame_height,
    //     right: 30,
    //     bottom: 70,
    //     left: 60,
    //   },
    //   width = total_width - margin.left - margin.right,
    //   height = total_height - margin.top - margin.bottom

  //   const colorRange = d3
  //     .scaleLinear()
  //     .domain([0, data.length])
  //     .range(["#851b48", "#e9a363"])

  //   var svg = d3
  //     .select(svgRef.current)
  //     .selectAll("#mainBarChart")
  //     .data("null")
  //     .join("g")
  //     .attr("id", "mainBarChart")
  //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  //   // X axis
  //   var x = d3
  //     .scaleBand()
  //     .range([0, width])
  //     .domain(
  //       data.map(function (d) {
  //         return d.Name
  //       })
  //     )
  //     .padding(0.5)

  //   //add text and axis
  //   svg
  //     .selectAll("#x-Axis")
  //     .data([x])
  //     .join("g")
  //     .attr("transform", "translate(0," + height + ")")
  //     .attr("id", "x-Axis")
  //     .call(d3.axisBottom(x))
  //     .selectAll("text")
  //     .attr("transform", "translate(-10,0)rotate(-45)")
  //     .style("text-anchor", "end")

  //   // Add Y axis
  //   var y = d3
  //     .scaleLinear()
  //     .domain([0, Math.max(...data.map((d) => d.Cellared))])
  //     .range([height, 0])
  //   svg
  //     .selectAll("#y-Axis")
  //     .data([null])
  //     .join("g")
  //     .attr("id", "y-Axis")
  //     .call(d3.axisLeft(y))

  //   const bar_svg = d3
  //     .select(svgRef.current)
  //     .selectAll("#barChartComponents")
  //     .data("null")
  //     .join("g")
  //     .attr("id", "barChartComponents")
  //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
  //   const barGroups = bar_svg.selectAll("g").data(data)
    
  //   barGroups.exit().remove()

  //   const newBarGroup = barGroups
  //     .enter()
  //     .append("g")
  //     .attr("id", (d, i) => `g${i}`)

  //   newBarGroup
  //     .append("rect")
  //     .attr("fill", (d, i) => {
  //       return colorRange(i)
  //     })
  //     .attr("x", function (d) {
  //       return x(d.Name)
  //     })
  //     .attr("y", function (d) {
  //       return y(d.Cellared)
  //     })
  //     .attr("width", x.bandwidth())
  //     .attr("height", function (d) {
  //       return height - y(d.Cellared)
  //     })
  //     .on("mouseover", (d, i) => {
  //       focused_frame = data.indexOf(i)
  //       if(focused_frame === -1){
  //         console.error('did not find the targeted data. See BarChart main component')
  //       }
  //       else{
  //         MakeBar.update_preview(svg, focused_frame, data, x, y, fieldname, preview_frame_height)
  //         svg.raise()
  //         //console.log(preview)
  //       }
  //     })
      


  //   barGroups
  //     .select("rect")
  //     .on("mouseover", (d, i) => {
  //       focused_frame = data.indexOf(i)
  //       if(focused_frame === -1){
  //         console.error('did not find the targeted data. See BarChart main component')
  //       }
  //       else{
  //         MakeBar.update_preview(svg, focused_frame, data, x, y, fieldname, preview_frame_height)
  //         svg.raise()
  //       }
  //     })
  //     .transition()
  //     .duration(200)
  //     .attr("x", function (d) {
  //       return x(d.Name)
  //     })
  //     .attr("y", function (d) {
  //       return y(d.Cellared)
  //     })
  //     .attr("width", x.bandwidth())
  //     .attr("height", function (d) {
  //       return height - y(d.Cellared)
  //     })

  //     MakeBar.make_preview(svg, x, y)

      
  //   }, [data, total_height, total_width])

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
