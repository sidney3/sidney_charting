import React, { useRef, useEffect } from "react"
import * as d3 from "d3"
import { PieBakery } from "./PieBakery"
/*

Legacy code to be used as a reference for making Pie Charts

*/

function PieCharts({ width, height, data }) {
  const svgRef = useRef()



  useEffect(() => {
    // console.log("data", data)
    // const depth = PieBakery.getDepth(data, 1)
    // console.log("depth: ",  depth)
    // const pieTree = {}
    // const prepArgs = {
    //   inputData: data,
    //   blankTree: pieTree,
    //   config: {radiusChange: 10, Depth: depth},
    //   key: [],
    //   ParentRadius: 30,
    //   Angles: {startAngle: 0, endAngle: 2*Math.PI}
    // }
    // PieBakery.PrepPie(prepArgs)
    // console.log(pieTree)

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

    const transformed_data = data.Children.map((d) => {
      return {
        store: d.Cellared,
        text: d.Name,
        radius: initial_radius,
        children: d.Children,
      }
    })

    let curr_data = transformed_data


    const colorScale = d3
      .scaleLinear()
      .domain([0, curr_data.length])
      .range(["maroon", "tan"])
      .range(["maroon", "tan"])

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
    
    //params:
    /**
     * {
     *  measurements: {startAngle, endAngle, min_radius, max_radius},
     *  config: {direction, initial},
     *  index,
     *  data
     * }
     * 
     */
    const render_preview = (params) => {
      //genius idea: we can just pass in the initial and target radii ! ! ! !
      const previewPie = d3
        .pie()
        .startAngle(params.measurements.startAngle)
        .endAngle(params.measurements.endAngle)
        .padAngle(0.02)
        .value((d) => d.store)
        .sort(null)

      const previewArc = (r) =>
        d3
          .arc()
          .innerRadius(params.measurements.min_radius)
          .outerRadius(params.measurements.min_radius + r)

      const previewColors = d3
        .scaleLinear()
        .domain([0, params.data.length])
        .range(["yellow", "pink"])

    let processed_preview_data = previewPie(params.data)
     svg
      .selectAll(`#previewPie${params.index}-`)
      .data(processed_preview_data)
      .join(
            (enter) => enter.append("path"),
            (update) => update
            .transition()
            .duration(500)
            .tween('preview-tween', function() {
              const start_radius = preview_locations[params.index] ?? 0
              let target_radius
              if(params.config.initial) {
                target_radius = start_radius
              }
              else if(params.config.direction){
                target_radius = params.measurements.max_radius - params.measurements.min_radius
              }
              else{
                target_radius = 0
              }
              return function(t){
                const radius = d3.interpolate(start_radius, target_radius)(t)
                preview_locations[params.index] = radius
                svg
                .selectAll(`#previewPie${params.index}-`)
                .attr('d', previewArc(radius))
                // processed_preview_data.push(null)
                // processed_preview_data.pop()
              }
 
            })
            )
          .attr("id", `previewPie${params.index}-`)
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
              .attr("fill", (d, i) => colorScale(i))
          }
        )
        .attr("id", "piePath")
        .on("mouseenter", function (d, i) {
          invis_text_index = i.index
          render_pie_text(pie, curr_data)
          const childData = i.data.children.map((child) => {
            return { store: child.Cellared }
          })
          const render_preview_params = {
            measurements: {
              startAngle: i.startAngle,
              endAngle: i.endAngle,
              min_radius: initial_radius,
              max_radius: initial_radius + 30
            },
            config: {
              direction: true,
              initial: false
            },
            index: i.index,
            data: childData
          }
          const dummy_preview_params = {
            measurements: {
              startAngle: i.startAngle,
              endAngle: i.endAngle,
              min_radius: initial_radius,
              max_radius: initial_radius + 30
            },
            config: {
              direction: true,
              initial: true
            },
            index: i.index,
            data: childData
          }
          render_preview(dummy_preview_params)
          render_preview(render_preview_params)
        })
        .on("mouseleave", function (d, i) {
          invis_text_index = -1
          i.data.radius = initial_radius
          const childData = i.data.children.map((child) => {
            return { store: child.Cellared }
          })
          const render_preview_params = {
            measurements: {
              startAngle: i.startAngle,
              endAngle: i.endAngle,
              min_radius: initial_radius,
              max_radius: initial_radius + 30
            },
            config: {
              direction: false,
              initial: false
            },
            index: i.index,
            data: childData
          }
          render_preview(render_preview_params)
          render_pie()
          render_pie_text(pie, curr_data)
        })
    }

    const render_pie_text = (pie_func, input_data) => {
      svg
        .selectAll("#pieText")
        .data(pie_func(input_data))
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
    render_pie_text(pie, curr_data)
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

export default PieCharts
