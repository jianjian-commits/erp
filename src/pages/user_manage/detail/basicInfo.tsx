import React, { ChangeEvent, useState, forwardRef } from 'react'
import { observer } from 'mobx-react'
import {
  FormPanel,
  Form,
  FormItem,
  Switch,
  Input,
  Button,
  Validator,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { RolesOptionItem } from './type'
import { MoreSelect_Role } from 'gm_api/src/enterprise/pc'
import { MoreSelect_Warehouse_Selected } from '@/common/components/select_warehouse'
import globalStore from '@/stores/global'
interface BasicInfoProps {
  store: any
}

const BasicInfo = observer(
  forwardRef<Form, BasicInfoProps>(({ store }, ref) => {
    const [active, setActive] = useState(false)
    const sty = { width: '100%' }
    return (
      <FormPanel title={t('基本信息')}>
        <Form ref={ref} colWidth='400px' labelWidth='150px'>
          <FormItem
            required
            label={t('登录账号')}
            validate={Validator.create([], '')}
          >
            {/* 解决用户名密码自动填充的问题 */}
            <Input
              className='form-control'
              style={{ position: 'absolute', left: '-1000px' }}
              maxLength={30}
            />
            <Input
              className='form-control'
              style={{ position: 'absolute', left: '-1000px' }}
              type='password'
              maxLength={30}
            />
            <Input
              className='form-control'
              value={store.form.username}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                store.handleFormUpdate('username', e.target.value)
              }
            />
          </FormItem>
          <FormItem label={t('是否是管理员')}>
            <Switch
              type='primary'
              disabled
              on={t('是')}
              off={t('否')}
              checked={store.form.isAdmin}
              onChange={(e: boolean) => {
                store.handleFormUpdate('isAdmin', e)
              }}
            />
            <div style={{ paddingTop: '10px' }}>设置为管理员后带有全部权限</div>
          </FormItem>
          <FormItem label={t('角色')}>
            <MoreSelect_Role
              multiple
              selected={store.form.roles}
              onSelect={(value: RolesOptionItem[]) =>
                store.handleFormUpdate('roles', value)
              }
              getName={(item) => item.name || ''}
            />
          </FormItem>
          <FormItem required label={t('用户状态')}>
            <Switch
              type='primary'
              on={t('有效')}
              off={t('无效')}
              checked={store.form.is_valid}
              onChange={(e: boolean) => {
                store.handleFormUpdate('is_valid', e)
              }}
            />
          </FormItem>
          <FormItem required label={t('登录密码')}>
            {!store.form.group_user_id || active ? (
              <>
                <Input
                  className='form-control'
                  value={store.form.password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    store.handleFormUpdate('password', e.target.value)
                  }
                  placeholder={t('请输入密码')}
                  type='password'
                  maxLength={30}
                />
                <Input
                  className='form-control gm-margin-top-10'
                  value={store.form.password2}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    store.handleFormUpdate('password2', e.target.value)
                  }
                  placeholder={t('请再次输入密码')}
                  type='password'
                  maxLength={30}
                />
              </>
            ) : (
              <Button type='link' onClick={() => setActive(true)}>
                {t('修改密码')}
              </Button>
            )}
          </FormItem>
          {globalStore.isOpenMultWarehouse && (
            <FormItem required label={t('归属仓库')}>
              <MoreSelect_Warehouse_Selected
                style={sty}
                params={{
                  all: globalStore.isAdmin(),
                }}
                key='warehouse_ids'
                selected={store.form.warehouse_ids}
                onChange={(selected?: string | string[]) => {
                  store.handleFormUpdate('warehouse_ids', selected)
                }}
                placeholder='请选择归属仓库'
                multiple
              />
            </FormItem>
          )}
        </Form>
      </FormPanel>
    )
  }),
)

export default BasicInfo
