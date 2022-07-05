import _ from 'lodash'
import { SortBy } from 'gm_api/src/common'

const getSort = (value: { [key: number]: string | null }): SortBy[] => {
  const key = +Object.keys(value)[0]
  return key
    ? [
        {
          field: key,
          desc: value[key] === 'desc',
        },
      ]
    : []
}

const isTextNumber = (text: string) => /^\d+$/.test(text)

export { isTextNumber, getSort }
