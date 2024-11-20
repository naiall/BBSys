const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware สำหรับจัดการ JSON, URL-encoded data และ CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Endpoint สำหรับรับข้อมูล BO และ BT
app.post("/api/data", (req, res) => {
  try {
    const { bo, bt } = req.body;

    // ตรวจสอบว่าข้อมูลที่ส่งมาถูกต้องหรือไม่
    if (!bo || !bt) {
      return res.status(400).json({
        status: "error",
        message: "Missing parameters BO or BT",
      });
    }

    if (typeof bo !== "string" || typeof bt !== "string") {
      return res.status(400).json({
        status: "error",
        message: "BO and BT must be strings",
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
  } catch (error) {
    // จัดการข้อผิดพลาด
    console.error("Error processing request:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

// จัดการ route อื่นที่ไม่พบ
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
  });
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
