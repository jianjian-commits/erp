import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Flex, Box, FormPanel } from '@gm-pc/react'

import FactoryModalList from './components/factory_modal'
import WorkShopWithProcess from './components/work_shop_with_process'
import WorkShopAddProcess from './components/work_shop_add_process'
import WorkShopWithDevice from './components/work_shop_with_device'
import WorkShopAddDevice from './components/work_shop_add_device'
import store from './store'
import './style.less'
import { FullTabs } from '@gm-pc/frame'

const FactoryModel: FC = observer(() => {
  const { add_process, add_device } = store
  useEffect(() => {
    // 获取工厂模型列表
    store.getFactoryModalList()
    store.initData()
  }, [])

  return (
    <Flex className='b-factory-modal'>
      <Flex flex={1} style={{ minWidth: '300px' }} className='gm-margin-10'>
        <Box className='b-width-100'>
          <FormPanel title={t('工厂模型')} style={{ height: '100%' }}>
            <FactoryModalList />
          </FormPanel>
        </Box>
      </Flex>

      <Flex flex={4} className='gm-margin-tb-10 gm-margin-right-10'>
        <Box className='b-width-100'>
          <div className='position-left'>
            <FullTabs
              onChange={(active) => store.setType(active)}
              tabs={[
                {
                  text: '工序',
                  value: 'process',
                  children: (
                    <FormPanel
                      title={
                        add_process ? t('车间 添加工序') : t('车间 已有工序')
                      }
                      style={{ height: '100%' }}
                    >
                      {add_process ? (
                        <WorkShopAddProcess />
                      ) : (
                        <WorkShopWithProcess />
                      )}
                    </FormPanel>
                  ),
                },
                {
                  text: '设备',
                  value: 'device',
                  children: (
                    <div className='gm-margin-top-10 gm-margin-left-10'>
                      {add_device ? (
                        <WorkShopAddDevice />
                      ) : (
                        <WorkShopWithDevice />
                      )}
                    </div>
                  ),
                },
              ]}
              active={store.tabType}
            />
          </div>
        </Box>
      </Flex>
    </Flex>
  )
})

export default FactoryModel
