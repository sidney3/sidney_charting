
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
