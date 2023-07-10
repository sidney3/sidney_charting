import * as d3 from "d3"
import { BrowserText } from "../../utils"
import { PieUtil } from "./PieUtil"

export class PieBakery {
  /**
   * Get the depth of an inputted (pie) tree
   *
   * @param {*} root {Children: tree[]}
   * @param depth number
   */
  static getDepth(root, depth) {
    const child_depths = []
    root.Children.forEach((tree) => {
      child_depths.push(PieBakery.getDepth(tree, depth + 1))
    })

    return Math.max(...child_depths, depth)
  }

  static getEntries(root) {
    const len_tracker = []
    const count_entries = (root, len_tracker) => {
      len_tracker.push(null)
      root.Children.forEach((c) => {
        count_entries(c, len_tracker)
      })
    }
    count_entries(root, len_tracker)
    return len_tracker.length
  }

  /**
   *
   * Pre-process data for making pie graph. We turn an inputted blank object
   * into a tree representing the children of the pie chart
   *
   * @param childArgs:
   * {
   *  inputData: {Name, Cellared, Children: inputData[]}[]
   *  blankTree: pieTree (described in bakePie). Inputted blank
   * and filled in over the prep of the pie
   *  config: {radiusChange, Depth}
   *  key: number[],
   *  Nodes: pieTree[]
   *  Angles: {startAngle, endAngle}
   *  ParentRadius: number
   * }
   *
   */
  static PrepPie(params) {
    params.nodes.push(params.blankTree)
    const tempColorScale = d3
      .scaleLinear()
      .domain([0, params.TEMP_color_index])
      .range(["#851b48", "#e9a363"])

    const objPie = d3
      .pie()
      .startAngle(params.Angles.startAngle)
      .endAngle(params.Angles.endAngle)
      .padAngle(0.02)
      .value(function (d) {
        return d.Cellared
      })
      .sort(null)
    
    params.blankTree.depth = params.depth
    params.blankTree.root_node = params.root
    params.blankTree.Children = []
    params.blankTree.key = params.key
    params.blankTree.focusedLayer = params.focusedLayer
    params.blankTree.Measurements = {
      radius: {
        init: params.ParentRadius,
        target: params.ParentRadius + params.config.radiusChange,
      },
      currRad: {
        init: null,
        target: null
      },
      initialRadius: {
        init: params.ParentRadius,
        target: params.ParentRadius + params.config.radiusChange,
      },
      angles: {
        startAngle: params.Angles.startAngle,
        endAngle: params.Angles.endAngle,
      },
    }
    params.blankTree.parent = params.parent
    params.blankTree.direction = false
    params.blankTree.PieFunc = objPie
    params.blankTree.temporary = true
    params.blankTree.Visuals = {
      Name: params.inputData.Name,
      Color: tempColorScale,
    }
    params.blankTree.is_root = false
    params.blankTree.data = {
      child_data: params.inputData.Children.map((d) => {
        return { Cellared: d.Cellared }
      }),
      self_data: { Cellared: params.inputData.Cellared },
    }
    params.blankTree.preview = params.config.preview
    params.blankTree.nodes = params.nodes

    const SlicedChildren = objPie(params.inputData.Children)
    params.inputData.Children.forEach((child, index) => {
      let child_tree = {}
      const child_key = [...params.key].concat(index)
      const child_params = {
        inputData: child,
        blankTree: child_tree,
        config: params.config,
        key: child_key,
        ParentRadius: params.ParentRadius + params.config.radiusChange,
        Angles: {
          startAngle: SlicedChildren[index].startAngle,
          endAngle: SlicedChildren[index].endAngle,
        },
        TEMP_color_index: params.TEMP_color_index,
        depth: params.depth + 1,
        root: params.root,
        nodes: params.nodes,
        focusedLayer: params.focusedLayer,
        parent: params.blankTree
      }
      PieBakery.PrepPie(child_params)
      params.blankTree.Children.push(child_tree)
    })
  }
  static BakePieIterative(direction, initial, index, nodes, svg) {
    const pieTree = nodes[index]
    const PieID = pieTree.key.join("-")
    let TEMP_index
    if (pieTree.key.length === 0) {
      TEMP_index = 1
    } else if (pieTree.key.length === 1) {
      TEMP_index = 4
    } else if (pieTree.key.length === 3) {
      TEMP_index = 5
    } else {
      TEMP_index = 6
    }
    const colorScale = d3
      .scaleLinear()
      .domain([0, pieTree.data.child_data.length])
      .range(["crimson", "tan"])

    const pieLine = pieTree.PieFunc(pieTree.data.child_data)

    const customArc = (inner, outer) =>
      d3
        .arc()
        .innerRadius(inner)
        .outerRadius(inner + outer)

    svg
      .selectAll(`#pie${PieID}`)
      .data(pieLine)
      .join(
        (enter) => {
          let outer_radius = pieTree.Measurements.radius.init
          if(this.direction){
            outer_radius = pieTree.Measurements.radius.target
          }
          return enter.append("path").attr('d', customArc(pieTree.Measurements.radius.init,outer_radius))
 
        },
        (update) => {
          let start_outer_radius = pieTree.Measurements.currRad.target ?? 0
          //let start_radius = pieTree.Measurements.currRadius ?? 0
          let target_outer_radius
          if (initial) {
            target_outer_radius = start_outer_radius
          } else if (pieTree.direction) {
            target_outer_radius =
              pieTree.Measurements.radius.target -
              pieTree.Measurements.radius.init
          } else {
            target_outer_radius = 0
          }
          let animation_duration = 150
          if(start_outer_radius === target_outer_radius){
            animation_duration = 1
          }
          let start_inner_radius = pieTree.Measurements.currRad.init
          let target_inner_radius = pieTree.Measurements.radius.init

          if(!start_inner_radius){
            start_inner_radius = target_inner_radius
          }
          return update
              .transition()
              .duration(animation_duration)
              .tween("expand-graph", function () {
                "entering animation"
                return function (t) {
                  const outer_radius = d3.interpolate(start_outer_radius, target_outer_radius)(t)
                  const inner_radius = d3.interpolate(start_inner_radius, target_inner_radius)(t)
                  pieTree.Measurements.currRad.target = outer_radius
                  pieTree.Measurements.currRad.init = inner_radius
                  svg.selectAll(`#pie${PieID}`).attr("d", customArc(inner_radius, outer_radius))
                }
              })
              //render the next node in nodes
              .on('end', () => {

                if(!direction){
                  if(index > 0){
                    PieBakery.BakePieIterative(direction, initial, index - 1, nodes, svg)
                  }
                }
                else{
                  if(index < nodes.length - 1){
                    PieBakery.BakePieIterative(direction, initial, index + 1, nodes, svg)
                  }
                }
              })
        }
      )
      .attr("id", `pie${PieID}`)
      .attr("fill", (d, i) => pieTree.Visuals.Color((i + 1) * TEMP_index))
      // .on("mouseenter", function (d, i) {
      //   const mousedTree = pieTree.Children[i.index]
      //   PieBakery.handleMouseEnter(pieTree, mousedTree, svg, d)
      // })
      // .on("mouseleave", function (d, i) {
      //   const mousedTree = pieTree.Children[i.index]
      //   PieBakery.handleMouseLeave(pieTree, mousedTree, svg, d)
      // })
      .on("mousemove", function (d, i) {
        const mousedTree = pieTree.Children[i.index]
        PieUtil.handleMouseMove(pieTree, mousedTree, svg, d)
      })
      //Jason's suggestion: no mouseenter
      .on("click", function (d, i) {
        const mousedTree = pieTree.Children[i.index]
        PieUtil.handleClick(pieTree, mousedTree, svg, d)
      })

    let target_opacity

    if(pieTree.root_node.focused_depth === pieTree.depth){
      target_opacity = 1
    }
    else{
      target_opacity = 0
    }
    if (pieTree.direction) {
      svg
        .selectAll(`#pieText${PieID}`)
        .data(pieTree.PieFunc(pieTree.data.child_data))
        .join(
          (enter) =>
            enter
              .append("text")
              .text((d) => pieTree.Children[d.index].Visuals.Name),
          (update) => {
            if (pieTree.is_root) {
              return update.attr("opacity", target_opacity)
            }
            return update.transition().duration(1000).attr("opacity", target_opacity)
          }
        )

        .attr("transform", function (d) {
          //TODO: refactor into helper
          //TODO: refactor mouseover into helper, call on mouseover for text
          const text_angle = ((d.startAngle + d.endAngle) / 2) * (180 / Math.PI)
          const x = text_angle
          const text_size = BrowserText.getWidth(
            pieTree.Children[d.index].Visuals.Name,
            12
          )
          const thickness =
            (pieTree.Measurements.radius.target -
              pieTree.Measurements.radius.init) /
            2
          const text_buffer = Math.max((thickness - text_size / 2) / 2, 0)
          const y = pieTree.Measurements.radius.init + text_size + text_buffer
          return `rotate(${
            x - 90
          }) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
        })
        .attr("text-anchor", function (d) {
          const text_angle = ((d.startAngle + d.endAngle) / 2) * (180 / Math.PI)
          return 0 <= text_angle && 180 >= text_angle ? "end" : "start"
        })
        .attr(`id`, `pieText${PieID}`)
        .style("font-size", 10)
        .attr('fill', 'white')
        .attr("y", "0.32em")
        .on("click", function (d, i) {
          if(pieTree.direction){
            const mousedIndex = i.index
            const mousedTree = pieTree.Children[mousedIndex]
            PieUtil.handleClick(pieTree, mousedTree, svg, d)
          }
        })
        // .on('mouseover', (d) => {
        //   const mousedIndex = d.fromElement.__data__.index
        //   const mousedTree = pieTree.Children[mousedIndex]
        //   if(mousedTree){
        //     PieBakery.handleMouseMove(pieTree, mousedTree, svg, d)
        //   }
        // })
        // .on('mouseenter', (d) => {
        //   const mousedIndex = d.fromElement.__data__.index
        //   const mousedTree = pieTree.Children[mousedIndex]
        //   if(mousedTree){
        //     PieBakery.handleMouseEnter(pieTree, mousedTree, svg, d)
        //   }
        // })
    } else {
      svg
        .selectAll(`#pieText${PieID}`)
        .transition()
        .duration(1000)
        .attr("opacity", 0)
  }

    if(pieTree.data.child_data.length === 0){
      if(!direction){
        if(index > 0){
          PieBakery.BakePieIterative(direction, initial, index - 1, nodes, svg)
        }
      }
      else{
        if(index < nodes.length - 1){
          PieBakery.BakePieIterative(direction, initial, index + 1, nodes, svg)
        }
      }
    }
  }
}
