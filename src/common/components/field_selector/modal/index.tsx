import React, { CSSProperties, ReactElement, useState } from 'react'
import { Divider, Modal } from 'antd'
import { FieldSelector } from '../field_selector'
import { AnyObject, ValueInObject } from '../field_selector/interface'
import Footer from './footer'
import _ from 'lodash'
import { SingleProps, BatchProps, OverloadProps } from './types'

const DEFAULT_CONTAINER_STYLE: CSSProperties = {
  height: 460,
  maxHeight: 540,
  overflowY: 'auto',
}

function FieldSelectorModal<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
>(props: SingleProps<RawData, TabId, RawDataKey>): ReactElement
function FieldSelectorModal<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
>(props: BatchProps<RawData, TabId, RawDataKey>): ReactElement
function FieldSelectorModal<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
>(props: OverloadProps<RawData, TabId, RawDataKey>): ReactElement {
  const {
    containerStyle = DEFAULT_CONTAINER_STYLE,
    defaultActiveKey,
    fieldKey,
    labelKey,
    tabs,
    instance,
    fetcher,
    batchSubmit = true,
    closeOnSubmit = true,
    renderGroupTitle,
    onClose,
    onSubmit,
    ...restProps
  } = props

  const [fieldStateInstance] = FieldSelector.useFieldState<
    RawData,
    TabId,
    RawDataKey
  >(instance)
  const [activeKey, setActiveKey] = useState(defaultActiveKey)

  const handleClose = () => {
    onClose && onClose()
  }

  const handleSubmit = async () => {
    if (typeof onSubmit !== 'function') return
    const fields = fieldStateInstance.getFields()
    if (batchSubmit) {
      await Promise.resolve(onSubmit(fields))
    } else {
      let field = fields[0]
      if (!_.isNil(activeKey)) {
        field = _.find(fields, (item) => item.name === activeKey)!
      }
      await Promise.resolve(onSubmit(field))
    }
    if (closeOnSubmit) handleClose()
  }

  return (
    <Modal
      {...restProps}
      bodyStyle={{ padding: 0 }}
      footer={null}
      forceRender={false}
      destroyOnClose
      maskClosable={false}
      onCancel={handleClose}
    >
      <FieldSelector
        instance={fieldStateInstance}
        activeKey={activeKey}
        fieldKey={fieldKey}
        labelKey={labelKey}
        tabs={tabs}
        fetcher={fetcher}
        containerStyle={containerStyle}
        onChangeActiveKey={setActiveKey}
        renderGroupTitle={renderGroupTitle}
      />
      <Divider className='tw-m-0' />
      <div className='tw-p-3 tw-text-right'>
        <Footer onClose={handleClose} onOk={handleSubmit} />
      </div>
    </Modal>
  )
}

export default FieldSelectorModal
