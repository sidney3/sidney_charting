import React, { useRef, useEffect } from "react"
import * as d3 from 'd3'
import { render } from "@testing-library/react"

function PieChart({width,height, data}){

  const svgRef = useRef()

  useEffect(() => {
    //svg within SVG
    const svg = d3.select(svgRef.current)
    .selectAll("#Chart-Render")
    .data([null])
    .join('g')
    .attr("id", "Chart-Render")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    
    //create border
  

    const initial_radius = 50
    const test_data = [{store: 2, radius: initial_radius}, {store: 2, radius: initial_radius},{store: 3, radius: initial_radius}, {store: 5, radius: initial_radius}]

    const colorScale = d3.scaleLinear().domain([0, test_data.length])
      .range(["maroon", "tan"])
    // console.log(d3.range(5))

    .range(['maroon', 'tan']);

    
    const arc = d3.arc()
      .innerRadius(20)
      .outerRadius((d) => {
        return d.data.radius
      })

    const big_arc = d3.arc()
      .innerRadius(20)
      .outerRadius((d) => {
        if(d.data.index === 2){
          return d.data.radius + 30
        }
        else{
          return d.data.radius
        }
      })
    
    
    var pie = d3.pie()
        .startAngle(-90 * (Math.PI / 180))
        .endAngle(90 * (Math.PI / 180))
        .padAngle(.02)
        .value(function(d) {return d.store; })
        .sort(null)

    
    let render_data = pie(test_data)
    console.log(render_data)

    let opacity = 1
    const render_pie = () => {
      svg.selectAll("path")
      .data(render_data)
      .join(
        (enter) => {
          return enter
          .append("path")
          .attr("d", arc)
        }
        ,
        (update) =>
        {
          return update
          .transition()
          .duration(300)
          .attr("d", arc)
        }  
      )
      .attr('fill', (d,i) => colorScale(i))
      .on('mouseenter', function (d,i) {
        i.data.radius += 10
        render_pie()
      })
      .on('mouseleave', function (d,i) {
        i.data.radius = initial_radius
        render_pie()
      })
    }
    render_pie()
    

  

  }, [height,width, data])

  return(
    <svg ref={svgRef} style={{ height: height, width: width, transform: "translate(" + width / 2 + "," + height / 2 + ")" }}></svg>
  )
}

export default PieChart