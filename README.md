# 使用

- 配置项目 => 将`@/config`下的`sample.local.js`复制一份到同目录下，重命名为`local.js`
- 运行项目 => `yarn`，`yarn start`
- 启动master环境 => `yarn`，`start:master`
- 启动dev环境 => `yarn`，`start:dev`
- 启动lite环境 => `yarn`，`start:lite`
- 启动开发环境 => `yarn`，`start:feature`

# 开发版本

- 从 develop 切 feature 分支
- 分支命名 => 与后台开发分支同名。可不同名，但需要在联调时给后端分支名用于更换模板
- 强关联 gm_api => 后台 proto 有变动的时候需要去 api 工程更新。成功后需要在该工程里执行命令行 `yarn api`（需要两个工程的分支名相同），或手动修改`package.json`里 `gm_api` 的 commitID
- 联调 => 替换`local.js` 下的 target
- <a href="https://code.guanmai.cn/back_end/ceres/-/wikis/%E4%BA%BA%E5%B7%A5%E6%B5%8B%E8%AF%95%E6%8C%87%E5%8D%97">创建 groupId</a>

# 修复版本

- 纯前端改动从 master 切 hotfix 分支。涉及到后台改动需走开发流程
- <a href="https://code.guanmai.cn/back_end/ceres/-/wikis/%E5%A6%82%E4%BD%95%E8%AE%BF%E9%97%AE%E5%90%8E%E7%AB%AF%E6%9C%8D%E5%8A%A1">提测链接生成</a>

# 其他

- 模块化 => `local.js` 下的 `autoRouterReg` 可选定需要编译的模块，提升编译速度
- 大部分的 url 可通过 vscode 中的`command+p`快速定位到相应的代码文件

# 常见报错

- gm_api 不是正确的节点,导致页面白屏，类似于枚举值 undefined 等
  - 开发分支 => 前端合了线上代码，后代没合。导致引用未定义的值或接口
  - develop => 解决冲突的时候将开发分支的 gm_api commitId 提到 develop 分支

# 轻巧版本地环境登录方式

1.在正式环境扫码登录后，localStorage里面找到token,例如：

```
'056a8145e5000001ff2f0bfd33b24fa5'
```

2.在下面的代码里面填写上一步获取的token，然后在本地环境控制台执行下方代码：

```js
window.localStorage.setItem(
  "erp__gm-common_ACCESS_TOKEN_KEY", 
  JSON.stringify('056a8145e5000001ff2f0bfd33b24fa5')
)
```

3.刷新页面

 