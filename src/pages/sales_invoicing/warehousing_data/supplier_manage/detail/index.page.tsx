import { t } from 'gm-i18n'
import React, { useEffect, useRef } from 'react'
import _ from 'lodash'
import {
  Dialog,
  Form,
  FormBlock,
  FormGroup,
  FormItem,
  FormPanel,
  TextArea,
  Radio,
  RadioGroup,
  Tip,
  Validator,
  Button,
  Tree,
  Input,
  ImgUploader,
  UploaderFile,
  Select,
  Tooltip,
  Flex,
} from '@gm-pc/react'

import { isNumOrEnglish } from '@/common/util'

import { observer } from 'mobx-react'
import store from '../stores/detail_store'
import { useGMLocation } from '@gm-common/router'

import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'

import { history, uploadQiniuImage } from '@/common/service'
import { SupplierItem } from '../interface'
import { LocationMap } from '@gm-common/map'
import { CodeInput } from '@gm-pc/business'
import { FileType } from 'gm_api/src/cloudapi'
import SortList from '@/common/components/sort_list'
import SVGDelete from '@/svg/delete_shop_module.svg'
import './style.less'

const supplierDetail = observer(() => {
  const formRef = useRef(null)
  const { supplier_id: defaultSupplierId } = useGMLocation<{
    supplier_id: string
  }>().query

  useEffect(() => {
    store.fetchCategory()
    if (defaultSupplierId) {
      store.getSupplier(defaultSupplierId)
    }

    return store.clear
  }, [])

  const { supplierDetail, categoryTree } = store
  const { supplier_id } = supplierDetail
  const title = defaultSupplierId ? t('供应商信息') : t('新建供应商')

  const { map_address, location_latitude, location_longitude } = supplierDetail

  const handleSubmit = () => {
    if (supplier_id) {
      store.updateSupplier().then(() => {
        Tip.success(t('编辑供应商成功'))
        return null
      })
    } else {
      store.createSupplier().then((json) => {
        Tip.success(t('新建供应商成功'))
        history.push(
          '/data_manage/warehousing_data/supplier_manage/detail?supplier_id=' +
            json.response.supplier.supplier_id,
        )
        return null
      })
    }
  }

  const handleCancel = () => {
    history.push('/data_manage/warehousing_data/supplier_manage')
  }

  const handleDelete = () => {
    Dialog.render({
      children: t(
        '供应商删除后,其绑定的采购规格将无法生成采购任务,是否确定删除?',
      ),
      title: t('删除供应商'),
      buttons: [
        { text: t('取消'), btnType: 'default', onClick: Dialog.hide },
        {
          text: t('确定'),
          btnType: 'primary',
          onClick: () => {
            return store.deleteSupplier(supplier_id).then(() => {
              Tip.success(t('删除成功'))
              Dialog.hide()
              return history.push(
                '/data_manage/warehousing_data/supplier_manage',
              )
            })
          },
        },
      ],
    })
  }

  const handleCheckMerchandise = (merchandise: any[]) => {
    if (merchandise.length === 0) {
      return t('请勾选')
    }
    return ''
  }

  const handleCheckCustomizedCode = () => {
    const { customized_code } = store.supplierDetail
    if (!customized_code || !isNumOrEnglish(customized_code)) {
      return t('只能输入英文字母和数字')
    }
    return ''
  }

  const handleChangeValue = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    store.changeSupplierDetail(
      event.target.name as keyof SupplierItem,
      event.target.value,
    )
  }

  const handleChangeCreditType = (selected: number) => {
    store.changeSupplierDetail('credit_type', selected)
  }

  const handleChangeTaxpayerType = (selected: number) => {
    store.changeSupplierDetail('taxpayer_type', selected)
  }

  const handleSelectMerchandise = (selected: any[]) => {
    store.changeSupplierDetail('available_category_ids', selected)
  }

  const handleChangeLocation = (data: any) => {
    store.changeSupplierDetail('location_longitude', data.longitude)
    store.changeSupplierDetail('location_latitude', data.latitude)
    store.changeSupplierDetail('map_address', data.address)
  }

  const handleUploadImg = (files: UploaderFile[]) => {
    const res = _.map(files, (item) =>
      uploadQiniuImage(FileType.FILE_TYPE_MERCHANDISE_SKU_IMAGE, item),
    )
    return Promise.all(res).then((json) => _.map(json, (i) => i.data))
  }

  const handleImageClose = (i: number) => {
    const data = [...supplierDetail.qualification_images!]

    data.splice(i, 1)
    store.changeSupplierDetail('qualification_images', data)
  }

  const invoicingType = [
    { text: '开具专票', value: ChinaVatInvoice_InvoiceType.VAT_SPECIAL },
    { text: '不开专票', value: ChinaVatInvoice_InvoiceType.UNSPECIFIED },
  ]

  return (
    <FormGroup
      formRefs={[formRef]}
      onSubmitValidated={handleSubmit}
      onCancel={handleCancel}
    >
      <FormPanel
        title={title}
        right={
          <>
            {defaultSupplierId && (
              <Button onClick={handleDelete}>{t('删除')}</Button>
            )}
          </>
        }
      >
        <Form
          ref={formRef}
          labelWidth='120px'
          colWidth='350px'
          hasButtonInGroup
        >
          <FormBlock>
            <FormItem
              label={t('供应商名称')}
              required
              validate={Validator.create([], _.trim(supplierDetail.name))}
            >
              <Input
                type='text'
                name='name'
                value={supplierDetail.name || ''}
                onChange={handleChangeValue}
              />
            </FormItem>
            <FormItem
              label={t('供应商编号')}
              required
              validate={Validator.create(
                [],
                supplierDetail.customized_code,
                handleCheckCustomizedCode,
              )}
            >
              <CodeInput
                style={{ width: '300px' }}
                text={supplierDetail.name}
                needTextChange={!defaultSupplierId}
                value={supplierDetail.customized_code || ''}
                maxLength={34}
                onChange={(value: string) =>
                  store.changeSupplierDetail('customized_code', value)
                }
              />
            </FormItem>
          </FormBlock>
          <FormBlock>
            <FormItem label={t('联系电话')}>
              <Input
                type='text'
                name='phone'
                value={supplierDetail.phone || ''}
                onChange={handleChangeValue}
              />
            </FormItem>
          </FormBlock>
          <FormBlock>
            <FormItem label={t('公司名称')}>
              <Input
                type='text'
                name='company_name'
                value={supplierDetail.company_name || ''}
                onChange={handleChangeValue}
              />
            </FormItem>
          </FormBlock>
          <FormItem label={t('公司地址')}>
            <TextArea
              name='company_address'
              style={{ width: '400px' }}
              value={supplierDetail.company_address || ''}
              onChange={handleChangeValue}
            />
          </FormItem>
          <FormBlock>
            <FormItem
              label={t('可供应商品')}
              required
              validate={Validator.create(
                [],
                supplierDetail.available_category_ids,
                handleCheckMerchandise,
              )}
            >
              <div style={{ width: '400px', height: '500px' }}>
                <Tree
                  list={categoryTree.slice()}
                  title={t('选择全部商品')}
                  selectedValues={supplierDetail.available_category_ids || []}
                  onSelectValues={handleSelectMerchandise}
                />
              </div>
            </FormItem>
          </FormBlock>
          <FormBlock>
            <FormItem label={t('财务联系人')}>
              <Input
                type='text'
                name='financial_contact_name'
                value={supplierDetail.financial_contact_name || ''}
                onChange={handleChangeValue}
              />
            </FormItem>
            <FormItem label={t('联系人电话')}>
              <Input
                type='text'
                name='financial_contact_phone'
                value={supplierDetail.financial_contact_phone || ''}
                onChange={handleChangeValue}
              />
            </FormItem>
          </FormBlock>
          <FormBlock>
            <FormItem label={t('开户名')}>
              <Input
                type='text'
                name='bank_card_owner_name'
                value={supplierDetail.bank_card_owner_name || ''}
                onChange={handleChangeValue}
              />
            </FormItem>
            <FormItem label={t('开户银行')}>
              <Input
                type='text'
                name='bank_name'
                value={supplierDetail.bank_name || ''}
                onChange={handleChangeValue}
              />
            </FormItem>
          </FormBlock>
          <FormBlock>
            <FormItem label={t('银行账号')}>
              <Input
                type='text'
                name='bank_account'
                value={supplierDetail.bank_account || ''}
                onChange={handleChangeValue}
              />
            </FormItem>
            <FormItem label={t('营业执照号')}>
              <Input
                type='text'
                name='business_license_number'
                value={supplierDetail.business_license_number || ''}
                onChange={handleChangeValue}
              />
            </FormItem>
          </FormBlock>
          <FormItem label={t('结款方式')}>
            <RadioGroup
              style={{ width: '230px' }}
              name='credit_type'
              value={supplierDetail.credit_type}
              onChange={handleChangeCreditType}
            >
              <Radio value={3}>{t('日结')}</Radio>
              <Radio value={4}>{t('周结')}</Radio>
              <Radio value={8}>{t('半月结')}</Radio>
              <Radio value={5}>{t('月结')}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem colWidth='600px' required label={t('开票类型')}>
            <Flex alignCenter>
              <Select
                style={{ width: '230px' }}
                data={invoicingType}
                value={supplierDetail.invoice_type}
                onChange={(value: stirng) =>
                  store.changeSupplierDetail('invoice_type', value)
                }
              />
              <Tooltip
                className='tw-ml-1'
                popup={
                  <div className='gm-padding-5' style={{ maxWidth: '230px' }}>
                    {t(
                      '开具专票的供应商使用sku默认进项税率不开专票则进项税率默认为0',
                    )}
                  </div>
                }
              />
            </Flex>
            {supplierDetail.invoice_type !== 0 &&
              supplier_id &&
              ChinaVatInvoice_InvoiceType.VAT_SPECIAL && (
                <div className='gm-text-12 gm-text-desc tw-mt-2 tw-w-full'>
                  <span>{t('默认采用商品中的默认进项税率设置,')}</span>
                  <span
                    onClick={() =>
                      history.push(
                        `/data_manage/warehousing_data/supplier_manage/supplier_merchandise?supplier_id=${supplier_id}&name=${supplierDetail.name}`,
                      )
                    }
                    className='gm-text-primary gm-cursor'
                  >
                    {t('点此设置供应商针对不同商品税率')}
                  </span>
                </div>
              )}
          </FormItem>

          {/* <FormItem
            label={t('开票类型')}
            colWidth='420px'
            tooltip={
              <div className='gm-padding-5' style={{ maxWidth: '250px' }}>
                {t('根据供应商提供的发票类型进行分类')}
              </div>
            }
          >
            <RadioGroup
              name='taxpayer_type'
              value={supplierDetail.taxpayer_type}
              onChange={handleChangeTaxpayerType}
            >
              <Radio value={1}>{t('一般纳税人')}</Radio>
              <Radio value={2}>{t('小规模纳税人')}</Radio>
              <Radio value={3}>{t('普票或无票')}</Radio>
            </RadioGroup>
          </FormItem> */}
          <FormItem label={t('地理位置')}>
            <div style={{ width: '80vw', height: '45vh' }}>
              <LocationMap
                defaultLocation={{
                  longitude: location_longitude!,
                  latitude: location_latitude!,
                  address: map_address,
                }}
                onLocation={handleChangeLocation}
              />
            </div>
          </FormItem>

          <FormItem col={3} label={t('资质图片')}>
            <div>
              <div className='gm-margin-bottom-10'>
                <ImgUploader
                  data={supplierDetail.qualification_images ?? []}
                  max={10}
                  onUpload={handleUploadImg}
                  onChange={(data) =>
                    store.changeSupplierDetail('qualification_images', data)
                  }
                  imgRender={(img) => (
                    <img className='b-spread-img' src={img.url} />
                  )}
                  accept='image/jpg, image/png, image/gif'
                  multiple
                  desc={t(
                    '最多可上传10张图片，图片大小请不要超过2mb，支持jpg/png/gif格式',
                  )}
                />
              </div>
              {supplierDetail.qualification_images &&
              supplierDetail.qualification_images.length > 0 ? (
                <SortList
                  list={supplierDetail.qualification_images}
                  onChange={(data) =>
                    store.changeSupplierDetail('qualification_images', data)
                  }
                  renderItem={(v, i) => (
                    <div>
                      <div
                        className='b-item-close'
                        onClick={() => handleImageClose(i)}
                      >
                        <SVGDelete style={{ width: '20px', height: '20px' }} />
                      </div>
                      <img style={{ maxWidth: '100%' }} src={v.url} />
                    </div>
                  )}
                />
              ) : null}
            </div>
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})

export default supplierDetail
