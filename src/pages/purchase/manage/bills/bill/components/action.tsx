import React, { useMemo } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  gmHistory,
  gmHistory as history,
  useGMLocation,
} from '@gm-common/router'
import {
  Flex,
  Button,
  FunctionSet,
  Tip,
  RightSideModal,
  Confirm,
} from '@gm-pc/react'
import { observer } from 'mobx-react'
import {
  CreatePurchaseSheet,
  UpdatePurchaseSheet,
  PurchaseSheet_Status,
  Status_Code,
} from 'gm_api/src/purchase'
import store from '../store'
import SidePrintModal from '../../../components/side_print_modal'
import type { Query } from '../../../../interface'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { openNewTab } from '@/common/util'
import globalStore from '@/stores/global'
// import TaskFinish from './task_finish'

interface Data {
  text: string
  onClick?(): void
}

interface ActionProps {
  disabledEdit?: boolean
}

const Action = (props: ActionProps) => {
  const { disabledEdit } = props
  const location = useGMLocation<Query>()
  const { status } = store.info
  const isCommitted = status === (PurchaseSheet_Status.COMMIT as number)

  /**
   * @description 保存和保存草稿的submit函数
   */
  async function handleSubmit(isDraft: boolean) {
    // const list = store.list.filter((v) => v.sku_id && v.ssu_unit_id)
    const list = store.list.filter((v) => v.sku_id)
    for (let i = 0; i < list.length; i++) {
      // 草稿不需要校验
      if (!isDraft && !+list[i].purchase_amount!) {
        Tip.danger('请填写大于0的采购数量')
        return Promise.reject(new Error('num error'))
      }
    }
    let params
    if (location.query.id) {
      params = await store.getUpdateParams(isDraft)
      return UpdatePurchaseSheet(
        {
          purchase_sheets: [params as any],
        },
        [Status_Code.PURCHASE_SHEET_SUBMIT_WITH_TASK_FINISHED],
      ).then(async (json) => {
        if (json.message?.detail) {
          const target = _.find(store.list, (v) => {
            const purchase_task_id = (v.purchase_task_ids || [])[0] || ''
            return purchase_task_id === json.message?.detail?.purchase_task_id
          })
          Tip.danger(
            '商品' + (target?.name! || '-') + '已完成采购，请删除后在提交',
          )
          throw new Error(json.message?.description || '')
        } else {
          Tip.success('更新成功')
          await store.fetchBill(location.query.id)
          return json
        }
      })
    } else {
      params = await store.getCreateParams(isDraft)
      return CreatePurchaseSheet({
        purchase_sheet: params as any,
      }).then((json) => {
        Tip.success('创建成功')
        return json
      })
    }
  }

  /**
   * @description 保存提交
   * */
  function handleSave() {
    handleSubmit(false).then(() => {
      const ids = store.list
        .map(
          (v) =>
            v.purchase_task_ids?.length &&
            v.purchase_task_ids[0] !== '0' &&
            v.purchase_task_ids[0],
        )
        .filter((v) => v) as string[]
      if (!ids.length) {
        history.goBack()
        return null
      } else {
        gmHistory.replace('/purchase/manage/bills')
        return null
      }
    })
  }

  /**
   * @description 保存草稿
   */
  function handleSaveDraft() {
    handleSubmit(true).then(() => {
      const id = location.query.id
      if (!id) {
        history.replace(`/purchase/manage/bills`)
      }
      return null
    })
  }

  function dialogConfirm() {
    Confirm(
      globalStore.isLite
        ? t(`是否确认入库，入库后采购单不能删除`)
        : t('是否确认提交'),
    ).then(
      () => handleSave(),
      (_) => _,
    )
  }

  // const disabled = !store.list.filter((v) => v.sku_id && v.ssu_unit_id).length
  const disabled = !store.list.filter((v) => v.sku_id).length

  /**
   *
   * @description 更多功能,如果没有列表不支持点击
   */
  const actions = useMemo(
    () => [
      {
        text: t('保存草稿'),
        show: !disabledEdit && !isCommitted,
        disabled: disabled,
        onClick: handleSaveDraft,
      },
      {
        text: t('打印'),
        disabled: !location.query.id,
        show: !globalStore.isLite,
        onClick: async () => {
          const templates = await ListPrintingTemplate({
            paging: { limit: 999 },
            type: PrintingTemplate_Type.TYPE_PURCHASE_SHEET,
            not_need_supplier_default: true,
          }).then((json) => json.response.printing_templates || [])

          RightSideModal.render({
            onHide: RightSideModal.hide,
            style: { width: '300px' },
            children: (
              <SidePrintModal
                name='purchase_bill_print'
                onPrint={({ printing_template_id }) => {
                  openNewTab(
                    `#system/template/print_template/purchase_bill_template/print?sheet_no=${location.query.id}&tpl_id=${printing_template_id}&print_what=bill`,
                  )
                  RightSideModal.hide()
                }}
                templates={templates}
              />
            ),
          })
        },
      },
      {
        text: t('分享'),
        show: false,
        disabled: !location.query.id,
        onClick: (_: any) => _,
      },
    ],
    [isCommitted, disabled],
  )

  return (
    <Flex>
      {!isCommitted && (
        <Button
          type='primary'
          disabled={disabled}
          className='gm-margin-right-10'
          onClick={dialogConfirm}
        >
          {globalStore.isLite ? t('保存并入库') : t('保存并提交')}
        </Button>
      )}
      {globalStore.isLite && !disabledEdit && !isCommitted ? (
        <Button
          type='default'
          disabled={disabled}
          className='gm-margin-right-10'
          onClick={handleSaveDraft}
        >
          {t('保存草稿')}
        </Button>
      ) : (
        <FunctionSet
          right
          // @ts-ignore
          data={actions}
        />
      )}
    </Flex>
  )
}

export default observer(Action)
