import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex, Box, Button } from '@gm-pc/react'
import _ from 'lodash'

import invitationStore from '../store'
import SVGCopy from '@/svg/copy.svg'
import Copy from './copy'

const Codes = observer(class Codes extends React.Component {
  handleChange(is_fixed_code, code) {
    // invitationStore.postChangeCodeStatus(code, is_fixed_code).then(() => {
    //   invitationStore.fetchData()
    // })
  }

  render() {
    const {
      quotationObj,
      codeList,
      quotationList,
      listServicePeriod,
    } = invitationStore
    const keys = Object.keys(quotationObj).sort()
    return (
      <Box title={i18next.t('未使用邀请码')} hasGap>
        <Flex className='gm-text-18 gm-padding-bottom-10'>
          {i18next.t('未使用邀请码')}
        </Flex>
        <div>
          {_.map(keys, (item, index) => {
            const [service_period_id, quotation_id] = item.split(',')
            const servicePeriodText = _.find(
              listServicePeriod,
              (item) => item.value === service_period_id,
            )?.text
            const quotationText = _.find(
              quotationList,
              (item) => item.value === quotation_id,
            )?.text
            return (
              <div key={index} className='gm-margin-bottom-20'>
                <div className='gm-border-bottom gm-margin-bottom-10'>
                  <div className='gm-margin-bottom-5 gm-text-18'>{`[${
                    servicePeriodText || ''
                  }]${quotationText || ''}`}</div>
                </div>
                <Flex wrap>
                  {_.map(quotationObj[item], (value, index) => (
                    <div
                      key={value + index}
                      className='gm-margin-right-15 gm-margin-bottom-10'
                    >
                      <Button
                      // type={v.status === 0 ? 'default' : 'primary'}
                      // style={{ width: '100px' }}
                      // onClick={this.handleChange.bind(this, 0, v.code)}
                      >
                        {value}
                      </Button>
                      <Copy text={value}>
                        <Button className='gm-border-left-0'>
                          <SVGCopy className='gm-text-16' />
                        </Button>
                      </Copy>
                    </div>
                  ))}
                </Flex>
              </div>
            )
          })}
        </div>
      </Box>
    )
  }
});

export default Codes
