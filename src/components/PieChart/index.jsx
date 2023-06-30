import React, { useRef, useEffect, useState} from "react"
import * as d3 from "d3"
import { PieBakery } from "./PieBakery"


function PieChart({ width, height, data }) {
  const svgRef = useRef()

  const [preview, setPreview] = useState({
    name: "", x: 0, y:0, size: ""
  })

  useEffect(() => {

    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
    //console.log("curr preview: ", preview)
    const svg = d3.select(svgRef.current)
    svg.selectAll(`#toolTip`)
        .data([preview])
        .join('text')
        .text((d) => {
          //console.log("preview seen from pie: ", d)
          return d.name + ',' + d.size
        })
        .attr('id', 'toolTip')
        .attr('x', (d) => d.x + 10)
        .attr('y', (d) => d.y)
        .style('font-size', 10)
        .moveToFront()

    //https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    //console.log("updated preview: ", preview)

  }, [preview])

  useEffect(() => {
    console.log("data", data)
    const depth = PieBakery.getDepth(data, 1)

    const max_entries = 15
    
    

    console.log("depth: ",  depth)
    const pieTree = {}
    const prepArgs = {
      inputData: data,
      blankTree: pieTree,
      config: {radiusChange: 50, Depth: depth,
        preview: {set: setPreview, get: preview}
        },
      key: [],
      ParentRadius: 50,
      Angles: {startAngle: 0, endAngle: 2*Math.PI},
      TEMP_color_index: max_entries
    }


    PieBakery.PrepPie(prepArgs)

    pieTree.temporary = false
    pieTree.direction = true
    pieTree.root = true

    console.log("final tree: ", pieTree)

    const untranslated_svg = d3.select(svgRef.current)
    const svg = d3
      .select(svgRef.current)
      .selectAll("#Chart-Render")
      .data([null])
      .join("g")
      .attr("id", "Chart-Render")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    
    console.log('svg from index: ', svg)
    PieBakery.BakePie(pieTree, false, svg, untranslated_svg)

  }, [])

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

export default PieChart
