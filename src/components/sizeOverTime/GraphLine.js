import { PathManager } from "./PathManager"
import { interpolatePath } from "d3-interpolate-path"
import * as d3 from "d3"
import { DEFAULT_OFFSETS } from "../../constants"

export class GraphLine {
  //params:
  /*
  {
    data,
    svg
    chart_details: {
      height,
      width,
    }
    states: 
    {
      infoLabel: {
        get
        set
      }
      oldData: {
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
      x_formulas: {
        get,
        set
      },
      dataPreview: {
        get, 
        set
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
      data: params.data[params.index].data,
      height: params.chart_details.height,
      width: params.chart_details.width,
      secs: params.states.timeView.get,
    })

    params.states.x_formulas.get.current[params.index] = new_line.x_formula

    const svg = d3.select(params.svg)

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

    svg
      //the visible line
      .selectAll(`#linegraph${params.index}`)
      .data([new_line])
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => {
              // let old_data_store = {...params.states.oldData.get}
              // old_data_store[params.index] = d.path
              // params.states.oldData.set(old_data_store)
              params.states.oldDataRef.get.current[params.index] = d.path
              return d.path
            })
            .attr("id", `linegraph${params.index}`)
            .attr("stroke", "black")
            .attr("fill", "none")
            .attr("stroke-width", "3"),
        (update) =>
          update.transition().attrTween("d", (d) => {
            // let old_data_store = {...params.states.oldData.get}
            // const index_store = old_data_store[params.index]
            // old_data_store[params.index] = d.path
            // params.states.oldData.set(old_data_store)
            const index_store = params.states.oldDataRef.get.current[params.index]
            params.states.oldDataRef.get.current[params.index] = d.path
            if (!index_store) {
              return interpolatePath(d.path, d.path)
            } else {
              return interpolatePath(index_store, d.path)
            }
          })
      )

    //absolutely no idea why it's faster to make new such components rather than re-using old ones
    //but it absolutely is ????
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
        //D3 is great - it will automatically give mouseover priority to one of the indices

        if (params.states.labelHidden.get) {
          params.states.labelHidden.set(false)
        }

        params.states.vertPreview.set(d.offsetX)
        
        //we need to do this asyncronously as setState is an async function
        //we iterate through our different "graphs" (datums)
        const update_Preview = async () => {
          for(let graph_index = 0; graph_index < params.data.length; graph_index += 1){
            const data_point = PathManager.get_datum({
              x_formula: params.states.x_formulas.get.current[graph_index],
              pagePos: {
                x: d.offsetX,
                y: d.offsetY
              },
              data: params.data[graph_index].data
            })

            params.states.dataPreview.set(oldPreview => {
              const previewCopy = {...oldPreview}
              previewCopy[params.data[graph_index].key] = data_point.datum
              return previewCopy
            })
            await new Promise(resolve => setTimeout(resolve, 0)); // Add a delay to see the updates

          }}
        update_Preview()
        })
      

    return new_line.bounds
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
