import { CSSProperties } from 'react'
// 处理分拣进度普通和投屏的ui样式
class UiStyle {
  colorIndex = 0
  colorList: string[] = []
  completedColor = 'rgb(134, 176, 78)'
  unfinishedColor = 'rgb(136, 164, 187)'
  stockOutColor = '#FA1C2C'

  setColor(list: string[]) {
    this.colorIndex = 0
    this.colorList = list
  }

  getColor() {
    return this.colorList[this.colorIndex++]
  }

  getModuleBackgroundColor(isFullScreen: boolean) {
    return isFullScreen ? 'transparent' : '#FFFFFF'
  }

  getOrderBackgroundColor(isFullScreen: boolean) {
    return isFullScreen ? 'rgba(8,12,34, 0.9)' : '#FFFFFF'
  }

  getStatisticsBackgroundColor(isFullScreen: boolean) {
    return isFullScreen ? 'rgba(8,12,34, 0.7)' : '#FFFFFF'
  }

  getMerchandiseBackgroundColor(isFullScreen: boolean) {
    return isFullScreen ? 'rgba(8,12,34, 0.9)' : '#F5F7FA'
  }

  getQuickPanelStyle(isFullScreen: boolean, isHeightAuto = false) {
    const style: CSSProperties = {
      width: '100%',
      height: '100%',
      background: this.getOrderBackgroundColor(isFullScreen),
    }
    // 投屏模式不需要border
    if (isFullScreen) {
      style.border = 'none'
    }
    if (isHeightAuto) {
      delete style.height
    }
    return style
  }

  getStatisticsHeight(isFullScreen: boolean) {
    return isFullScreen ? '130px' : '90px'
  }

  // 整体进度页 border
  getStatisticsBorder(isFullScreen: boolean) {
    return isFullScreen
      ? '0.5px solid #56A3F2'
      : '0.5px solid rgba(132, 148, 161, 0.3)'
  }

  // 排行榜
  getRankBackgroundColor(isFullScreen: boolean) {
    return {
      width: '100%',
      height: '500px',
      background: isFullScreen ? 'rgba(23,35,70, 0.7)' : '#FFFFFF',
      color: isFullScreen ? '#FFFFFF' : '',
    }
  }

  // 进度
  getProcessBackgroundColor(isFullScreen: boolean) {
    return {
      background: isFullScreen ? 'rgba(23,35,70, 0.7)' : '#FFFFFF',
      color: isFullScreen ? '#FFFFFF' : '',
      height: '150px',
      width: '100%',
      // marginTop: '50px',
    }
  }

  // 商品生产进度
  getGoodsBackgroundColor(isFullScreen: boolean) {
    return {
      width: '100%',
      minHeight: '250px',
      height: 'auto',
      background: isFullScreen ? 'rgba(23,35,70, 0.7)' : '#FFFFFF',
      color: isFullScreen ? '#FFFFFF' : '',
    }
  }
}

export default new UiStyle()
