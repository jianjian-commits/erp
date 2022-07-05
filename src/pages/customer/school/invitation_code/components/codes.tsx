import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex, Box, Button } from '@gm-pc/react'
import _ from 'lodash'
import invitationStore from '../store'
import SVGCopy from '@/svg/copy.svg'
import Copy from '../../../society/invitation_code/components/copy'
import '../style.less'

const Codes: FC = observer(() => {
  const { codeList, schoolList } = invitationStore

  return (
    <Box title={t('未使用邀请码')} hasGap>
      {codeList.length ? (
        <>
          <Flex className='gm-text-18 gm-padding-bottom-10'>
            {t('未使用邀请码')}
          </Flex>
          <Flex
            justifyBetween
            wrap
            className='gm-margin-top-20 gm-margin-left-20'
          >
            {_.map(codeList, (item, index) => {
              const school_text = _.find(
                schoolList,
                (it) => it.value === item.root_customer_id,
              )?.text
              return (
                <Flex column wrap key={index} style={{ width: '50%' }}>
                  <span className='gm-text-16 gm-margin-bottom-10'>
                    {school_text}
                  </span>
                  <div className='b-underline' />
                  <div
                    key={item.invitation_code_id + index}
                    className='gm-margin-top-10 gm-margin-right-15 gm-margin-bottom-20'
                  >
                    <Button>{item?.text!}</Button>
                    <Copy text={item?.text!}>
                      <Button className='gm-border-left-0'>
                        <SVGCopy className='gm-text-16' />
                      </Button>
                    </Copy>
                  </div>
                </Flex>
              )
            })}
          </Flex>
        </>
      ) : (
        <Flex className='gm-text-18 gm-padding-bottom-10'>
          {t('暂无可用邀请码')}
        </Flex>
      )}
    </Box>
  )
})

export default Codes
