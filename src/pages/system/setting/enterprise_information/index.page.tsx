import React, { FC, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormBlock,
  FormItem,
  FormPanel,
  Uploader,
  UploaderFile,
  Tip,
  Validator,
  Input,
  FormButton,
  Button,
} from '@gm-pc/react'
import { PlusOutlined } from '@ant-design/icons'
import { uploadQiniuImage } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import RegionSelect from './region_select'
import store from './store'
import { t } from 'gm-i18n'
import _ from 'lodash'
import globalStore from '@/stores/global'
import { GroupUser_Type } from 'gm_api/src/enterprise'
import './style.less'

const EnterpriseInformation: FC = observer(() => {
  const formRef = useRef(null)

  useEffect(() => {
    store
      .initForm()
      .then(() => store.getProvinceList(store.form.country_id || ''))
      .then((provinces: any) => store.sortRegionSelectData(provinces))
  }, [])

  const handleSubmit = () => {
    store.updateGroup().then(() => Tip.success(t('保存成功')))
  }

  const onUpload = (files: UploaderFile[]) => {
    if (files.length) {
      uploadQiniuImage(
        FileType.FILE_TYPE_MERCHANDISE_SKU_IMAGE,
        _.head(files) as UploaderFile,
      ).then((json) => {
        return store.changeLogo(json.data)
      })
    }
  }

  const handleDelete = () => {
    store.clearLogo()
  }

  return (
    <Form ref={formRef} labelWidth='100px' onSubmitValidated={handleSubmit}>
      <FormPanel title={t('企业信息')}>
        <FormBlock col={2}>
          <FormItem label={t('企业头像')}>
            <div className='gm-enterprise-upload-wrap'>
              <Uploader
                accept='image/*'
                onUpload={onUpload}
                className='gm-enterprise-upload'
              >
                {store.logo ? (
                  <div className='gm-enterprise-upload-img-wrap'>
                    <img
                      className='gm-enterprise-upload-img'
                      src={store.logo.url}
                    />
                    <span>更换</span>
                  </div>
                ) : (
                  <PlusOutlined className='gm-enterprise-upload-plus-outlined' />
                )}
              </Uploader>
              {store.logo && (
                <div className='gm-enterprise-upload-action'>
                  <span onClick={handleDelete}>删除</span>
                </div>
              )}
            </div>
          </FormItem>
        </FormBlock>
        <FormBlock>
          <FormItem label={t('')}>
            <div style={{ width: '500px' }}>
              {t('建议上传的图片大小不超过2MB，支持jpg，jpeg，gif，bmp，png')}
            </div>
          </FormItem>
        </FormBlock>
        <FormBlock col={1}>
          <FormItem
            label={t('公司名称')}
            required
            validate={Validator.create([], _.trim(store.form.name))}
          >
            <Input
              type='text'
              name='name'
              disabled={
                globalStore.userInfo.group_user?.type !==
                GroupUser_Type.GROUP_ADMIN
              }
              value={store.form.name || ''}
              onChange={(e) => store.changeForm('name', e.target.value)}
            />
          </FormItem>
        </FormBlock>
        <FormBlock col={1}>
          <FormItem label={t('联系人')}>
            <Input
              type='text'
              name='name'
              value={store.form.receiver || ''}
              onChange={(e) => store.changeForm('receiver', e.target.value)}
            />
          </FormItem>
        </FormBlock>
        <FormBlock col={1}>
          <FormItem label={t('联系电话')}>
            <Input
              type='text'
              name='name'
              value={store.form.phone || ''}
              onChange={(e) => store.changeForm('phone', e.target.value)}
            />
          </FormItem>
        </FormBlock>
        {!globalStore.isLite && (
          <>
            <FormBlock>
              <FormItem label={t('所在区域')}>
                <RegionSelect
                  provinceData={store.provinceSelectData}
                  provinceValue={store.form.province_id}
                  cityValue={store.form.city_id}
                  onProvinceChange={(value: string) => {
                    store.changeForm('province_id', value)
                  }}
                  onCityChange={(value: string) => {
                    store.changeForm('city_id', value)
                  }}
                />
              </FormItem>
            </FormBlock>
            <FormBlock col={2}>
              <FormItem label={t('详细地址')}>
                <Input
                  maxLength={30}
                  name='address'
                  style={{ width: '500px' }}
                  value={store.form.address}
                  onChange={(e) => store.changeForm('address', e.target.value)}
                />
              </FormItem>
            </FormBlock>
            <FormBlock>
              <FormItem label={t('')}>
                <div style={{ width: '500px' }}>
                  {t('企业信息可被供应商和客户查看')}
                </div>
              </FormItem>
            </FormBlock>
          </>
        )}
      </FormPanel>
      <div className='gm-footer-button-wrap'>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('保存')}
          </Button>
        </FormButton>
      </div>
    </Form>
  )
})

export default EnterpriseInformation
