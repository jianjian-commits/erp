import React, { FC } from 'react'
import { Flex, Popover } from '@gm-pc/react'
import { map_Order_State } from 'gm_api/src/order'
import styled from 'styled-components'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import { gmHistory as history } from '@gm-common/router'
import { ViewOrderNoProps } from '../interface'
import SVGAnomaly from '@/svg/triangle-warning.svg'
import { ZImage } from '@/common/components/z_image'
import { imageDomain } from '@/common/service'
import globalStore from '@/stores/global'
import { orderState4Light } from '@/pages/order/enum'

export const Tag = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--gm-color-desc);
  margin-right: 3px;
  vertical-align: middle;
`
interface StateProps {
  state?: number
}
const State: FC<StateProps> = ({ children }) => {
  return (
    <Flex alignCenter className='gm-inline-block gm-margin-left-5'>
      <Tag className={classNames('gm-inline-block gm-bg-primary')} />
      <span className='gm-text-desc gm-text-12'>{children}</span>
    </Flex>
  )
}

const ViewOrderNo: FC<ViewOrderNoProps> = ({
  serial_no,
  sign_img_url,
  customer_img_url,
  state,
  status,
}) => {
  return (
    <Flex alignCenter>
      {serial_no}
      <State>
        {globalStore.isLite
          ? orderState4Light[state as keyof typeof orderState4Light]
          : map_Order_State[state!]}
      </State>
      {(sign_img_url || customer_img_url) && (
        <Popover
          showArrow
          center
          type='hover'
          popup={
            <div className='gm-padding-10' style={{ minWidth: '140px' }}>
              {customer_img_url && (
                <Flex column>
                  <span>客户签名:</span>
                  <img width='140px' src={customer_img_url} alt='客户签名' />
                </Flex>
              )}
              {sign_img_url && (
                <Flex column>
                  <span>司机签名:</span>
                  <img
                    width='140px'
                    src={`${imageDomain}${sign_img_url}`}
                    alt='司机签名'
                  />
                </Flex>
              )}
            </div>
          }
        >
          <div
            className='gm-cursor gm-margin-left-5 gm-text-12'
            style={{ color: 'blue', textDecoration: 'underline' }}
          >
            {t('电子签名')}
          </div>
        </Popover>
      )}

      {+status! & (1 << 14) ? (
        <Popover
          showArrow
          center
          type='hover'
          popup={
            <div className='gm-padding-10' style={{ width: '140px' }}>
              {t('该订单存在售后异常')}
            </div>
          }
        >
          <div
            className='gm-text-red gm-cursor gm-margin-left-5 gm-text-16'
            onClick={() =>
              history.push(
                `/order/after_sales/after_sales_list?order_serial_no=${serial_no}`,
              )
            }
          >
            <SVGAnomaly />
          </div>
        </Popover>
      ) : (
        ''
      )}
    </Flex>
  )
}

export default ViewOrderNo
