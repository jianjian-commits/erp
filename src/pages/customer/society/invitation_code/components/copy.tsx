import React from 'react'
import { i18next } from 'gm-i18n'
import ReactDOM from 'react-dom'
import { Tip } from '@gm-pc/react'
import Clipboard from 'clipboard'

interface CopyProps {
  text: string
}

class Copy extends React.Component<CopyProps> {
  componentDidMount() {
    this.clipboard = new Clipboard(ReactDOM.findDOMNode(this), {
      text: () => this.props.text,
    })

    this.clipboard.on('success', () => {
      Tip.success(i18next.t('复制成功'))
    })

    this.clipboard.on('error', () => {
      Tip.success(i18next.t('复制失败，请手动复制'))
    })
  }

  componentWillUnmount() {
    this.clipboard.destroy()
  }

  render() {
    return this.props.children
  }
}
export default Copy
