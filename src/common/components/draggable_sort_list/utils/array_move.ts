import _ from 'lodash'

export function arrayMoveMutable<T>(
  array: T[],
  fromIndex: number,
  toIndex: number,
) {
  const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex

  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = toIndex < 0 ? array.length + toIndex : toIndex

    const [item] = array.splice(fromIndex, 1)
    array.splice(endIndex, 0, item)
  }
}

function arrayMove<T>(fromIndex: number, toIndex: number, array?: T[]) {
  const newArray = _.slice(array)
  arrayMoveMutable(newArray, fromIndex, toIndex)
  return newArray
}

export default arrayMove
