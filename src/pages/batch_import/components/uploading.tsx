/**
 * @description 批量导入-导入中
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { Button, Divider, Progress } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { gmHistory as history } from '@gm-common/router'
import '../style.less'
import { CheckOutlined } from '@ant-design/icons'
import store from '../store'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
import { GetTask, Task_State } from 'gm_api/src/asynctask'

const BatchUploading: FC = observer(() => {
  const { setStep, taskId, pageConfig } = store
  // 导入进度
  const [percent, setPercent] = useState<number>(0)
  // 导入成功数量
  const [successCount, setSuccessCount] = useState<number>(0)
  // 导入失败数量
  const [failureCount, setFailureCount] = useState<number>(0)
  // 失败文件下载地址
  const [failureUrl, setFailureUrl] = useState<string>('')

  // 控制定时器状态
  const timerRef = useRef<NodeJS.Timer | null>(null)

  // 获取当前导入进度
  const getPercent = () => {
    if (taskId) {
      GetTask({ task_id: taskId }).then((json) => {
        const { task, task_data } = json.response
        if (Number(task.state) >= Task_State.STATE_CANCELED) {
          // 任务已完成
          clearTimer()
          setSuccessCount(task_data?.success_count?.total || 0)
          setFailureCount(task_data?.failure_count?.total || 0)
          setFailureUrl(task_data?.failure_attach_url || '')
          setPercent(100)
        } else {
          // 任务未完成
          const data =
            Math.round(
              (Number(task_data?.progress) / Number(task_data?.total)) * 100,
            ) || 0
          setPercent(data)
          if (!timerRef.current) {
            // 没有定时器时创建定时器
            timerRef.current = setInterval(() => {
              getPercent()
            }, 5000)
          }
        }
      })
    }
  }

  // 清楚定时器
  const clearTimer = () => {
    clearInterval(timerRef.current as NodeJS.Timer)
    timerRef.current = null
  }

  useEffect(() => {
    getPercent()
  }, [])

  const onCancel = () => {
    clearTimer()
    history.go(-1)
  }

  const continueUpload = () => {
    setStep(0)
  }

  // 获取任务完成后提示文案
  const getFinishDom = () => {
    const { successTip, failureTip = '失败{#failure}行' } = pageConfig
    const failureTips = failureTip?.split('{#failure}')
    return (
      <>
        {successTip.replace('{#success}', `${successCount}`)}
        {failureCount > 0 && (
          <>
            &nbsp;&nbsp;&nbsp;&nbsp;{failureTips[0]}
            <span style={{ color: '#ff4d4f' }}>{failureCount}</span>
            {failureTips[1]}
          </>
        )}
      </>
    )
  }

  return (
    <>
      <div className='batch_import_uploading batch_import_box'>
        {percent !== 100 ? (
          <div className='batch_import_uploading_content'>
            <div>{t('数据导入中，请稍后…')}</div>
            <Progress
              style={{ maxWidth: 300 }}
              percent={percent}
              showInfo={false}
            />
          </div>
        ) : (
          <div className='batch_import_uploading_content'>
            <div className='batch_import_uploading_success'>
              <CheckOutlined />
            </div>
            <p>{t('导入完成')}</p>
            <p style={{ fontSize: 14, fontWeight: 400 }}>
              {getFinishDom()}
              {!!failureUrl && (
                <>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <a href={failureUrl}>{t('下载失败数据')}</a>
                </>
              )}
              {!!failureCount && !failureUrl && (
                <>&nbsp;&nbsp;&nbsp;&nbsp;{t('失败原因生成错误')}</>
              )}
            </p>
          </div>
        )}
      </div>
      <Divider />
      {percent !== 100 && (
        <div>
          <p>{t('温馨提醒：')}</p>
          <p>
            {t(
              '1、若导入时间过长，可以先点击【返回列表】进行其他业务操作，导入结束后可在系统右下角的【任务】栏中查看导入结果；',
            )}
          </p>
          <p>{t('2、若导入失败，可下载失败数据表查看具体的失败原因；')}</p>
        </div>
      )}
      <ButtonGroupFixed
        onCancel={onCancel}
        cancelText={percent === 100 ? t('取消') : t('返回列表')}
        ButtonNode={
          <>
            {percent === 100 && (
              <Button type='primary' onClick={continueUpload}>
                {t('再次导入')}
              </Button>
            )}
          </>
        }
      />
    </>
  )
})

export default BatchUploading
