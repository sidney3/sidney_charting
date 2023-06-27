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
      { store: 6, radius: initial_radius, text: "France" },
    ]

    const transformed_data = data.map((d) => {
      return {
        store: d.Cellared,
        text: d.Name,
        radius: initial_radius,
        children: d.Children,
      }
    })

    let curr_data = transformed_data

    let erased_index = -1

    const colorScale = d3
      .scaleLinear()
      .domain([0, curr_data.length])
      .range(["maroon", "tan"])
      // console.log(d3.range(5))

      .range(["maroon", "tan"])

    const colorFunc = (i) => {
      if (i === erased_index) {
        return "transparent"
      } else {
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

    let invis_text_index = -1
    const get_text_opacity = (i) => {
      if (i === invis_text_index) {
        return 0
      } else {
        return 1
      }
    }

    let preview_locations = []
    let waiting_on_transition = false
    
    const render_preview = (startAngle, endAngle, previewData, direction, index, initial) => {
      const previewPie = d3
        .pie()
        .startAngle(startAngle)
        .endAngle(endAngle)
        .padAngle(0.02)
        .value((d) => d.store)
        .sort(null)

      const previewArc = (r) =>
        d3
          .arc()
          .innerRadius(initial_radius)
          .outerRadius(initial_radius + r)

      const previewColors = d3
        .scaleLinear()
        .domain([0, previewData.length])
        .range(["yellow", "pink"])

      let processed_preview_data = previewPie(previewData)
     svg
      .selectAll(`#previewPie${index}`)
      .data(processed_preview_data)
      .join(
            (enter) => enter.append("path"),
            (update) => update
            .transition()
            .duration(100)

            .tween('preview-tween', function() {
              const start_radius = preview_locations[index] ?? 0
              let target_radius
              if(initial) {
                target_radius = start_radius
              }
              else if(direction){
                target_radius = 30
              }
              else{
                target_radius = 0
              }
              return function(t){
                console.log("arc path: ", previewPie(previewData))
                const radius = d3.interpolate(start_radius, target_radius)(t)
                preview_locations[index] = radius
                svg
                .selectAll(`#previewPie${index}`)
                .attr('d', previewArc(radius))
                //force a refresh
                processed_preview_data.push(null)
                processed_preview_data.pop()
              }
 
            })
            )
          .attr("id", `previewPie${index}`)
          .attr("fill", (d, i) => previewColors(i))
    }

    const render_pie = () => {
      svg
        .selectAll("#piePath")
        .data(pie(curr_data))
        .join(
          (enter) => {
            return enter.append("path").attr("d", arc)
          },
          (update) => {
            return update
              .transition()
              .duration(200)
              .attr("d", arc)
              .attr("fill", (d, i) => colorFunc(i))
          }
        )
        .attr("id", "piePath")
        .on("mouseenter", function (d, i) {
          // i.data.radius += 10
          //render_pie()

          invis_text_index = i.index
          render_pie_text()
          const childData = i.data.children.map((child) => {
            return { store: child.Cellared }
          })
          console.log("entering index", i.index)

          // if(!preview_locations[index]){

          // }
          render_preview(i.startAngle, i.endAngle, childData, false, i.index, true)
          render_preview(i.startAngle, i.endAngle, childData, true, i.index, false)
        })
        .on("mouseleave", function (d, i) {
          invis_text_index = -1
          i.data.radius = initial_radius
          const childData = i.data.children.map((child) => {
            return { store: child.Cellared }
          })
          console.log("exiting index", i.index)
          render_preview(i.startAngle, i.endAngle, childData, false, i.index, false)
          render_pie()
          render_pie_text()
        })
    }

    const render_pie_text = () => {
      svg
        .selectAll("#pieText")
        .data(pie(curr_data))
        .join(
          (enter) =>
            enter
              .append("text")
              .text((d) => d.data.text)
              .attr("opacity", 1),
          (update) =>
            update
              .transition()
              .delay(200)
              .attr("opacity", (i) => get_text_opacity(i.index))
        )
        .attr("id", "pieText")
        .attr("transform", function (d) {
          var c = arc.centroid(d),
            xp = c[0],
            yp = c[1],
            // pythagorean theorem for hypotenuse
            hp = Math.sqrt(xp * xp + yp * yp)
          return (
            "translate(" +
            (xp / hp) * (initial_radius + 30) +
            "," +
            (yp / hp) * (initial_radius + 30) +
            ")"
          )
        })
        .style("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", 12) //whereeee do I put the text to make it look not awful???
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
      }}
    ></svg>
  )
}

export default PieChart
