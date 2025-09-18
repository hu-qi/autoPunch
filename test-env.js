// 测试环境变量处理
require('dotenv').config({ path: '.env.test' });

console.log('环境变量测试:');
console.log('PUNCH_URL:', process.env.PUNCH_URL || '未设置，使用默认值');
console.log('PUNCH_TOKEN:', process.env.PUNCH_TOKEN ? '已设置' : '未设置');
console.log('APP_VERSION_NUMBER:', process.env.APP_VERSION_NUMBER || '未设置，使用默认值');
console.log('FEISHU_BOT_WEBHOOK:', process.env.FEISHU_BOT_WEBHOOK ? '已设置' : '未设置');
console.log('ZHIPU_API_KEY:', process.env.ZHIPU_API_KEY ? '已设置' : '未设置');