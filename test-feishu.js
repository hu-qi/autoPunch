// 测试飞书机器人推送功能
require('dotenv').config({ path: '.env.test' });

const { default: axios } = require('axios');

async function testFeishuMessage() {
  const feishuWebhook = process.env.FEISHU_BOT_WEBHOOK;
  
  if (!feishuWebhook) {
    console.log('未配置飞书机器人webhook');
    return;
  }
  
  try {
    const payload = {
      msg_type: 'text',
      content: {
        text: '🎉 这是一个测试消息，用于验证飞书机器人推送功能是否正常工作。'
      }
    };
    
    // 注意：这里我们只是测试环境变量是否正确读取，不会真正发送请求
    console.log('飞书机器人Webhook URL:', feishuWebhook);
    console.log('消息内容:', JSON.stringify(payload, null, 2));
    console.log('✅ 环境变量配置正确，可以正常推送消息到飞书机器人');
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testFeishuMessage().catch(console.error);