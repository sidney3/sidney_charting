import * as d3 from "d3"
import { BrowserText } from "../../utils"

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

  static getEntries(root){
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
   *  blankTree: pieTree[] (described in bakePie). Inputted blank
   * and filled in over the prep of the pie
   *  config: {radiusChange, Depth}
   *  key: number[]
   *  Angles: {startAngle, endAngle}
   *  ParentRadius: number
   * }
   *
   */
  static PrepPie(params) {
    //TEMP
    const tempColorScale = d3
      .scaleLinear()
      .domain([0, params.TEMP_color_index])
      .range(["maroon", "tan"])

    const objPie = d3
      .pie()
      .startAngle(params.Angles.startAngle)
      .endAngle(params.Angles.endAngle)
      .padAngle(0.02)
      .value(function (d) {
        return d.Cellared
      })
      .sort(null)

    params.blankTree.Children = []
    params.blankTree.key = params.key
    params.blankTree.Measurements = {
      Radius: {
        init: params.ParentRadius,
        current: params.ParentRadius,
        target: params.ParentRadius + params.config.radiusChange,
      },
      Angles: {
        startAngle: params.Angles.startAngle,
        endAngle: params.Angles.endAngle,
      },
    }
    params.blankTree.direction = false
    params.blankTree.PieFunc = objPie
    params.blankTree.temporary = true
    params.blankTree.Visuals = {
      Name: params.inputData.Name,
      Color: tempColorScale,
    }
    params.blankTree.root = false
    params.blankTree.data = params.inputData.Children.map((d) => {
      return { Cellared: d.Cellared }
    })
    params.blankTree.preview = params.config.preview

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
        TEMP_color_index: params.TEMP_color_index
      }
      PieBakery.PrepPie(child_params)
      params.blankTree.Children.push(child_tree)
    })
  }

  /**
   *
   * @param pieTree - /**
   * {
   * Measurements: {
   *    Radius {init:number , target: number, current: number}
   *    Angle: {start: number, end: number}
   * }
   * direction: boolean
   * root: boolean
   * Temporary / Full component: boolean
   * Visuals {
   *    Name: string
   *    Color: number
   *  }
   * data: {cellared: number}[]
   * Key: number
   * PieFunc: f
   * Children: pieTree[]
   * }
   * 
   * The function to render a pie from a tree (with a tree representing a pie chart)
   */
  static BakePie(pieTree, initial, svg) {
    const PieID = pieTree.key.join("-")
    let TEMP_index;
    if(pieTree.key.length === 0){
      TEMP_index = 1
    }
    else if(pieTree.key.length === 1){
      TEMP_index = 4
    }
    else if(pieTree.key.length === 3){
      TEMP_index = 5
    }
    else{
      TEMP_index = 6
    }
    const colorScale = d3
      .scaleLinear()
      .domain([0, pieTree.data.length])
      .range(["crimson", "tan"])

    const pieLine = pieTree.PieFunc(pieTree.data)

    const customArc = (r) =>
      d3
        .arc()
        .innerRadius(pieTree.Measurements.Radius.init)
        .outerRadius(pieTree.Measurements.Radius.init + r)
    svg
      .selectAll(`#pie${PieID}`)
      .data(pieLine)
      .join(
        (enter) => {
          if (!pieTree.root) {
            return enter.append("path")
          } else {
            return enter
              .append("path")
              .attr(
                "d",
                customArc(
                  pieTree.Measurements.Radius.target -
                    pieTree.Measurements.Radius.init
                )
              )
          }
        }
        ,
        (update) => {
          if(!pieTree.root){
            return update
            .transition()
            .duration(1000)
            .tween('expand-graph', function() {
              let start_radius = pieTree.Measurements.current ?? 0
              let target_radius
              if(initial){
                target_radius = start_radius
              }
              else if(pieTree.direction) {
                target_radius = pieTree.Measurements.Radius.target - pieTree.Measurements.Radius.init
              }
              else {
                target_radius = 0
              }
              return function(t){
                const radius = d3.interpolate(start_radius, target_radius)(t)
                pieTree.Measurements.current = radius
                svg
                  .selectAll(`#pie${PieID}`)
                  .attr('d', customArc(radius))
              }
            })
          }
          else{
            return update
          }
        }
          
      )
      .attr("id", `pie${PieID}`)
      .attr("fill", (d, i) => pieTree.Visuals.Color((i+1) * TEMP_index))
      //JASON: enter or click?
      .on('mouseenter', function (d,i) {
        const mousedTree = pieTree.Children[i.index]
        if(!pieTree.temporary){
          mousedTree.direction = true
          PieBakery.BakePie(mousedTree, true, svg)
          PieBakery.BakePie(mousedTree, false, svg)
        }
      })
      .on('mouseleave', function (d,i) {
        const mousedTree = pieTree.Children[i.index]
        if(mousedTree.temporary){
          mousedTree.direction = false
          PieBakery.BakePie(mousedTree, false, svg)
        }
      })
      // .on('mousemove', function (d,i) {
      //   const updatePreview = async () => {
      //     const new_obj = {x: d.offsetX, y: d.offsetY, text: pieTree.data[i.index].Cellared}
      //     pieTree.preview.set(() => {
      //       return new_obj
      //     })
      //     await new Promise((resolve) => setTimeout(resolve, 0))
      //   }
      //   updatePreview()
      // })
      .on('click', function (d,i) {
        const mousedTree = pieTree.Children[i.index]
        if(mousedTree.temporary){
          mousedTree.temporary = false
          mousedTree.direction = true
          PieBakery.BakePie(mousedTree, false, svg)
        }
        else {
          //leads to not the best behavior but I don't think it's worth to fix
          PieBakery.closeChild(mousedTree)
          PieBakery.BakePie(mousedTree, false, svg)
        }
      })
      if(pieTree.direction){
        svg.selectAll(`#pieText${PieID}`)
        .data(pieTree.PieFunc(pieTree.data))
        .join(
          (enter) => enter.append('text').text((d) => 
          pieTree.Children[d.index].Visuals.Name
        ),
          (update) =>  {
            if(pieTree.root){
              return update.attr('opacity', 1)

            }
            return update.transition().duration(1000).attr('opacity', 1)
          }
        )
        
        .attr('transform',  function (d) {
          const text_angle = (d.startAngle + d.endAngle)/2 * (180 / Math.PI)
          const x = text_angle
          const text_size = BrowserText.getWidth(pieTree.Children[d.index].Visuals.Name, 12)
          const thickness = (pieTree.Measurements.Radius.target - pieTree.Measurements.Radius.init)/2
          console.log("thickness: ", thickness)
          const text_buffer = Math.max((thickness - text_size/2)/2, 0)
          console.log("buffer: ", text_buffer, "text_size: ", text_size, "text: ", pieTree.Children[d.index].Visuals.Name)
          const y = pieTree.Measurements.Radius.init + text_size + text_buffer
          return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr('text-anchor', function(d) {
          const text_angle = (d.startAngle + d.endAngle)/2 * (180 / Math.PI)
          return 0 <= text_angle && 180 >= text_angle ? "end" : "start"
        })
        .attr(`id`, `pieText${PieID}`)
        .style('font-size', 10)
        .attr('y', "0.32em")
      }
      else{
        svg.selectAll(`#pieText${PieID}`)
          .transition()
          .duration(1000)
          .attr('opacity', 0)
      }
     



    pieTree.Children.forEach((childPie) => {
      if (childPie.Children.length > 0) {
        PieBakery.BakePie(childPie, initial, svg)
      }
    })
  }
  static closeChild(root){
    root.direction = false
    root.temporary = true
    root.Children.forEach((child) => {
      PieBakery.closeChild(child)
    })
  }
}
