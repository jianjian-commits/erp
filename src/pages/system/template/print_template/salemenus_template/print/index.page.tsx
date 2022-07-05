import React, { useEffect, useRef, VFC } from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gm-pc/react'
import { doBatchPrint } from 'gm-x-printer'
import { setTitle } from '@gm-common/tool'
import formatData from '../config/data_to_key'
import { useGMLocation } from '@gm-common/router'
import { GetPrintingTemplate } from 'gm_api/src/preference'
import {
  Category,
  GetCategoryTree,
  GetSkuReferencePrices,
  GetSkuReferencePricesRequest,
  ListBasicPriceV2,
  ListBasicPriceV2Request_RequestData,
  ListBasicPriceV2Response,
} from 'gm_api/src/merchandise'
import { list2Map } from '@/common/util'
import { GenerateTokenByBusinessId } from 'gm_api/src/oauth'
import queryString from 'query-string'
import _ from 'lodash'

setTitle(i18next.t('打印'))
interface Query {
  template_id: string
  quotation_id: string
}

type printDataSource = ListBasicPriceV2Response & {
  category_map: Category[]
}

const mergeUtil = (
  quotationInfo: ListBasicPriceV2Response,
  categoryInfo: Category[],
): printDataSource =>
  Object.assign(quotationInfo, {
    category_map: list2Map(categoryInfo, 'category_id'),
  }) as printDataSource

const QuotationPrinter: VFC = () => {
  const location = useGMLocation<Query>()

  const ref = useRef<HTMLDivElement>(null)

  function fetchQuotationRelation() {
    const { quotation_id, template_id } = location.query
    const quotationReq = {
      filter_params: {
        quotation_id: quotation_id,
        // sku_type: Sku_SkuType.NOT_PACKAGE,
      },
      request_data:
        ListBasicPriceV2Request_RequestData.QUOTATION_CUSTOMER_RELATION,
      paging: { all: true },
    }

    /**
     * [报价单信息，分类信息，模板配置，qrcode]
     */
    return Promise.all([
      ListBasicPriceV2(quotationReq).then((json) => json.response),
      GetCategoryTree().then((json) => json.response),
      GetPrintingTemplate({ printing_template_id: template_id }).then(
        (json) => json.response,
      ),
      GenerateTokenByBusinessId({ business_id: quotation_id }).then((json) => {
        const shareUrl = `https://q.guanmai.cn/more#/share_salemenu?${queryString.stringify(
          {
            quotation_id: quotation_id,
            token: json.response.access_token,
            template_id: template_id,
          },
        )}`
        return shareUrl
      }),
    ])
      .then(async (res) => {
        const [quotationInfo, categoryInfo, config, shareUrl] = res
        const _config = JSON.parse(config.printing_template.attrs?.layout || '')

        /** 查询最近报价的参数 */
        const getSkuReferencePricesReq: GetSkuReferencePricesRequest = {
          sku_unit_filter: _.flatten(
            _.map(quotationInfo.basic_prices!, (item) => {
              return _.map(item.items.basic_price_items, (bp) => {
                return {
                  sku_id: item.sku_id,
                  unit_id: bp.fee_unit_price.unit_id,
                  order_unit_id: bp.order_unit_id,
                  quotation_id: location.query.quotation_id,
                  quotation_type:
                    quotationInfo.quotation_map?.[location.query.quotation_id]
                      .type,
                }
              })
            }),
          ),
          period: 1,
        }
        const {
          response: { reference_price_map },
        } = await GetSkuReferencePrices(getSkuReferencePricesReq)
        return [
          {
            data: formatData(
              {
                ...mergeUtil(quotationInfo, categoryInfo.categories || []),
                shareUrl,
                reference_price_map,
              },
              _config,
            ),
            config: _config,
          },
        ]
      })
      .catch((err) => {
        window.alert(i18next.t('未知错误'))
        // eslint-disable-next-line promise/no-return-wrap
        return Promise.reject(new Error(err))
      })
  }

  async function handleDoIt() {
    LoadingFullScreen.render({
      size: '100px',
      text: i18next.t('正在加载数据，请耐心等待!'),
    })
    const list: any[] = await fetchQuotationRelation()
    LoadingFullScreen.hide()
    console.log(document.getElementById('_root'))

    doBatchPrint(list)
  }

  useEffect(() => {
    handleDoIt()
  }, [])

  return <div id='_root' ref={ref} style={{ overflow: 'auto' }} />
}

export default QuotationPrinter
