const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware สำหรับจัดการ JSON และ URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint สำหรับรับข้อมูล BO และ BT
app.post("/api/data", (req, res) => {
  const { bo, bt } = req.body;

  // ตรวจสอบว่ามีค่าหรือไม่
  if (!bo || !bt) {
    return res.status(400).json({
      status: "error",
      message: "Missing parameters BO or BT",
    });
  }

  // สร้างลิงก์ QR Code
  const qrCodeLink = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `https://example.com/process?bo=${bo}&bt=${bt}`
  )}`;

  // ส่งผลลัพธ์กลับ
  res.json({
    status: "success",
    bo: bo,
    bt: bt,
    qrCodeUrl: qrCodeLink,
  });
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
