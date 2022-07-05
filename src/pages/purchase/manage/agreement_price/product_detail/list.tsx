import { t } from 'gm-i18n'
import React, { useCallback, useMemo, ChangeEvent } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  Flex,
  Input,
  DatePicker,
  Button,
  BoxTable,
  Tip,
  Modal,
} from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import Big from 'big.js'
import { gmHistory as history } from '@gm-common/router'
import SupplierSelector from '@/pages/purchase/manage/components/supplier_selector'
import store from './store'
import CellOperation from './components/cell_operation'
import CellName from './components/cell_name'
import CellUnit from './components/cell_unit'
import _ from 'lodash'

const { OperationHeader, TABLE_X } = TableXUtil

function onEditPkgPriceChange(value: string) {
  const a = value.split('.')[0]
  const b = value.split('.')[1]
  if (b?.length > 2) {
    return a + '.' + b.slice(0, 2)
  }
  return value
}

function onEditPriceChange(value: string) {
  const a = value.split('.')[0]
  const b = value.split('.')[1]
  if (b?.length > 2) {
    return a + '.' + b.slice(0, 2)
  }
  return value
}

const List = observer(() => {
  const handleDetailAdd = useCallback(() => {
    store.addRow()
  }, [])

  const handleSubmitConfirm = () => {
    store.createSheet().then(() => {
      Tip.success(t('保存成功'))
      return setTimeout(() => {
        Modal.hide()
        history.goBack()
      }, 1000)
    })
  }

  const verifyMsg = () => {
    let msg = ''
    if (!store.list[0].skuName) {
      return '请选择商品'
    }
    if (!store.list[0].supplier) {
      return '请选择供应商'
    }
    for (const item of store.list) {
      if (!item.skuName) {
        msg = '请选择商品'
        break
      }
      if (!item.supplier) {
        msg = '请选择供应商'
        break
      }
      if (Number(item.startTime) > Number(item.endTime)) {
        msg = '终止时间需大于开始时间'
        break
      }
    }
    const arr = [
      ...new Set(
        _.map(
          store.list,
          (item) =>
            `${item.skuId}_${item.unitId}_${item.supplier.supplier_id}_${item.startTime}_${item.endTime}`,
        ),
      ),
    ]
    if (arr.length !== store.list.length) msg = '请勿填写重复商品信息'
    return msg
  }

  const handleSubmit = () => {
    const verifyResult = verifyMsg()
    if (verifyResult) {
      Tip.danger(t(verifyResult))
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
          <div className='tw-p-1'>{t('保存后将同步生成协议单')}</div>
          <Flex justifyEnd>
            <Button onClick={() => Modal.hide()}>{t('取消')}</Button>
            <div className='gm-gap-5' />
            <Button type='primary' onClick={() => handleSubmitConfirm()}>
              {t('确定')}
            </Button>
          </Flex>
        </div>
      ),
    })
  }

  const columns: Column[] = useMemo(() => {
    return [
      {
        Header: OperationHeader,
        id: 'operation',
        fixed: 'left',
        diyItemText: t('操作'),
        width: TABLE_X.WIDTH_EDIT_OPERATION,
        Cell: (cellProps) => {
          const { index } = cellProps
          return <CellOperation index={index} />
        },
      },
      {
        Header: t('商品名称'),
        id: 'name',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => <CellName index={cellProps.index} />,
      },
      {
        Header: t('规格'),
        id: 'unit',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => <CellUnit index={cellProps.index} />,
      },
      {
        Header: t('商品分类'),
        id: 'category_name',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => (
          <Observer>
            {() => {
              return <div>{cellProps.original.categoryName || '-'}</div>
            }}
          </Observer>
        ),
      },
      {
        Header: t('供应商'),
        id: 'supplier',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const { index } = cellProps
              const { supplier } = cellProps.original
              return (
                <SupplierSelector
                  multiple={false}
                  selected={supplier}
                  onSelect={(value) => {
                    store.updateList(index, { supplier: value })
                  }}
                />
              )
            }}
          </Observer>
        ),
      },
      {
        Header: t('含税协议价（计量单位）'),
        id: 'price',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const { index } = cellProps
              const { price, measUnit, rate } = cellProps.original
              return (
                <Flex alignCenter>
                  <Input
                    type='number'
                    max={9999999999999}
                    value={price}
                    onInput={(e: any) => {
                      e.target.value = e.target.value.replace(/-/g, '')
                    }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value
                      const fixPkgPrice = value
                        ? new Big(value).times(rate).toString()
                        : ''
                      const priceMsg = {
                        price: onEditPriceChange(value),
                        pkgPrice: onEditPkgPriceChange(fixPkgPrice),
                      }
                      store.updateList(index, priceMsg)
                    }}
                  />
                  {`元/${measUnit}`}
                </Flex>
              )
            }}
          </Observer>
        ),
      },
      {
        Header: t('含税协议价（包装单位）'),
        id: 'category_name',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const { index } = cellProps
              const { rate, pkgPrice, pkgUnit } = cellProps.original
              return (
                <Flex alignCenter>
                  <Input
                    type='number'
                    max={9999999999999}
                    value={pkgPrice}
                    onInput={(e: any) => {
                      e.target.value = e.target.value.replace(/-/g, '')
                    }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const value: any = e.target.value
                      const fixedPrice = value
                        ? new Big(value).div(rate).toString()
                        : ''
                      const priceMsg = {
                        price: onEditPriceChange(fixedPrice),
                        pkgPrice: onEditPkgPriceChange(value),
                      }
                      store.updateList(index, priceMsg)
                    }}
                  />
                  {`元/${pkgUnit}`}
                </Flex>
              )
            }}
          </Observer>
        ),
      },
      {
        Header: t('开始时间'),
        id: 'startTime',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => (
          <DatePicker
            date={new Date(+cellProps.original.startTime)}
            onChange={(value) =>
              store.updateList(cellProps.index, { startTime: `${+value}` })
            }
          />
        ),
      },
      {
        Header: t('结束时间'),
        id: 'endTime',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => (
          <DatePicker
            date={new Date(+cellProps.original.endTime)}
            onChange={(value) =>
              store.updateList(cellProps.index, { endTime: `${+value}` })
            }
          />
        ),
      },
    ]
  }, [])
  return (
    <BoxTable
      action={
        <div>
          <Button
            type='primary'
            onClick={() => history.push('/purchase/manage/agreement_price')}
            className='gm-margin-left-10'
          >
            {t('取消')}
          </Button>
          <Button
            type='primary'
            onClick={() => handleSubmit()}
            className='gm-margin-left-10'
          >
            {t('保存')}
          </Button>
        </div>
      }
    >
      <Table
        isIndex
        isKeyboard
        isEdit
        onAddRow={handleDetailAdd}
        data={store.list.slice()}
        columns={columns}
      />
    </BoxTable>
  )
})

export default List
