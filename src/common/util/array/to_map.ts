/**
 * @description: 列表转map
 */
export const list2Map = (list: any[], keyFiled: string) => {
  const map: { [key: string]: any } = {}
  list.forEach((v) => {
    if (!map[v[keyFiled]]) {
      map[v[keyFiled]] = v
    }
  })
  return map
}

/**
 * @description: 列表转map,key可以是多个拼接
 */
export const list2MapSeveralKey = <T extends object>(
  list: T[],
  keyFiled: (keyof T)[],
) => {
  const map: { [key: string]: T } = {}
  list.forEach((v) => {
    const key = keyFiled.reduce((pre, cur) => pre + v[cur], '')
    if (!map[key]) {
      map[key] = v
    }
  })
  return map
}
