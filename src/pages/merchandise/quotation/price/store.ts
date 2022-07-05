import { action, observable, makeAutoObservable } from 'mobx';
import { rulesetOptions } from '../interface'

class ListStore {
  filter: { [key: string]: any } = {
    state: '',
    q: '',
  };

  pagination = {
    count: 0,
  };

  list: rulesetOptions[] = [];

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  getList() {
    this.list = [
      {
        rule_set_display_id: 'R11111',
        rule_set_id: 'R11111',
        rule_set_name: 'A客户协议价',
        create_time: '2020-09-08',
        quotation_id: 'Q11111',
        quotation_name: 'A报价单',
        state: 1,
      },
      {
        rule_set_display_id: 'R11112',
        rule_set_id: 'R11112',
        rule_set_name: 'B客户协议价',
        create_time: '2020-09-08',
        quotation_id: 'Q11112',
        quotation_name: 'B报价单',
        state: 2,
      },
    ]
  }

  changeFilter(name: string, value: any) {
    this.filter[name] = value
  }

  deleteRuleSet(id: string) {
    console.log('deleteRuleSet', id)
  }
}

export default new ListStore()
