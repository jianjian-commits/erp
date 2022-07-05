import React, { useMemo, FC } from 'react'
import {
  FormItem,
  Button,
  Flex,
  Select,
  InputNumber,
  Tip,
  Popover,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { toJS } from 'mobx'
import { observer, Observer } from 'mobx-react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import _ from 'lodash'
import AddSvg from '@/svg/plus.svg'
import SvgRemove from '@/svg/remove.svg'
import { MoreSelectCell } from './index'
import Big from 'big.js'
import { CustomerOrderLimit_CompareType } from 'gm_api/src/enterprise'

/** type */
interface TableCellProps {
  store: any
}

const {
  OperationHeader,
  TABLE_X,
  OperationCell,
  OperationIcon,
  OperationDelete,
} = TableXUtil

const PROCESS_OPTIONS_TYPE = [
  { value: CustomerOrderLimit_CompareType.COMPARETYPE_GT, text: t('大于') },
  { value: CustomerOrderLimit_CompareType.COMPARETYPE_LT, text: t('小于') },
]

const TableCell: FC<TableCellProps> = observer(({ store }) => {
  const {
    orderRuleConfig: { category_1_rule },
  } = store

  // 已选分类列表
  const _category_1_rule_details_ = _.get(
    category_1_rule,
    'category_1_rule_details',
    [],
  )

  const handleAddClass = (index: number) => {
    if (_.some(_category_1_rule_details_, ['isEditing', true])) {
      Tip.danger('已存在分类编辑，请确定或取消')
      return
    }
    store.updateTableRow(index, 'isEditing', true)
    store.setIsLock(true)
  }

  const handleRemoveClass = (
    index: number,
    classIndex: number,
    select_id: string,
  ) => {
    store.delClass(index, classIndex)
    store.updateMoreSelectListById(select_id)
  }

  const column: Column[] = useMemo(() => {
    return [
      {
        Header: t('商品分类'),
        id: 'class',
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const {
                index,
                original: { category_1_ids, isEditing },
              } = cellProps
              const showSelectClassList = [...category_1_ids]
              return (
                <>
                  {!isEditing ? (
                    <Flex wrap justifyStart alignCenter width='100%'>
                      {showSelectClassList.length
                        ? _.map(showSelectClassList, (item, classIndex) => {
                            return (
                              <Flex
                                alignCenter
                                justifyStart
                                className='gm-border gm-padding-5 gm-margin-right-5 gm-margin-bottom-5 gm-bg-white gm-text-hover-primary'
                                style={{
                                  borderRadius: 5,
                                }}
                                key={`row-${classIndex}-id`}
                              >
                                <span className='gm-margin-right-5'>
                                  {item.text}
                                </span>
                                <Popover
                                  type='hover'
                                  showArrow
                                  popup={
                                    <span
                                      style={{
                                        padding: 2,
                                      }}
                                    >
                                      {t('删除')}
                                    </span>
                                  }
                                >
                                  <span>
                                    <SvgRemove
                                      className='gm-cursor'
                                      style={{
                                        fontSize: 10,
                                        marginBottom: 1,
                                      }}
                                      onClick={() => {
                                        handleRemoveClass(
                                          index,
                                          classIndex,
                                          item.value,
                                        )
                                      }}
                                    />
                                  </span>
                                </Popover>
                              </Flex>
                            )
                          })
                        : ''}
                      <OperationCell>
                        <OperationIcon
                          tip={t('添加分类')}
                          onClick={() => handleAddClass(index)}
                        >
                          <AddSvg className='gm-text-primary' />
                        </OperationIcon>
                      </OperationCell>
                    </Flex>
                  ) : (
                    <MoreSelectCell
                      index={index}
                      selectClassList={category_1_ids}
                      store={store}
                    />
                  )}
                </>
              )
            }}
          </Observer>
        ),
      },
      {
        Header: t('金额'),
        id: 'cost',
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const {
                index,
                original: { compare_type, limit_price },
              } = cellProps

              const {
                orderRuleConfig: { total_price_rule },
              } = store
              const __plan_order_price__ = _.get(
                total_price_rule,
                'plan_order_price.val',
              )
              const __on_off__ = _.get(total_price_rule, 'on_off')

              return (
                <Flex justifyCenter alignCenter>
                  <Select
                    data={PROCESS_OPTIONS_TYPE}
                    value={compare_type}
                    onChange={(value: number) =>
                      store.updateTableRow(index, 'compare_type', value)
                    }
                  />
                  <Flex alignCenter className='gm-margin-left-10'>
                    <InputNumber
                      className='form-control'
                      value={limit_price === 0 ? null : limit_price}
                      onChange={(value: number | null) => {
                        const _value_ = value === null ? 0 : value
                        if (__on_off__ && __plan_order_price__ === (-1 || 0)) {
                          Tip.danger(t('请先填写每日计划下单金额'))
                          return
                        }
                        store.updateTableRow(index, 'limit_price', _value_)
                        // 如果开启总金额限制类型
                        if (__on_off__ && __plan_order_price__ !== (-1 || 0)) {
                          const _ratio_ = +Big(_value_)
                            .div(+__plan_order_price__)
                            .times(100)
                            .toFixed(2)
                          store.updateTableRow(
                            index,
                            'ratio',
                            _ratio_ > 100 ? 100 : _ratio_,
                          )
                        }
                      }}
                      style={{ width: 100 }}
                      min={0}
                      // max={__on_off__ ? __max__ : 1000000}
                      max={1000000}
                      precision={2}
                    />
                    <span className='gm-margin-left-5 gm-text-desc'>
                      {t('元')}
                    </span>
                  </Flex>
                </Flex>
              )
            }}
          </Observer>
        ),
      },
      {
        Header: t('比例'),
        id: 'pre',
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const {
                index,
                original: { ratio },
              } = cellProps
              const {
                orderRuleConfig: { total_price_rule },
              } = store
              const __plan_order_price__ = _.get(
                total_price_rule,
                'plan_order_price.val',
              )
              const __on_off__ = _.get(total_price_rule, 'on_off')
              return (
                <Flex alignCenter justifyCenter>
                  <span className='gm-margin-right-20'>
                    {t('占订单总金额')}
                  </span>
                  <Flex alignCenter className='gm-margin-left-20'>
                    <InputNumber
                      className='form-control'
                      value={ratio === 0 ? null : parseFloat(ratio)}
                      onChange={(value: number | null) => {
                        store.updateTableRow(
                          index,
                          'ratio',
                          value === null ? 0 : value,
                        )
                        // 如果开启总金额限制类型
                        if (__on_off__ && __plan_order_price__ !== (-1 || 0)) {
                          store.updateTableRow(
                            index,
                            'limit_price',
                            +Big(value === null ? 0 : value)
                              .div(100)
                              .times(+__plan_order_price__)
                              .toFixed(2),
                          )
                        }
                      }}
                      min={0}
                      // max={__on_off__ && __floating_ratio__ ? 200 : 100}
                      max={100}
                      precision={2}
                      style={{ width: 100 }}
                    />
                    <span className='gm-margin-left-5 gm-text-desc'>
                      {t('%')}
                    </span>
                  </Flex>
                </Flex>
              )
            }}
          </Observer>
        ),
      },
      {
        Header: OperationHeader,
        id: 'operation',
        fixed: 'left',
        width: TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => {
          return (
            <OperationCell>
              <OperationDelete
                title={t('删除分类')}
                onClick={() => {
                  store.delTableRow(cellProps.index)
                }}
              >
                <div>{t('是否确定要删除该列分类？')}</div>
              </OperationDelete>
            </OperationCell>
          )
        },
      },
    ]
  }, [])

  return (
    <FormItem label={t('')}>
      <Table<any>
        id='goods-class-list'
        data={toJS(_category_1_rule_details_)}
        // @ts-ignore
        columns={column}
        border
      />
      <Button
        type='primary'
        size='middle'
        onClick={() => {
          store.addTableRow()
        }}
        className='gm-margin-top-10'
      >
        {t('添加限制')}
      </Button>

      <div className='gm-padding-5 gm-text-desc'>
        {t(
          '客户提交订单时，会根据以上的规则进行判断，符合规则时订单提交成功，不符合时不能提交订单，并且会有相应的提示，例如：订单金额不能大于XXX元，叶菜类金额不能大于XXX元。',
        )}
      </div>
    </FormItem>
  )
})

export default TableCell
