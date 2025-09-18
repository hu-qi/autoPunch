// 本地测试脚本
require('dotenv').config(); // 加载 .env 文件中的环境变量

const punchCard = require('./index.js');

// 执行打卡
punchCard().catch(console.error);