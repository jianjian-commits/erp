import { t } from 'gm-i18n'
import React, { FC, useRef, ChangeEvent, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormItem,
  Switch,
  MoreSelect,
  FormGroup,
  FormPanel,
  MoreSelectDataItem,
  Input,
} from '@gm-pc/react'
import _ from 'lodash'
import { useGMLocation } from '@gm-common/router'
import { history } from '@/common/service'

import store from './store'
import Account from './components/account'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

const DriverDetail: FC = observer(() => {
  const {
    driverDetail: { name, is_valid, attrs, distribution_contractor_id, status },
    accountDetail: { account_phone },
    accountDetail,
    handleDetail,
    distributionContractorList,
    fetchDistributionContractorList,
    UpdateDriver,
    CreateDriver,
    handleAccountDetail,
  } = store

  const [newCarrier, setNewCarrier] = useState(false)

  const location = useGMLocation<{ id?: string }>()
  const id = location.query?.id
  const refform = useRef(null)
  const onCancel = () => {
    history.push('/delivery/driver_management')
  }
  const handleSaveType = () => {
    return id ? UpdateDriver() : CreateDriver()
  }
  const handleSave = async () => {
    if (store.newDistributionContractor) {
      await store.createDistributionContractor()
    }
    if (!store.validate()) {
      return
    }
    handleSaveType().then((json) => {
      json && onCancel()
      return null
    })
  }
  const handleSelectCarrier = (key: string, value: string) => {
    if (value === '0') {
      setNewCarrier(true)
    } else {
      handleDetail(key, value)
    }
  }
  const title = id ? t('编辑司机') : t('新建司机')
  useEffect(() => {
    id && store.fetchDetail(id)
    fetchDistributionContractorList()
    return () => store.init()
  }, [])
  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_ENTERPRISE_UPDATE_DRIVER,
        )
      }
      formRefs={[refform]}
      onCancel={onCancel}
      onSubmit={handleSave}
    >
      <FormPanel title={title}>
        <Form ref={refform} labelWidth='130px'>
          <Account
            accountData={accountDetail}
            onChangeAccount={handleAccountDetail}
            isCreate={!id}
          />

          <FormItem label={t('状态')}>
            <Switch
              onChange={(value: boolean) => {
                handleDetail('is_valid', value)
              }}
              checked={is_valid!}
              on={t('有效')}
              off={t('无效')}
            />
          </FormItem>
          <FormItem label={t('司机APP')}>
            <Switch
              onChange={(value: boolean) => {
                if (value) {
                  handleDetail('status', '512')
                } else {
                  handleDetail('status', '0')
                }
              }}
              checked={status === '512'}
              on={t('有效')}
              off={t('无效')}
            />
          </FormItem>
          <FormItem
            // className={classNames({ 'has-error': _.has(errorMsg, 'name') })}
            required
            label={t('司机名')}
          >
            <Input
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleDetail('name', e.target.value)
              }}
              placeholder={t('填写司机姓名')}
              //   onBlur={handleValidator.bind(null, 'name')}
              style={{ width: '300px' }}
              className='form-control'
              type='text'
            />
            {/* {_.has(errorMsg, 'name') && (
              <div className='help-block'>{errorMsg.name}</div>
            )} */}
          </FormItem>
          <FormItem
            // className={classNames({
            //   'has-error': _.has(errorMsg, 'phone'),
            // })}
            required
            label={t('手机号码')}
          >
            <Input
              value={account_phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleAccountDetail('account_phone', e.target.value)
              }}
              placeholder={t('填写司机手机号码')}
              //   onBlur={handleValidator.bind(null, 'phone')}
              style={{ width: '300px' }}
              disabled={!!id}
              className='form-control'
              type='text'
            />
            {/* {_.has(errorMsg, 'phone') && (
              <div className='help-block'>{errorMsg.phone}</div>
            )} */}
          </FormItem>
          <FormItem
            // className={classNames({
            //   'has-error': _.has(errorMsg, 'plate_number'),
            // })}
            label={t('车牌号')}
          >
            <Input
              value={attrs?.car_license_plate_number || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleDetail('attrs', e.target.value)
              }}
              placeholder={t('填写车牌号')}
              //   onBlur={handleValidator.bind(null, 'plate_number')}
              style={{ width: '300px' }}
              className='form-control'
              type='text'
            />
            {/* {_.has(errorMsg, 'plate_number') && (
              <div className='help-block'>{errorMsg.plate_number}</div>
            )} */}
          </FormItem>
          <FormItem
            // className={classNames({
            //   'has-error': _.has(
            //     errorMsg,
            //     carrier ? 'company_name' : 'carrier_id',
            //   ),
            // })}
            required
            label={t('承运商')}
          >
            {newCarrier ? (
              <Input
                value={store.newDistributionContractor}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  store.handleChangeDistributionContractor(e.target.value)
                }}
                placeholder={t('请填写承运商名称')}
                style={{ width: '300px' }}
                maxLength={30}
                className='form-control'
                type='text'
              />
            ) : (
              <div style={{ width: '300px' }}>
                <MoreSelect
                  data={distributionContractorList}
                  selected={_.find(
                    distributionContractorList,
                    (item) => item.value === distribution_contractor_id,
                  )}
                  onSelect={(item: MoreSelectDataItem<string>) =>
                    handleSelectCarrier(
                      'distribution_contractor_id',
                      item.value,
                    )
                  }
                />
              </div>
            )}
            {/* {_.has(errorMsg, carrier ? 'company_name' : 'carrier_id') && (
              <div className='help-block'>
                {errorMsg[carrier ? 'company_name' : 'carrier_id']}
              </div>
            )} */}
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})

export default DriverDetail
