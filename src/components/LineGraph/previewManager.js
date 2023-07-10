import * as d3 from "d3"
import { BrowserText } from "../../utils"

export class PreviewManager {
  /**
   * Given a datum of type {Name: str, Cellared: num}
   * Returns
   * @param {} data
   *
   * Should also take in TODO name of args
   */
  static get_text_width(data) {
    return BrowserText.getWidth(data, 25)
  }

  /*
  We want our preview box to look like this:
   40% | 20% | 40%
  |-------------|
  |   Name      |
  |   Cellared  |    - the middle (70% of total height)
  |----      ---|    
       \    /
        \  /      - the base (30% of total height)
         \/
  
  So this function draws the path for such a box

  Base refers to the top left point of the bar in question
  {x, y}

  params: {
    center,
    height, 
    width
  }
  */

  static get_preview_box_path(params) {
    const base_height = params.height * 0.15

    const mid_left_x = params.center.x - params.width * 0.1
    const mid_right_x = params.center.x + params.width * 0.1

    const top_rect_y = params.center.y - params.height
    const bottom_rect_y = params.center.y - base_height

    const path = [
      [params.center.x, params.center.y],
      [mid_right_x, bottom_rect_y],
      [params.center.x  + params.width * .5, bottom_rect_y],
      [params.center.x  + params.width * .5, top_rect_y],
      [params.center.x - params.width * .5, top_rect_y],
      [params.center.x - params.width * .5 , bottom_rect_y],
      [mid_left_x, bottom_rect_y],
      [params.center.x, params.center.y],
    ]
    const line = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])

    return line(path)
  }
  /*
  Params: {
  }
  */
  static update_preview(svg, index, x, y, text, preview_frame_height) {
    const previewGroup = svg.selectAll(`#previewGroup${index}`).attr("opacity", 1)

    const bar_args = {
      height: preview_frame_height,
      width: 100,
      // BrowserText.getWidth(text, 25),
      center: {x:x, y:y},
    }
    previewGroup
      .selectAll(`#previewPath${index}`)
      .attr("d", PreviewManager.get_preview_box_path(bar_args))

    previewGroup
      .selectAll(`#previewText${index}`)
      .text(text)
      .attr("x", x)
      .attr("y", y - preview_frame_height * 0.5)

  }

  static make_preview(svg, index) {
    const previewGroup = svg
      .selectAll(`#previewGroup${index}`)
      .data([null])
      .join("g")
      .attr("id", `previewGroup${index}`)

    previewGroup
      .selectAll(`#previewPath${index}`)
      .data([null])
      .join("path")
      .attr("id", `previewPath${index}`)
      .attr("fill", "transparent")
      .attr("stroke", "black")

    previewGroup
      .selectAll(`#previewText${index}`)
      .data([null])
      .join("text")
      .attr("id", `previewText${index}`)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
  }
}
