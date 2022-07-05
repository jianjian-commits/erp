import React, { FC } from 'react'
import { Col, Row } from 'antd'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import moment from 'moment'
import { MenuPeriodNameProps } from '../interface'
const MenuPeriodName: FC<MenuPeriodNameProps> = ({
  details,
  menu_period_desc,
}) => {
  return (
    <>
      {_.map(details, (item) => {
        return (
          <>
            <Col span={8}>
              <span style={{ fontSize: '12px' }}>
                {moment(+_.keys(item)).format('YYYY-MM-DD')}
              </span>
            </Col>
            <Col span={16}>
              <Row>
                {_.map(item[+_.keys(item)], (id) => {
                  return (
                    <Col
                      span={6}
                      style={{
                        marginRight: '8px',
                        fontSize: '12px',
                        marginTop: '3px',
                      }}
                    >
                      {
                        _.find(
                          menu_period_desc?.menu_period_groups,
                          (perId) =>
                            perId.menu_period_group_id ===
                            id.menu_period_group_id,
                        )?.name
                      }
                    </Col>
                  )
                })}
              </Row>
            </Col>
          </>
        )
      })}
    </>
  )
}

export default MenuPeriodName
