import { BomQuery } from '@/pages/production/bom_management/components/bom_info/interfaces'
import globalStore from '@/stores/global'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import { Flex } from '@gm-pc/react'
import { Button, Tabs, Tag } from 'antd'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { Bom, Bom_Status, GetBom } from 'gm_api/src/production'
import React, { useEffect, useState } from 'react'
import { BomInfo, OperationRecord, RelatedBom, RelatedMerchant } from './'

const BomDetailBox = () => {
  const location = useGMLocation<BomQuery>()
  const { bom_id, revision } = location.query

  const isPack = location.pathname.includes('pack')

  const [bomInfo, setBomInfo] = useState<Bom>()

  useEffect(() => {
    GetBom({
      bom_id,
      revision,
    }).then((response) => {
      setBomInfo(response.response.bom)
    })
  }, [])

  const handleEditButtonClick = () => {
    if (!bomInfo) {
      return
    }

    history.push(
      `/production/bom_management/${isPack ? 'pack' : 'produce'}/create?type=${
        bomInfo.type
      }&bomId=${bom_id}`,
    )
  }

  return (
    <div>
      <Flex style={{ fontSize: 16, padding: '12px 24px' }} justifyBetween>
        <Flex alignCenter>
          <div>{bomInfo?.name}</div>
          <div>
            {(+(bomInfo?.status || 0) & (1 << 9)) ===
              Bom_Status.STATUS_DEFAULT && (
              <Tag color='blue' style={{ margin: 4 }}>
                {t('默认')}
              </Tag>
            )}
          </div>
        </Flex>
        <div>
          {globalStore.hasPermission(
            isPack
              ? Permission.PERMISSION_PRODUCTION_UPDATE_PACK_BOM
              : Permission.PERMISSION_PRODUCTION_UPDATE_BOM,
          ) && (
            <Button type='primary' onClick={handleEditButtonClick}>
              {t('编辑')}
            </Button>
          )}
        </div>
      </Flex>
      <div
        style={{
          height: 'calc(100vh - 106px)',
          background: '#fff',
          border: '16px solid #f1f1f1',
          overflowY: 'auto',
        }}
      >
        <Tabs
          defaultActiveKey='1'
          size='large'
          tabBarGutter={60}
          style={{ padding: 12 }}
        >
          <Tabs.TabPane tab='BOM信息' key='1'>
            <BomInfo />
          </Tabs.TabPane>
          <Tabs.TabPane tab='关联BOM' key='2'>
            <RelatedBom />
          </Tabs.TabPane>
          {!JSON.parse(isPack.toString()) && (
            <Tabs.TabPane tab='关联商户' key='3'>
              <RelatedMerchant />
            </Tabs.TabPane>
          )}
          <Tabs.TabPane tab='操作记录' key='4'>
            <OperationRecord />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  )
}

export default BomDetailBox
