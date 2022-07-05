import SelectSku from '@/common/components/base_components/select_sku'
import BomMaterial from '@/pages/production/bom_management/components/create_bom/components/bom_material'
import BomProcess from '@/pages/production/bom_management/components/create_bom/components/bom_process'
import { ByProducts } from '@/pages/production/bom_management/components/create_bom/interface'
import {
  processYieldChange,
  switchStatus,
  withStatus,
} from '@/pages/production/bom_management/components/create_bom/utils'
import globalStore from '@/stores/global'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import { CodeInput } from '@gm-pc/business'
import {
  Card,
  Col,
  Flex,
  Form,
  FormGroup,
  FormItem,
  Input,
  InputNumber,
  MoreSelect,
  RadioGroup,
  Row,
  Switch,
  TextArea,
  Validator,
} from '@gm-pc/react'
import { Button, message, Modal } from 'antd'
import Big from 'big.js'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import { Customer } from 'gm_api/src/enterprise'
import { ProductionSettings_CookYieldSetting } from 'gm_api/src/preference'
import { BomType, Bom_Status, ProductionLine } from 'gm_api/src/production'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import SelectTable, { SelectTableRef } from '../select_table'
import CellSkuProcessYield from './components/cell_sku_process_yield'
import SelectProductionLine from './components/select_production_line'
import store from './store'
import './style.less'
import ProductionLineModal from '@/pages/production/components/production_line_modal'

/**
 * BOM的查询属性
 */
interface BomQuery {
  /** BOM的种类 */
  type: BomType
  /** BOM的ID */
  bomId: string
}

/**
 * BOM详情页（创建页）的组件函数
 */
const BomDetail = () => {
  const location = useGMLocation<BomQuery>()
  const {
    query: { type: bomType, bomId },
  } = location
  const type = +bomType

  const {
    skuList,
    bomSkuList,
    materialList,
    bomProcessList,
    bomDetail: {
      name,
      customized_code,
      desc,
      by_products,
      selectedSku,
      status,
      original_status,
      showYield,
      default_cook_yield_rate,
      production_line_id,
    },
    customersNumber,
    selectedCustomers: {
      selectKey: selectCustomerKey,
      info: selectCustomerInfo,
    },
    update_default_yield,
  } = store

  const refForm1 = useRef(null)
  const selectTableRef = useRef<SelectTableRef<Customer>>(null)
  const [isModalVisible, setModalVisible] = useState(false)
  const [isTipVisible, setTipVisible] = useState(false)
  const showUpdateDefaultYield = useRef(false)
  const isCreate = !bomId
  const bomStatus = isCreate ? '新建' : '保存'
  const isPack = type === BomType.BOM_TYPE_PACK
  const isClean = type === BomType.BOM_TYPE_CLEANFOOD
  // 设计变动 与原先字段的含义相反
  const isOpenYield = withStatus(status!, Bom_Status.STATUS_PROCESS_YIELD_RATE)
  const isDefaultBom = withStatus(status!, Bom_Status.STATUS_DEFAULT)
  const [addLineVisible, setAddLineVisible] = useState(false)

  // 一些初始化
  useEffect(() => {
    Promise.all([
      store.fetchProcessList(isPack),
      store.fetchProcessType(),
    ]).then(() => {
      if (!isCreate) {
        store.getBomDetail(bomId)
        return
      }
      // 净菜下默认1024 组合默认512
      store.updateBomDetails({
        ...store.bomDetail,
        type,
        quantity: isPack ? '1' : '',
        status: isClean
          ? '' + Bom_Status.STATUS_PROCESS_YIELD_RATE
          : !isPack
          ? '' + Bom_Status.STATUS_COMBINED
          : '0',
      })
      isPack && store.updateBomProcessName(0, store.processList[0])
    })
    return () => store.initBom()
  }, [])

  // 状态存储
  useEffect(() => {
    store.updateBomDetails({
      ...store.bomDetail,
      showYield:
        globalStore.productionSetting.cook_yield_setting ===
        ProductionSettings_CookYieldSetting.COOKYIELDSETTING_CLEANFOOD_COOKED_BOM_ON,
    })
  }, [globalStore.productionSetting.cook_yield_setting])

  /**
   * 处理保存后的事件
   * 提示信息并跳转至列表页
   */
  const handleSaveAfter = () => {
    message.success(`${bomStatus}成功`)
    history.push(`/production/bom_management/${isPack ? 'pack' : 'produce'}`)
  }

  /**
   * 处理提交的事件
   * 创建或更新BOM
   */
  const handleSubmitCheck = async () => {
    const { bomDetail } = store
    const materials = _.filter(
      materialList,
      (m, index) => m.sku_id !== '' && index !== materialList.length - 1,
    )
    const bomProcess = _.filter(bomProcessList, (m) => m.selectProcess?.value)

    /**
     * !!!bom校验
     */

    // 必须填写物料信息
    if (!materials.length) {
      message.error(t('当前没有填写物料信息，请补充'))
      return
    }

    if (
      new Set(materials.map((material) => material.sku_id)).size <
      materials.length
    ) {
      message.error(t('BOM不可添加重复的物料，请检查！'))
      return
    }

    if (
      materials.some(
        (material) => material.sku_id === bomDetail.selectedSku?.value,
      )
    ) {
      message.error(t('BOM的原料和成品不能相同，请检查！'))
      return
    }

    // 非单品BOM
    if (!isClean) {
      // 检测是否有数量为空 / 0的物料
      const zeroQuantitySkus = _.filter(
        materials,
        (material) => Big(material.quantity || 0).toFixed(4) === '0.0000',
      )

      if (zeroQuantitySkus.length) {
        message.error(t('有物料或成品商品数量为空或为0，请检查！'))
        return
      }

      if (
        bomDetail.quantity === '' ||
        Big(bomDetail.quantity || '0').toFixed(4) === '0.0000'
      ) {
        message.error(t('成品数量应大于0'))
        return
      }
    }
    if (!isPack && !bomProcess.length) {
      message.error(t('当前没有填写工序信息，请补充'))
      return
    }
    // 单品BOM
    if (isClean) {
      if (!materials[0].process_yield) {
        message.error(t('当前出成率为0或为空，请检查'))
        return
      }
      const unitIds = materials[0]?.unit_ids
      if (
        unitIds &&
        !_.find(unitIds, { value: bomDetail.base_unit_id }) &&
        !_.find(
          _.find(globalStore.getSameUnitArray(), (v) =>
            v.unitArrayId.includes(bomDetail.base_unit_id),
          )?.unitArray!,
          { value: unitIds[0].value },
        )
        // 该情况为判断是否生产单位跟成品为同一单位组
      ) {
        message.error(t(' 请确保组成物料和成品的基本单位同属于一个单位体系'))
        return
      }
      if (showYield && bomDetail.default_cook_yield_rate === '0') {
        message.error(t('默认熟出成率不能为0，请修改'))
        return
      }
      // 将单品BOM中的process_yield转换成quantity
      store.changeMaterialList()
    }

    // 接口请求
    // 两种情况下不弹窗 新建非默认 新建默认无关联Bom
    if (showYield) {
      showUpdateDefaultYield.current = !!(
        await store.fetchSkuCookYieldRate(selectedSku?.value!, true)
      )?.boms.length
    }

    ;(isCreate && !isDefaultBom) ||
    (isCreate && isDefaultBom && !showUpdateDefaultYield.current)
      ? handleSubmitPre()
      : setTipVisible(true)
  }

  const handleSubmitPre = async () => {
    const handleUpdateCookYield = (bom_ids: string) => {
      // 净菜，默认，同步熟食
      if (isClean && isDefaultBom && update_default_yield)
        return store.updateCookYield({
          clean_food_bom_ids: [bom_ids],
        })
      return Promise.resolve(null)
    }

    // 净菜
    if (!store.bomDetail.bom_id) {
      store
        .createBom()
        .finally(() => setTipVisible(false))
        .then(async (json) => {
          if (json) {
            await handleUpdateCookYield(json.response.bom.bom_id)
            handleSaveAfter()
          }
          return json
        })
    } else {
      store
        .updateBom()
        .finally(() => setTipVisible(false))
        .then(async (json) => {
          if (json) {
            await handleUpdateCookYield(json.response.bom.bom_id)
            handleSaveAfter()
          }
          return json
        })
    }
  }

  const tipDIv = () => {
    return (
      <>
        {!isCreate && (
          <div className='gm-margin-top-10'>
            {t('编辑生产BOM后只影响未生成的计划，已生成的计划不受影响')}
          </div>
        )}
        {isClean && isDefaultBom && showUpdateDefaultYield.current && (
          <Flex className='gm-margin-top-10'>
            <span className='gm-margin-right-10'>
              {t('默认熟出成率更新后同步至熟食BOM:')}
            </span>
            <RadioGroup
              value={store.update_default_yield}
              onChange={store.changeDefaultYield}
              options={[
                {
                  value: true,
                  children: <span>{t('是')}</span>,
                },
                {
                  value: false,
                  children: <span>{t('否')}</span>,
                },
              ]}
            />
          </Flex>
        )}
        <Flex className='gm-padding-bottom-20 gm-margin-top-20' justifyEnd>
          <Button
            className='gm-margin-right-10'
            onClick={() => setTipVisible(false)}
          >
            {t('取消')}
          </Button>
          <Button type='primary' onClick={() => handleSubmitPre()}>
            {t('确定')}
          </Button>
        </Flex>
      </>
    )
  }

  /**
   * @description 跳转对应BOM
   * @param num 单品 3 组合 1
   */
  const handlePushBOM = (num: number) => {
    if (type === num) return
    history.push(`/production/bom_management/produce/create?type=${num}`)
  }

  const defaultBom = (isPack?: boolean) => (
    <FormItem label={t('是否为默认BOM')}>
      <>
        <Switch
          checked={Boolean(isDefaultBom)}
          onChange={() => {
            store.updateBomDetail(
              'status',
              switchStatus(!isDefaultBom, status!, Bom_Status.STATUS_DEFAULT),
            )
          }}
          on={t('默认')}
          off={t('不启用')}
          disabled={Boolean(
            original_status & Bom_Status.STATUS_DEFAULT && bomId,
          )}
        />
        <div className='gm-text-desc'>
          {t(
            isPack
              ? '设置为默认BOM后，该商品将默认关联此BOM'
              : '设置为默认BOM后新加入客户默认关联此BOM',
          )}
        </div>
      </>
    </FormItem>
  )

  return (
    <FormGroup
      formRefs={[refForm1]}
      onSubmitValidated={handleSubmitCheck}
      onCancel={() =>
        history.push(
          `/production/bom_management/${isPack ? 'pack' : 'produce'}`,
        )
      }
    >
      {type !== 2 && isCreate && (
        <div className='gm-bom-switch-bom-wrap'>
          <div
            className={classNames('gm-bom-switch-item', { active: type === 3 })}
            onClick={() => handlePushBOM(3)}
          >
            单品BOM
          </div>
          <div
            onClick={() => handlePushBOM(1)}
            className={classNames('gm-bom-switch-item', { active: type === 1 })}
          >
            组合BOM
          </div>
        </div>
      )}

      <Card type='form-card' title='基本信息'>
        <Form hasButtonInGroup labelWidth='100px' disabledCol ref={refForm1}>
          <Row className='gm-margin-top-15 gm-margin-bottom-15'>
            <Col sm={24} md={24} lg={12}>
              <FormItem
                label={t('BOM商品')}
                required
                validate={Validator.create([], selectedSku)}
              >
                {bomId ? (
                  <div className='gm-margin-top-5'>{selectedSku?.text}</div>
                ) : (
                  // api 生成的组件有问题，临时写了一个
                  <SelectSku
                    onChange={(sku) => {
                      const { sku_id, name, base_unit_id } = sku
                      store.updateBomSelectedSku({
                        value: sku_id,
                        text: name,
                        base_unit_id,
                        original: sku,
                      })
                    }}
                  />
                )}
              </FormItem>
            </Col>
            <Col sm={24} md={24} lg={12}>
              <FormItem
                label={t('生产产线')}
                validate={Validator.create([], production_line_id)}
              >
                <Flex alignCenter>
                  <SelectProductionLine
                    defaultValue={
                      production_line_id && production_line_id !== '0'
                        ? production_line_id
                        : ''
                    }
                    onChange={(line: ProductionLine) => {
                      store.updateBomDetail(
                        'production_line_id',
                        line?.production_line_id,
                      )
                    }}
                  />
                  <ProductionLineModal
                    visible={addLineVisible}
                    setVisible={setAddLineVisible}
                  />
                  <a
                    className='tw-ml-2'
                    onClick={() => setAddLineVisible(true)}
                  >
                    {t('新建产线')}
                  </a>
                </Flex>
              </FormItem>
            </Col>
          </Row>
          <Row className='gm-margin-top-15 gm-margin-bottom-15'>
            <Col sm={24} md={24} lg={12}>
              <FormItem
                label={t('BOM名称')}
                required
                validate={Validator.create([], name)}
              >
                <Input
                  style={{ width: '300px' }}
                  value={name}
                  maxLength={80}
                  onChange={(e) => {
                    store.updateBomDetail('name', e.target.value)
                  }}
                />
              </FormItem>
            </Col>
            <Col sm={24} md={24} lg={12}>
              <FormItem
                label={t('BOM编码')}
                required
                validate={Validator.create([], customized_code)}
              >
                <CodeInput
                  style={{ width: '300px' }}
                  text={name}
                  needTextChange={!bomId}
                  value={customized_code}
                  maxLength={80}
                  onChange={(value: string) =>
                    store.updateBomDetail('customized_code', value)
                  }
                />
              </FormItem>
            </Col>
          </Row>
          <FormItem label={t('描述')}>
            <TextArea
              style={{ width: '650px', height: '80px', lineHeight: 1.4 }}
              name='desc'
              rows={2}
              value={desc}
              maxLength={50}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                store.updateBomDetail('desc', e.target.value.trim())
              }
            />
          </FormItem>
        </Form>
      </Card>
      <Card type='form-card' title='生产信息'>
        <Form hasButtonInGroup labelWidth='100px' disabledCol>
          <BomMaterial type={type} />
          {isClean && (
            <FormItem label={t('总出成率')}>
              <Flex column>
                <Flex alignCenter>
                  <Switch
                    checked={!isOpenYield}
                    onChange={() => {
                      store.updateBomDetail(
                        'status',
                        switchStatus(
                          !isOpenYield,
                          status!,
                          Bom_Status.STATUS_PROCESS_YIELD_RATE,
                        ),
                      )
                      store.updateAllBomProcessList(
                        processYieldChange(
                          bomProcessList,
                          materialList[0].process_yield!,
                        ),
                      )
                    }}
                    on={t('开启')}
                    off={t('关闭')}
                  />
                  <CellSkuProcessYield />
                </Flex>
                <div className='gm-text-desc gm-margin-top-5'>
                  {t('开启总出成率后，忽略工序出成率，以总出成率为最终结果')}
                </div>
              </Flex>
            </FormItem>
          )}
          <BomProcess type={type} />
          {!isPack && (
            <>
              <FormItem label={t('副产品')} className='gm-margin-top-10'>
                <MoreSelect
                  style={{ width: '300px' }}
                  multiple
                  data={skuList.length ? skuList.slice() : bomSkuList.slice()}
                  selected={by_products.slice()}
                  onSelect={(selected: ByProducts[]) =>
                    store.updateBomDetail('by_products', selected)
                  }
                  onSearch={() => {
                    !skuList.length && store.fetchSkuList()
                  }}
                />
              </FormItem>
            </>
          )}
          {showYield && isClean && (
            <FormItem label={t('默认熟出成率')} labelWidth='135px'>
              <Flex alignCenter>
                <InputNumber
                  precision={2}
                  min={0}
                  value={
                    default_cook_yield_rate ? +default_cook_yield_rate : null
                  }
                  onChange={(value) => {
                    store.updateBomDetail(
                      'default_cook_yield_rate',
                      value ? '' + value : value === 0 ? '' + value : '',
                    )
                  }}
                  style={{ width: '200px' }}
                />
                <span>%</span>
              </Flex>
              {/* {MapHint(Bom_Default_Yield_Tip)} */}
            </FormItem>
          )}
        </Form>
      </Card>
      {!isPack && (
        <Card type='form-card' title='客户信息'>
          <Form hasButtonInGroup labelWidth='150px' disabledCol>
            {defaultBom()}
            <FormItem labelWidth='130px' label={t('关联商户')}>
              <a
                className='gm-margin-top-5 gm-block'
                onClick={() => setModalVisible(true)}
              >
                {t('配置关联客户')}
                {!!selectCustomerKey.length &&
                  '（已关联' + customersNumber + '个）'}
              </a>
            </FormItem>
          </Form>
          <Modal
            title='配置关联商户'
            destroyOnClose
            style={{ top: 20 }}
            visible={isModalVisible}
            bodyStyle={{ padding: '0 16px 0 16px' }}
            okText='确认'
            cancelText='取消'
            width={1000}
            onCancel={() => setModalVisible(false)}
            onOk={() => {
              const { selectedRowKeys, selectedRows } = selectTableRef.current!
              store.updateCustomersSelected(
                selectedRowKeys! as string[],
                selectedRows,
              )
              setModalVisible(false)
            }}
          >
            <SelectTable<Customer>
              tableRef={selectTableRef}
              rowKey='customer_id'
              defaultSelectedRowKeys={selectCustomerKey}
              defaultSelectedRows={selectCustomerInfo}
              selectedKey='name'
              extraKey='child_number'
              filter={[
                {
                  name: 'q',
                  placeholder: t('可搜索公司名称和编码'),
                  type: 'input',
                },
              ]}
              onSearch={store.fetchCustomerList}
              columns={[
                {
                  title: '公司名称',
                  dataIndex: 'name',
                },
                {
                  title: '公司编码',
                  dataIndex: 'customized_code',
                },
                {
                  title: '商户数',
                  dataIndex: 'child_number',
                },
              ]}
            />
          </Modal>
        </Card>
      )}
      {isPack && (
        <Card type='form-card' title='其他信息'>
          <Form hasButtonInGroup labelWidth='150px' disabledCol>
            {defaultBom(true)}
          </Form>
        </Card>
      )}
      <Modal
        title={`${bomStatus}生产BOM`}
        destroyOnClose
        visible={isTipVisible}
        bodyStyle={{ padding: '0 16px 0 16px' }}
        footer={null}
        width={500}
        onCancel={() => setTipVisible(false)}
      >
        {tipDIv()}
      </Modal>
    </FormGroup>
  )
}

export default observer(BomDetail)
