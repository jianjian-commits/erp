import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import _ from 'lodash'
import { useEffect, useRef, useState } from 'react'

interface Options {
  /**
   * 为 true 时发起请求。默认为 true
   */
  ready?: boolean
}

/**
 * 获取对账单打印模板
 */
function usePrintTemplateList(options?: Options) {
  const { ready = true } = options || {}
  const [list, setList] = useState<Array<{ id: string; name?: string }>>()
  const [loading, setLoading] = useState(false)
  const [defaultTemplateId, setDefaultTemplateId] = useState<string>()

  const timer = useRef<number>()
  useEffect(() => {
    if (!ready) {
      return
    }
    // 此次请求是否被弃用
    let isDiscarded = false
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setLoading(true)
    }, 300)
    ListPrintingTemplate({
      paging: { limit: 999 },
      type: PrintingTemplate_Type.TYPE_BILL,
    })
      .then(({ response }) => {
        if (isDiscarded) {
          return
        }
        let defaultId: string | undefined
        const printTemplateList = _.map(response.printing_templates, (item) => {
          if (item.is_default) {
            defaultId = item.printing_template_id
          }
          return { id: item.printing_template_id, name: item.name }
        })
        setDefaultTemplateId(defaultId)
        setList(printTemplateList)
      })
      .finally(() => {
        clearTimeout(timer.current)
        if (isDiscarded) {
          return
        }
        setLoading(false)
      })
    return () => {
      isDiscarded = true
    }
  }, [ready])

  return { list, loading, defaultTemplateId }
}

export default usePrintTemplateList
