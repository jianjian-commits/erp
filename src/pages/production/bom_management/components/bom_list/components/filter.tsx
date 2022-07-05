import { history } from '@/common/service'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import BatchImport from '@/pages/production/bom_management/components/bom_list/components/batch_import'
import { ListBomRequestExpand } from '@/pages/production/bom_management/components/bom_list/interface'
import '@/pages/production/bom_management/style.less'
import globalStore from '@/stores/global'
import { BoxForm, Flex } from '@gm-pc/react'
import { Button, Input, Modal } from 'antd'
import { ButtonType } from 'antd/lib/button'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { BomType, ExportBom } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import React, { FC, useState } from 'react'
import store from '../store'
import MoreFilter from './more_filter'

/**
 * 筛选信息的属性
 */
interface Query {
  /** BOM的种类 */
  type: BomType
  /** 搜索后执行的动作 */
  onSearch: (params: ListBomRequestExpand) => Promise<any>
}

/**
 * 筛选信息的组件函数
 */
const Filter: FC<Query> = ({ type, onSearch }) => {
  const [isModalVisible, setModalVisible] = useState(false)
  const [inputModal, setInputModal] = useState(false)

  const { q, category_ids } = store.filter

  const renderActionButton = (
    bomType: BomType,
    action: 'import' | 'create',
  ) => {
    const permission =
      bomType === BomType.BOM_TYPE_PACK
        ? Permission.PERMISSION_PRODUCTION_CREATE_PACK_BOM
        : Permission.PERMISSION_PRODUCTION_CREATE_BOM
    if (!globalStore.hasPermission(permission)) {
      return null
    }

    let buttonClass = ''
    let buttonText = ''
    let buttonType: ButtonType = 'default'
    let callback: () => void
    if (action === 'import') {
      buttonClass = 'gm-margin-right-10'
      buttonText = t('导入')
      callback = () => setInputModal(true)
    } else {
      buttonType = 'primary'
      buttonText =
        bomType === BomType.BOM_TYPE_PACK ? t('新建包装BOM') : t('新建生产BOM')
      callback = () => handleCreateButtonClick(type)
    }
    return (
      <Button className={buttonClass} type={buttonType} onClick={callback}>
        {buttonText}
      </Button>
    )
  }

  /**
   * 处理创建按钮点击的事件
   * 根据选择创建BOM的种类跳转至不同的页面
   * @param {BomType} [value] BOM的种类
   */
  const handleCreateButtonClick = (value?: BomType) => {
    const isPack = type === BomType.BOM_TYPE_PACK
    history.push(
      `/production/bom_management/${isPack ? 'pack' : 'produce'}/create?type=${
        value ||
        (type === BomType.BOM_TYPE_UNSPECIFIED
          ? BomType.BOM_TYPE_CLEANFOOD
          : type)
      }`,
    )
  }

  /**
   * 处理搜索按钮点击的事件
   * 执行props中的onSearch函数
   */
  const handleSearch = () => {
    onSearch(store.getFilter()).then((json) => json && setModalVisible(false))
  }

  /**
   * 处理导出按钮点击的事件
   * 导出BOM列表
   */
  const handleExportButtonClick = () => {
    ExportBom({
      bom_filter: { ...store.getFilter(), paging: { limit: 999 } },
    }).then((json) => json && globalStore.showTaskPanel())
  }

  return (
    <BoxForm>
      <Flex justifyBetween className='b-bomList-filter'>
        <Flex alignCenter className='b-filter-search '>
          <CategoryCascader
            value={category_ids}
            onChange={(value) => {
              store.updateFilter('category_ids', value as string[])
              onSearch(store.getFilter())
            }}
            showAdd={false}
          />
          <Input
            style={{ width: '230px' }}
            className='gm-margin-left-10 '
            placeholder='请输入BOM名称/BOM编码'
            allowClear
            value={q}
            onChange={(e) => store.updateFilter('q', e.target.value)}
          />
          <Button
            type='primary'
            onClick={handleSearch}
            className='gm-margin-right-10'
          >
            {t('搜索')}
          </Button>
          <div
            className='gm-margin-right-10 gm-text-desc b-button'
            onClick={() => setModalVisible(true)}
          >
            {t('更多筛选')}
          </div>
          <div
            className='gm-text-desc b-button'
            onClick={() => {
              store.initFilter()
              handleSearch()
            }}
          >
            {t('清空')}
          </div>
        </Flex>
        <div>
          {renderActionButton(type, 'import')}
          <Button
            className='gm-margin-right-10'
            onClick={handleExportButtonClick}
          >
            {t('导出')}
          </Button>
          {renderActionButton(type, 'create')}
        </div>
      </Flex>
      <Modal
        title={t('更多筛选')}
        visible={isModalVisible}
        width='900px'
        destroyOnClose
        onCancel={() => setModalVisible(false)}
        onOk={handleSearch}
      >
        <MoreFilter type={type} />
      </Modal>
      <Modal
        title={t('导入Bom')}
        visible={inputModal}
        onCancel={() => setInputModal(false)}
        width='500px'
        destroyOnClose
        footer={null}
      >
        <BatchImport onCancel={() => setInputModal(false)} />
      </Modal>
    </BoxForm>
  )
}

export default observer(Filter)
