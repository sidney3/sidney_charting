import React, { useRef, useEffect, useState} from "react"
import * as d3 from "d3"
import { PieBakery } from "./PieBakery"


function PieChart({ width, height, data }) {
  const svgRef = useRef()

  // const [preview, setPreview] = useState({
  //   text: "hola", x: 0, y:0
  // })

  // useEffect(() => {
  //   //console.log("curr preview: ", preview)

  //   //https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
  //   d3.selection.prototype.moveToFront = function() {
  //     return this.each(function(){
  //       this.parentNode.appendChild(this);
  //     });
  //   };

  //   const svg = d3
  //   .select(svgRef.current)
    
  //   svg.selectAll(`#previewText`)
  //     .data([preview])
  //     .join('text')
  //     .attr('x', (d) => d.x)
  //     .attr('y', (d) => d.y)
  //     .attr('id', 'previewText')
  //     .text((d) => {
  //       const sel = d3.select(this)
  //       sel.raise()
  //       return d.text}
  //       )


  // }, [preview])

  useEffect(() => {
    console.log("data", data)
    const depth = PieBakery.getDepth(data, 1)

    const factorize = (num) => {
      if(num === 1){
        return 1
      }
      return num * factorize(num - 1)
    }
    const max_entries = 15
    console.log(max_entries)
    
    

    console.log("depth: ",  depth)
    const pieTree = {}
    const prepArgs = {
      inputData: data,
      blankTree: pieTree,
      config: {radiusChange: 50, Depth: depth,
        // preview: {set: setPreview, get: preview}
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

    const svg = d3
      .select(svgRef.current)
      .selectAll("#Chart-Render")
      .data([null])
      .join("g")
      .attr("id", "Chart-Render")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    
    PieBakery.BakePie(pieTree, false, svg)

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
