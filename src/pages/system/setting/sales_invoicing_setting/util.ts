import _ from 'lodash'
export const getAutoSelected = (data: any) => {
  const result: any[] = []
  _.each(data, (item, key) => {
    if (item) {
      result.push(key)
    }
  })

  return result
}
