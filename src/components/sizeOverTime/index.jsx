import { useState, React, useEffect, useRef } from "react"
import * as d3 from "d3"
import { PathManager } from "./PathManager"
import { GraphLine } from "./GraphLine"

import {
  DEFAULT_OFFSETS,
  ONE_DAY,
  ONE_YEAR,
  X_DATA_POINTS,
  Y_DATA_POINTS,
} from "../../constants"
import { ticks, unix_to_MDY } from "../../utils"

function SizeOverTime({ h, w, data, dataPreview, setDataPreview }) {
  if (h <= DEFAULT_OFFSETS.y * 2 || w <= DEFAULT_OFFSETS.x * 2) {
    throw Error("Height or width exceeds default offset.")
  }

  const [infoLabel, setInfoLabel] = useState({
    location: { x: DEFAULT_OFFSETS.x, y: DEFAULT_OFFSETS.y },
    date: "",
    datum: "",
  })
  const [labelHidden, setLabelHidden] = useState(true)
  const [timeView, setTimeView] = useState(30 * ONE_YEAR)
  const [vertPreview, setVertPreview] = useState(0)

  //keep a copy of the last path so that we can transition between lines
  //const [oldState, setOldState] = useState({})

  const [oldGraph, setOldGraph] = useState({})

  //we do not store this as a React state because we choose to manage it ourselves via
  //the D3 component. Leaving it to React unfortunately did not work

  const svgRef = useRef()

  /**
   * UseEffect block for rendering vertical line following users cursor
   */
  useEffect(() => {

    const svg = d3.select(svgRef.current)

    svg.selectAll('#vert-preview')
      .data([vertPreview])
      .join("path")
      .attr("id", 'vert-preview')
      .attr('d', (d) => {
        const lineData = [[vertPreview, DEFAULT_OFFSETS.y], 
      [vertPreview, h - DEFAULT_OFFSETS.y]]
        return d3.line()
          .x((a) => a[0])
          .y((a) => a[1])
          (lineData)
      })
      .attr("stroke", "black")
  }, [vertPreview, h])
  /**
   * A secondary useEffect block.
   *
   * Because none of these components depend on the data, we extract them from the
   * main useEffect block (such that they are re-rendered only when height/width change)
   */
  useEffect(() => {
    const svg = d3.select(svgRef.current)

    svg
      .selectAll("#y-axis-dashes")
      .data(PathManager.get_y_dashes(h, w))
      .join("path")
      .attr("d", (d) => d)
      .attr("id", "y-axis-dashes")
      .attr("stroke", "black")
      .style("stroke-dasharray", "3, 3")

    svg
      .selectAll("#graph-border")
      .data([null])
      .join("rect")
      .attr("id", "graph-border")
      .attr("x", DEFAULT_OFFSETS.x)
      .attr("y", DEFAULT_OFFSETS.y)
      .attr("height", h - 2 * DEFAULT_OFFSETS.y)
      .attr("width", w - 2 * DEFAULT_OFFSETS.x)
      .attr("stroke", "black")
      .attr("fill", "transparent")

    svg
      .selectAll("#region-border")
      .data([null])
      .join("rect")
      .attr("id", "region-border")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", h)
      .attr("width", w)
      .attr("stroke", "black")
      .attr("fill", "transparent")
  
  }, [h, w, data.length, vertPreview])
  /**
   * The body of the program.
   *
   * We render in a line for each entry in data
   * and then render the x and y axes accordingly
   */
  useEffect(() => {

    //TODO: pre-process data to get mins/maxes
    //and append max zero item to all non-max lists
    //This can happen in SizeOverTime

    const processed_data = PathManager.pre_process_datums(data, timeView,h,w)
    

    //let all_bounds = []
    data.forEach((d, i) => {
      const path_params = {
        index: i,
        data: processed_data.filtered_data,
        svg: svgRef.current,
        data_details: {
          bounds: processed_data.large_bounds,
          formulae: processed_data.formulae,
          keys: data.map((d) => d.key)
        },
        chart_details: {
          height: h,
          width: w,
        },
        states: {
          infoLabel: {
            set: setInfoLabel,
          },
          labelHidden: {
            get: labelHidden,
            set: setLabelHidden,
          },
          timeView: {
            get: timeView,
          },
          vertPreview: {
            set: setVertPreview
          },
          oldGraph: {
            set: setOldGraph,
            get: oldGraph
          },
          dataPreview:{
            get: dataPreview,
            set: setDataPreview
          }
          
        },
      }
      //all_bounds.push(GraphLine.load_line(path_params))
      GraphLine.load_line(path_params)
    })
    //const large_bounds = GraphLine.process_bounds(all_bounds)

    const svg = d3.select(svgRef.current) // select svg ref

    //this doesn't interact with each component
    svg
      .selectAll("#infotext")
      .data([infoLabel, infoLabel])
      .join("text")
      .text((d, i) => {
        if (i === 0) {
          return d.date
        } else {
          return d.datum
        }
      })
      .attr("id", "infotext")
      .attr("x", (d, i) => d.location.x)
      .attr("y", (d, i) => d.location.y + 20 * i)
      .attr("opacity", () => {
        if (labelHidden) {
          return "0"
        } else {
          return "1"
        }
      })

    const y_axis_coords = ticks(
      DEFAULT_OFFSETS.y,
      h - DEFAULT_OFFSETS.y,
      Y_DATA_POINTS
    ).reverse()
    //for this we just need the minimum and maximum y mins and maxes
    svg
      .selectAll("#y-axis-datums")
      .data(ticks(processed_data.bounds.y_min, processed_data.bounds.y_max, X_DATA_POINTS))
      .join("text")
      .text((d) => d)
      .attr("id", "y-axis-datums")
      .attr("x", DEFAULT_OFFSETS.x / 2)
      .attr("y", (d, i) => y_axis_coords[i])
      .style("text-anchor", "middle")

    //same for this
    const x_axis_coords = ticks(
      DEFAULT_OFFSETS.x,
      w - DEFAULT_OFFSETS.x,
      Y_DATA_POINTS
    )
    svg
      .selectAll("#x-axis-datums")
      .data(ticks(processed_data.bounds.x_min, processed_data.bounds.x_max, Y_DATA_POINTS))
      .join("text")
      .text((d) => unix_to_MDY(d))
      .attr("id", "x-axis-datums")
      .attr("x", (d, i) => x_axis_coords[i])
      .attr("y", h - DEFAULT_OFFSETS.y / 2)
      .style("text-anchor", "middle")
  }, [h, w, data, timeView])

  /*
  When we shorten the length of data (i.e. go from 2 data sets to 1),
  we remove all of the lines that are tied to higher indices than number of 
  data points
  */
  useEffect(() => {
    
    const svg = d3.select(svgRef.current)

    for (const [index, ignored] of Object.entries(oldGraph)) {
      if (index >= data.length) {
        svg
          //second path with the same line as the above
          .selectAll(`#linegraph${index}`)
          .remove()

        svg.selectAll(`#g${index}`).remove()
      }
    }
  }, [data.length, oldGraph])

  return (
    <div>
      <svg ref={svgRef} style={{ height: h, width: w }}></svg>
      {/*
      Note: we include such buttons only for demo purposes.

      In a real environment setTimeView should be extracted and called by
      a wrapper function such that SizeOverTime need not worry about modifying
      data (and only rendering it)
      */}
      <button
        onClick={() => {
          setLabelHidden(true)
          setTimeView(2 * ONE_YEAR)
        }}
        id="b1"
      >
        2 Years
      </button>
      <button
        onClick={() => {
          setLabelHidden(true)
          setTimeView(1 * ONE_YEAR)
        }}
      >
        {" "}
        1 Year{" "}
      </button>
      <button
        onClick={() => {
          setLabelHidden(true)
          setTimeView(6 * 30 * ONE_DAY)
        }}
      >
        {" "}
        6 Month{" "}
      </button>
    </div>
  )
}

export default SizeOverTime
