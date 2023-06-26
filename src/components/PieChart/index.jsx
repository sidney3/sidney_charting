import React, { useRef, useEffect } from "react"
import * as d3 from "d3"
import { render } from "@testing-library/react"

function PieChart({ width, height, data }) {
  const svgRef = useRef()

  useEffect(() => {
    //svg within SVG
    const svg = d3
      .select(svgRef.current)
      .selectAll("#Chart-Render")
      .data([null])
      .join("g")
      .attr("id", "Chart-Render")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

    //create border

    const initial_radius = 100
    const inner_radius = 60

    const test_data = [
      { store: 2, radius: initial_radius, text: "USA" },
      { store: 6, radius: initial_radius, text: "France"},
      { store: 3, radius: initial_radius, text: "Denmark" },
      { store: 5, radius: initial_radius, text: "Sweden" },
    ]

    const transformed_data = data.map((d) => 
      {
        return {store: d.Cellared, text: d.Name, radius: initial_radius}
      }
    )

    let erased_index = -1

    const colorScale = d3
      .scaleLinear()
      .domain([0, transformed_data.length])
      .range(["maroon", "tan"])
      // console.log(d3.range(5))

      .range(["maroon", "tan"])

    const colorFunc = (i) => {
      if(i === erased_index){
        return 'transparent'
      }
      else{
        return colorScale(i)
      }
    } 

    const arc = d3
      .arc()
      .innerRadius(inner_radius)
      .outerRadius((d) => {
        return d.data.radius
      })

    var pie = d3
      .pie()
      .startAngle(0)
      .endAngle(360 * (Math.PI / 180))
      .padAngle(0.02)
      .value(function (d) {
        return d.store
      })
      .sort(null)

    let render_data = pie(transformed_data) // radius for label anchor


    const render_pie = () => {
      svg
        .selectAll("#piePath")
        .data(render_data)
        .join(
          (enter) => {
            return enter.append("path").attr("d", arc).attr("fill", (d, i) => colorFunc(i))
          },
          (update) => {
            return update.transition().duration(300).attr("fill", (d, i) => colorFunc(i))
          }
        )
      
        .attr("id", "piePath")
        .on("mouseenter", function (d, i) {
          erased_index = i.index
          i.data.radius += 10
          render_pie()
          render_pie_text()
          console.log(i)

        })
        .on("mouseleave", function (d, i) {
          erased_index = -1
          i.data.radius = initial_radius
          render_pie()
          render_pie_text()
        })
    }

    const render_pie_text = () => {
      svg
        .selectAll('#pieText')
        .data(render_data)
        .join(
          (enter) => enter.append('text').text((d) => d.data.text),
          (update) => update.text((d) => d.data.text)
        )
        .attr('id', 'pieText')
        .attr("transform", function(d) {
          var c = arc.centroid(d),
              xp = c[0],
              yp = c[1],
              // pythagorean theorem for hypotenuse
          hp = Math.sqrt(xp*xp + yp*yp);
          return "translate(" + (xp/hp * (initial_radius - inner_radius + 8)) +  ',' +
             (yp/hp * (initial_radius - inner_radius + 8)) +  ")"; 
      })
        .style('text-anchor', 'middle')
        .style('font-size', 12) //whereeee do I put the text to make it look not awful???
    }
    render_pie()
    render_pie_text()
  }, [height, width, data])

  return (
    <svg
      ref={svgRef}
      style={{
        height: height,
        width: width,
        transform: "translate(" + width / 2 + "," + height / 2 + ")",
      }}
    ></svg>
  )
}

export default PieChart
