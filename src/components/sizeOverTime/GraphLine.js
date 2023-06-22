import {PathManager} from './PathManager'
import { interpolatePath } from "d3-interpolate-path"
import * as d3 from 'd3'


export class GraphLine{
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
      }
    }
  }

  */
  //returns: bounds (minimum and maximum x,y over line)
  /*
  renders in the line for a specific dataset
  also adds event listeners for mouseover
  */
  static load_line(params){
    const new_line = PathManager.transform_dataset({
      data: params.data.data,
      height: params.chart_details.height,
      width: params.chart_details.width,
      secs: params.states.timeView.get,
   })

    const svg = d3.select(params.svg)

    svg
    //second path with the same line as the above
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
            params.states.oldDataRef.current[params.index] = d.path
            return d.path
          })
          .attr("id", `linegraph${params.index}`)
          .attr("stroke", "black")
          .attr("fill", "none")
          .attr("stroke-width", "3"),
      (update) =>
        update.transition()
          .attrTween("d", (d) => {
          // let old_data_store = {...params.states.oldData.get}
          // const index_store = old_data_store[params.index]
          // old_data_store[params.index] = d.path
          // params.states.oldData.set(old_data_store)
          const index_store = params.states.oldDataRef.current[params.index]
          params.states.oldDataRef.current[params.index] = d.path
          if(!index_store){
            return interpolatePath(d.path, d.path)
          }
          else{
            return interpolatePath(index_store, d.path)
          }
        })
    )

    svg
      .selectAll(`#transparentlinegraph${params.index}`)
      .data([new_line])
      .join("path")
      .attr("id", `linegraph${params.index}`)
      .attr("d", (d) => d.path)
      .attr("stroke", "transparent")
      .attr("fill", "none")
      .attr("stroke-width", "20")
      .on("mouseover", function (d) {
        if (params.states.labelHidden.get) {
          params.states.labelHidden.set(false)
        }
        const new_data = PathManager.get_datum({
          x_formula: new_line.x_formula,
          pagePos: {
            x: d.offsetX,
            y: d.offsetY,
          },
          data: new_line.data 
          }
        )
        params.states.infoLabel.set({
          location: {
            x: d.offsetX,
            y: d.offsetY,
          },
          date: new_data.date,
          datum: new_data.datum,
        })
      })

    return new_line.bounds
  }

  /*
  takes in a list of bounds (each of the form {x_min, y_min, x_max, y_max})
  and spits out the overall minimum
  */
  static process_bounds(all_bounds){
    if(all_bounds.length === 0){
      return {
        x_min: null,
        x_max: null,
        y_min: null,
        y_max: null,
      }
    }
    let curr_bounds = all_bounds[0]

    all_bounds.forEach((bound) => {
      if(bound.x_min < curr_bounds.x_min){
        curr_bounds.x_min = bound.x_min
      }
      if(bound.x_max > curr_bounds.x_max){
        curr_bounds.x_max = bound.x_max
      }
      if(bound.y_min < curr_bounds.y_min){
        curr_bounds.y_min = bound.y_min
      }
      if(bound.y_max > curr_bounds.y_max){
        curr_bounds.y_max = bound.y_max
      }
    })

    return curr_bounds
  }
}