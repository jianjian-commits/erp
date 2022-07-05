import React, { forwardRef } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { FormPanel, Form, Flex, Checkbox } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import './style.less'
import classNames from 'classnames'

interface RoleAuthProps {
  store: any
}

const RoleAuth = observer(
  forwardRef<Form, RoleAuthProps>(({ store }, ref) => {
    return (
      <FormPanel title={t('基本信息')}>
        {_.map(store.permissionOptionList, (level1, level1Index) => {
          return (
            <div className='gm-margin-bottom-20' key={level1.value}>
              <div className='role-manage-check-first-level'>
                <Checkbox
                  value={level1.value}
                  checked={level1.checked}
                  indeterminate={level1.indeterminate}
                  onChange={(event: any) => {
                    store.handleLevel1Change(level1)
                  }}
                  key={level1.value}
                >
                  {level1.text}
                </Checkbox>
              </div>
              <div>
                {_.map(level1.children, (level2, level2Index) => {
                  return (
                    <Flex
                      className={classNames('gm-padding-20', {
                        'gm-back-bg': Number(level2Index) % 2 === 1,
                      })}
                      key={level2.value}
                    >
                      <div style={{ width: '300px' }}>
                        <Checkbox
                          checked={level2.checked}
                          indeterminate={level2.indeterminate}
                          value={level2.value}
                          key={level2.value}
                          onChange={(event: any) => {
                            store.handleLevel2Change(level1, level2)
                          }}
                        >
                          {level2.text}
                        </Checkbox>
                      </div>
                      <Flex flex wrap>
                        {_.map(level2.children, (level3) => {
                          return (
                            <Checkbox
                              checked={level3.checked}
                              value={level3.value}
                              key={level3.value}
                              onChange={(event: any) => {
                                store.handleLevel3Change(level1, level2, level3)
                              }}
                            >
                              {level3.text}
                            </Checkbox>
                          )
                        })}
                      </Flex>
                    </Flex>
                  )
                })}
              </div>
            </div>
          )
        })}
      </FormPanel>
    )
  }),
)

export default RoleAuth
