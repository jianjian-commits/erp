import {
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  Flex,
  Modal,
  Row,
} from '@gm-pc/react'
import {
  InventorySettings_AutoApproveSettings,
  InventorySettings_AutoApproveSettings_InventoryStockSheetAutoApprove,
  InventorySettings_AutoApproveSettings_OutStockSheetAutoApprove,
  InventorySettings_AutoApproveSettings_InStockSheetAutoApprove,
} from 'gm_api/src/preference'
import React, { FC, useState } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { getAutoSelected } from '../util'

type AutoApprove =
  | keyof InventorySettings_AutoApproveSettings_InventoryStockSheetAutoApprove
  | keyof InventorySettings_AutoApproveSettings_OutStockSheetAutoApprove
  | keyof InventorySettings_AutoApproveSettings_InStockSheetAutoApprove

const AUTO_APPROVE: {
  text: string
  value: keyof InventorySettings_AutoApproveSettings
  children: { text: string; value: AutoApprove }[]
}[] = [
  {
    text: t('入库单据'),
    value: 'in_stock',
    children: [
      { text: t('采购入库'), value: 'purchase_in' },
      { text: t('加工入库'), value: 'product_in' },
      { text: t('退料入库'), value: 'material_in' },
      { text: t('其他入库'), value: 'other_in' },
    ],
  },
  {
    text: t('出库单据'),
    value: 'out_stock',
    children: [
      { text: t('销售出库'), value: 'sale_out' },
      { text: t('领料出库'), value: 'material_out' },
      { text: t('采购退货出库'), value: 'refund_out' },
      { text: t('其他出库'), value: 'other_out' },
    ],
  },
  {
    text: t('盘点单据'),
    value: 'check_stock',
    children: [
      { text: t('盘点审核'), value: 'check' },
      { text: t('调拨审核'), value: 'transfer' },
    ],
  },
]

interface Props {
  data: InventorySettings_AutoApproveSettings
  onEnsure: (data: InventorySettings_AutoApproveSettings) => void
}

interface State {
  in_stock: (keyof InventorySettings_AutoApproveSettings_InStockSheetAutoApprove)[]
  check_stock: (keyof InventorySettings_AutoApproveSettings_InventoryStockSheetAutoApprove)[]
  out_stock: (keyof InventorySettings_AutoApproveSettings_OutStockSheetAutoApprove)[]
}

const AutoApprovalModal: FC<Props> = (props) => {
  const { check_stock, out_stock, in_stock } = props.data
  const [state, setState] = useState<State>({
    in_stock: in_stock ? getAutoSelected(in_stock) : [],
    check_stock: check_stock ? getAutoSelected(check_stock) : [],
    out_stock: out_stock ? getAutoSelected(out_stock) : [],
  })

  const handleChangeAll = (
    name: keyof InventorySettings_AutoApproveSettings,
  ) => {
    let length = 0
    const currentKeyList: AutoApprove[] = []
    _.each(AUTO_APPROVE, (item) => {
      if (name === item.value) {
        length = item.children.length
        _.each(item.children, (kid) => {
          currentKeyList.push(kid.value)
        })
      }
    })

    // 若相等，则当前为全选，需要清空
    if (state[name].length === length) {
      setState({
        ...state,
        [name]: [],
      })
    } else {
      setState({
        ...state,
        [name]: currentKeyList,
      })
    }
  }

  const handleChange = (
    group: keyof InventorySettings_AutoApproveSettings,
    value: AutoApprove[],
  ) => {
    setState({
      ...state,
      [group]: value,
    })
  }

  const handleEnsure = () => {
    const result: InventorySettings_AutoApproveSettings = {
      check_stock: { check: false },
      out_stock: {
        sale_out: false,
        material_out: false,
        refund_out: false,
        other_out: false,
      },
      in_stock: {
        purchase_in: false,
        product_in: false,
        material_in: false,
        other_in: false,
      },
    }

    _.each(state.in_stock, (item) => {
      result.in_stock![item] = true
    })

    _.each(state.out_stock, (item) => {
      result.out_stock![item] = true
    })

    _.each(state.check_stock, (item) => {
      result.check_stock![item] = true
    })

    props.onEnsure(result)
    Modal.hide()
  }

  return (
    <>
      <Flex column>
        {_.map(AUTO_APPROVE, (item) => {
          return (
            <Flex column className='gm-margin-top-10' key={item.value}>
              <Checkbox
                checked={state[item.value].length === item.children.length}
                onChange={() => handleChangeAll(item.value)}
              >
                {item.text}
              </Checkbox>
              <CheckboxGroup
                value={state[item.value]}
                onChange={(value: any) => handleChange(item.value, value)}
                className='gm-margin-left-20 gm-margin-top-10'
              >
                {/* {_.map(item.children, (kid) => ( */}
                <Row>
                  {_.map(item.children, (v) => (
                    <Col span={5} key={v.value}>
                      <Checkbox value={v.value}>{v.text}</Checkbox>
                    </Col>
                  ))}
                </Row>
                {/* ))} */}
              </CheckboxGroup>
            </Flex>
          )
        })}
      </Flex>
      <Flex justifyEnd className='gm-margin-top-10'>
        <Button
          onClick={() => {
            Modal.hide()
          }}
          className='gm-margin-right-10'
        >
          {t('取消')}
        </Button>
        <Button type='primary' onClick={handleEnsure}>
          {t('确认')}
        </Button>
      </Flex>
    </>
  )
}

export default AutoApprovalModal
