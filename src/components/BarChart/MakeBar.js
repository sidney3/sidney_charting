import * as d3 from 'd3'
import { BrowserText } from "../../utils"

export class MakeBar {
  /**
   * Given a datum of type {Name: str, Cellared: num}
   * Returns 
   * @param {} data 
   * 
   * Should also take in TODO name of args
   */
  static get_text_width(data){
    return Math.max(BrowserText.getWidth(`Year: ${data.Name}`, 18), BrowserText.getWidth(`Cellared: ${data.Cellared}`, 18))
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
    base,
    height, 
    bar_width,
    width
  }
  */


  static get_preview_box_path(params) {
    const overhang = (params.width - params.bar_width)/2
    const base_height = params.height * 0.15

    const mid_left_x = params.base.x - overhang + params.width * 0.4
    const mid_right_x = params.base.x - overhang + params.width * 0.6
    const bottom_point_x = params.base.x -overhang + params.width * 0.5

    const top_rect_y = params.base.y - params.height
    const bottom_rect_y = params.base.y - base_height

    const path = [
      [bottom_point_x, params.base.y],
      [mid_right_x, bottom_rect_y],[params.base.x - overhang + params.width, bottom_rect_y], 
      [params.base.x - overhang + params.width, top_rect_y], [params.base.x - overhang, top_rect_y],
      [params.base.x - overhang, bottom_rect_y], [mid_left_x, bottom_rect_y],
      [bottom_point_x, params.base.y],
    ]
    const line = d3.line()
    .x((d) => d[0])
    .y((d) => d[1])

    return line(path)
  }
  static update_preview(svg, index, data, x, y, name, preview_frame_height){
    const previewGroup = svg.selectAll('#previewGroup').attr('opacity', 1)

    const bar_args = {
      base: {x: x(data[index].Name), y: y(data[index].Cellared)},
      height: preview_frame_height,
      width: MakeBar.get_text_width(data[index]),
      bar_width: x.bandwidth()
    }
    previewGroup.selectAll(`#previewPath`)
      .transition()
      // .duration(500)
      .attr('d', MakeBar.get_preview_box_path(bar_args))
      
    previewGroup.selectAll(`#previewTextTop`)
      .transition()
      .text(`${name}: ${data[index].Name}`)
      .attr('x', x(data[index].Name) + x.bandwidth() / 2)
      .attr('y', y(data[index].Cellared) - preview_frame_height*0.3)

    previewGroup.selectAll(`#previewTextBottom`)
      .transition()
      .text("Cellared: " + data[index].Cellared)
      .attr('x', x(data[index].Name) + x.bandwidth() / 2)
      .attr('y', y(data[index].Cellared) - preview_frame_height*0.3 - 20)
  }

  static make_preview(svg,x,y){

    const previewGroup = svg.selectAll('#previewGroup')
      .data([null])
      .join('g')
      .attr('id', 'previewGroup')

    previewGroup.selectAll(`#previewPath`)
      .data([null])
      .join('path')
      .attr('id', 'previewPath')
      .attr('fill', 'white')
      .attr('stroke', 'black')

      previewGroup.selectAll(`#previewTextTop`)
      .data([null])
      .join('text')
      .attr('id', 'previewTextTop')
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .raise()

      previewGroup.selectAll(`#previewTextBottom`)
      .data([null])
      .join('text')
      .attr('id', 'previewTextBottom')
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .raise()
  }
  
  static show_expander(svg, index, width){
    const previewGroup = svg.selectAll(`#previewGroup${index}`)

    previewGroup.selectAll('#previewBox')
      .transition()
      .duration(300)
      .attr('width', width)
      previewGroup.selectAll('text')
      .transition()
      .duration(300)
      .attr('opacity', 1)

  }
  static hide_expander(svg, index) {
    const previewGroup = svg.selectAll(`#previewGroup${index}`)

    previewGroup.selectAll('#previewBox')
      .transition()
      .duration(300)
      .attr('width', 0)
    previewGroup.selectAll('text')
      .transition()
      .duration(300)
      .attr('opacity', 0)
  }

  static make_expander(svg, index, top_text, height, x, y){
    const previewGroup = svg.selectAll(`#previewGroup${index}`)
    .data([null])
    .join('g')
    .attr('id', `previewGroup${index}`)
    
    previewGroup.selectAll(`#previewBox`)
      .data([null])
      .join('rect')
      .attr('id', `previewBox`)
      .attr('height', height)
      .attr('width', 0)
      .attr('opacity', .9)
      .attr('fill', 'black')
      .attr('x', x)
      .attr('y', y)

    previewGroup.selectAll(`#previewTextTop`)
      .data([null])
      .join('text')
      .attr('id', `previewTextTop`)
      .attr("text-anchor", "start")
      .attr("font-size", 14)
      .text(top_text)
      .attr('fill', 'white')
      .attr('x', x + 2)
      .attr('y', y + height * .64)
      .attr('opacity', 0)
      .raise()

    // previewGroup.selectAll(`#previewTextBottom`)
    //   .data([null])
    //   .join('text')
    //   .attr('id', `previewTextBottom`)
    //   .attr("text-anchor", "start")
    //   .attr("font-size", 14)
    //   .attr('x', x + 2)
    //   .attr('y', y + height * .7)
    //   .text(bottom_text)
    //   .attr('opacity', 0)
    //   .raise()
  }
}