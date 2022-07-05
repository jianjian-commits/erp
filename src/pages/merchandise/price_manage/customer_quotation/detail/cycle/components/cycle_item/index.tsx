import { Row, Col, Dropdown } from 'antd'
import classNames from 'classnames'
import React, { ReactElement, useMemo, useState } from 'react'
import CycleStatusTag from '../cycle_tag'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { Quotation_Status } from 'gm_api/src/merchandise'
import './index.less'
import _ from 'lodash'
import SvgMore from '@/svg/more2.svg'

interface CycleItemProps {
  /** 高亮显示 */
  activated?: boolean
  /** 报价单 id */
  quotationId: string
  /** 报价单名称 */
  name?: string
  /** 报价单状态 */
  status: Quotation_Status
  /** 下拉菜单内容，传入的元素需要能够接受 onClick 并处理事件 */
  overlay: ReactElement
  onClick: (quotationId: string) => void
}

const CycleItem: React.VFC<CycleItemProps> = (props) => {
  const {
    activated = false,
    name = '',
    status,
    quotationId,
    overlay,
    onClick,
  } = props

  const [visibleDropdown, setVisibleDropdown] = useState(false)
  const [visibleIcon, setVisibleIcon] = useState(false)

  const showIcon = activated || visibleIcon || visibleDropdown

  const overlayNode = useMemo(() => {
    if (!React.isValidElement(overlay)) {
      return <></>
    }
    const node = overlay as ReactElement
    return React.cloneElement(node, {
      onClick: (...rest: unknown[]) => {
        setVisibleDropdown(false)
        const handler = node.props?.onClick
        if (_.isFunction(handler)) {
          handler(...rest)
        }
      },
    })
  }, [overlay])

  return (
    <Row
      className={classNames('cycle_left_list_item', {
        cycle_left_list_item_active: activated,
      })}
      justify='space-between'
      align='middle'
      onMouseEnter={() => setVisibleIcon(true)}
      onMouseLeave={() => setVisibleIcon(false)}
    >
      <Col
        className='cycle_left_list_item_right'
        onClick={() => onClick(quotationId)}
      >
        <CycleStatusTag status={status} />
        <TableTextOverflow text={name} />
      </Col>
      <Col>
        <Dropdown
          overlay={overlayNode}
          trigger={['click']}
          visible={visibleDropdown}
          onVisibleChange={setVisibleDropdown}
        >
          <SvgMore
            className={classNames('cycle_left_list_action', {
              'tw-hidden': !showIcon,
              actived: visibleDropdown,
            })}
          />
        </Dropdown>
      </Col>
    </Row>
  )
}

export default CycleItem
