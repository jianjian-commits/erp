/*
 * @Description: 由于gm_api没有QuotationV2,无法生成 QuotationV2的MoreSelect
 */
import React, { FC } from 'react'
import {
  Quotation,
  ListQuotationV2,
  ListQuotationV2Response,
} from 'gm_api/src/merchandise'
import { MoreSelectListProps, MoreSelectList } from 'gm_api/src/util/pc_util'

export const MoreSelect_QuotationV2: FC<
  MoreSelectListProps<Quotation, ListQuotationV2Response>
> = (props) => {
  return (
    <MoreSelectList<Quotation, ListQuotationV2Response>
      {...props}
      messageName='Quotation'
      fetchList={ListQuotationV2}
    />
  )
}
