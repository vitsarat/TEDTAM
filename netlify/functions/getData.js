const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const filePath = path.join(__dirname, 'performanceData.json');
    let data;

    try {
      data = await fs.readFile(filePath, 'utf-8');
      data = JSON.parse(data);
    } catch (error) {
      // ถ้าไฟล์ไม่มี ให้ส่ง array ว่าง
      data = [];
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error retrieving data', error: error.message }),
    };
  }
};