import React, { useState, useEffect, createContext } from 'react'
import { Button, Space, Tabs, Popover } from 'antd'
import { t } from 'gm-i18n'

import RulesClient from './components/rules_client'
import RulesMerchandise from './components/rules_merchandise'
import BatchClientAdd from './components/create/client/batch_client_add'
import BatchMerchandiseAdd from './components/create/merchandise/batch_merchandise_add'
import createStore from './components/create/store'
import store from './store'
import './style.less'
import { GradeContextProps } from './interface'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { gmHistory as history } from '@gm-common/router'
const { TabPane } = Tabs

export const GradeContext = createContext<GradeContextProps>({})

const Rules = () => {
  const [type, setType] = useState<string>('')
  const [visible, setVisible] = useState<boolean>(false)
  const {
    getListPurchase,
    getListSupplier,
    init,
    getClientList,
    getMerchandiseList,
    getMerchandiseCategory,
    exportPurchaseRules,
  } = store

  useEffect(() => {
    fetchData()
    return () => {
      init()
    }
  }, [])

  const fetchData = async () => {
    await getClientList({}, 'reload')
    await getMerchandiseList({}, 'reload')
    await getListPurchase()
    await getListSupplier()
    await getMerchandiseCategory()
  }

  const handleCreate = (type: string) => {
    setType(type)
    setVisible(false)
  }
  const handleVisible = () => {
    setType('')
  }
  const content = () => {
    return (
      <>
        <div
          className='tw-cursor-pointer'
          onClick={() => handleCreate('client')}
        >
          {t('按客户新建规则')}
        </div>
        <div
          className='tw-mt-4 tw-cursor-pointer'
          onClick={() => handleCreate('merchandise')}
        >
          {t('按商品新建规则')}
        </div>
      </>
    )
  }

  const leadRules = () => {
    history.push(`/batch_import?page=purchase_rules`)
  }

  return (
    <div
      className='rules'
      onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        setVisible(false)
      }}
    >
      <div className='rules-item'>
        <Tabs
          tabBarStyle={{
            paddingLeft: '26px',
            paddingRight: '24px',
          }}
          defaultActiveKey='client'
          tabBarGutter={40}
          tabBarExtraContent={
            <>
              <Space size='middle'>
                {/* <PermissionJudge
                  permission={
                    Permission.PERMISSION_PURCHASE_EXPORT_PURCHASE_TASK_RULE
                  }
                > */}
                <Button onClick={leadRules} style={{ fontSize: '14px' }}>
                  {t('导入')}
                </Button>
                {/* </PermissionJudge> */}
                <PermissionJudge
                  permission={
                    Permission.PERMISSION_PURCHASE_EXPORT_PURCHASE_TASK_RULE
                  }
                >
                  <Button
                    onClick={exportPurchaseRules}
                    style={{ fontSize: '14px' }}
                  >
                    {t('导出')}
                  </Button>
                </PermissionJudge>
                <PermissionJudge
                  permission={
                    Permission.PERMISSION_PURCHASE_CREATE_PURCHASE_TASK_RULE
                  }
                >
                  <Popover
                    visible={visible}
                    content={content}
                    placement='bottom'
                    trigger='click'
                  >
                    <Button
                      style={{ fontSize: '14px' }}
                      onClick={(
                        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
                      ) => {
                        e.stopPropagation()
                        setVisible(true)
                        createStore.setType('batchAdd')
                      }}
                      type='primary'
                    >
                      {t('新建')}
                    </Button>
                  </Popover>
                </PermissionJudge>
              </Space>
            </>
          }
        >
          <TabPane tab={t('按客户查看')} key='client'>
            <RulesClient />
          </TabPane>
          <TabPane tab={t('按商品查看')} key='merchandise'>
            <RulesMerchandise />
          </TabPane>
        </Tabs>
      </div>

      {type === 'client' && (
        <BatchClientAdd
          visible={type === 'client'}
          handleVisible={handleVisible}
        />
      )}
      {type === 'merchandise' && (
        <BatchMerchandiseAdd
          visible={type === 'merchandise'}
          handleVisible={handleVisible}
        />
      )}
    </div>
  )
}
export default Rules
