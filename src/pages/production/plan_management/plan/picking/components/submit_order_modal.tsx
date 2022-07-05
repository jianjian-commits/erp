import React, { FC } from 'react'
import { Modal } from 'antd'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'
import { SubmitMaterialOrder } from 'gm_api/src/production'
import store from '../store'

const SubmitOrderModal: FC<{
  refresh(): void
  data: any[]
  visible: boolean
  setVisible(visible: boolean): void
}> = ({ data, visible, setVisible, refresh }) => {
  const handleSubmit = () => {
    const material_order_ids = data.map((e) => e.materialOrderId)
    SubmitMaterialOrder({ material_order_ids }).then(() => {
      Tip.success(t('操作成功'))
      store.initSelectedData()
      refresh()
      return setVisible(false)
    })
  }

  return (
    <Modal
      title={t('提交领料单')}
      visible={visible}
      onOk={handleSubmit}
      onCancel={() => setVisible(false)}
    >
      <div>{t('说明：')}</div>
      <div>{t('1、领料单提交之后，不可编辑数量和删除领料单中的数据；')}</div>
      <div>{t('2、“已提交”的领料单不可重复提交；')}</div>
    </Modal>
  )
}

export default SubmitOrderModal
