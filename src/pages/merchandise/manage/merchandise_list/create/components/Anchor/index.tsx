import React, { useState, useEffect, useRef } from 'react'
import { AnchorProps } from './Anchor'
import { AnchorContext } from './constants'
import Link from './Link'
import './index.less'
import classNames from 'classnames'

const Anchor = (props: AnchorProps) => {
  const { children, affix = true, animation = true, options = [] } = props

  const timeRef = useRef<NodeJS.Timeout | null>(null)
  const [activeId, setActiveId] = useState<string>(
    options.length ? options[0]?.id : '',
  )
  const [heightList, setHeightList] = useState<Array<number>>([])

  const childIds: Array<string> = options?.map((item) => item.id) || []

  // activeId 选项变化的副作用
  useEffect(() => {
    handleHeightList()
  }, [activeId, options])

  // 页面滚动事件监听
  const handleScroll = () => {
    // 定时任务存在时,页面滚动不会影响active态
    if (timeRef.current) return
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop

    let index = 0
    heightList.forEach((item) => {
      if (scrollTop > item) index++
    })
    setActiveId(index ? options[index - 1]?.id : options[0].id)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // 点击锚点
  const handleActive = (id: string) => {
    if (timeRef.current) {
      clearInterval(timeRef.current)
      timeRef.current = null
    }
    timeRef.current = setInterval(() => {
      timeRef.current !== null && clearInterval(timeRef.current)
      timeRef.current = null
    }, 1250)
    setActiveId(id)
    const index = childIds.findIndex((f) => f === id)
    window.scrollTo({
      top: heightList[index] || 0,
      behavior: animation ? 'smooth' : 'auto',
    })
  }

  // 存储所有盒子的高度
  const handleHeightList = (): void => {
    let height = 0
    const heightList = childIds.map((item) => {
      const scrollHeight = Number(document.getElementById(item)?.scrollHeight)
      height += scrollHeight
      return height - scrollHeight
    })
    setHeightList(heightList)
  }

  return (
    <div className='anchor-base-style'>
      <div
        id='anchor_parent_id'
        className={classNames({ link_tab: true, is_fixed: affix })}
      >
        <AnchorContext.Provider value={{ activeId, onActive: handleActive }}>
          {/* children 的方式尚未补充，目前仅支持options的方式 */}
          {options
            ? options.map((item) => <Link {...item} key={item.id} />)
            : children}
        </AnchorContext.Provider>
      </div>
    </div>
  )
}

export default Anchor
