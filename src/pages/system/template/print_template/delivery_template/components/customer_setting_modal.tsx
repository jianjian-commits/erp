import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Flex, Transfer, LoadingChunk, Button } from '@gm-pc/react'
import store from './../store'

interface CustomerSettingModalProps {
  templateId: string
  templateDeliveryType: number | string | undefined
  onHide?(): void
}

const CustomerSettingModal: FC<CustomerSettingModalProps> = observer(
  ({ templateId, templateDeliveryType, onHide }) => {
    const {
      customer_ids,
      allCustomerLists,
      setSelectValues,
      updatePrintingRelation,
    } = store

    useEffect(() => {
      store.getPrintingRelation(templateId).then((json) => {
        store.getCustomerList(templateDeliveryType as number)
        return json
      })
    }, [])

    const confirmToConfig = () => {
      updatePrintingRelation(templateId)
      onHide && onHide()
    }
    return (
      <div className='gm-padding-lr-15'>
        <LoadingChunk text={t('拼命加载中...')} loading={false}>
          <div className='gm-text-14 gm-padding-tb-10'>{t('客户配置')}</div>
          <Flex justifyBetween alignCenter>
            <span />
            <Button type='primary' onClick={confirmToConfig}>
              {t('确定')}
            </Button>
          </Flex>
          <hr />
          <Transfer
            list={allCustomerLists}
            selectedValues={customer_ids as any[]}
            onSelectValues={(selected: string[]) => setSelectValues(selected)}
            leftTitle={t('全部客户')}
            rightTree
            rightTitle={t('已选客户')}
            hideToLeftBtn
          />
          <Flex alignStart>
            <p>注：</p>
            <div>
              {/* <p>
                1、若将客户从配置中移除，则该客户不会绑定任何模板，且按客户打印模板时，该客户的单据不会被打印！
              </p> */}
              <p>
                1、一个客户关联的模块只能有一个，如已关联模板，修改后将解除原模板关联，并与当前模板关联
              </p>
            </div>
          </Flex>
        </LoadingChunk>
      </div>
    )
  },
)

export default CustomerSettingModal
