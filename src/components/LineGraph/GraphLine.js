import { PathManager } from "./PathManager"
import { interpolatePath } from "d3-interpolate-path"
import * as d3 from "d3"
import { DEFAULT_OFFSETS } from "../../constants"
import { default_key_to_color, unix_to_MDY, locate_y } from "../../utils"
import { PreviewManager } from "./previewManager"

export class GraphLine {
  //params:
  /*
  {
    data,
    svg
    chart_details: {
      height,
      width,
    },
    data_details: {
      bounds
    },
    states: 
    {
      infoLabel: {
        get
        set
      }

      labelHidden: {
        get
        set
      },
      timeView: {
        get
      },
      vertPreview: {
        set
      },
      dataPreview: {
        get, 
        set
      },
      oldGraph: {
        set: setOldGraph,
        get: oldGraph
      }
    }
  }

  */
  //returns: bounds (minimum and maximum x,y over line)
  /*
  renders in the line for a specific dataset
  also adds event listeners for mouseover
  */
  static load_line(params) {


    const new_line = PathManager.transform_dataset({
      data: params.data[params.index],
      height: params.chart_details.height,
      width: params.chart_details.width,
      formulae: params.data_details.formulae,
    })

    //console.log("y formula: ", params.data_details.formulae.y_formula)
    const line_maker = d3
    .line()
    .x((d) => params.data_details.formulae.x_formula(d[0]))
    .y((d) => params.data_details.formulae.y_formula(d[1]))
    .curve(d3.curveBasis)

    console.log()

    const svg = d3.select(params.svg)

    PreviewManager.make_preview(svg, params.index)


    svg.selectAll(`#g${params.index}`).remove()

    if (new_line.alert === "no_data") {
      svg.selectAll(`#linegraph${params.index}`).remove()

      return {
        x_min: 0,
        x_max: 100,
        y_min: 0,
        y_max: 100,
      }
    }
    const path = svg
      //the visible line
      .selectAll(`#linegraph${params.index}`)
      .data([line_maker])
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => {
              const updateOldGraph = async () => {
                params.states.oldGraph.set((currOldGraph) => {
                  const oldGraphCopy = { ...currOldGraph }
                  oldGraphCopy[params.index] = d(params.data[params.index])
                  return oldGraphCopy
                })
                await new Promise((resolve) => setTimeout(resolve, 0)) // Add a delay to see the updates
              }
              updateOldGraph()
              return d(params.data[params.index])
            })
            .attr("id", `linegraph${params.index}`)
            .attr(
              "stroke",
              params.data[params.index].color ??
                d3.rgb(default_key_to_color(params.data_details.keys[params.index]))
            )
            .attr("fill", "none")
            .attr("stroke-width", "3"),
        (update) =>
          update.transition().attrTween("d", (d) => {
            const store = params.states.oldGraph.get[params.index]
            const updateOldGraph = async () => {
              params.states.oldGraph.set((currOldGraph) => {
                const oldGraphCopy = { ...currOldGraph }
                oldGraphCopy[params.index] = d(params.data[params.index])
                return oldGraphCopy
              })
              await new Promise((resolve) => setTimeout(resolve, 0)) // Add a delay to see the updates
            }

            updateOldGraph()

            if (!store) {
              return interpolatePath(d(params.data[params.index]), d(params.data[params.index]))
            } else {
              return interpolatePath(store, d(params.data[params.index]))
            }
          })
      )
      let preview_location = [0,0]
      const update = () => {
        svg.selectAll(`#previewRect`)
        .data([preview_location])
        .join(
          (enter) => enter.append('rect').attr('x', preview_location[0]).attr('y', preview_location[1]),
          (update) => update
          .attr('x', preview_location[0])
          .attr('y', preview_location[1])
        )
        .attr('id', 'previewRect')
        .attr('height', 5)
        .attr('width', 5)
      }
    svg
      .append("rect")
      .attr("id", `g${params.index}`)
      .attr("x", DEFAULT_OFFSETS.x)
      .attr("y", DEFAULT_OFFSETS.y)
      .attr("stroke", "transparent")
      .attr("fill", "transparent")
      .attr("height", params.chart_details.height - 2 * DEFAULT_OFFSETS.y)
      .attr("width", params.chart_details.width - 2 * DEFAULT_OFFSETS.x)
      .on("mousemove", function (d) {
        GraphLine.handle_mouseover(d.offsetX, d.offsetY, params, svg)
      })
      .on("touchmove", (d) => {
        const touch = d.touches[0]
        console.log(touch)
        GraphLine.handle_mouseover(touch.clientX, touch.clientY, params, svg)
      })
  }

  static handle_mouseover(x, y, params, svg){
    params.states.vertPreview.set(x)

    for(let graph_index = 0; graph_index < params.data.length; graph_index += 1){
      const data_point = PathManager.get_datum({
        x_formula: params.data_details.formulae.x_formula,
        pagePos: {
          x:x,
          y: y,
        },
        data: params.data[graph_index],
      })

      const index_path = svg.selectAll(`#linegraph${graph_index}`)
      const preview_y = locate_y(index_path,x)
      PreviewManager.update_preview(svg, graph_index, x, preview_y, data_point.datum, 40)
    
    }
  }

  /*
  takes in a list of bounds (each of the form {x_min, y_min, x_max, y_max})
  and spits out the overall minimum
  */
  static process_bounds(all_bounds) {
    if (all_bounds.length === 0) {
      return {
        x_min: null,
        x_max: null,
        y_min: null,
        y_max: null,
      }
    }
    let curr_bounds = all_bounds[0]

    all_bounds.forEach((bound) => {
      if (bound.x_min < curr_bounds.x_min) {
        curr_bounds.x_min = bound.x_min
      }
      if (bound.x_max > curr_bounds.x_max) {
        curr_bounds.x_max = bound.x_max
      }
      if (bound.y_min < curr_bounds.y_min) {
        curr_bounds.y_min = bound.y_min
      }
      if (bound.y_max > curr_bounds.y_max) {
        curr_bounds.y_max = bound.y_max
      }
    })

    return curr_bounds
  }
}
