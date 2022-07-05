import React, { useRef, FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import {
  Form,
  FormGroup,
  FormItem,
  Modal,
  Input,
  Flex,
  Tip,
  Validator,
  InputNumber,
} from '@gm-pc/react'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { MoreSelect_Customer, Select_GroupUser } from 'gm_api/src/enterprise/pc'
import { MoreSelect_Sku } from 'gm_api/src/merchandise/pc'
import { ListSkuResponse } from 'gm_api/src/merchandise'
import { Role_Type } from 'gm_api/src/enterprise'

import { SheetType } from '../interface'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'
import globalStore from '@/stores/global'

interface Props {
  sheetInfo: SheetType
  createSheetInfo: <T extends keyof SheetType>(
    name: T,
    value: SheetType[T],
  ) => any
  createSheet: () => any
  doRequest: () => any
  clearSheet: () => any
  type?: string
}

const Turnover: FC<Props> = observer((props) => {
  const refForm = useRef<Form>(null)
  const {
    sheetInfo,
    type,
    createSheetInfo,
    createSheet,
    doRequest,
    clearSheet,
  } = props
  const {
    customer,
    sku,
    quantity,
    group_user_id,
    base_unit_name,
    related_sheet_serial_no,
    max,
    warehouse_id,
  } = sheetInfo
  const handleSheetChange = <T extends keyof SheetType>(
    key: T,
    value: SheetType[T],
  ) => {
    createSheetInfo(key, value)
  }

  const handleSave = () => {
    createSheet().then(() => {
      Tip.success('创建成功')
      Modal.hide()
      doRequest()
      clearSheet()
      return null
    })
  }
  const handleClose = () => {
    Modal.hide()
    clearSheet()
  }

  const handleValidate = (value: number) => {
    if (!value) {
      return t('数量必须大于0')
    }
    return ''
  }

  useEffect(() => {
    handleSheetChange('sku', sku)
  }, [type])

  return (
    <FormGroup
      formRefs={[refForm]}
      // eslint-disable-next-line react/jsx-handler-names
      onCancel={handleClose}
      onSubmitValidated={handleSave}
      absolute
      style={{ flexDirection: 'column', display: 'flex', alignItems: 'center' }}
    >
      <Form labelWidth='100px' colWidth='400px' ref={refForm}>
        <FormItem
          label={t('客户')}
          required
          validate={Validator.create([], customer)}
        >
          {type !== 'log_return' ? (
            <MoreSelect_Customer
              params={{ level: 2 }}
              selected={customer}
              onSelect={(select: MoreSelectDataItem<string>) => {
                handleSheetChange('customer', select)
              }}
            />
          ) : (
            <div style={{ marginTop: '6px' }}>{customer?.text}</div>
          )}
        </FormItem>
        {globalStore.isOpenMultWarehouse && (
          <FormItem
            label={t('仓库')}
            required
            validate={Validator.create([], warehouse_id)}
          >
            <Select_Warehouse
              style={{
                maxWidth: '260px',
              }}
              value={warehouse_id}
              onChange={(select: string) => {
                handleSheetChange('warehouse_id', select)
              }}
            />
          </FormItem>
        )}

        {type === 'lend' && (
          <FormItem label={t('关联订单')}>
            <Input
              value={related_sheet_serial_no}
              onChange={(e) => {
                handleSheetChange('related_sheet_serial_no', e.target.value)
              }}
            />
          </FormItem>
        )}
        <FormItem
          label={t('周转物名称')}
          required
          validate={Validator.create([], sku)}
        >
          {type !== 'log_return' ? (
            <MoreSelect_Sku
              params={{ package_sub_sku_type: 1, request_data: 1024 + 256 }}
              selected={sku}
              onSelect={(select: MoreSelectDataItem<string>) => {
                handleSheetChange('sku', select)
              }}
              getResponseData={(res: ListSkuResponse) =>
                _.map(res.sku_infos, (v) =>
                  Object.assign(v.sku, { ssu_infos: v.ssu_infos }),
                )
              }
            />
          ) : (
            <div style={{ marginTop: '6px' }}>{sku?.text}</div>
          )}
        </FormItem>
        <FormItem
          label={t('数量')}
          required
          validate={Validator.create([], quantity, handleValidate)}
        >
          <Flex alignCenter>
            <InputNumber
              max={max}
              min={0}
              value={quantity}
              onChange={(e) => {
                handleSheetChange('quantity', e)
              }}
            />
            <span style={{ minWidth: 'max-content' }}>{base_unit_name}</span>
          </Flex>
        </FormItem>
        <FormItem label={t('司机')}>
          <Select_GroupUser
            value={group_user_id}
            params={{ role_types: [Role_Type.BUILT_IN_DRIVER] }}
            onChange={(value: string) => {
              handleSheetChange('group_user_id', value)
            }}
          />
        </FormItem>
      </Form>
    </FormGroup>
  )
})

export default Turnover
