import DefaultImage from '@/img/product-default-gm.png'
import { useGMLocation } from '@gm-common/router'
import { Flex } from '@gm-pc/react'
import { Avatar, Button, Dropdown, Menu, Tag } from 'antd'
import { t } from 'gm-i18n'
import { Bom, Bom_Status, GetBomTreeResponse } from 'gm_api/src/production'
import React, { useEffect, useState } from 'react'
import { BomTreeGraph } from './components'
import { BomQuery } from './interfaces'
import store from './store'

/**
 * 展示BOM信息的组件函数
 */
const BomInfo = () => {
  const location = useGMLocation<BomQuery>()
  const { bom_id, sku_id, revision } = location.query

  const [currentRevision, setCurrentRevision] = useState(revision)
  const [bomData, setBomData] = useState<Bom>()
  const [menu, setMenu] = useState(<Menu />)
  const [bomTreeData, setBomTreeData] = useState<GetBomTreeResponse>()
  const [bomImage, setBomImage] = useState<string>()

  useEffect(() => {
    getBomTreeData(revision)
  }, [])

  useEffect(() => {
    const newMenu = (
      <Menu
        style={{ maxHeight: '400px', overflowY: 'auto' }}
        onClick={handleVersionButtonClick}
      >
        {Array(+revision)
          .fill(0)
          .map((_, index) => {
            return (
              <Menu.Item key={+revision - index}>
                版本{+revision - index}
              </Menu.Item>
            )
          })}
      </Menu>
    )
    setMenu(newMenu)
  }, [bomData])

  useEffect(() => {
    getBomTreeData(currentRevision)
  }, [currentRevision])

  /**
   * 获取BOM数据
   * @param {string} revision BOM的版本
   */
  const getBomTreeData = (revision: string) => {
    store
      .getBomTreeData(bom_id, revision)
      .then((bomTreeData: GetBomTreeResponse) => {
        const imagePath =
          bomTreeData.sku_infos?.[sku_id]?.sku?.repeated_field?.images?.[0]
            ?.path
        setBomImage(imagePath && `https://qncdn.guanmai.cn/${imagePath}`)
        setBomData(bomTreeData.boms?.[sku_id])
        setBomTreeData(bomTreeData)
      })
      .catch(() => {
        setBomTreeData(undefined)
      })
  }

  /**
   * 处理版本按钮点击的事件
   * 更新版本号
   * @param {any} target 点击的目标
   */
  const handleVersionButtonClick = (target: any) => {
    setCurrentRevision(target.key)
  }

  return (
    <div style={{ padding: 8 }}>
      <Flex style={{ margin: '12px 0' }}>
        <div
          style={{
            border: '1px solid black',
            borderRadius: 4,
          }}
        >
          <Avatar src={bomImage || DefaultImage} size={112} shape='square' />
        </div>
        <div style={{ margin: 4 }}>
          <Button
            type='link'
            style={{ fontSize: 16, padding: 0, margin: 4 }}
            href={`/#/merchandise/manage/merchandise_list/detail?sku_id=${sku_id}`}
          >
            {bomTreeData?.sku_infos?.[sku_id]?.sku?.name || ''}
          </Button>
          <Flex style={{ margin: 4, fontSize: 14 }} alignCenter>
            <div>BOM名称：{bomData?.name}</div>
            {(+(bomData?.status || 0) & (1 << 9)) ===
              Bom_Status.STATUS_DEFAULT && (
              <Tag color='blue' style={{ margin: 4 }}>
                {t('默认')}
              </Tag>
            )}
          </Flex>
          <div style={{ margin: 4, fontSize: 14 }}>
            BOM编码：{bomData?.customized_code}
          </div>
        </div>
      </Flex>
      <div style={{ margin: '12px 8px' }}>
        <div>
          <Dropdown.Button overlay={menu}>
            版本{currentRevision}
          </Dropdown.Button>
        </div>
        <div>
          {bomData && bomTreeData && (
            <BomTreeGraph bomId={bomData.sku_id} bomTreeData={bomTreeData} />
          )}
        </div>
        <div />
      </div>
    </div>
  )
}

export default BomInfo
