import {
  DEFAULT_OFFSETS,
  ONE_YEAR,
  SIX_MONTHS,
  X_DATA_POINTS,
  Y_DATA_POINTS,
} from "../../constants"
import { unix_to_MDY, ticks } from "../../utils"
import * as d3 from "d3"

export class PathManager {
  //params: {x_formula, pagePos, data}
  /*
  //from a given [x,y], get the current state
  // (i.e. if we are at time 8 and working with the following data:
  // (where x is time, y is bottles)
  //[[3,5], [11,12]]
  */

  //will return 5 (formatted)
  static get_datum(params) {
    const time = params.x_formula.invert(params.pagePos.x)

    let i = params.data.length - 1

    while (params.data[i][0] > time && i > 0) {
      i -= 1
    }
    
    return {
      date: unix_to_MDY(time),
      datum: params.data[i][1],
    }
  }

  //params: {data, height, width, secs}
  /*Scale a dataset of arbitrary points [[x,y],[x,y],...]
  // 1. into a set of points within the graph bounds (height, width)
  // 2. into a d3 path
  */
  static transform_dataset(params) {
    const time_threshold = Date.now() - params.secs
    const filtered_data = params.data.filter(
      (data_point) => data_point[0] > time_threshold
    )

    if (filtered_data.length === 0) {
      return {
        alert: "no_data",
      }
    }
    const bounds = {
      x_min: Math.min(...filtered_data.map((d) => d[0])),
      x_max: Math.max(...filtered_data.map((d) => d[0])),
      y_min: Math.min(...filtered_data.map((d) => d[1])),
      y_max: Math.max(...filtered_data.map((d) => d[1])),
    }

    const x_formula = d3
      .scaleLinear()
      .domain([bounds.x_min, bounds.x_max])
      .range([DEFAULT_OFFSETS.x, params.width - DEFAULT_OFFSETS.x])

    const y_formula = d3
      .scaleLinear()
      .domain([bounds.y_min, bounds.y_max])
      .range([params.height - DEFAULT_OFFSETS.y, DEFAULT_OFFSETS.y])

    return {
      path: d3
        .line()
        .x((d) => x_formula(d[0]))
        .y((d) => y_formula(d[1]))
        .curve(d3.curveBasis)(filtered_data),
      bounds: bounds,
      x_formula: x_formula,
      y_formula: y_formula,
      data: filtered_data,
      alert: "none",
    }
  }

  /*generate the horizontal dashes for the graph */
  static get_y_dashes(graph_height, graph_width) {
    const levels = ticks(
      DEFAULT_OFFSETS.y,
      graph_height - DEFAULT_OFFSETS.y,
      Y_DATA_POINTS
    )
    const lines = levels.map((d) => [d, d])
    const paths = lines.map((l) =>
      d3
        .line()
        .x((d, i) => {
          if (i === 0) {
            return DEFAULT_OFFSETS.x
          } else {
            return graph_width - DEFAULT_OFFSETS.x
          }
        })
        .y((d) => {
          return d
        })(l)
    )
    return paths
  }
}
