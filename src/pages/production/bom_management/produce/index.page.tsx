import { Tabs } from 'antd'
import { t } from 'gm-i18n'
import { BomType } from 'gm_api/src/production'
import React from 'react'
import BomList from '../components/bom_list/bom_list'

const { TabPane } = Tabs

/**
 * 生产BOM管理页（列表页）
 */
const ProduceBomManagementPage = () => {
  const tabs = [
    {
      text: t(`全部`),
      value: BomType.BOM_TYPE_UNSPECIFIED,
      children: <BomList type={BomType.BOM_TYPE_UNSPECIFIED} isAll />,
    },
    {
      text: t(`单品`),
      value: BomType.BOM_TYPE_CLEANFOOD,
      children: <BomList type={BomType.BOM_TYPE_CLEANFOOD} />,
    },
    {
      text: t(`组合`),
      value: 'task',
      children: <BomList type={BomType.BOM_TYPE_PRODUCE} />,
    },
  ]

  return (
    <>
      <Tabs
        className='tw-box-border'
        tabBarStyle={{ paddingLeft: '25px', marginBottom: '0' }}
        size='small'
        destroyInactiveTabPane
      >
        {tabs.map((item) => (
          <TabPane tab={item.text} key={item.value}>
            {item.children}
          </TabPane>
        ))}
      </Tabs>
    </>
  )
}

export default ProduceBomManagementPage
