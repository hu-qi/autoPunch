# Auto Punch Serverless

自动打卡 Serverless 程序，支持 GitHub Actions 自动执行。

## 功能特性

- ✅ 支持 GitHub Actions 自动执行
- ✅ 自动判断工作日（考虑中国节假日）
- ✅ 根据时间自动判断打卡类型（上班卡/下班卡）
- ✅ 支持通过环境变量配置 URL、TOKEN 和 APP_VERSION_NUMBER
- ✅ 上班卡时间：工作日北京时间上午 7:00-8:00
- ✅ 下班卡时间：工作日北京时间下午 18:00-22:00
- ✅ 支持打卡结果推送到飞书机器人
- ✅ 支持使用 LLM 生成有情绪价值的打卡消息

## 环境变量配置

需要在 GitHub Actions Secrets 中配置以下环境变量：

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| PUNCH_URL | 打卡接口URL | https://example.com/api/attendance/app/attendance/punchCard |
| PUNCH_TOKEN | 认证Token | 无默认值（必须配置） |
| APP_VERSION_NUMBER | 应用版本号 | 3 |
| FEISHU_BOT_WEBHOOK | 飞书机器人Webhook (可选) | 无 |
| ZHIPU_API_KEY | 智谱AI API Key (可选) | 无 |
| ALLOW_INSECURE_TLS | 跳过 TLS 证书校验（仅私有/测试环境） | false |
| CUSTOM_CA_CERT_PATH | 自定义 CA 证书路径（优先于不安全模式） | 无 |

## GitHub Actions 配置

1. Fork 本项目到你的 GitHub 账户
2. 进入项目 Settings > Secrets and variables > Actions
3. 添加以下 Secrets:
   - `PUNCH_TOKEN`: 你的认证 Token
   - `PUNCH_URL`: (可选) 打卡接口 URL
   - `APP_VERSION_NUMBER`: (可选) 应用版本号
   - `FEISHU_BOT_WEBHOOK`: (可选) 飞书机器人 Webhook URL
   - `ZHIPU_API_KEY`: (可选) 智谱AI API Key
4. 工作流会根据以下时间自动执行：
   - 上班卡：工作日上午 7:05 (UTC+8)
   - 下班卡：工作日下午 18:05 (UTC+8)
   
   > ⏰ **时间说明**: 由于 GitHub Actions 使用 UTC 时间，而我们的需求是北京时间，因此：
   > - 上班卡时间 (北京时间 7:05) 对应 UTC 时间前一天 23:05
   > - 下班卡时间 (北京时间 18:05) 对应 UTC 时间 10:05
   > 
   > 更多关于 cron 调度的详细信息，请查看 [CRON_SCHEDULE.md](CRON_SCHEDULE.md) 文件。

## 飞书机器人配置（可选）

1. 在飞书群聊中添加自定义机器人
2. 复制机器人的 Webhook 地址
3. 将 Webhook 地址添加到 GitHub Secrets 中，变量名为 `FEISHU_BOT_WEBHOOK`
4. 打卡结果将自动推送到飞书群聊中

## 智谱AI集成（可选）

本项目支持使用智谱AI的免费 [glm-4.5-flash](https://docs.bigmodel.cn/cn/guide/models/free/glm-4.5-flash) 模型为打卡消息提供情绪价值：

1. 访问 [智谱AI开放平台](https://bigmodel.cn/) 并注册账号
2. 在 API Keys 管理页面创建 API Key
3. 将 API Key 添加到 GitHub Secrets 中，变量名为 `ZHIPU_API_KEY`
4. 打卡消息将使用 LLM 生成更加温馨和有情绪价值的内容

## TLS 证书问题处理

- 错误 `unable to verify the first certificate` 多为服务器证书链不完整或使用了私有 CA。
- 优先方案：配置 `CUSTOM_CA_CERT_PATH` 指向可信的 CA 证书文件（例如 `ca.crt`）。代码会使用该 CA 验证 TLS。
- 临时方案：设置 `ALLOW_INSECURE_TLS=true`，将忽略 TLS 证书校验，仅建议在受控测试环境使用。
- 诊断命令：
  - `curl -v https://gp.stonghr.cn/` 查看证书链与握手情况
  - `openssl s_client -connect gp.stonghr.cn:443 -showcerts` 导出与检查证书

> 提示：即使解决 TLS 问题，若 Token 无效，接口可能返回类似 `{"code":1000,"msg":"身份验证失败"}`。请确认 `authentication` 头与 `appversionnumber` 值正确。

## 本地测试

1. 克隆项目:
   ```bash
   git clone https://github.com/your-username/auto-punch-serverless.git
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 配置环境变量:
  ```bash
  export PUNCH_TOKEN="your_token_here"
  export PUNCH_URL="https://example.com/api/attendance/app/attendance/punchCard"
  export APP_VERSION_NUMBER="3"
  export FEISHU_BOT_WEBHOOK="your_feishu_webhook_here" # 可选
  export ZHIPU_API_KEY="your_zhipu_api_key_here" # 可选
  # TLS 相关（二选一或均不配置）
  export CUSTOM_CA_CERT_PATH="/absolute/path/to/ca.crt"  # 推荐
  export ALLOW_INSECURE_TLS="false"                      # 如需跳过 TLS，设为 true
  ```

4. 运行程序:
   ```bash
   node index.js
   ```

## 注意事项

1. 请确保 Token 的有效性
2. 程序会自动判断是否为工作日（使用公共节假日 API）
3. 只在指定时间范围内执行打卡操作
4. 打卡位置固定为广东省广州市天河区华景路1号
5. 如需修改打卡位置，请修改源代码中的经纬度和地址信息
6. 飞书机器人推送为可选功能，如不配置 `FEISHU_BOT_WEBHOOK` 环境变量则不会推送消息
7. LLM 消息生成功能为可选功能，如不配置 `ZHIPU_API_KEY` 环境变量则使用默认消息格式

## 许可证

本项目采用 [GNU General Public License v3.0](LICENSE) 许可证。

## License

GPL-3.0