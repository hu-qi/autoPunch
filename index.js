const axios = require('axios');

// 中国节假日API（使用公共API）
const HOLIDAY_API = 'http://timor.tech/api/holiday/info/';

/**
 * 判断是否为工作日
 * @param {Date} date 日期
 * @returns {Promise<boolean>} 是否为工作日
 */
async function isWorkday(date) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  console.log(`检查日期 ${dateStr} 是否为工作日`);

  try {
    // 使用公共API查询节假日信息
    const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    }
    const response = await axios.get(`${HOLIDAY_API}${dateStr}`, { headers: headers });
    const data = response.data;
    console.log('data', data)
    console.log(`节假日API返回数据:`, JSON.stringify(data, null, 2));
    
    // 如果是工作日返回true，节假日或调休返回false
    if (data.type && data.type.type === 0) {
      console.log('今天是工作日');
      return true; // 工作日
    } else if (data.type && (data.type.type === 1 || data.type.type === 2)) {
      console.log('今天是节假日或调休日');
      return false; // 节假日或调休
    }
    
    // 默认按照周末判断
    const dayOfWeek = date.getDay();
    const isWeekday = dayOfWeek > 0 && dayOfWeek < 6; // 周一到周五
    console.log(`按照周末判断，今天${isWeekday ? '是' : '不是'}工作日`);
    return isWeekday;
  } catch (error) {
    // API调用失败时，按照常规工作日判断
    console.log('节假日API调用失败，使用默认判断:', error.message);
    const dayOfWeek = date.getDay();
    const isWeekday = dayOfWeek > 0 && dayOfWeek < 6; // 周一到周五
    console.log(`按照周末判断，今天${isWeekday ? '是' : '不是'}工作日`);
    return isWeekday;
  }
}

/**
 * 获取打卡类型
 * @param {Date} date 时间
 * @returns {string|null} 打卡类型 (ONCLOCK/OFFCLOCK)
 */
function getPunchCardType(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  console.log(`当前时间: ${hour}:${minute}`);
  
  // 上班卡时间：7:00-8:00
  if (hour === 7) {
    console.log('在上班打卡时间范围内');
    return "ONCLOCK";
  }
  
  // 下班卡时间：18:00-22:00
  if (hour >= 18 && hour < 22) {
    console.log('在下班打卡时间范围内');
    return "OFFCLOCK";
  }
  
  console.log('不在打卡时间范围内');
  // 不在打卡时间范围内
  return null;
}

/**
 * 调用智谱AI API 生成有情绪价值的打卡消息
 * @param {string} punchType 打卡类型
 * @param {boolean} isSuccess 是否成功
 * @returns {Promise<string>} 生成的消息
 */
async function generateEmotionalMessage(punchType, isSuccess, errorDetails = null) {
  const zhipuApiKey = process.env.ZHIPU_API_KEY;
  
  // 如果没有配置智谱AI API Key，则返回默认消息
  if (!zhipuApiKey) {
    console.log('未配置智谱AI API Key，使用默认消息');
    if (isSuccess) {
      return `✅ 自动打卡成功\n打卡类型: ${punchType === 'ONCLOCK' ? '上班' : '下班'}\n时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n状态: 成功`;
    } else {
      let message = `❌ 自动打卡失败\n打卡类型: ${punchType === 'ONCLOCK' ? '上班' : '下班'}\n时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
      if (errorDetails) {
        message += `\n错误: ${errorDetails}`;
      }
      return message;
    }
  }
  
  try {
    // 构造提示词
    let prompt;
    if (isSuccess) {
      prompt = `你是一个积极乐观的助手，请为用户生成一条有情绪价值的打卡成功消息。要求：
1. 表达对用户按时打卡的赞赏
2. 用积极正面的语言鼓励用户
3. 可以包含一些温馨提醒或祝福
4. 保持专业但友好的语调
5. 打卡类型是${punchType === 'ONCLOCK' ? '上班' : '下班'}打卡
6. 请用中文回复，不要超过200字

示例格式：
🎉 打卡成功！
[积极正面的内容]
[温馨提醒或祝福]`;
    } else {
      prompt = `你是一个贴心的助手，请为用户生成一条有情绪价值的打卡失败消息。要求：
1. 表达理解和安慰
2. 用温和的语言鼓励用户
3. 可以提供一些建议或帮助
4. 保持专业但友好的语调
5. 打卡类型是${punchType === 'ONCLOCK' ? '上班' : '下班'}打卡
6. 如果有错误详情，请适当提及但不要过于technical
7. 请用中文回复，不要超过200字

示例格式：
😔 打卡遇到问题了
[理解和安慰的内容]
[鼓励和建议]`;
    }
    
    // 调用智谱AI API
    const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      model: 'glm-4.5-flash',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer ${zhipuApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 返回生成的内容
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content.trim();
    } else {
      // 如果API调用失败，返回默认消息
      console.log('智谱AI API 返回内容为空，使用默认消息');
      if (isSuccess) {
        return `✅ 自动打卡成功\n打卡类型: ${punchType === 'ONCLOCK' ? '上班' : '下班'}\n时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n状态: 成功`;
      } else {
        let message = `❌ 自动打卡失败\n打卡类型: ${punchType === 'ONCLOCK' ? '上班' : '下班'}\n时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
        if (errorDetails) {
          message += `\n错误: ${errorDetails}`;
        }
        return message;
      }
    }
  } catch (error) {
    console.error('调用智谱AI API失败:', error.message);
    // 如果API调用失败，返回默认消息
    if (isSuccess) {
      return `✅ 自动打卡成功\n打卡类型: ${punchType === 'ONCLOCK' ? '上班' : '下班'}\n时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n状态: 成功`;
    } else {
      let message = `❌ 自动打卡失败\n打卡类型: ${punchType === 'ONCLOCK' ? '上班' : '下班'}\n时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
      if (errorDetails) {
        message += `\n错误: ${errorDetails}`;
      }
      return message;
    }
  }
}

/**
 * 推送消息到飞书机器人
 * @param {string} message 消息内容
 */
async function sendFeishuMessage(message) {
  const feishuWebhook = process.env.FEISHU_BOT_WEBHOOK;
  
  // 如果没有配置飞书机器人webhook，则不推送消息
  if (!feishuWebhook) {
    console.log('未配置飞书机器人webhook，跳过消息推送');
    return;
  }
  
  try {
    const payload = {
      msg_type: 'text',
      content: {
        text: message
      }
    };
    
    const response = await axios.post(feishuWebhook, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('飞书消息推送成功');
    } else {
      console.error('飞书消息推送失败，状态码:', response.status);
    }
  } catch (error) {
    console.error('飞书消息推送失败:', error.message);
  }
}

/**
 * 执行打卡操作
 */
async function punchCard() {
  // 从环境变量获取配置
  const url = process.env.PUNCH_URL || 'https://example.com/api/attendance/app/attendance/punchCard';
  const token = process.env.PUNCH_TOKEN;
  const appVersionNumber = process.env.APP_VERSION_NUMBER || '3';
  
  // 检查必要环境变量
  if (!token) {
    throw new Error('缺少必要的环境变量: PUNCH_TOKEN');
  }
  
  // 判断是否为工作日
  const now = new Date();
  const workday = await isWorkday(now);
  
  if (!workday) {
    console.log('今天不是工作日，无需打卡');
    return;
  }
  
  // 获取打卡类型
  const punchCardType = getPunchCardType(now);
  
  if (!punchCardType) {
    console.log('当前时间不在打卡时间范围内');
    return;
  }
  
  // 构造请求头
  const headers = {
    'Content-Type': 'application/json',
    'authentication': token,
    'appversionnumber': appVersionNumber
  };
  
  // 构造请求体
  const data = {
    remark: '',
    punchCardType: punchCardType,
    longitude: 113.36405324137161,
    latitude: 23.14080953899491,
    address: '广东省广州市天河区华景路1号'
  };
  
  try {
    console.log(`开始执行${punchCardType === 'ONCLOCK' ? '上班' : '下班'}打卡`);
    
    // 发送打卡请求
    const response = await axios.post(url, data, { headers });
    
    if (response.status === 200) {
      console.log('打卡成功:', response.data);
      // 生成成功消息并推送
      const message = await generateEmotionalMessage(punchCardType, true);
      await sendFeishuMessage(message);
    } else {
      console.error('打卡失败，状态码:', response.status);
      // 生成失败消息并推送
      const message = await generateEmotionalMessage(punchCardType, false, `状态码: ${response.status}`);
      await sendFeishuMessage(message);
    }
  } catch (error) {
    console.error('打卡请求失败:', error.message);
    
    // 生成失败消息并推送
    const errorDetails = error.response ? 
      `${error.message} - ${JSON.stringify(error.response.data)}` : 
      error.message;
    const message = await generateEmotionalMessage(punchCardType, false, errorDetails);
    await sendFeishuMessage(message);
  }
}

// 如果直接运行此脚本，则执行打卡
if (require.main === module) {
  punchCard().catch(console.error);
}

module.exports = punchCard;