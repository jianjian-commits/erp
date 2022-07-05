import React, { ReactNode, FC, useContext } from 'react'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import classNames from 'classnames'
import './index.less'

const ReceiptHeaderDetailContext = React.createContext<ContextContent>({
  contentLabelWidth: 60,
  contentCol: 4,
})

interface Data {
  text: string | ReactNode
  value: ReactNode
  left?: boolean
  hide?: boolean
}

interface Info {
  label?: string | ReactNode
  /** 是否隐藏该项 */
  hide?: boolean
  item: ReactNode
  tag?: 'error' | 'finish' | 'processing'
  required?: boolean
}

interface SummaryProps {
  totalData?: Data[]
}

interface HeaderProps {
  HeaderInfo: Info[]
  HeaderAction?: ReactNode
}

interface ContentProps {
  ContentInfo: Info[]
}

interface ContextContent {
  contentCol?: number
  contentBlockWidth?: number
  contentLabelWidth?: number
  customerContentColWidth?: number[]
}

interface ReceiptHeaderDetailProps
  extends SummaryProps,
    HeaderProps,
    ContentProps,
    ContextContent {
  className?: string
}

const Content: FC<ContentProps> = ({ ContentInfo }) => {
  const {
    customerContentColWidth,
    contentCol = 4,
    contentLabelWidth,
    contentBlockWidth = 230,
  } = useContext(ReceiptHeaderDetailContext)

  const contentLabelStyle = {
    width: contentLabelWidth,
    minWidth: contentLabelWidth,
  }

  const getContentBlockWidth = (index: number) => {
    if (customerContentColWidth && customerContentColWidth.length) {
      return { width: customerContentColWidth[index % contentCol] }
    }
    return { width: contentBlockWidth }
  }
  return (
    <Flex className='b-receipt-header-detail-content'>
      <Flex className='b-receipt-header-detail-block' alignCenter wrap>
        {ContentInfo && (
          <Flex wrap>
            {_.map(ContentInfo, (info, index) => {
              if (info.hide) return
              if (info.item === null) {
                return (
                  <Flex
                    key={`content-info-${index}`}
                    style={{ width: '100%' }}
                  />
                )
              }
              return (
                <Flex
                  key={`content-info-${index}`}
                  className='b-receipt-header-detail-content-item'
                  style={contentBlockWidth ? getContentBlockWidth(index) : {}}
                >
                  {info.label && (
                    <Flex
                      justifyEnd
                      alignCenter
                      className='b-receipt-header-detail-content-item-label gm-text-desc gm-text'
                      style={contentLabelWidth ? contentLabelStyle : {}}
                    >
                      <>
                        {info.label}
                        {info.required ? (
                          <span className='gm-text-14 gm-text-red gm-text-bold'>
                            *
                          </span>
                        ) : (
                          ''
                        )}
                      </>
                      :
                    </Flex>
                  )}
                  {info.tag && (
                    <Flex alignCenter>
                      <div
                        className={classNames('b-receipt-header-tag', {
                          'gm-bg-error': info.tag === 'error',
                          'gm-bg-desc': info.tag === 'finish',
                          'gm-bg-primary': info.tag === 'processing',
                        })}
                      />
                    </Flex>
                  )}
                  <Flex
                    flex
                    alignCenter
                    className='b-receipt-header-detail-content-item-text'
                  >
                    {info.item}
                  </Flex>
                </Flex>
              )
            })}
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

const Header: FC<HeaderProps> = ({ HeaderInfo, HeaderAction }) => {
  const {
    customerContentColWidth,
    contentLabelWidth,
    contentBlockWidth = 230,
  } = useContext(ReceiptHeaderDetailContext)
  const getContentBlockWidth = (index: number) => {
    if (customerContentColWidth && customerContentColWidth.length) {
      return { width: customerContentColWidth[index] }
    }
    return { width: contentBlockWidth }
  }

  const Info = (
    <Flex wrap>
      {HeaderInfo &&
        _.map(HeaderInfo, (info, index) => {
          if (info.hide) return
          return (
            <Flex
              key={`header-info-${index}`}
              className='b-receipt-header-detail-header-item'
              style={getContentBlockWidth(index)}
            >
              {info.label && (
                <Flex
                  justifyEnd
                  alignCenter
                  none
                  className='b-receipt-header-detail-header-item-label'
                >
                  <span>{info.label}</span>:
                </Flex>
              )}
              <Flex flex alignCenter none>
                {info.item}
              </Flex>
            </Flex>
          )
        })}
    </Flex>
  )

  return (
    <Flex className='b-receipt-header-detail-block' alignCenter>
      <Flex row alignCenter className='b-receipt-header-detail-header'>
        {Info}
      </Flex>
      <Flex flex />
      {HeaderAction !== undefined && HeaderAction}
    </Flex>
  )
}

const Summary: FC<SummaryProps> = ({ totalData }) => {
  let leftTotalData: Data[] = []
  let rightTotalData: Data[] = []
  if (totalData) {
    leftTotalData = _.filter(totalData, (info) => !!info.left)
    rightTotalData = _.filter(totalData, (info) => !info.left)
  }

  const renderData = (data: Data[]) => {
    return _.map(data, (info, i) => {
      if (info.hide) return null
      return (
        <Flex
          className='b-receipt-header-detail-summary-item gm-margin-right-10'
          column
          alignCenter
          key={i}
        >
          <span className='b-receipt-header-detail-summary-text'>
            {info.text}
          </span>
          <span className='b-receipt-header-detail-summary-value'>
            {info.value}
          </span>
        </Flex>
      )
    })
  }

  return totalData ? (
    <Flex alignCenter className='gm-padding-tb-5 gm-padding-left-20'>
      <Flex
        alignCenter
        className='b-receipt-header-detail-summary gm-padding-tb-10 gm-padding-lr-20'
      >
        {leftTotalData.length !== 0 && renderData(leftTotalData)}
        {leftTotalData.length !== 0 && rightTotalData.length !== 0 && (
          <div className='gm-gap-20 gm-border-left gm-margin-left-20 gm-margin-right-10' />
        )}
        {renderData(rightTotalData)}
      </Flex>
    </Flex>
  ) : null
}

const ReceiptHeaderDetail: FC<ReceiptHeaderDetailProps> = (props) => {
  const {
    totalData,
    HeaderInfo,
    HeaderAction,
    ContentInfo,
    contentLabelWidth,
    contentBlockWidth,
    contentCol,
    className,
    customerContentColWidth = [],
  } = props

  return (
    <Flex row className={classNames('b-receipt-header-detail', className)}>
      <Summary totalData={totalData} />
      <Flex
        column
        justifyCenter
        flex
        style={{ width: '100%' }}
        className='gm-padding-tb-10 gm-padding-lr-20'
      >
        <ReceiptHeaderDetailContext.Provider
          value={{
            contentLabelWidth,
            contentBlockWidth,
            contentCol,
            customerContentColWidth,
          }}
        >
          <>
            <Header HeaderInfo={HeaderInfo} HeaderAction={HeaderAction} />
            <Content ContentInfo={ContentInfo} />
          </>
        </ReceiptHeaderDetailContext.Provider>
      </Flex>
    </Flex>
  )
}

export default ReceiptHeaderDetail
