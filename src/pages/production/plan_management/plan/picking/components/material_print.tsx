import DiyBatchPrint from '@/pages/production/components/diy_batch_print'
import { PrintingTemplate_Type } from 'gm_api/src/preference'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Modal } from 'antd'
import { openNewTab } from '@/common/util'
import qs from 'query-string'
import store from '../store'

const MaterialPrint = forwardRef((__, ref) => {
  const [modal, setModal] = useState(false)
  const { selectedData, selectAll, filter } = store

  const handleChangeModal = () => {
    setModal((v) => !v)
  }

  useImperativeHandle(ref, () => ({
    handleChangeModal,
  }))

  return (
    <Modal
      visible={modal}
      title='批量打印'
      onCancel={handleChangeModal}
      footer={null}
      width={900}
      bodyStyle={{ paddingTop: 0, height: 450 }}
      destroyOnClose
    >
      <DiyBatchPrint
        id={1}
        type={PrintingTemplate_Type.TYPE_MATERIAL}
        href={(printing_template_id: string) =>
          `#/system/template/print_template/material_requisition_template/edit?template_id=${printing_template_id}`
        }
        onCancel={handleChangeModal}
        onOk={({ _, printId }) => {
          const query: string = qs.stringify({
            filter: JSON.stringify(
              selectAll
                ? { ...filter }
                : {
                    material_order_ids: selectedData.map(
                      (e) => e.materialOrderId,
                    ),
                  },
            ),
            printId,
          })
          openNewTab(
            `#/system/template/print_template/material_requisition_template/print?${query}`,
          )
        }}
      />
    </Modal>
  )
})

export default MaterialPrint
