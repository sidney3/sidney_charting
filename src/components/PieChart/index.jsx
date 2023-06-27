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
      return { store: d.Cellared, text: d.Name, radius: initial_radius, children: d.Children }
    })

    let curr_data = transformed_data

    let erased_index = -1
    let preview_visible = false

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
      if(i === invis_text_index){
        return 0
      }
      else{
        return 1
      }
    }

    

    const render_preview = (startAngle, endAngle, previewData) => {
      console.log("entering render preview")
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

      console.log(previewPie(previewData))

      const renderPreviewPie = (r) => {
        svg
        .selectAll("#previewPie")
        .data(previewPie(previewData))
        .join(
          (enter) => enter.append("path").attr('d', previewArc(r)),

          (update) => update.attr('d', previewArc(r))
        )
        .attr('id', 'previewPie')
        .attr('fill', (d,i) => previewColors(i))
      }
      

      svg.transition()
      .duration(2000)
      .tween("previewTween", function() {
        let start_radius
        let target_radius
        if(preview_visible) {
          start_radius = 0
          target_radius = 20
        }
        else{
          start_radius = 20
          target_radius = 0
        }
        

        return function(t) {
          const radius = d3.interpolate(start_radius, target_radius)(t)
          console.log(radius)
          renderPreviewPie(radius)
        }
      })

      //renderPreviewPie(10)
      
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
            return {store: child.Cellared}
          })
          preview_visible = true
          render_preview(i.startAngle, i.endAngle, childData)
        })
        .on("mouseleave", function (d, i) {
          invis_text_index = -1
          i.data.radius = initial_radius
          preview_visible = false
          const childData = i.data.children.map((child) => {
            return {store: child.Cellared}
          })
          render_preview(i.startAngle, i.endAngle, childData)
          render_pie()
          render_pie_text()
        })
    }

    const render_pie_text = () => {
      svg
        .selectAll("#pieText")
        .data(pie(curr_data))
        .join(
          (enter) => enter.append("text").text((d) => d.data.text).attr('opacity', 1),
          (update) => update.transition().delay(200).attr('opacity', (i) => get_text_opacity(i.index)
            )
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
        .style('fill', 'black')
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
        transform: "translate(" + width / 2 + "," + height / 2 + ")",
      }}
    ></svg>
  )
}

export default PieChart
