import React, {useEffect, useRef} from "react"
import * as d3 from 'd3'
import { Button } from "react-native-web"
import { locate_y } from "../../utils"
import {PreviewManager} from '../LineGraph/previewManager'

function Test(){

  const svgRef = useRef()

  useEffect(() => {

    const svg = d3
    .select(svgRef.current)

    const data = [[0,0], [1,1], [2,3], [4,9]]

    const x = d3.scaleLinear()
      .domain([0, Math.max(...data.map((d) => d[0]))])
      .range([0,300])
    
    const y = d3.scaleLinear()
    .domain([0, Math.max(...data.map((d) => d[1]))])
    .range([0,300])

    console.log(x(2))

    const line_formula = d3.line()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))

    const path = svg.selectAll(`#dopePath`)
      .data([line_formula(data)])
      .join('path')
      .attr('d',(d) => {
        console.log(d)
        return d
      })
      .attr('id', 'dopePath')
      .attr('fill', 'transparent')
      .attr('stroke', 'black')

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

    PreviewManager.make_preview(svg, 0)
    
    const largeRect = svg.selectAll(`#largeRect`)
      .data([null])
      .join('rect')
      .attr('id', 'largeRect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', 300)
      .attr('width', 300)
      .attr('fill', 'transparent')
      .attr('stroke', 'black')
      .on('mousemove', (d) => {
        console.log(d)
        const offsetY = locate_y(path, d.offsetX)
        preview_location = [d.offsetX, offsetY]
        // update()
        PreviewManager.update_preview(svg, 0, d.offsetX, offsetY, "hello", 20)
      })
    }, [])


  return(
    <div>
    <p>Hello world</p>

    <svg
      ref={svgRef}
      style={{
        height: 300,
        width: 300,
      }}
    ></svg>
    </div>
  )
}

export default Test