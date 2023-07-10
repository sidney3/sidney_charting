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
  // (where x is time, y is Cellared)
  //[[3,5], [11,12]]
  */

  //takes array of bounds objects
  //for each, appends an entry
  //[x,y]
  //where x is the max of all time entries and
  // y is the final value for such a datum
  //also returns overall bounds

  //returns:
  // {
  // filtered_data,
  // bounds
  //}

  static pre_process_datums(datums, secs, height, width) {
    const time_threshold = Date.now() - secs

    if (datums.length === 0) {
      return {
        x_min: 0,
        x_max: 100,
        y_min: 0,
        y_max: 100,
      }
    }

    let curr_bounds = {
      x_min: Infinity,
      x_max: 0,
      y_min: Infinity,
      y_max: 0,
    }
    let max_time_index = 0

    let filtered_datums = []

    datums.forEach((datum, index) => {
      const filtered_datum = datum.data.filter(
        (data_point) => data_point[0] > time_threshold
      )
      filtered_datum.sort((a, b) => a[0] - b[0])
      //add a today entry
      //breaks some of the example code that works into the future. This isn't an issue for
      //real data
      if (filtered_datum.slice(-1)[0][0] < Date.now()) {
        filtered_datum.push([Date.now(), filtered_datum.slice(-1)[0][1]])
      }
      filtered_datums.push(filtered_datum)
      filtered_datum.forEach((entry) => {
        if (curr_bounds["x_min"] > entry[0]) {
          curr_bounds["x_min"] = entry[0]
        }
        if (curr_bounds["x_max"] < entry[0]) {
          curr_bounds["x_max"] = entry[0]
          max_time_index = index
        }
        if (curr_bounds["y_min"] > entry[1]) {
          curr_bounds["y_min"] = entry[1]
        }
        if (curr_bounds["y_max"] < entry[1]) {
          curr_bounds["y_max"] = entry[1]
        }
      })
    })

    filtered_datums.forEach((datum, index) => {
      if (
        index !== max_time_index &&
        datum.slice(-1)[0][0] < curr_bounds.x_max
      ) {
        filtered_datums[index].push([curr_bounds.x_max, datum.slice(-1)[0][1]])
      }
    })

    const x_formula = d3
      .scaleLinear()
      .domain([curr_bounds.x_min, curr_bounds.x_max])
      .range([DEFAULT_OFFSETS.x, width - DEFAULT_OFFSETS.x])

    const y_formula = d3
      .scaleLinear()
      .domain([curr_bounds.y_min, curr_bounds.y_max])
      .range([height - DEFAULT_OFFSETS.y, DEFAULT_OFFSETS.y])

    return {
      bounds: curr_bounds,
      formulae: {
        x_formula: x_formula,
        y_formula: y_formula,
      },
      filtered_data: filtered_datums,
    }
  }

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
  //params: height, width, bounds
  static get_formulae(params) {
    const x_formula = d3
      .scaleLinear()
      .domain([params.bounds.x_min, params.bounds.x_max])
      .range([DEFAULT_OFFSETS.x, params.width - DEFAULT_OFFSETS.x])

    const y_formula = d3
      .scaleLinear()
      .domain([params.bounds.y_min, params.bounds.y_max])
      .range([params.height - DEFAULT_OFFSETS.y, DEFAULT_OFFSETS.y])

    return {
      x_formula: x_formula,
      y_formula: y_formula,
    }
  }

  //params: {height, width, formulae, data}
  static transform_dataset(params) {
    return d3
      .line()
      .x((d) => params.formulae.x_formula(d[0]))
      .y((d) => params.formulae.y_formula(d[1]))
      .curve(d3.curveBasis)(params.data)
  }

  static findYCoordinateOnLine(xCoordinate, line) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const context = path.getContext('2d');
    line.context(context)(line.data());
  
    const totalLength = path.getTotalLength();
    const numPoints = 100;
    const step = totalLength / numPoints;
    const points = Array.from({ length: numPoints }, (_, i) => {
      const point = path.getPointAtLength(i * step);
      return { x: point.x, y: point.y };
    });
  
    const closestPoint = points.reduce((closest, point) => {
      const distance = Math.abs(point.x - xCoordinate);
      if (distance < closest.distance) {
        return { point, distance };
      }
      return closest;
    }, { point: null, distance: Infinity }).point;
  
    return closestPoint.y;
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
