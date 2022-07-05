import React from 'react'
import { Flex, Tooltip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import { gmHistory } from '@gm-common/router'
import { observer } from 'mobx-react'
import { map_ReferencePrice_Type } from 'gm_api/src/merchandise'

const MaterialCost = () => {
  const {
    gmShopSetting: { reference_price_type },
  } = globalStore

  const handleChangeType = () => {
    gmHistory.push('/system/setting/shop_settings')
  }

  const type = map_ReferencePrice_Type[reference_price_type!]

  return (
    <Flex>
      {t('商品成本')}
      <Tooltip
        className='gm-padding-lr-5 gm-text-14'
        top
        popup={
          <div className='gm-padding-5' style={{ width: '300px' }}>
            <span>
              {t(
                type
                  ? `默认商品成本=${
                      map_ReferencePrice_Type[reference_price_type!] ?? ''
                    }，`
                  : '暂未开启商品成本，',
              )}
            </span>
            <a onClick={handleChangeType}>
              {t(type ? '更换成本取值' : '点此设置成本取值')}
            </a>
          </div>
        }
      />
    </Flex>
  )
}

export default observer(MaterialCost)
