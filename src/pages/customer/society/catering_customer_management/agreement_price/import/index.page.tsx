import ButtonGroupFixed from '@/common/components/button_group_fixed'
import { history } from '@/common/service'
import Icon, {
  DeleteOutlined,
  PlusOutlined,
  CheckCircleFilled,
} from '@ant-design/icons'
import {
  Button,
  Divider,
  Progress,
  Space,
  Steps,
  Typography,
  Upload,
  Spin,
} from 'antd'
import Dragger from 'antd/lib/upload/Dragger'
import { observer } from 'mobx-react'
import Excel from '@/svg/excel.svg'
import React, { FC, useEffect } from 'react'
import { inRange } from 'lodash'
import store from './store'
import { runInAction } from 'mobx'
import { useGMLocation } from '@gm-common/router'
import './style.less'
import ErrorList from './component/error_list'

const { Step } = Steps
const { Text, Title } = Typography

const ImportExcel: FC = observer(() => {
  const {
    query: { customer_id },
  } = useGMLocation<{ customer_id: string }>()

  const ready = store.step === 0 && store.progress === -1
  const uploading = inRange(store.progress, 0, 100)
  const uploaded = store.step === 2 && store.progress === 100
  const error = store.step === 1

  useEffect(() => {
    store.reset({ customerId: customer_id })
  }, [])

  return (
    <>
      <div className='tw-px-32'>
        <div className='tw-flex tw-justify-center tw-mt-16'>
          <Steps current={store.step} style={{ width: '600px' }}>
            <Step title='导入协议价' />
            <Step title='处理异常' />
            <Step title='上传完成' />
          </Steps>
        </div>
        {!error && (
          <Dragger
            className='dragger tw-mt-12'
            accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
            disabled={!ready}
            multiple={false}
            maxCount={1}
            beforeUpload={() => Promise.reject(new Error())}
            itemRender={(node, file, fileList) => null}
            onChange={(info) => {
              store.setFile(info.file)
            }}
          >
            {/* 待选择文件上传 */}
            {ready && (
              <>
                <div className='ant-upload-drag-icon tw-flex tw-flex-col tw-justify-center tw-pointer-events-none tw-mt-4'>
                  <Upload listType='picture-card'>
                    <PlusOutlined className='tw-text-4xl' />
                  </Upload>
                  <div className='ant-upload-text'>
                    点击或将文件拖拽到这里上传
                  </div>
                  <div className='ant-upload-hint tw-text-gray-500 tw-mb-4'>
                    导入的文件仅支持.xls和.xlsx格式，大小不超过10M，单个excel条数不超过5000条
                  </div>
                </div>
              </>
            )}
            {/* 上传中 */}
            {uploading && !store.loading && (
              <div className='uploading'>
                <div className='tw-mb-3'>数据导入中，请稍后</div>
                <Progress
                  percent={store.progress}
                  showInfo={false}
                  strokeWidth={3}
                  style={{ width: '255px' }}
                />
              </div>
            )}
            {/* 上传完成 */}
            {uploaded && (
              <div className='upload-success'>
                <CheckCircleFilled
                  className='tw-text-6xl'
                  style={{ color: '#52C41A' }}
                />
                <div className='tw-text-xl tw-font-bold tw-mt-2'>完成上传</div>
                <div className='tw-mt-6 tw-text-xs'>
                  <span>成功导入</span>
                  <span className='tw-mx-1 tw-text-base'>
                    {store.successCount || 0}
                  </span>
                  <span>条</span>
                  <span className='tw-text-gray-200 tw-mx-4'>|</span>
                  <span>失败</span>
                  <span className='tw-mx-1 tw-text-base tw-text-red-500'>
                    {store.failureCount || 0}
                  </span>
                  <span>条</span>
                  {store.failureAttachURL && (
                    <a className='tw-ml-4' href={store.failureAttachURL}>
                      下载失败数据
                    </a>
                  )}
                </div>
              </div>
            )}
          </Dragger>
        )}
        {/* 文件列表 */}
        {ready &&
          store.files.map((file, i) => {
            return (
              <div key={i}>
                <div className='tw-h-10 tw-border-solid tw-border tw-border-gray-200 tw-mt-2 tw-flex tw-items-center'>
                  <div className='tw-m-2'>
                    <Icon component={Excel} className='tw-text-2xl' />
                  </div>
                  <div>{file.name}</div>
                  <div className='tw-flex-auto' />
                  <div className='tw-m-2'>
                    <Button
                      type='text'
                      disabled={uploading}
                      onClick={() => {
                        runInAction(() => {
                          store.files = []
                        })
                      }}
                    >
                      <DeleteOutlined />
                    </Button>
                  </div>
                </div>
                {store.errors.map((err, i) => {
                  return (
                    <Text key={i} type='danger' className='tw-block tw-mt-1'>
                      {err}
                    </Text>
                  )
                })}
              </div>
            )
          })}

        {/* 底部说明 */}
        {!error && (
          <>
            <Divider className='tw-mt-32' />
            <div className='tw-mt-5'>
              <Space direction='vertical'>
                <Title
                  type='secondary'
                  level={5}
                  style={{ fontWeight: 'normal' }}
                >
                  说明
                </Title>
                <Text type='secondary'>
                  必须：将现在客户所有协议价文件转为.xls或.xlsx格式；
                </Text>
                <Text type='secondary'>
                  必须：将表明商品名称的列标题修改为”商品名“，表明价格的列标题改为”单价“；
                </Text>
                <div />
                <Text type='secondary'>
                  可选：表明单位的列标题修改为”单位“；
                </Text>
                <Button className='tw-mx-0 tw-px-0 tw-text-xs' type='link'>
                  查看示例
                </Button>
              </Space>
            </div>
          </>
        )}
      </div>

      {/* 导入异常商品列表 */}
      {error && (
        <Spin tip='正在导入数据...' spinning={store.loading}>
          <ErrorList />
          <div className='tw-mt-5 tw-px-10 tw-mb-16'>
            <Text type='secondary'>
              注意：提交后，价格将覆盖至至商品库中商品原有价格并立即生效；如商品库中不存在该商品，提交会新建该商品并报价。
            </Text>
          </div>
        </Spin>
      )}

      {/* 底部导航 */}
      {ready && (
        <ButtonGroupFixed
          onCancel={() => history.goBack()}
          ButtonNode={
            <Button
              type='primary'
              disabled={!store.files.length || store.errors.length > 0}
              onClick={() => store.next()}
            >
              下一步
            </Button>
          }
        />
      )}
      {uploading && (
        <ButtonGroupFixed
          onCancel={() => history.goBack()}
          cancelText='返回列表'
          ButtonNode={<></>}
        />
      )}
      {uploaded && (
        <ButtonGroupFixed
          onCancel={() => history.goBack()}
          cancelText='返回列表'
          ButtonNode={
            <Button
              type='primary'
              disabled={!store.files.length}
              onClick={() => store.reset({ customerId: customer_id })}
            >
              继续上传
            </Button>
          }
        />
      )}
      {error && (
        <ButtonGroupFixed
          onCancel={() => store.reset({ customerId: customer_id })}
          cancelText='返回重新上传'
          ButtonNode={
            <Button
              type='primary'
              disabled={
                !store.errorList.length ||
                store.errors.length > 0 ||
                store.loading
              }
              onClick={() => store.save()}
            >
              确认提交
            </Button>
          }
        />
      )}
    </>
  )
})

export default ImportExcel
