import React, { ChangeEvent, useState } from 'react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { useGMLocation, gmHistory as history } from '@gm-common/router'

import {
  Flex,
  Input,
  DateRangePicker,
  Button,
  Tip,
  Select,
  Modal,
} from '@gm-pc/react'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import SupplierSelector from '@/pages/purchase/manage/components/supplier_selector'
import { Quotation_Status } from 'gm_api/src/merchandise'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import store from './store'
import _ from 'lodash'

import type { MoreSelectDataItem } from '@gm-pc/react'
import globalStore from '@/stores/global'

enum StatusMap {
  '未生效' = Quotation_Status.STATUS_WAIT_VALID,
  '生效中' = Quotation_Status.STATUS_VALID,
  '已失效' = Quotation_Status.STATUS_INVALID,
  '已终止' = Quotation_Status.STATUS_STOP,
}

interface Query {
  quotation_id?: string
  copy_quotation_id?: string
}

interface HeaderProps {
  disabledEdit?: boolean
}

const statusesSelectData = [
  {
    text: '生效中',
    value: Quotation_Status.STATUS_VALID,
  },
  {
    text: '已终止',
    value: Quotation_Status.STATUS_STOP,
  },
]

const Header = observer((props: HeaderProps) => {
  const [editState, setEditState] = useState(false)
  const location = useGMLocation<Query>()
  const quotation_id = location.query?.quotation_id
  const copy_quotation_id = location.query?.copy_quotation_id
  function handleSupplierSelect(selected?: MoreSelectDataItem<string>) {
    store.updateHeaderInfo('supplier', selected)
  }

  function handleCopy() {
    window.open(
      `#/purchase/manage/agreement_price/sheet_detail?copy_quotation_id=${quotation_id}`,
    )
  }

  function handleCancel() {
    setEditState(false)
    store.changeListEditState(false)
    if (!quotation_id) {
      history.push('/purchase/manage/agreement_price')
    } else {
      history.go(0)
    }
  }

  function handleExport() {
    const quotation_id = store.headerInfo.quotation_id || ''
    store.exportQuotation(quotation_id).then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  function verifyMsg() {
    if (!store.headerInfo.supplier?.supplier_id) {
      return '请选择供应商'
    }
    if (!store.headerInfo.start_time || !store.headerInfo.end_time) {
      return '请选择起止时间'
    }
    if (
      Number(store.headerInfo.start_time) > Number(store.headerInfo.end_time)
    ) {
      return '终止时间需大于开始时间'
    }
    let msg = ''
    const map: any = {}
    for (const item of store.list) {
      if (!item.skuName || !item.price) {
        msg = '请填写完整的协议单信息'
        break
      }
      const key = `${item.skuId}`
      if (map[key]) {
        msg = `请勿填写重复商品信息：${item.skuName}`
        break
      }
      map[key] = true
    }
    return msg
  }
  function handleEditSubmitConfirm() {
    store.updateSheet().then((res) => {
      setEditState(false)
      store.changeListEditState(false)
      Tip.success(t('修改成功'))
      Modal.hide()
    })
  }
  function handleEditSubmit() {
    const result = verifyMsg()
    if (result) {
      Tip.danger(t(result))
      return
    }
    if (store.headerInfo.status === Quotation_Status.STATUS_VALID) {
      Modal.render({
        style: {
          width: '400px',
        },
        title: t('提示'),
        onHide: Modal.hide,
        children: (
          <div>
            <div className='tw-p-1'>
              {t(
                '保存后仅影响新增采购单单价展示，已有单据单价不受影响，是否确认保存？',
              )}
            </div>
            <Flex justifyEnd>
              <Button onClick={() => Modal.hide()}>{t('取消')}</Button>
              <div className='gm-gap-5' />
              <Button type='primary' onClick={() => handleEditSubmitConfirm()}>
                {t('确定')}
              </Button>
            </Flex>
          </div>
        ),
      })
    } else {
      handleEditSubmitConfirm()
    }
  }
  function handleCreateSubmitConfirm() {
    store.createSheet().then((res) => {
      const quotation_id = res.sheets?.abc.quotation.quotation_id || ''
      Tip.success(t('新建成功'))
      Modal.hide()
      return setTimeout(() => {
        history.push(
          `/purchase/manage/agreement_price/sheet_detail?quotation_id=${quotation_id}`,
        )
        // history.push('/purchase/manage/agreement_price')
      }, 1000)
    })
  }
  function handleCreateSubmit() {
    const result = verifyMsg()
    if (result) {
      Tip.danger(t(result))
      return
    }
    Modal.render({
      style: {
        width: '400px',
      },
      title: t('提示'),
      onHide: Modal.hide,
      children: (
        <div>
          <div className='tw-p-1'>{t('是否确认保存?')}</div>
          <Flex justifyEnd>
            <Button onClick={() => Modal.hide()}>{t('取消')}</Button>
            <div className='gm-gap-5' />
            <Button type='primary' onClick={() => handleCreateSubmitConfirm()}>
              {t('确定')}
            </Button>
          </Flex>
        </div>
      ),
    })
  }
  function handleEdit() {
    setEditState(true)
    // store.changeListEditState(true)
    store.getAllSkuUnitSelectData().then(() => store.changeListEditState(true))
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={80}
      contentCol={4}
      customerContentColWidth={[330, 280, 380, 280]}
      HeaderInfo={[
        {
          label: t('协议单'),
          item: (
            <Observer>
              {() => (
                <div>{!quotation_id ? '-' : store.headerInfo.serial_no}</div>
              )}
            </Observer>
          ),
        },
        {
          label: t('供应商'),
          item: (
            <Flex alignCenter>
              {!quotation_id ||
              copy_quotation_id ||
              (editState &&
                store.headerInfo.status ===
                  Quotation_Status.STATUS_WAIT_VALID) ? (
                <Observer>
                  {() => (
                    <SupplierSelector
                      multiple={false}
                      selected={store.headerInfo.supplier}
                      onSelect={handleSupplierSelect}
                    />
                  )}
                </Observer>
              ) : (
                <div>{store.headerInfo.supplier_name || '-'}</div>
              )}
            </Flex>
          ),
        },
        {
          label: t('起止时间'),
          item: (
            <Observer>
              {() => {
                const start_time = store.headerInfo.start_time
                const end_time = store.headerInfo.end_time
                const start_date = moment(Number(start_time)).format(
                  'YYYY-MM-DD',
                )
                const end_date = moment(Number(end_time)).format('YYYY-MM-DD')
                // return <div>{date ? moment(date).format('YYYY-MM-DD') : '-'}</div>
                return !quotation_id ||
                  copy_quotation_id ||
                  (editState &&
                    store.headerInfo.status ===
                      Quotation_Status.STATUS_WAIT_VALID) ? (
                  <DateRangePicker
                    begin={start_time ? new Date(+start_time) : undefined}
                    end={end_time ? new Date(+end_time) : undefined}
                    onChange={(begin: Date, end: Date) => {
                      if (begin && end) {
                        store.updateHeaderInfo('start_time', `${+begin}`)
                        store.updateHeaderInfo('end_time', `${+end}`)
                      }
                    }}
                  />
                ) : (
                  <div>
                    {start_time && end_time
                      ? `${start_date} ~ ${end_date}`
                      : '-'}
                  </div>
                )
              }}
            </Observer>
          ),
        },
        {
          label: t('单据备注'),
          item: (
            <Observer>
              {() => {
                return !quotation_id ||
                  copy_quotation_id ||
                  (editState &&
                    store.headerInfo.status ===
                      Quotation_Status.STATUS_WAIT_VALID) ? (
                  <Input
                    value={store.headerInfo.remark}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      store.updateHeaderInfo('remark', e.target.value)
                    }
                    type='text'
                    maxLength={30}
                  />
                ) : (
                  <div>{store.headerInfo.remark || '-'}</div>
                )
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
              {() =>
                editState &&
                store.headerInfo.status === Quotation_Status.STATUS_VALID ? (
                  <Select
                    value={store.headerInfo.status}
                    onChange={(value) =>
                      store.updateHeaderInfo('status', value)
                    }
                    data={statusesSelectData}
                  />
                ) : (
                  <div>
                    {quotation_id ? StatusMap[store?.headerInfo?.status!] : '-'}
                  </div>
                )
              }
            </Observer>
          ),
        },
        {
          label: t('创建人'),
          item: (
            <Observer>
              {() => <div>{store.headerInfo.operator || '-'}</div>}
            </Observer>
          ),
        },
        {
          label: t('创建时间'),
          item: (
            <Observer>
              {() => (
                <div>
                  {store.headerInfo.create_time
                    ? moment(new Date(+store.headerInfo.create_time)).format(
                        'YYYY-MM-DD HH:mm',
                      )
                    : '-'}
                </div>
              )}
            </Observer>
          ),
        },
        // {
        //   label: t('最后修改人'),
        //   item: (
        //     <Observer>
        //       {() => <div>{store.headerInfo.last_operator || '-'}</div>}
        //     </Observer>
        //   ),
        // },
        {
          label: t('最后修改时间'),
          item: (
            <Observer>
              {() => (
                <div>
                  {store.headerInfo.update_time
                    ? moment(new Date(+store.headerInfo.update_time)).format(
                        'YYYY-MM-DD HH:mm',
                      )
                    : '-'}
                </div>
              )}
            </Observer>
          ),
        },
      ]}
      HeaderAction={
        <div>
          {!quotation_id ? (
            <Flex>
              <Button onClick={handleCancel}>取消</Button>
              <Button
                type='primary'
                className='tw-ml-1'
                onClick={handleCreateSubmit}
                disabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_PURCHASE_CREATE_AGREEMENT_PRICE,
                  )
                }
              >
                保存
              </Button>
            </Flex>
          ) : editState ? (
            <Flex>
              <Button onClick={handleCancel}>取消</Button>
              <Button
                type='primary'
                className='tw-ml-1'
                onClick={handleEditSubmit}
              >
                保存
              </Button>
            </Flex>
          ) : (
            <Flex>
              {store.headerEditAble && (
                <PermissionJudge
                  permission={
                    Permission.PERMISSION_PURCHASE_UPDATE_AGREEMENT_PRICE
                  }
                >
                  <Button onClick={handleEdit}>{t('修改')}</Button>
                </PermissionJudge>
              )}
              {/* <Button className='tw-ml-1' onClick={handleCopy}>
                {t('复制')}
              </Button>
              <Button className='tw-ml-1' onClick={handleExport}>
                {t('导出')}
              </Button> */}
            </Flex>
          )}
        </div>
      }
    />
  )
})

export default Header
