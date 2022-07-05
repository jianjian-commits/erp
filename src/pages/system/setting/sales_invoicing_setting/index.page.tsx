import React, { useEffect, useRef } from 'react'
import { t } from 'gm-i18n'
import {
  FormGroup,
  FormPanel,
  Form,
  FormItem,
  Flex,
  Modal,
  Switch,
  Tip,
  Select,
  InputNumber,
} from '@gm-pc/react'

import _ from 'lodash'
import { observer } from 'mobx-react'
import store from './store'
import { AutoApprovalModal } from './components'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import { Filters_Bool } from 'gm_api/src/common'
import { Column, Table } from '@gm-pc/table-x'
import { InventorySettings_ExpireStockSettingsItem } from 'gm_api/src/preference'
import { useAsyncRetry } from 'react-use'
import { GetCategoryTree } from 'gm_api/src/merchandise'

const SalesInvoicing = observer(() => {
  const {
    allow_negative_stock,
    auto_approve_settings,
    stock_sheet_price_equal_protocol_price,
    expire_stock_settings,
    in_stock_date_default_type,
    out_stock_date_default_type,
    mult_warehouse,
  } = store.salesInvoicing

  const { fetchSalesInvoicingSetting } = globalStore
  const salesInvoicingSetting = useAsyncRetry(async () => {
    const json = await fetchSalesInvoicingSetting({
      need_full_category: true,
    })
    const result = json.response.inventory_settings
    return result
  }, [])

  const categories = useAsyncRetry(async () => {
    const json = await GetCategoryTree({})
    const result = json.response.categories

    return result
  })

  useEffect(() => {
    if (salesInvoicingSetting.loading || !salesInvoicingSetting.value)
      return void 0
    store.init(_.cloneDeep(salesInvoicingSetting.value))
  }, [salesInvoicingSetting.loading, salesInvoicingSetting.value])

  useEffect(() => {
    if (categories.loading || !categories.value) return void 0
    store.init(void 0, _.cloneDeep(categories.value))
  }, [categories.loading, categories.value])

  const handleSave = () => {
    store.updateSetting().then(() => {
      Tip.success(t('修改仓储设置成功'))
      salesInvoicingSetting.retry()
      categories.retry()
      window.location.reload()
      return null
    })
  }

  const handleApprovalSetting = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault()
    Modal.render({
      children: (
        <AutoApprovalModal
          data={auto_approve_settings!}
          onEnsure={(data) => {
            store.changeValue('auto_approve_settings', data)
          }}
        />
      ),
      disableMaskClose: true,
      title: t('仓储审核设置'),
    })
  }

  const formRef = useRef<Form>(null)
  const formRef1 = useRef<Form>(null)
  const InStockDate = [
    {
      value: 0,
      text: '预计到货时间',
    },
    {
      value: 1,
      text: '审核时间',
    },
    {
      value: 2,
      text: '建单时间',
    },
  ]

  const OutStockDate = [
    {
      value: 0,
      text: '收货时间',
    },
    {
      value: 1,
      text: '审核时间',
    },
    {
      value: 2,
      text: '建单时间',
    },
  ]

  const columns: Array<Column<InventorySettings_ExpireStockSettingsItem>> = [
    {
      Header: t('一级分类'),
      accessor: 'category_id_1',
      Cell: (cellProps) => {
        return (
          categories.value?.find((it) => it.category_id === cellProps.value)
            ?.name ?? ''
        )
      },
    },
    {
      Header: t('临期提醒设置'),
      accessor: 'on',
      Cell: (cellProps) => {
        return (
          <Select
            value={cellProps.value ? 0 : 1}
            data={[
              {
                value: 0,
                text: '开启提醒',
              },
              {
                value: 1,
                text: '不提醒',
              },
            ]}
            onChange={(v: number) => {
              store.change_expire_stock_settings(cellProps.index, {
                on: !v,
              })
            }}
          />
        )
      },
    },
    {
      Header: t('提前提醒天数'),
      accessor: 'day',
      Cell: (cellProps) => {
        return cellProps.original.on ? (
          <Flex alignCenter>
            <InputNumber
              style={{ width: '50px' }}
              min={0}
              max={9999}
              value={cellProps.value}
              onChange={(value: number | null) => {
                const new_value = value === null ? '' : value
                store.change_expire_stock_settings(cellProps.index, {
                  day: new_value.toString(),
                })
              }}
            />
            <div>天</div>
          </Flex>
        ) : (
          '-'
        )
      },
    },
  ]

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_PREFERENCE_PRODUCTION_SETTINGS,
        )
      }
      formRefs={[formRef, formRef1]}
      onSubmit={handleSave}
    >
      <FormPanel title={t('流程设置')}>
        <Form ref={formRef} labelWidth='166px' hasButtonInGroup disabledCol>
          <FormItem label={t('仓储计算方式')}>
            <div className='gm-margin-top-5'>{t('先进先出')}</div>
            <div className='gm-text-desc gm-padding-top-5'>
              {t('因涉及核心经营数据，如需修改仓储计算方式请联系客服')}
            </div>
          </FormItem>
          <FormItem label={t('仓储审核设置')}>
            <Flex column className='gm-margin-top-5'>
              <a onClick={handleApprovalSetting} className='gm-cursor'>
                {t('点击设置')}
              </a>
              <div className='gm-text-desc gm-padding-top-5'>
                {t('设置仓储是否提交后自动审核')}
              </div>
            </Flex>
          </FormItem>
          <FormItem label={t('允许超支出库')}>
            <Switch
              checked={allow_negative_stock!}
              onChange={() => {
                store.changeValue('allow_negative_stock', !allow_negative_stock)
              }}
              on={t('开启')}
              off={t('关闭')}
              style={{ width: '70px' }}
              className='gm-margin-top-5'
            />
            <div className='gm-text-desc gm-margin-top-5'>
              {t(
                '开启后，出库单中存在库存小于出库数的商品时，允许使用临时批次进行出库',
              )}
            </div>
            <div className='gm-text-desc gm-margin-top-5'>
              {t('关闭后，出库单中存在库存小于出库数的商品时，不允许出库操作')}
            </div>
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel title={t('单据模式时间设置')}>
        <Form ref={formRef} labelWidth='200px' hasButtonInGroup disabledCol>
          <FormItem
            labelWidth='200px'
            label={t('“采购入库单“ 默认入库时间取值')}
          >
            <Select
              style={{ width: '200px' }}
              value={in_stock_date_default_type}
              data={InStockDate}
              onChange={(v: number) => {
                store.changeValue('in_stock_date_default_type', v)
              }}
            />
          </FormItem>
          <FormItem label={t('“销售出库单“ 默认出库时间取值')}>
            <Select
              style={{ width: '200px' }}
              value={out_stock_date_default_type}
              data={OutStockDate}
              onChange={(v: number) => {
                store.changeValue('out_stock_date_default_type', v)
              }}
            />
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel title={t('多仓库设置')}>
        <Form ref={formRef} labelWidth='200px' hasButtonInGroup disabledCol>
          <FormItem labelWidth='100px' label={t('启用多仓库')}>
            <Switch
              checked={mult_warehouse}
              onChange={() => {
                store.changeValue('mult_warehouse', !mult_warehouse)
              }}
              on={t('开启')}
              off={t('关闭')}
              style={{ width: '70px' }}
              className='gm-margin-top-5'
            />
            <div className='gm-text-desc gm-margin-top-5'>
              {t(
                '开启后，允许手动新增仓库，之前进销存数据全部归为系统默认仓下面',
              )}
            </div>
            <div className='gm-text-desc gm-margin-top-5'>
              {t('系统存在多个仓库时不允许关闭')}
            </div>
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel title={t('保质期预警设置')}>
        <Flex className='gm-text-desc gm-padding-top-5'>
          {t('分类设置超期商品的提醒天数，系统将根据设置的天数进行提醒')}
        </Flex>
        <Table
          style={{
            maxWidth: '700px',
          }}
          data={expire_stock_settings?.expire_stock_settings?.slice() ?? []}
          columns={columns}
        />
      </FormPanel>
      {/* <FormPanel title={t('默认单据设置')}>
        <Form labelWidth='166px' hasButtonInGroup disabledCol>
          <div className='tw-ml-3 tw-p-1'>{t('采购入库单')}</div>
          <FormItem label={t('入库单价默认等于协议价')}>
            <Switch
              checked={
                stock_sheet_price_equal_protocol_price! === Filters_Bool.TRUE
              }
              onChange={(value) => {
                const v = value ? Filters_Bool.TRUE : Filters_Bool.FALSE
                store.changeValue('stock_sheet_price_equal_protocol_price', v)
              }}
              className='gm-margin-top-5'
            />
            <div className='gm-text-desc gm-margin-top-5'>
              <p className='gm-margin-bottom-5'>
                {t(
                  '1.开启后，采购入库单新增商品的入库单价（计量单位）默认展示当前供应商在生效期间的协议价；若当前供应商无协议价生效，则价格需由用户手动录入',
                )}
              </p>
              <p>
                {t(
                  '2.关闭后，采购入库单新增商品的入库单价（计量单位）无默认值，需手动录入',
                )}
              </p>
            </div>
          </FormItem>
        </Form>
      </FormPanel> */}
    </FormGroup>
  )
})

export default SalesInvoicing
