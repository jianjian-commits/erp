import React, { FC, useMemo, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import moment from 'moment'

import store, { Filter } from '../store'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  ControlledFormItem,
  Input,
  Button,
  FormButton,
  DateRangePicker,
} from '@gm-pc/react'
import globalStore from '@/stores/global'
import { CategoryFilter } from '@/common/components'
import Select_Warehouse_Default from '@/common/components/select_warehouse'
import { Select_GroupUser, Select_Supplier } from 'gm_api/src/enterprise/pc'
import { PurchaseFormsType } from 'gm_api/src/inventory'
import { Task_Type } from 'gm_api/src/asynctask/types'
import _ from 'lodash'

interface Props {
  onSearch: () => any
  type: PurchaseFormsType
  warehouseId?: string | number
  onChangeWarehouse: Function
}

const FilterCom: FC<Props> = observer(
  ({ onSearch, type, warehouseId, onChangeWarehouse }) => {
    const { q, begin_time, end_time, supplier_id, purchaser_id } = store.filter

    const onChangeFilter = <T extends keyof Filter>(
      filed: T,
      value: Filter[T],
    ) => {
      store.changeFilter(filed, value)
    }

    const handleExport = () => {
      let task_type = Task_Type.TYPE_PURCHASE_FORMS_TASK_BY_MERCHANDISE
      switch (type) {
        case PurchaseFormsType.TYPE_MERCHANDISE:
          task_type = Task_Type?.TYPE_PURCHASE_FORMS_TASK_BY_MERCHANDISE
          break
        case PurchaseFormsType.TYPE_SUPPLIER:
          task_type = Task_Type?.TYPE_PURCHASE_FORMS_TASK_BY_SUPPLIER
          break
        case PurchaseFormsType.TYPE_PURCHASER:
          task_type = Task_Type?.TYPE_PURCHASE_FORMS_TASK_BY_PURCHASER
          break
      }
      store.export(task_type).then((json) => {
        globalStore.showTaskPanel()
        return json
      })
    }

    return (
      <BoxForm labelWidth='100px' colWidth='385px' onSubmit={() => onSearch()}>
        <FormBlock col={3} className='gm-margin-bottom-5'>
          {useMemo(
            () =>
              globalStore?.isOpenMultWarehouse && (
                <ControlledFormItem label={t('????????????')}>
                  <Select_Warehouse_Default
                    value={warehouseId as string}
                    onChange={(value: string) => {
                      onChangeWarehouse(value)
                    }}
                  />
                </ControlledFormItem>
              ),
            [warehouseId],
          )}
          <ControlledFormItem label={t('???????????????')}>
            <DateRangePicker
              disabledDate={(date, { begin, end }) => {
                return (
                  moment(date).isBefore(moment(begin)) ||
                  moment(date).isAfter(moment(begin).add(1, 'month'))
                )
              }}
              begin={begin_time}
              end={end_time}
              onChange={(begin, end) => {
                onChangeFilter('begin_time', begin!)
                onChangeFilter('end_time', end!)
              }}
            />
          </ControlledFormItem>
          {type === PurchaseFormsType.TYPE_SUPPLIER && (
            <ControlledFormItem label={t('?????????')}>
              <Select_Supplier
                all
                value={supplier_id as string}
                onChange={(selected) => onChangeFilter('supplier_id', selected)}
                placeholder={t('??????????????????')}
              />
            </ControlledFormItem>
          )}
          {type === PurchaseFormsType.TYPE_PURCHASER && (
            <ControlledFormItem label={t('?????????')}>
              <Select_GroupUser
                all
                value={purchaser_id as string}
                onChange={(value: string) => {
                  onChangeFilter('purchaser_id', value)
                }}
                placeholder={t('??????????????????')}
              />
            </ControlledFormItem>
          )}
          <ControlledFormItem label={t('??????')}>
            <Input
              value={q}
              onChange={(e) => {
                onChangeFilter('q', e.target.value)
              }}
              placeholder={t('?????????????????????????????????')}
            />
          </ControlledFormItem>
        </FormBlock>
        <BoxFormMore>
          <FormBlock col={3}>
            <ControlledFormItem label={t('????????????')}>
              <CategoryFilter
                placeholder='????????????'
                onChange={(selected) => {
                  onChangeFilter('category_id', selected)
                }}
              />
            </ControlledFormItem>
            {type === PurchaseFormsType.TYPE_PURCHASER && (
              <ControlledFormItem label={t('?????????')}>
                <Select_Supplier
                  all
                  value={supplier_id as string}
                  onChange={(selected) =>
                    onChangeFilter('supplier_id', selected)
                  }
                  placeholder={t('??????????????????')}
                />
              </ControlledFormItem>
            )}
          </FormBlock>
        </BoxFormMore>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('??????')}
          </Button>
          <div className='gm-gap-10' />
          <Button onClick={handleExport}>{t('??????')}</Button>
        </FormButton>
      </BoxForm>
    )
  },
)

export default FilterCom
function useEfffect(arg0: () => () => void, arg1: never[]) {
  throw new Error('Function not implemented.')
}
