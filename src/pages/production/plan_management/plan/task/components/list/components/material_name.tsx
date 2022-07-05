import EllipsesText from '@/pages/production/bom_management/components/bom_list/components/ellipsed_text'
import '@/pages/production/style.less'
import { toFixed } from '@/pages/production/util'
import globalStore from '@/stores/global'
import { GetManySkuResponse_SkuInfo } from 'gm_api/src/merchandise'
import {
  Bom_Process_Input,
  ProcessTaskRelation,
  TaskProcess_Attr,
  TaskProcess_Output,
} from 'gm_api/src/production'
import _ from 'lodash'
import React, { FC } from 'react'
import { SHOW_OVERFLOW } from '../../../enum'
import store from '../../../store'

interface Props {
  inputs?: TaskProcess_Output[]
  outputs?: ProcessTaskRelation[]
  attrs?: TaskProcess_Attr[]
  match?: Bom_Process_Input[]
  nameType: number
  skuList?: { [key: string]: GetManySkuResponse_SkuInfo }
}

const MaterialName: FC<Props> = (props) => {
  const { match, attrs, inputs, outputs, nameType } = props
  const skuList = props.skuList ?? store.skuList
  let name: string[] = []

  switch (nameType) {
    case SHOW_OVERFLOW.attrs:
      name = _.map(attrs, ({ name, val }) => `${name}(${val})`)
      break
    case SHOW_OVERFLOW.input:
      name = _.map(
        inputs,
        ({ material }) => skuList[material?.sku_id!]?.sku?.name!,
      )
      break
    case SHOW_OVERFLOW.output:
      name = _.map(
        outputs,
        ({ output_sku_id }) => skuList[output_sku_id!]?.sku?.name!,
      )
      break
    case SHOW_OVERFLOW.raw_input:
      name = _.map(match, ({ material }) => {
        const { sku_id, quantity, unit_id } = material!
        return (
          skuList[sku_id!]?.sku?.name +
          toFixed(quantity) +
          globalStore.getUnitName(unit_id)
        )
      })
      break
  }

  // 过滤掉重复的并把内容合并，用逗号隔开
  const showName =
    name.filter((n, index) => name.indexOf(n) === index).join(',') || '-'

  return (
    <>
      <EllipsesText text={showName} maxLength={23} />
      {/* {showName.length >= 23 ? (
        <Popover
          type='hover'
          popup={
            <div className='gm-padding-10' style={{ width: '300px' }}>
              {showName}
            </div>
          }
        >
          <span className='b-24-text-overflow '>{showName}</span>
        </Popover>
      ) : name.length ? (
        <span>{showName}</span>
      ) : (
        '-'
      )} */}
    </>
  )
}

export default MaterialName
