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
    .selectAll("#Chart-Render")
    .data([null])
    .join("g")
    .attr("id", "Chart-Render")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    
    let data = [2,2,5]

    const pie = d3.pie()
      .startAngle(0)
      .endAngle(2*Math.PI)
      .padAngle(0.02)
      .value((d) => d)
      .sort(null)

    const arc = d3.arc().innerRadius(initial_radius).outerRadius(final_radius)

    svg.selectAll('#pie')
      .data(pie(data))
      .join('path')
      .attr('d', arc)
      .attr('fill', 'grey')
      .attr('id', 'pie')
      .attr('opacity', .8)
    
    svg.selectAll('#pieText')
      .data(pie(data))
      .join('text')
      .text((d) => d.data)
      .attr('transform',  function (d) {
        console.log(d)
        const x = (d.startAngle + d.endAngle)/2 * (180 / Math.PI)
        const y = initial_radius + (final_radius - initial_radius)/2

        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr('y', "0.32em")

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