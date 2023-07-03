import { PieBakery } from "./PieBakery"

export class PieUtil{
  static closeChild(root) {
    root.direction = false
    root.temporary = true
    root.Children.forEach((child) => {
      PieUtil.closeChild(child)
    })
  }

  static handleClick(pieTree, mousedTree, svg, d) {
    console.log("moused tree: ", mousedTree, "focused depth: ", mousedTree.root_node.focused_depth)
    if (mousedTree.depth > mousedTree.root_node.focused_depth) {
      mousedTree.root_node.focused_depth = mousedTree.depth
      PieUtil.focusNode(mousedTree)
      PieBakery.BakePieIterative(true, false, 0, pieTree.nodes, svg)
    } 
    else {  
        if(mousedTree.depth === 1){
          PieUtil.ResetRadius(pieTree.root_node)
          pieTree.nodes.forEach((child) => {
            if(child.depth >= 1){
              child.direction = false
              child.temporary = true
            }
          })
        }
        else{
          PieUtil.ResetRadius(pieTree.root_node)
          PieUtil.focusNode(mousedTree.parent)
        }   
        mousedTree.root_node.focused_depth = mousedTree.depth - 1
        PieBakery.BakePieIterative(false, false, pieTree.nodes.length - 1, pieTree.nodes, svg)
    }
    }

  static handleMouseMove(pieTree, mousedTree, svg, d) {
    const new_obj = {
      x: d.offsetX,
      y: d.offsetY,
      name: mousedTree.Visuals.Name + ", ",
      size: mousedTree.data.self_data.Cellared,
    }
    pieTree.preview.set(new_obj)
  }

  static handleMouseLeave(pieTree, mousedTree, svg, d) {
    if (mousedTree.temporary) {
      const new_obj = { x: d.offsetX, y: d.offsetY, name: "", size: "" }
      pieTree.preview.set(new_obj)
      mousedTree.direction = false
      PieBakery.BakePie(mousedTree, false, svg, true)
    }
  }

  static handleMouseEnter(pieTree, mousedTree, svg, d) {
    if (!pieTree.temporary) {
      mousedTree.direction = true
      PieBakery.BakePie(mousedTree, true, svg, true)
      PieBakery.BakePie(mousedTree, false, svg, true)
    }
  }
  
  /**
   * A method that undoes ShrinkToDepthN. We store in each pie element the "old"
   * radius, and so this method just sets the radius to such old measurements
   * @param {*} root 
   */
  static ResetRadius(root){
    root.Measurements.radius = root.Measurements.initialRadius
    root.Children.forEach((child) => {
      PieUtil.ResetRadius(child)
    })
  }
  /**
   * 
   * The "focus" method - beginning at the root we shrink all shelves
   * up to a target depth N. This is activated when a slice of the chart
   * is clicked (to focus)
   * 
   * @param {*} root pieTree root
   * @param {*} depth desired depth to continue to
   * @param {*} shrinkParams: {
      currRadius,
      radiusChange
   * }
   */
  static ShrinkToDepthN(root, target_depth, curr_depth, shrinkParams) {
    if(curr_depth < target_depth){
      root.Measurements.radius = {
        init: shrinkParams.currRadius,
        target: shrinkParams.currRadius + shrinkParams.radiusChange
      }
      const newShrinkParams = {
        currRadius:  shrinkParams.currRadius + shrinkParams.radiusChange,
        radiusChange: shrinkParams.radiusChange
      }
      root.Children.forEach((child) => {
        PieUtil.ShrinkToDepthN(child, target_depth, curr_depth + 1, newShrinkParams)
      })
    }
    else if(curr_depth === target_depth){
      root.Measurements.radius.init = shrinkParams.currRadius
      //no need to alter the target
    }
    else{
      throw Error("Should not be shrinking past current depth")
    }
  }

  static focusNode(node){
      //close all nodes deeper than focused node
      node.nodes.forEach((child) => {
        if(child.depth > node.depth){
          child.direction = false
          child.temporary = true
        }
      })
      //shrink all nodes shallower than focused node
      PieUtil.ShrinkToDepthN(node.root_node, node.depth, 0, {
        currRadius: node.root_node.Measurements.radius.init,
        radiusChange: 30
      })
      node.temporary = false
      node.direction = true
  }
}
