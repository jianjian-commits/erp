import { Modal } from 'antd'
import { t } from 'gm-i18n'

interface LeaveConfirmParams {
  onCancel?: () => void
}

export default function leaveConfirm(params: LeaveConfirmParams) {
  const { onCancel } = params
  Modal.confirm({
    title: t('提示'),
    content: t('取消后已填写的信息将会失效，确定要离开？'),
    cancelText: '离开',
    okText: '继续填写',
    onCancel,
  })
}
