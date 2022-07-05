import { t } from 'gm-i18n'
import React, { useRef, useEffect } from 'react'
import {
  Switch,
  Flex,
  Form,
  FormItem,
  FormPanel,
  FormGroup,
  Input,
} from '@gm-pc/react'
import _ from 'lodash'
import { useGMLocation, gmHistory as history } from '@gm-common/router'
import { observer, Observer } from 'mobx-react'
import SupplierSelector from '../../components/supplier_selector'

import store from '../store'
import Validator from '@gm-pc/react/src/validator/validator'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

const Component = () => {
  const refform = useRef<Form>(null)
  const location = useGMLocation<{ id: string }>()
  const isDetail = !!location.query.id
  useEffect(() => {
    store.fetchSuppliers()
    if (location.query.id) {
      store.getPurchaser(location.query.id)
    }
    return () => {
      store.init()
    }
  }, [location.query.id])
  function handleSubmit() {
    if (!isDetail) {
      store.createPurchaser().then(() => {
        handleBack()
        return null
      })
    } else {
      store.updatePurchaser().then(() => {
        handleBack()
        return null
      })
    }
  }
  function handleChange(key: any, value: any) {
    store.updatePurchaserItem(key, value)
  }
  function handleBack() {
    history.goBack()
  }

  const { username, appLimit, phone, password, is_valid, name, suppliers } =
    store.purchaser

  return (
    <FormGroup
      disabled={
        isDetail &&
        !globalStore.hasPermission(
          Permission.PERMISSION_ENTERPRISE_UPDATE_PURCHASER,
        )
      }
      onCancel={handleBack}
      onSubmitValidated={handleSubmit}
      formRefs={[refform]}
    >
      <FormPanel title={isDetail ? t('编辑采购员') : t('新建采购员')}>
        <Form
          hasButtonInGroup
          ref={refform}
          labelWidth='130px'
          colWidth='400px'
        >
          <FormItem
            label={t('账号')}
            required={!isDetail}
            validate={!isDetail ? Validator.create([], username) : undefined}
          >
            {isDetail ? (
              <Flex className='form-control gm-border-0'>{username}</Flex>
            ) : (
              <Input
                type='text'
                value={username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            )}
          </FormItem>
          <FormItem
            label={t('密码')}
            required={!isDetail}
            validate={!isDetail ? Validator.create([], password) : undefined}
          >
            <Input
              type='password'
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </FormItem>
          <FormItem label={t('状态')}>
            <Flex className='form-control gm-border-0'>
              <Switch
                type='primary'
                checked={!!is_valid}
                on={t('有效')}
                off={t('无效')}
                onChange={(v) => handleChange('is_valid', v)}
              />
            </Flex>
            {!is_valid ? (
              <Flex flex style={{ color: '#a94442' }}>
                {t('无效状态下，将清空已绑定的供应商')}
              </Flex>
            ) : null}
          </FormItem>
          <FormItem label={t('采购小程序')}>
            <Flex className='form-control gm-border-0'>
              <Switch
                type='primary'
                checked={!!appLimit}
                on={t('开启')}
                off={t('关闭')}
                onChange={(v) => handleChange('appLimit', v)}
              />
            </Flex>
          </FormItem>
          <FormItem
            label={t('姓名')}
            required
            validate={Validator.create([], name)}
          >
            <Input
              type='text'
              value={name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </FormItem>
          <FormItem label={t('手机号')}>
            <Input
              type='text'
              value={phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </FormItem>
          <FormItem label={t('负责供应商')}>
            <Observer>
              {() => {
                return (
                  <SupplierSelector
                    selected={suppliers}
                    data={store.suppliers.slice()}
                    onSelect={(v) => handleChange('suppliers', v)}
                  />
                )
              }}
            </Observer>
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
}

export default observer(Component)
