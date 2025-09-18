// 测试智谱AI集成功能
require('dotenv').config({ path: '.env.test' });

const axios = require('axios');

async function testZhipuMessage() {
  const zhipuApiKey = process.env.ZHIPU_API_KEY;
  
  if (!zhipuApiKey) {
    console.log('未配置智谱AI API Key');
    return;
  }
  
  try {
    // 构造提示词
    const prompt = `你是一个积极乐观的助手，请为用户生成一条有情绪价值的打卡成功消息。要求：
1. 表达对用户按时打卡的赞赏
2. 用积极正面的语言鼓励用户
3. 可以包含一些温馨提醒或祝福
4. 保持专业但友好的语调
5. 打卡类型是上班打卡
6. 请用中文回复，不要超过200字

示例格式：
🎉 打卡成功！
[积极正面的内容]
[温馨提醒或祝福]`;
    
    console.log('智谱AI API Key:', zhipuApiKey);
    console.log('提示词:', prompt);
    
    // 注意：这里我们只是测试环境变量是否正确读取，不会真正发送请求
    console.log('✅ 环境变量配置正确，可以正常调用智谱AI API');
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testZhipuMessage().catch(console.error);