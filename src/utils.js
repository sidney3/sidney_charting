import * as d3 from "d3"

export function unix_to_MDY(unix) {
  const date = new Date(unix)
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDay()

  return month + "/" + day + "/" + year
}

export function ticks(start, end, count) {
  //re-write of D3's "ticks" function
  //returns array of length count with start, end included
  //additionally we round to the nearest decimal
  const floored_start = Math.floor(start)
  const floored_end = Math.floor(end)
  if (count <= 1 || floored_start > floored_end) {
    throw Error("Bad input to ticks")
  }

  const step_size = (floored_end - floored_start) / (count - 1)
  let ret = [floored_start]
  let curr = floored_start
  while (curr < floored_end) {
    curr += step_size
    ret.push(Math.floor(curr))
  }
  return ret
}

export function default_key_to_color(key) {
  const big_prime_1 = 1181
  const big_prime_2 = 139
  const big_prime_3 = 107

  //https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }
  
  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  const red = (big_prime_1 * (key + big_prime_2)) % 256
  const blue = (big_prime_2 * (key + big_prime_3)) % 256
  const green = (big_prime_3 * (key+ big_prime_1)) % 256

  return rgbToHex(red, green, blue)
  
}
