import React, { useEffect } from 'react'
import {
  Box,
  Flex,
  FormPanel,
  Button,
  ControlledForm,
  ControlledFormItem,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import globalStore from '@/stores/global'
import store from './store'
import { ProductList, ShelfTree } from './components'
import '../style.less'
import Select_WareHouse_Default from '@/common/components/select_warehouse'
import { useEffectOnce } from '@/common/hooks'

const Shelf: React.FC = () => {
  const { warehouse_id } = store.shelfFilter

  useEffectOnce(store.fetchShelf, warehouse_id)
  useEffect(() => {
    store.fetchCategory()
  }, [])

  const handleExport = () => {
    store.export().then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  return (
    <Flex className='b-shelf-full'>
      <Flex flex={1} style={{ minWidth: '300px' }} className='gm-margin-10'>
        <Box className='b-width-100-percent'>
          <FormPanel
            title={t('货位列表')}
            style={{ height: '100%', width: '100%' }}
            right={
              <div>
                <Button onClick={handleExport}>{t('导出')}</Button>
              </div>
            }
          >
            <ControlledForm className='gm-margin-10'>
              <ControlledFormItem label={t('选择仓库')} disabledCol>
                <Select_WareHouse_Default
                  value={warehouse_id as string}
                  onChange={(value: string) => {
                    store.changeShelfFilter('warehouse_id', value)
                    store.fetchShelf()
                  }}
                />
              </ControlledFormItem>
            </ControlledForm>
            {/* 货位树 */}
            <ShelfTree />
          </FormPanel>
        </Box>
      </Flex>
      <Flex flex={4} className='gm-margin-tb-10 gm-margin-right-10'>
        <Box className='b-width-100-percent b-height-100-percent'>
          <Flex column flex={3} className='b-height-100-percent'>
            <ProductList />
          </Flex>
        </Box>
      </Flex>
    </Flex>
  )
}

export default observer(Shelf)
