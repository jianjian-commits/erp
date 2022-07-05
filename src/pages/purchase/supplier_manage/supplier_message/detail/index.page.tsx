import { t } from 'gm-i18n'
import React, { useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import {
  Form,
  FormBlock,
  FormGroup,
  FormItem,
  FormPanel,
  Radio,
  RadioGroup,
  Tip,
  Validator,
  Input,
  Select,
  Checkbox,
  Row,
  Flex,
  Dialog,
  Button,
  LoadingChunk,
  ControlledForm,
  ControlledFormItem,
  DateRangePicker,
} from '@gm-pc/react'
import { Form as AntdForm, message } from 'antd'
import { Table } from '@gm-pc/table-x'
import { isNumOrEnglish } from '@/common/util'
import { observer } from 'mobx-react'
import store from './store'
import { useGMLocation } from '@gm-common/router'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'
import { history } from '@/common/service'
import { CodeInput } from '@gm-pc/business'
import './style.less'
import RegionSelect from './region_select'
import globalStore from '@/stores/global'
import { useAsync } from '@gm-common/hooks'
import Select_WareHouse_Default from '@/common/components/select_warehouse'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'
import { useEffectOnce } from '@/common/hooks'
import BatchMerchandise from './components/batch_merchandise'
import {
  CreateSupplierUpperLimit,
  UpdateSupplierUpperLimit,
} from 'gm_api/src/purchase'
import UploadImage from './components/upload_images'
import { FileType } from 'gm_api/src/cloudapi'

const invoicingType = [
  { text: '开具专票', value: ChinaVatInvoice_InvoiceType.VAT_SPECIAL },
  { text: '不开专票', value: ChinaVatInvoice_InvoiceType.UNSPECIFIED },
]

const SupplierDetail = observer(() => {
  const formRef1 = useRef(null)
  const [antdForm] = AntdForm.useForm()
  const [assocStatus, setAssocStatus] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const { supplier_id: defaultSupplierId } = useGMLocation<{
    supplier_id: string
  }>().query
  const setAssocMsg = (relation_group_id: string) => {
    if (relation_group_id && relation_group_id !== '0') {
      setAssocStatus(true)
      store.getSupplierGroupMsg(
        globalStore.userInfo.group_id || '',
        relation_group_id,
      )
    }
  }
  const { supplierDetail, merchandiseList } = store

  const { run, loading } = useAsync(() =>
    store
      .getSupplier(defaultSupplierId)
      .then((res: any) => {
        store.getSupplierLimit(defaultSupplierId)
        const relation_group_id = res.relation_group_id || ''
        setAssocMsg(relation_group_id)
        let country_id = res.address?.country_id
        if (!country_id || country_id === '0') country_id = '156'
        return store.getProvinceList(country_id)
      })
      .then((provinces: any) => store.sortRegionSelectData(provinces)),
  )

  useEffectOnce<string | undefined>(
    defaultSupplierId ? run : null,
    supplierDetail.warehouse_id,
  )

  useEffect(() => {
    if (defaultSupplierId) {
      // 详情
      execMutiWarehouseJudge(run)
    } else {
      // 创建
      const group_id = globalStore.userInfo.group_id!
      store
        .getCountryId(group_id)
        .then((country_id: string) => store.getProvinceList(country_id))
        .then((provinces: any) => store.sortRegionSelectData(provinces))

      if (globalStore.isLite) {
        store.changeSupplierDetail(
          'invoice_type',
          ChinaVatInvoice_InvoiceType.VAT_SPECIAL,
        )
      }
    }
    return store.clear
  }, [])

  // 新增 & 修改供货上限
  const createOrUpdateSupplier = async (type: number, supplier_id?: string) => {
    // 处理参数
    const set_upper_limit = merchandiseList.map((item) => ({
      supplier_upper_limit_id: item.supplier_upper_limit_id,
      supplier_id,
      group_id: item.group_id,
      sku_id: item.sku_id,
      upper_limit: item.upper_limit + '',
      enable: item.enable,
    }))
    // 新增
    if (type === 0) {
      CreateSupplierUpperLimit({
        set_upper_limit,
      })
    }
    // 修改
    if (type === 1) {
      UpdateSupplierUpperLimit({
        set_upper_limit,
        supplier_id: defaultSupplierId,
      })
    }
  }

  const handleSubmit = () => {
    if (defaultSupplierId) {
      store.updateSupplier().then(async () => {
        if (merchandiseList.length) {
          await createOrUpdateSupplier(1, defaultSupplierId)
        }
        message.success(t('编辑供应商成功'), 1.5, () => {
          history.goBack()
        })
        return null
      })
    } else {
      store.createSupplier().then(async (json) => {
        if (merchandiseList.length) {
          await createOrUpdateSupplier(0, json.response.supplier.supplier_id)
        }
        message.success(t('新建供应商成功'), 1.5, () => {
          history.push(
            '/purchase/supplier_manage/supplier_message/detail?supplier_id=' +
              json.response.supplier.supplier_id,
          )
        })
      })
    }
  }

  const handleCancel = () => {
    history.push('/purchase/supplier_manage/supplier_message')
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
            return store.deleteSupplier(defaultSupplierId).then(() => {
              Tip.success(t('删除成功'))
              Dialog.hide()
              return history.push('/purchase/supplier_manage/supplier_message')
            })
          },
        },
      ],
    })
  }

  const handleCheckCustomizedCode = () => {
    const { customized_code } = store.supplierDetail
    if (!customized_code || !isNumOrEnglish(customized_code)) {
      return t('只能输入英文字母和数字')
    }
    return ''
  }

  const handleCreateQRCode = () => {
    if (!supplierDetail.name) {
      Tip.danger(t('请填写供应商名称'))
      return
    }
    store
      .encodeText()
      .then((scene: string) => store.getWechatCode(scene))
      .then(() => setShowCode(true))
  }

  const handleDeleteRelation = () => {
    store
      .deleteRelation()
      // .then(() => setAssocStatus(false))
      .then(() => location.reload())
  }

  const handleDateChange = (begin: Date, end: Date) => {
    store.changeSupplierDetail('period_of_validity_begin_time', begin)
    store.changeSupplierDetail('period_of_validity_end_time', end)
  }

  return (
    <LoadingChunk loading={loading && !!defaultSupplierId}>
      <FormGroup
        // @ts-ignore
        formRefs={[formRef1].filter(Boolean)}
        onSubmitValidated={handleSubmit}
        onCancel={handleCancel}
      >
        <FormPanel
          title={t('基本信息')}
          right={
            <>
              {defaultSupplierId && (
                <Button onClick={handleDelete}>{t('删除')}</Button>
              )}
            </>
          }
        >
          <Form ref={formRef1} labelWidth='100px' hasButtonInGroup>
            <FormBlock col={2}>
              <FormItem
                label={t('供应商名称')}
                required
                validate={Validator.create([], _.trim(supplierDetail.name))}
              >
                <Input
                  type='text'
                  name='name'
                  value={supplierDetail.name || ''}
                  onChange={(e) =>
                    store.changeSupplierDetail('name', e.target.value)
                  }
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
                  disabled={Boolean(defaultSupplierId)}
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
              <FormItem label={t('所在区域')}>
                <RegionSelect
                  provinceData={store.provinceSelectData}
                  provinceValue={store.supplierDetail.province_id}
                  cityValue={store.supplierDetail.city_id}
                  onProvinceChange={(value: string) => {
                    store.changeSupplierDetail('province_id', value)
                  }}
                  onCityChange={(value: string) => {
                    store.changeSupplierDetail('city_id', value)
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
                  value={supplierDetail.address}
                  onChange={(e) =>
                    store.changeSupplierDetail('address', e.target.value)
                  }
                />
              </FormItem>
            </FormBlock>
            <FormBlock>
              <FormItem label={t('联系电话')}>
                <Input
                  type='text'
                  name='phone'
                  maxLength={30}
                  value={supplierDetail.phone || ''}
                  onChange={(e) =>
                    store.changeSupplierDetail('phone', e.target.value)
                  }
                />
              </FormItem>
            </FormBlock>
            <FormBlock>
              {globalStore.isOpenMultWarehouse && (
                <FormItem label={t('供货仓')} required>
                  <Select_WareHouse_Default
                    onChange={(value) => {
                      store.changeSupplierDetail('warehouse_id', value)
                    }}
                    params={{ all: true }}
                    value={supplierDetail.warehouse_id}
                  />
                </FormItem>
              )}
            </FormBlock>
            {defaultSupplierId &&
              !showCode &&
              !assocStatus &&
              !globalStore.isLite && (
                <FormBlock>
                  <FormItem label={t('关联供应商账号')}>
                    <div
                      style={{
                        paddingTop: '6px',
                      }}
                    >
                      <a
                        onClick={() => handleCreateQRCode()}
                        style={{ cursor: 'pointer', paddingTop: '6px' }}
                      >
                        {t('点击生成小程序邀请码')}
                      </a>
                    </div>
                  </FormItem>
                </FormBlock>
              )}
            {defaultSupplierId && showCode && !globalStore.isLite && (
              <FormBlock>
                <FormItem label={t('关联供应商账号')}>
                  <img
                    src={store.image}
                    style={{ width: '200px', height: '200px' }}
                  />
                </FormItem>
              </FormBlock>
            )}
            {defaultSupplierId && assocStatus && !globalStore.isLite && (
              <FormBlock>
                <FormItem label={t('已关联供应商')}>
                  <div
                    style={{
                      paddingTop: '6px',
                    }}
                  >
                    <a
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleDeleteRelation()}
                    >
                      {`#${store.supplierGroupMsg.name}#`}
                      {t('点击取消关联')}
                    </a>
                  </div>
                </FormItem>
              </FormBlock>
            )}
          </Form>
        </FormPanel>
        {!globalStore.isLite && (
          <>
            <FormPanel title={t('财务信息')}>
              <Form labelWidth='100px'>
                <FormBlock col={2}>
                  <FormItem required label={t('开票类型')}>
                    <Select
                      data={invoicingType}
                      value={supplierDetail.invoice_type}
                      onChange={(value: number) =>
                        store.changeSupplierDetail('invoice_type', value)
                      }
                    />
                    {supplierDetail.invoice_type !== 0 &&
                      defaultSupplierId &&
                      ChinaVatInvoice_InvoiceType.VAT_SPECIAL && (
                        <div className='gm-text-12 gm-text-desc tw-mt-2 tw-w-full'>
                          <span>{t('默认采用商品中的默认进项税率设置,')}</span>
                          <span
                            onClick={() =>
                              history.push(
                                `/purchase/supplier_manage/supplier_message/supplier_merchandise?supplier_id=${defaultSupplierId}&name=${supplierDetail.name}`,
                              )
                            }
                            className='gm-text-primary gm-cursor'
                          >
                            {t('点此设置供应商针对不同商品税率')}
                          </span>
                        </div>
                      )}
                  </FormItem>
                  <FormItem label={t('结款方式')}>
                    <RadioGroup
                      style={{ width: '230px' }}
                      name='credit_type'
                      value={supplierDetail.credit_type}
                      onChange={(selected) =>
                        store.changeSupplierDetail('credit_type', selected)
                      }
                    >
                      <Radio value={3}>{t('日结')}</Radio>
                      <Radio value={4}>{t('周结')}</Radio>
                      <Radio value={8}>{t('半月结')}</Radio>
                      <Radio value={5}>{t('月结')}</Radio>
                    </RadioGroup>
                  </FormItem>
                </FormBlock>
                <FormBlock col={2}>
                  <FormItem label={t('开户银行')}>
                    <Input
                      type='text'
                      name='bank_name'
                      maxLength={30}
                      value={supplierDetail.bank_name || ''}
                      onChange={(e) =>
                        store.changeSupplierDetail('bank_name', e.target.value)
                      }
                    />
                  </FormItem>
                  <FormItem label={t('银行账号')}>
                    <Input
                      type='text'
                      name='bank_account'
                      maxLength={30}
                      value={supplierDetail.bank_account || ''}
                      onChange={(e) =>
                        store.changeSupplierDetail(
                          'bank_account',
                          e.target.value,
                        )
                      }
                    />
                  </FormItem>
                </FormBlock>
              </Form>
            </FormPanel>
            <FormPanel title={t('经营信息')}>
              <BatchMerchandise form={antdForm} />
            </FormPanel>
          </>
        )}
        {!globalStore.isLite && (
          <>
            <FormPanel title={t('供应商服务权限设置')}>
              <Form labelWidth='100px' colWidth='400px'>
                <FormItem label={t('')}>
                  <Row>
                    <Checkbox
                      checked={store.supplierDetail.settings?.code}
                      onChange={(e) =>
                        store.changeSupplierDetail('settings', {
                          ...store.supplierDetail.settings,
                          code: e.currentTarget.checked,
                        })
                      }
                    >
                      {t('客户编码')}
                    </Checkbox>
                    <Checkbox
                      checked={store.supplierDetail.settings?.name}
                      onChange={(e) =>
                        store.changeSupplierDetail('settings', {
                          ...store.supplierDetail.settings,
                          name: e.currentTarget.checked,
                        })
                      }
                    >
                      {t('客户名称')}
                    </Checkbox>
                  </Row>
                  <Row>
                    <Checkbox
                      checked={store.supplierDetail.settings?.receiver}
                      onChange={(e) =>
                        store.changeSupplierDetail('settings', {
                          ...store.supplierDetail.settings,
                          receiver: e.currentTarget.checked,
                        })
                      }
                    >
                      {t('收货人')}
                    </Checkbox>
                    <Checkbox
                      checked={store.supplierDetail.settings?.phone}
                      onChange={(e) =>
                        store.changeSupplierDetail('settings', {
                          ...store.supplierDetail.settings,
                          phone: e.currentTarget.checked,
                        })
                      }
                    >
                      {t('收货人电话')}
                    </Checkbox>
                    <Checkbox
                      checked={store.supplierDetail.settings?.order_price}
                      onChange={(e) =>
                        store.changeSupplierDetail('settings', {
                          ...store.supplierDetail.settings,
                          order_price: e.currentTarget.checked,
                        })
                      }
                    >
                      {t('订单售价')}
                    </Checkbox>
                  </Row>
                </FormItem>
              </Form>
            </FormPanel>
            {defaultSupplierId && (
              <FormPanel title={t('联系信息')}>
                <Form labelWidth='100px' colWidth='850px'>
                  <FormItem label={t('')}>
                    <Table
                      isEdit
                      className='gm-border'
                      data={store.supplierGroupMsg.contact_msg}
                      columns={[
                        {
                          Header: t('类型'),
                          maxWidth: 150,
                          Cell: (cellProps) => {
                            const { type } = cellProps.original
                            return <div>{type}</div>
                          },
                        },
                        {
                          Header: t('姓名/职务'),
                          Cell: (cellProps) => {
                            const { name_job } = cellProps.original
                            const [name, job] = name_job
                            return (
                              <Flex justifyStart>
                                <Input
                                  value={name}
                                  disabled
                                  style={{ width: '150px' }}
                                />
                                <Input
                                  value={job}
                                  disabled
                                  style={{ width: '150px', marginLeft: '20px' }}
                                />
                              </Flex>
                            )
                          },
                        },
                        {
                          Header: t('电话'),
                          maxWidth: 200,
                          Cell: (cellProps) => {
                            const { phone } = cellProps.original
                            return (
                              <Input
                                value={phone}
                                disabled
                                style={{ width: '150px' }}
                              />
                            )
                          },
                        },
                      ]}
                    />
                  </FormItem>
                </Form>
              </FormPanel>
            )}
          </>
        )}
        <FormPanel title={t('资质信息')}>
          <ControlledForm>
            <ControlledFormItem label='资质有效期'>
              <DateRangePicker
                begin={supplierDetail.period_of_validity_begin_time}
                end={supplierDetail.period_of_validity_end_time}
                onChange={handleDateChange}
              />
            </ControlledFormItem>
            <UploadImage
              fileType={FileType.FILE_TYPE_MERCHANDISE_SKU_IMAGE}
              fileLength={20}
              setFileList={(imglist) => {
                store.changeSupplierDetail('qualification_images', imglist)
              }}
              upload={{
                fileList: store.supplierDetail.qualification_images,
                listType: 'picture-card',
              }}
            />
          </ControlledForm>
        </FormPanel>
      </FormGroup>
    </LoadingChunk>
  )
})

export default SupplierDetail
