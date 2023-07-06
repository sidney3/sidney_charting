import React, { useRef, useEffect, useState} from "react"
import * as d3 from "d3"
import { PieBakery } from "./PieBakery"


function PieChart({ width, height, data }) {
  const svgRef = useRef()
  const [focusedLayer, setFocusedLayer] = useState(0)

  const [preview, setPreview] = useState({
    name: "", x: 0, y:0, size: ""
  })

  useEffect(() => {
    
    d3.selection.prototype.moveToBack = function() {  
      return this.each(function() { 
          var firstChild = this.parentNode.firstChild; 
          if (firstChild) { 
              this.parentNode.insertBefore(this, firstChild); 
          } 
      });
  };
    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

    const svg = d3.select(svgRef.current)
    
    svg.selectAll('boundingBox')
      .data([null])
      .join('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', height)
      .attr('width', width)
      .attr('fill', 'transparent')
      .attr('stroke', 'black')
      .moveToBack()

    const toolTipGroup = svg.selectAll(`#toolTips`)
    .data([preview])

    toolTipGroup.exit().remove();

    const newToolTipGroup = toolTipGroup.enter()
      .append('g')
      .attr('id', 'toolTips')
      .attr('class', 'group')

    newToolTipGroup.append('text')
      .style('font-size', 16)
      .style('fill', 'black')

    // toolTipGroup.select('rect')
    //   .attr('x',(d) => d.x)
    //   .attr('y', (d) => d.y)


    toolTipGroup.select('text')
      .text((d) => {
        //console.log("preview seen from pie: ", d)
        return d.name + d.size
      })
      .attr('x', (d) => d.x + 10)
      .attr('y', (d) => d.y)
      .raise()

    toolTipGroup.raise()
    //console.log("curr preview: ", preview)

    // svg.selectAll(`#toolTipBox`)
    //   .data([preview])
    //   .join('rect')
    //   .attr('height', 40)
    //   .attr('width', 90)
    //   .attr('fill', 'silver')
    //   .attr('stroke', 'black')
    //   .attr('stroke-width', 12)
    //   .attr('id', 'toolTipBox')
    //   .attr('x', (d) => d.x)
    //   .attr('y', (d) => d.y)
    //   .moveToFront()


    // svg.selectAll(`#toolTipText`)
    //     .data([preview])
    //     .join('text')
    //     .text((d) => {
    //       //console.log("preview seen from pie: ", d)
    //       return d.name + ',' + d.size
    //     })
    //     .attr('id', 'toolTipText')
    //     .attr('x', (d) => d.x + 10)
    //     .attr('y', (d) => d.y)
    //     .style('font-size', 10)
    //     .moveToFront()

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
      nodes: [],
      ParentRadius: 50,
      Angles: {startAngle: 0, endAngle: 2*Math.PI},
      TEMP_color_index: max_entries,
      root: pieTree,
      focusedLayer: {
        get: focusedLayer,
        set: setFocusedLayer
      },
      depth: 0,
      parent: null
    }
    PieBakery.PrepPie(prepArgs)
    pieTree.temporary = false
    pieTree.direction = true
    pieTree.root = true
    pieTree.nodes.sort((a,b) => a.depth - b.depth)
    console.log("final tree: ", pieTree)
    pieTree.root_node.focused_depth = 0
    pieTree.root_node.depth_tracker = [0]

    const svg = d3
      .select(svgRef.current)
      .selectAll("#Chart-Render")
      .data([null])
      .join("g")
      .attr("id", "Chart-Render")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
  

    //PieBakery.BakePie(pieTree, false, svg, true)
    //PieBakery.BakePieIterative(true, true, 0, pieTree.nodes, svg)
    PieBakery.BakePieIterative(true, false, 0, pieTree.nodes, svg)
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
