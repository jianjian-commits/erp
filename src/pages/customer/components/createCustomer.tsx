import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { history } from '@/common/service'
import { Button, Modal, Flex, MoreSelect } from '@gm-pc/react'
import _ from 'lodash'
import { Customer } from 'gm_api/src/enterprise'

interface CreateCustomerProps {
  data: Customer[]
  text: string
  url: string
}

const CreatCustomer: FC<CreateCustomerProps> = observer(
  ({ data, text, url }) => {
    useEffect(() => {
      // store.fetchParentList()
    }, [])
    const handleSelectParentCustomer = (selected: any) => {
      const value = _.trim(selected)
      if (value) {
        const id = selected.value
        history.push(`${url}${id}`)
        Modal.hide()
      }
    }
    return (
      <Flex column className='gm-padding-10'>
        <Flex>
          <Flex justifyCenter alignCenter>
            {text}:&nbsp;
            <div
              style={{ width: '180px', fontSize: '12px' }}
              className='gm-padding-right-5'
            >
              <MoreSelect
                data={_.map(data, (item) => {
                  return {
                    text: item.name,
                    value: item.customer_id,
                  }
                })}
                renderListFilterType='pinyin'
                selected={[]}
                onSelect={handleSelectParentCustomer}
              />
            </div>
            <Button
              type='link'
              onClick={() => {
                history.push(`${url}`)
                Modal.hide()
              }}
            >
              {t(`如无${text}，点此创建`)}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    )
  },
)

export default CreatCustomer
