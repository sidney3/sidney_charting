import React, {useEffect, useRef} from "react"
import * as d3 from 'd3'
import { Button } from "react-native-web"

function Test(){

  const svgRef = useRef()

  useEffect(() => {

    const width = 300
    const height = 300

    const initial_radius = 50
    const final_radius = initial_radius + 50

    const svg = d3
    .select(svgRef.current)
    
    //var groups = svg.selectAll('g').data([1,23,4])

    // exit
    // groups.exit().remove()

    // // new
    // var newGroups = groups.enter()
    // var newgroup = newGroups.append('g')
    // newgroup.append('text')
    // newgroup.append('circle')

    // // update + new
    // groups.select('text')
    //     .text(function(d){ return d; })
    //     .attr('x', function(d,i){ return i * 20 + 50; })
    //     .attr('y', function(d){ return d + 20; })
    //     .attr('dy', -10)
    // groups.select('circle')
    //     .attr('cx', function(d,i){ return i * 20 + 50; })
    //     .attr('cy', function(d){ return d + 20; })
    //     .attr('r', 10)

    
    const toolTipGroup = svg.selectAll(`#toolTip`)
    .data([null])
    .enter()
    .append('g')
    .attr('id', 'toolTip')

   
    toolTipGroup.append('text')
    toolTipGroup.append('rect')


    toolTipGroup.select('text')
      .text('Hola yo soy dora')
      .attr('x', 0)
      .attr('y', 20)
    toolTipGroup.select('rect')
      .attr('x', 60)
      .attr('y', 60)
      .attr('height', 30)
      .attr('width', 50)
  
    // const toolTipGroup = svg.selectAll('#toolTip')
    //   .data([null])
    //   .join(
    //     (enter) =>
    //     enter
    //      .append('g')
    //       .append('rect')
    //       .append('circle'),
    //     (update) => update.select('g').select('rect')
    //       .attr('x', 0)
    //       .attr('y', 0)
    //       .attr('height', 20)
    //       .attr('width', 20)
    //       // .select('circle')
    //       // .attr('cx', 50)
    //       // .attr('cy', 60)
    //       // .attr('radius', 100)
    //   )



    // let curr_x = {0:0, 1:0}
    // const renderSquare = (x, i) => {
    //   svg.selectAll(`#square${i}`)
    //     .data([curr_x[i]])
    //     .join(
    //       (enter) => enter.append('rect'),
    //       (update) => {
    //         console.log('updating')
    //         return update.transition().duration(3000)
    //       .tween('set-x-tween', function() {
    //         const target = x
    //         const init = curr_x[i]
    //         return function(t){
    //           const distance = d3.interpolate(init, target)(t)
    //           console.log(distance)
    //           curr_x[i] = distance
    //           svg.selectAll(`#square${i}`).attr('x', distance)
    //         }
    //       })
    //       //.end(() => {curr_x = x})
    //       //.attr('x', x)
    // })
    //     .attr('id', `square${i}`)
    //     .attr('fill', 'transparent')
    //     .attr('stroke', 'black')
    //     .attr('y', 30)
    //     .attr('height', 30)
    //     .attr('width', 40)
    // }

    // // const makeSquare = (start_x,i) => {
    // //   d3.transition()
    // //   .duration(500)
    // //   .tween("squareTween", function () {
    // //     const target_x = 300
    // //     return function(t) {
    // //       const distance = d3.interpolate(start_x, target_x)(t)
    // //       renderSquare(distance, square_index)
    // //     }
    // //   })
    // // }

    // svg.selectAll("#rectButton")
    // .data([null])
    // .join(
    //   (enter) => enter.append("rect")
    // )
    // .attr("id", 'rectButton')
    // .attr('x', 60)
    // .attr('y', 60)
    // .attr('height', 30)
    // .attr('width', 30)
    // .attr('stroke', 'black')
    // .on('mouseenter', () => {
    //   console.log('click!')
    //   renderSquare(0, 0)
    //   renderSquare(300, 0)

    // })
    // .on('mouseleave', () => {
    //   renderSquare(0, 0)
    // })

    // svg.selectAll("#rectButton2")
    // .data([null])
    // .join(
    //   (enter) => enter.append("rect")
    // )
    // .attr("id", 'rectButton2')
    // .attr('x', 90)
    // .attr('y', 90)
    // .attr('height', 30)
    // .attr('width', 30)
    // .attr('fill', 'cyan')
    // .on('mouseenter', () => {
    //   console.log('click!')
    //   renderSquare(0, 1)

    //   renderSquare(300, 1)
    // })
    // .on('mouseleave', () => {
    //   renderSquare(0, 1)
    // })
  }, [])

  return(
    <div>
    <p>Hello world</p>

    <svg
      ref={svgRef}
      style={{
        height: 300,
        width: 300,
        transform: "translate(" + 300 / 2 + "," + 300 / 2 + ")",
      }}
    ></svg>
    </div>
  )
}

export default Test