import * as d3 from "d3"

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
    const colorScale = d3
      .scaleLinear()
      .domain([0, 3])
      .range(["maroon", "tan"])
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
      Color: colorScale(params.key.slice(-1)[0]),
    }
    params.blankTree.root = false
    params.blankTree.data = params.inputData.Children.map((d) => {
      return { Cellared: d.Cellared }
    })

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

    const colorScale = d3
      .scaleLinear()
      .domain([0, pieTree.data.length])
      .range(["maroon", "tan"])

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
            .duration(500)
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
      .attr("fill", (d, i) => colorScale(i))
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
      .on('click', function (d,i) {
        const mousedTree = pieTree.Children[i.index]
        if(mousedTree.temporary){
          mousedTree.temporary = false
        }
        else {
          //leads to not the best behavior but I don't think it's worth to fix
          PieBakery.closeChild(mousedTree)
          PieBakery.BakePie(mousedTree, false, svg)
        }
      })
      //todo: onclick - set pieTree.Children[i.index] to not temporary (or reverse)
      //and bake pie

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
