import { history } from '@/common/service'
import { CodeInput } from '@gm-pc/business'
import {
  Form,
  FormBlock,
  FormItem,
  FormPanel,
  Input,
  TextArea,
  Validator
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { ProcessType_Status } from 'gm_api/src/production'
import { Select_ProcessType } from 'gm_api/src/production/pc'
import { observer, Observer } from 'mobx-react'
import React, { forwardRef } from 'react'
import { ProcessBaseData } from '../interface'
import store from '../store'

interface Props {
  type_id?: string
  viewType?: string
}

const BaseData = observer(
  forwardRef<Form, Props>((props, ref) => {
    const handleToProcessTypeManage = () => {
      history.push(
        '/production/processing_data/process_manage/process_type_manage',
      )
    }

    const handleBaseDataChange = <T extends keyof ProcessBaseData>(
      key: T,
      value: ProcessBaseData[T],
    ) => {
      store.updateBaseData(key, value)
    }

    return (
      <FormPanel title={t('基本信息')}>
        <Form
          ref={ref}
          className='gm-margin-15'
          labelWidth='200px'
          colWidth='470px'
        >
          <FormBlock col={2}>
            <FormItem
              label={t('工序名称')}
              required
              validate={Validator.create([], store.baseData.name)}
            >
              <Observer>
                {() => {
                  const { name } = store.baseData
                  return (
                    <Input
                      value={name}
                      maxLength={30}
                      onChange={(e) =>
                        handleBaseDataChange('name', e.target.value)
                      }
                      placeholder={t('输入工序名称')}
                    />
                  )
                }}
              </Observer>
            </FormItem>
            <FormItem
              label={t('工序编码')}
              required
              validate={Validator.create([], store.baseData.customized_code)}
            >
              <Observer>
                {() => {
                  const { customized_code, name } = store.baseData
                  return (
                    <CodeInput
                      text={name}
                      value={customized_code}
                      needTextChange={props.viewType === 'create'}
                      maxLength={34}
                      onChange={(value) =>
                        handleBaseDataChange('customized_code', value)
                      }
                      placeholder={t(
                        '自定义填写工序编码信息，如不填写系统分配',
                      )}
                    />
                  )
                }}
              </Observer>
            </FormItem>
          </FormBlock>
          <FormBlock col={2}>
            <FormItem label={t('工序类型')}>
              <Observer>
                {() => {
                  const { process_type_id } = store.baseData

                  return (
                    <div className='gm-inline-block'>
                      <Select_ProcessType
                        value={process_type_id || props.type_id || ''}
                        onChange={(value) =>
                          handleBaseDataChange('process_type_id', value)
                        }
                        getName={(item) =>
                          +(item.status || 0) &
                          ProcessType_Status.STATUS_DEFAULT
                            ? t('未分类')
                            : item.name
                        }
                      />
                    </div>
                  )
                }}
              </Observer>
              <a
                className='gm-margin-left-10 gm-cursor'
                onClick={handleToProcessTypeManage}
              >
                {t('工序类型管理')}
              </a>
            </FormItem>
            <FormItem label={t('工序描述')}>
              <Observer>
                {() => {
                  const { description } = store.baseData
                  return (
                    <TextArea
                      name='desc'
                      rows={3}
                      maxLength={50}
                      value={description}
                      onChange={(e) =>
                        handleBaseDataChange('description', e.target.value)
                      }
                    />
                  )
                }}
              </Observer>
            </FormItem>
          </FormBlock>
        </Form>
      </FormPanel>
    )
  }),
)

export default BaseData
