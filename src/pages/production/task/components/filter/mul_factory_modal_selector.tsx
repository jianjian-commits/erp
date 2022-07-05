import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { MultipleLevelSelect } from '@gm-pc/react'
import _ from 'lodash'
// import { ListProcessor } from 'gm_api/src/production'
// import { useAsync } from '@gm-common/hooks'

import store from '../../store'

interface Props {
  selected: string[][]
  onSelect: (selected: string[][]) => void
}

const MulFactoryModalSelector: FC<Props> = ({ selected, onSelect }) => {
  const { factoryModalList } = store

  // const handleRequest = () => {
  //   return ListProcessor({ paging: { limit: 999 } }).then((json) => {
  //     // 处理好数据
  //     const { processors } = json.response
  //     const group = _.groupBy(processors, 'parent_id')
  //     const parents = group['0']
  //     const new_list = (parents || []).map((v) => ({
  //       ...v,
  //       value: v.processor_id,
  //       text: v.name,
  //       children: _.map(group[v.processor_id], (g) => ({
  //         ...g,
  //         value: g.processor_id,
  //         text: g.name,
  //       })),
  //     }))
  //     setModals(new_list)
  //     return null
  //   })
  // }

  // const [modals, setModals] = useState<LevelSelectDataItem<string>[]>(
  //   factoryModalList.slice() || [],
  // )

  // const { run } = useAsync(handleRequest, {
  //   cacheKey: `processors`,
  // })

  // useEffect(() => {
  //   if (!factoryModalList.length) run()
  // }, [])

  return (
    <MultipleLevelSelect
      placeholder={t('全部')}
      data={[
        { value: '0', text: t('未分配'), children: [] },
        ...factoryModalList.slice(),
      ]}
      selected={selected}
      onSelect={onSelect}
    />
  )
}

export default MulFactoryModalSelector
