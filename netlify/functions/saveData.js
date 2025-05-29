const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // ตรวจสอบว่าเป็น POST request
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      };
    }

    // ดึงข้อมูลจาก body
    const data = JSON.parse(event.body);

    // บันทึกข้อมูลลงในไฟล์ JSON
    const filePath = path.join(__dirname, 'performanceData.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data saved successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error saving data', error: error.message }),
    };
  }
};