import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  ControlledForm,
  ControlledFormItem,
  FormButton,
  Button,
  Input,
  FormPanel,
  TextArea,
  RadioGroup,
  Radio,
  Tip,
  useControlFormRef,
  FormPanelMore,
} from '@gm-pc/react'
import { formatDateTime } from '@/common/util'
import {
  DeviceSupplier_Status,
  DeviceSupplier,
  map_DeviceSupplier_Type,
} from 'gm_api/src/device'
import { history } from '@/common/service'

import { Select_DeviceSupplier_Type } from 'gm_api/src/device/pc'

import { t } from 'gm-i18n'
import storeInfo from '../store/storeInfo'
import { OptionsType } from '@/pages/iot/device_management/enum'
import { DetailProps } from '@/pages/iot/device_management/interface'
import PaddingDiv from '@/pages/iot/device_management/components/paddingDiv'

const Details: FC<DetailProps> = ({ isEdit = false, supplier_id }) => {
  const {
    create_time,
    device_supplier_id,
    creater_name,
    device_supplier_name,
  } = storeInfo.supplierInfo

  const ref = useControlFormRef()

  useEffect(() => {
    if (isEdit) {
      storeInfo.getSupplier(supplier_id!).then(() => {
        return ref.current.setFieldsValue(storeInfo.supplierInfo)
      })
    }
    return () => storeInfo.initData()
  }, [isEdit, supplier_id])

  const SelectSupplier = () => (
    <ControlledFormItem label={t('供应商类型')} name='type' required>
      {isEdit ? (
        <PaddingDiv>{device_supplier_name}</PaddingDiv>
      ) : (
        <Select_DeviceSupplier_Type placeholder={t('选择供应商')} />
      )}
    </ControlledFormItem>
  )

  const BasicSupplier = () => (
    <>
      <ControlledFormItem
        label={t('通讯地址')}
        name='iot_supplier_url'
        required
        rules={[{ type: 'url', message: '通讯地址格式不对' }]}
      >
        <Input type='text' placeholder={t('输入通讯地址')} />
      </ControlledFormItem>
      <ControlledFormItem label={t('账户')} name='app_id' required>
        <Input type='text' placeholder={t('输入账户名')} maxLength={50} />
      </ControlledFormItem>
      <ControlledFormItem label={t('密匙')} name='app_secret' required>
        <Input type='text' placeholder={t('输入密钥')} maxLength={20} />
      </ControlledFormItem>
    </>
  )

  return (
    <FormPanel title={t(isEdit ? '基本信息' : '添加供应商')}>
      <ControlledForm
        form={ref}
        initialValues={{ ...storeInfo.supplierInfo }}
        labelWidth='100px'
        onSubmit={(values: DeviceSupplier) => {
          storeInfo
            .optionSupplier(
              isEdit ? OptionsType.edit : OptionsType.create,
              Object.assign(values, {
                device_supplier_name: map_DeviceSupplier_Type[values.type!],
              }),
            )
            .then(() => {
              Tip.success(t('操作成功'))
              history.push('/iot/device_management/suppliers')
              return null
            })
        }}
      >
        {isEdit && (
          <>
            <ControlledFormItem
              label={t('供应商编码')}
              name='device_supplier_id'
            >
              <PaddingDiv>{device_supplier_id}</PaddingDiv>
            </ControlledFormItem>
            <ControlledFormItem label={t('创建用户')}>
              <PaddingDiv>{creater_name}</PaddingDiv>
            </ControlledFormItem>
            <SelectSupplier />
            <ControlledFormItem label={t('创建时间')}>
              <PaddingDiv>{formatDateTime(+create_time!)}</PaddingDiv>
            </ControlledFormItem>
            <ControlledFormItem label={t('激活状态')} name='status'>
              <RadioGroup className='gm-margin-left-10'>
                <Radio value={DeviceSupplier_Status.STATUS_ENABLE}>
                  {t('开启')}
                </Radio>
                <Radio value={DeviceSupplier_Status.STATUS_DISABLE}>
                  {t('关闭')}
                </Radio>
              </RadioGroup>
            </ControlledFormItem>
          </>
        )}
        {!isEdit && (
          <>
            <SelectSupplier />
            <BasicSupplier />
          </>
        )}
        <ControlledFormItem label={t('备注')} name='remarks'>
          <TextArea
            placeholder={t('输入备注')}
            style={{ width: '400px' }}
            maxLength={100}
          />
        </ControlledFormItem>
        {isEdit && (
          <FormPanelMore>
            <BasicSupplier />
          </FormPanelMore>
        )}
        <FormButton>
          <Button
            onClick={() => {
              history.push('/iot/device_management/suppliers')
            }}
          >
            {t('取消')}
          </Button>
          <Button type='primary' htmlType='submit' className='gm-margin-left-5'>
            {t('保存')}
          </Button>
        </FormButton>
      </ControlledForm>
    </FormPanel>
  )
}

export default observer(Details)
