import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { Button, Flex, FormPanel } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import store from '../store'
import TableSku from './table_sku'
import '../../style.less'
import CategoryTree from '@/pages/sales_invoicing/warehousing_data/shelf_manage/shelf/components/shelf_category'
import TableSku2 from './table_sku_2'

const ProductList = observer(() => {
  useEffect(() => {
    return () => {
      store.init()
    }
  }, [])
  return (
    <FormPanel
      title={store.isAdd ? t('添加默认入库商品') : t('货位商品设置')}
      style={{ height: '100%' }}
    >
      {store.isAdd ? (
        <Flex style={{ height: '100%' }}>
          <Flex
            flex={1}
            style={{
              minWidth: '0',
              height: '100%',
              margin: 10,
              marginRight: 50,
            }}
            className='gm-border-right gm-border-bottom'
          >
            <CategoryTree />
          </Flex>
          <Flex
            flex={4}
            style={{ height: '100%' }}
            className='gm-margin-tb-10 gm-margin-right-10  gm-border-bottom'
          >
            <TableSku2 />
          </Flex>
        </Flex>
      ) : (
        <Flex style={{ height: '100%' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {/* <div>
              商品数：
              <span
                style={{
                  color: '#2789ee',
                }}
              >
                8
              </span>
            </div>
            <div>
              <Button
                type='primary'
                onClick={() => {
                  toggle(true)
                }}
              >
                添加
              </Button>
            </div> */}
            <TableSku />
          </div>
        </Flex>
      )}
    </FormPanel>
  )
})

export default ProductList
