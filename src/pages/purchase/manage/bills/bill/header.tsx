import React from 'react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { Observer } from 'mobx-react'
import { Flex, Input, DatePicker } from '@gm-pc/react'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import SupplierSelector from '../../components/supplier_selector'
import Purchaser from './components/purchaser'
import Action from './components/action'
import { getDateByTimestamp, getTimestamp } from '@/common/util'
import {
  map_PurchaseSheet_Status,
  PurchaseSheet_Status,
} from 'gm_api/src/purchase'
import store from './store'
import { supplierGroupBy } from '@/pages/purchase/util'

import type { MoreSelectDataItem } from '@gm-pc/react'
import { ListSkuRequest_RequestData } from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'

interface HeaderProps {
  disabledEdit?: boolean
}

const Header = (props: HeaderProps) => {
  const { disabledEdit } = props

  function handleSupplierSelect(selected?: MoreSelectDataItem<string>) {
    store.infoUpdate('supplier', selected)
    // TODO: 暂时没有采购协议价税率
    // if (
    //   store.merchandise_info.length > 0 &&
    //   store.agreementPriceState &&
    //   store.info.supplier
    // ) {
    //   store.fetchListBasicPrice()
    // }&& !store.agreementPriceState
    if (store.merchandise_info.length > 0) {
      store.fetchListSku(
        {
          request_data: ListSkuRequest_RequestData.CATEGORY,
          paging: { limit: 999 },
        },
        true,
      )
    }
  }
  function handleBillRemark(e: React.ChangeEvent<HTMLInputElement>) {
    store.infoUpdate('remark', e.target.value)
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={100}
      contentCol={4}
      customerContentColWidth={[280, 280, 280, 280]}
      HeaderInfo={[
        {
          label: t('采购单据'),
          item: (
            <Observer>
              {() => <div>{store.info.serial_no || '-'}</div>}
            </Observer>
          ),
        },
        {
          label: t('供应商'),
          item: (
            <Flex alignCenter>
              <Observer>
                {() => {
                  const isCommit =
                    store.info.status === PurchaseSheet_Status.COMMIT
                  if (isCommit)
                    return <Flex>{store.info.supplier?.text || '-'}</Flex>
                  return (
                    <SupplierSelector
                      multiple={false}
                      selected={store.info.supplier}
                      onSelect={handleSupplierSelect}
                      isGroupList
                      groupBy={supplierGroupBy}
                    />
                  )
                }}
              </Observer>
            </Flex>
          ),
        },
        {
          label: t('采购员'),
          hide: globalStore.isLite,
          item: (
            <Observer>
              {() => {
                const isCommit =
                  store.info.status === PurchaseSheet_Status.COMMIT
                if (isCommit)
                  return <Flex>{store.info.purchase?.text || '-'}</Flex>
                return <Purchaser />
              }}
            </Observer>
          ),
        },
      ]}
      ContentInfo={[
        {
          label: t('状态'),
          item: (
            <Observer>
              {() => (
                <div>
                  {map_PurchaseSheet_Status[store.info?.status!] || '-'}
                </div>
              )}
            </Observer>
          ),
        },
        {
          label:
            store.info?.status === PurchaseSheet_Status.DRAFT
              ? t('创建时间')
              : t('提交时间'),
          item: (
            <Observer>
              {() => (
                <div>
                  {store.info?.status === PurchaseSheet_Status.DRAFT
                    ? store.info.create_time
                      ? moment(new Date(+store.info.create_time)).format(
                          'YYYY-MM-DD HH:mm',
                        )
                      : '-'
                    : store.info.update_time
                    ? moment(new Date(+store.info.update_time)).format(
                        'YYYY-MM-DD HH:mm',
                      )
                    : '-'}
                </div>
              )}
            </Observer>
          ),
        },
        {
          label: t('创建人'),
          hide: globalStore.isLite,
          item: (
            <Observer>
              {() => <div>{store.info?.creator?.name || '-'}</div>}
            </Observer>
          ),
        },
        {
          label: t('单据备注'),
          hide: globalStore.isLite,
          item: (
            <Observer>
              {() => {
                const isCommit =
                  store.info.status === (PurchaseSheet_Status.COMMIT as number)
                if (isCommit) return <Flex>{store.info.remark}</Flex>
                return (
                  <Input
                    maxLength={50}
                    onChange={handleBillRemark}
                    value={store.info.remark}
                    type='text'
                  />
                )
              }}
            </Observer>
          ),
        },
        {
          label: t('预计到货时间'),
          item: (
            <Observer>
              {() => {
                return (
                  <>
                    {store.info?.status !== 512 ? (
                      <DatePicker
                        date={
                          +store?.info?.receive_time!
                            ? getDateByTimestamp(store?.info?.receive_time!)
                            : undefined
                        }
                        placeholder='请选择日期'
                        onChange={(date: Date) => {
                          store.infoUpdate('receive_time', getTimestamp(date))
                        }}
                        enabledTimeSelect
                      />
                    ) : (
                      <span>
                        {+store.info.receive_time!
                          ? moment(new Date(+store.info?.receive_time!)).format(
                              'YYYY-MM-DD HH:mm',
                            )
                          : '-'}
                      </span>
                    )}
                  </>
                )
              }}
            </Observer>
          ),
        },
      ]}
      HeaderAction={<Action disabledEdit={disabledEdit} />}
    />
  )
}

export default Header
