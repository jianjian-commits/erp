import React, { useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Button, Flex } from '@gm-pc/react'
import { Space, InputNumber, Select, message, Alert } from 'antd'
import CellSkuSelector from './cell_sku_selector'
import _, { iteratee } from 'lodash'
import store from '../store'
import globalStore from '@/stores/global'
import { runInAction, toJS } from 'mobx'
import SkuSelectByCategory, {
  formatCascaderData,
} from '../component/sku_select_by_category'
import { fetchTreeData } from '@/common/service'
import { Status_Code, UnitType } from 'gm_api/src/merchandise'
import { pinyin } from '@gm-common/tool'
import { ErrorListProps } from '../../type'

const { TABLE_X } = TableXUtil

const ErrorTip = (tip: string) => (
  <Alert
    className='tw-ml-2'
    type='error'
    message={
      <span className='gm-text-red gm-text-12'>
        {tip.replace(/[;；]/, '') || '-'}
      </span>
    }
    style={{
      height: 32,
    }}
  />
)

const rendSkuCell = (
  status_code: Status_Code,
  errStr: string,
  name: string,
) => {
  let text
  switch (status_code) {
    case Status_Code.SKU_NOT_EXISTS:
      text = errStr
      break
    case Status_Code.CODE_UNSPECIFIED:
      text = errStr
      break
    default:
      text = errStr
      break
  }
  return (
    <Flex alignCenter>
      <span
        style={{
          minWidth: 36,
        }}
      >
        {name || '-'}
      </span>
      {ErrorTip(errStr)}
    </Flex>
  )
}
export const getColumns = () => {
  const { unitList, getSameUnitGroup } = globalStore

  return [
    {
      Header: t('序号'),
      id: 'index',
      width: TABLE_X.WIDTH_NO,
      fixed: 'left',
      Cell: (cellProps) => cellProps.index + 1,
    },
    {
      Header: t('商品名'),
      accessor: 'name',
      minWidth: 180,
      Cell: (cellProps) => {
        const {
          original: { err, err_str, name },
          index,
        } = cellProps
        return (
          <Flex alignCenter>
            {rendSkuCell(err, err_str, name)}
            {err === Status_Code.MARCHING_ALIAS_MORE_GOODS && (
              <CellSkuSelector index={index} />
            )}
          </Flex>
        )
      },
    },
    {
      Header: t('单位'),
      accessor: 'unit_id',
      minWidth: 120,
      Cell: (cellProps) => (
        <Observer>
          {() => {
            const {
              original: { unit_id, err, err_sku, unit_id_from_user },
              index,
            } = cellProps
            // 判断条件
            const isErrorUnit = err === Status_Code.CODE_UNSPECIFIED
            const isNotFoundUnit =
              unit_id_from_user === '0' || err === Status_Code.UNIT_NOT_EXISTS

            // 商品基本单位
            const base_unit = _.find(
              unitList,
              (unit) => err_sku?.base_unit_id === unit.unit_id,
            )
            // 用户填的单位
            const user_input_unit = _.find(
              unitList,
              (unit) => unit_id_from_user === unit.unit_id,
            )

            let options = []
            if (isNotFoundUnit) {
              options = _.map(unitList, (it) => {
                return {
                  ...it,
                  label: it.text,
                }
              })
            } else {
              const sameUnitGroup = getSameUnitGroup()
              options = _.map(
                sameUnitGroup[
                  isErrorUnit ? base_unit?.type! : user_input_unit?.type!
                ],
                (u) => {
                  return {
                    ...u,
                    label: u.text,
                  }
                },
              ).filter((f) => {
                if (f.type === 5 || f.group_id !== '0') {
                  return f.unit_id === user_input_unit?.unit_id
                } else {
                  return true
                }
              })
            }
            return (
              <Flex alignCenter>
                <Select
                  showSearch
                  style={{ width: 120 }}
                  disabled={false}
                  options={options}
                  value={!isErrorUnit && !isNotFoundUnit ? unit_id : undefined}
                  onChange={(v) => {
                    if (v === unit_id) return
                    store.updateErrorList(index, 'unit_id', v)
                  }}
                  optionFilterProp='label'
                  filterOption={(input: string, option: any) => {
                    const text = input.toLocaleLowerCase()
                    return (
                      option!.label?.toLocaleLowerCase().indexOf(text) >= 0 ||
                      pinyin(option.label)?.toLocaleLowerCase().indexOf(text) >=
                        0
                    )
                  }}
                  placeholder='请选择单位'
                />
                {isErrorUnit && ErrorTip(user_input_unit?.name!)}
              </Flex>
            )
          }}
        </Observer>
      ),
    },
    {
      Header: t('单价'),
      accessor: 'price',
      diyEnable: false,
      minWidth: 100,
      Cell: (cellProps) => (
        <Observer>
          {() => {
            const {
              original: { price },
              index,
            } = cellProps
            return (
              <Flex alignCenter>
                <InputNumber
                  style={{ width: 100 }}
                  min={0}
                  max={9999999}
                  type='number'
                  precision={2}
                  controls={false}
                  defaultValue={price}
                  onChange={(value) =>
                    store.updateErrorList(index, 'price', value)
                  }
                  onBlur={(e) =>
                    store.updateErrorList(index, 'price', e.target.value)
                  }
                  placeholder='请填写单价'
                />
                <span className='tw-ml-2'>{t('元')}</span>
              </Flex>
            )
          }}
        </Observer>
      ),
    },
    {
      minWidth: 200,
      Header: TableXUtil.OperationHeader,
      diyEnable: false,
      id: 'action',
      fixed: 'right' as any,
      diyItemText: '操作',
      Cell: (cellProps) => (
        <Observer>
          {() => {
            const {
              original: { sku_id, forced_create, err },
              index,
            } = cellProps
            return (
              <Flex justifyStart>
                <Button
                  type='link'
                  className='tw-p-0'
                  onClick={() => store.del(cellProps.row.index)}
                >
                  {t('删除')}
                </Button>
                {err === Status_Code.SKU_NOT_EXISTS && (
                  <Flex justifyEnd>
                    {!forced_create && (
                      <SkuSelectByCategory
                        defaultValue={sku_id} // 不一定需要
                        onChange={(skuId: string, name: string) => {
                          store.updateErrorList(index, 'sku_id', skuId)
                        }}
                      />
                    )}
                    <Select
                      style={{ width: 170 }}
                      options={[
                        {
                          value: '1',
                          label: '直接新增',
                        },
                        {
                          value: '0',
                          label: '添加至已有商品别名',
                        },
                      ]}
                      value={+forced_create + ''}
                      className='tw-mr-2 tw-ml-2'
                      onChange={(value) => {
                        store.updateErrorList(
                          index,
                          'forced_create',
                          Boolean(+value),
                        )
                      }}
                    />
                  </Flex>
                )}
              </Flex>
            )
          }}
        </Observer>
      ),
    },
  ] as Column[]
}

const ErrorList = () => {
  const { errorList, selected } = store

  // 拉一次分类接口就行
  useEffect(() => {
    fetchTreeData().then((list) => {
      runInAction(() => {
        store.category = formatCascaderData(list.categoryTreeData)
      })
    })
  }, [])

  const limit = 12
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, errorList.length) * TABLE_X.HEIGHT_TR

  return (
    <>
      {/* error result */}
      <div className='tw-mt-2 tw-mb-5'>
        <div className='upload-error'>
          <div className='tw-mt-6 tw-text-xs'>
            <span>成功导入</span>
            <span className='tw-mx-1 tw-text-base'>
              {store.successCount || 0}
            </span>
            <span>条</span>
            <span className='tw-text-gray-200 tw-mx-4'>|</span>
            <span>失败</span>
            <span className='tw-mx-1 tw-text-base tw-text-red-500'>
              {store.failureCount || 0}
            </span>
            <span>条</span>
            <span className='tw-text-gray-200 tw-mx-4'>|</span>
            <span>失败结果如下</span>
            {store.failureAttachURL && (
              <a className='tw-ml-4' href={store.failureAttachURL}>
                下载失败数据
              </a>
            )}
          </div>
        </div>
      </div>
      {/* error list  */}
      <Table<ErrorListProps>
        id='error_list'
        keyField='sku_id'
        isEdit
        // isSelect
        isVirtualized
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        virtualizedHeight={tableHeight}
        // selected={selected}
        // onSelect={(selected: string[]) => store.updateSelected(selected)}
        data={errorList}
        columns={getColumns()}
      />
    </>
  )
}

export default observer(ErrorList)
