# 📅 ThaiDatePicker (BE / AD) – MUI Custom Component

Custom React DatePicker สำหรับ **ปฏิทินไทย (พ.ศ.)**
รองรับทั้ง **เลือกวัน / เดือน / ปี / เวลา**
และส่งค่ากลับเป็น **ค.ศ. (AD format string)** เพื่อเก็บลงฐานข้อมูลได้ทันที

พัฒนาโดยใช้:

* React
* TypeScript
* MUI (Material UI)
* Custom `dateUtils`

---

## ✨ Features

* ✅ แสดงปี **พ.ศ. (Buddhist Era)**
* ✅ ส่งค่ากลับเป็น **ค.ศ. (AD format: YYYY-MM-DD / YYYY-MM-DD HH:mm)**
* ✅ เลือกแบบ 3 ระดับ:

  * Day View
  * Month View
  * Year View
* ✅ รองรับเวลา (optional)
* ✅ Mask input อัตโนมัติ (DD/MM/YYYY)
* ✅ Controlled Component (ใช้กับ form ได้)
* ✅ Today button
* ✅ รองรับ `fullWidth`, `size="small"` และ props ของ MUI TextField

---

# 📦 Installation

ต้องมี:

```bash
npm install @mui/material @mui/icons-material
```

---

# 📁 File Structure

```
components/
  ThaiDatePicker.tsx
  dateUtils.ts
```

---

# 🧠 Data Format

| Layer              | Format           |
| ------------------ | ---------------- |
| Display            | 18/02/2569       |
| Internal (JS Date) | Date object      |
| Output to parent   | 2026-02-18       |
| With time          | 2026-02-18 14:30 |

---

# 🚀 Basic Usage

```tsx
import ThaiDatePicker from './ThaiDatePicker'

const [date, setDate] = useState("")

<ThaiDatePicker
  label="ตั้งแต่วันที่"
  value={date}
  onChange={setDate}
  fullWidth
  size="small"
/>
```

---

# ⏱ Usage With Time

```tsx
const [dateTime, setDateTime] = useState("")

<ThaiDatePicker
  label="วันเวลานัดหมาย"
  value={dateTime}
  onChange={setDateTime}
  withTime
  fullWidth
/>
```

Output:

```
2026-02-18 14:30
```

---

# 🎛 View Modes

### 1️⃣ Day View

* เลือกวัน
* แสดง highlight วันนี้
* แสดง selected day

### 2️⃣ Month View

* กดชื่อเดือนด้านบนเพื่อเปิด
* เลือกเดือน → กลับไป day view

### 3️⃣ Year View

* กดปี (พ.ศ.)
* แสดงช่วงปี
* เลือกปี → ไป month view

---

# 🔁 View Flow

```
Open
  ↓
Day View
  ↓ (click month)
Month View
  ↓ (click year)
Year View
```

เลือกปี → เดือน → วัน

---

# 🧾 Props

| Prop      | Type                 | Required | Description               |
| --------- | -------------------- | -------- | ------------------------- |
| value     | string               | ✅        | AD string เช่น 2026-02-18 |
| onChange  | (value:string)=>void | ✅        | callback                  |
| label     | string               | ❌        | TextField label           |
| withTime  | boolean              | ❌        | เปิดโหมดเวลา              |
| disabled  | boolean              | ❌        | disable input             |
| fullWidth | boolean              | ❌        | full width                |
| size      | "small" | "medium"   | ❌        | MUI size                  |

---

# 🎨 Styling

สามารถ override ผ่าน MUI props:

```tsx
<ThaiDatePicker
  sx={{ backgroundColor: "#fff" }}
  InputLabelProps={{ shrink: true }}
/>
```

---

# 🧮 dateUtils Requirements

ไฟล์ `dateUtils.ts` ต้องมี:

* formatThaiDate
* parseThaiDate
* formatThaiDateTime
* parseThaiDateTime
* formatADDate
* parseADDate
* formatADDateTime
* parseADDateTime
* BE_OFFSET (543)
* THAI_MONTHS
* getDaysInMonth
* getFirstDayOfMonth

---

# 🛠 Example dateUtils (ย่อ)

```ts
export const BE_OFFSET = 543

export const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  ...
]
```

---

# 🧩 Integration Example (With MUI Grid Form)

```tsx
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    <ThaiDatePicker
      label="วันเริ่มต้น"
      value={dateFrom}
      onChange={setDateFrom}
      fullWidth
      size="small"
    />
  </Grid>

  <Grid item xs={12} md={6}>
    <ThaiDatePicker
      label="วันสิ้นสุด"
      value={dateTo}
      onChange={setDateTo}
      withTime
      fullWidth
      size="small"
    />
  </Grid>
</Grid>
```

---

# 🧪 Behavior Details

### Typing Input

* รองรับการพิมพ์ตัวเลขเท่านั้น
* ใส่ / อัตโนมัติ
* ถ้า format ครบ → แปลงเป็น AD แล้วส่งออก

### Clear Behavior

* ถ้า parent set value = "" → input clear

### Close Behavior

* ถ้า withTime = false → เลือกวันแล้วปิด
* ถ้า withTime = true → ต้องกด “ตกลง”

---

# 🔒 Controlled Component Pattern

```tsx
const [date, setDate] = useState("2026-02-18")

<ThaiDatePicker
  value={date}
  onChange={setDate}
/>
```

---

# ⚙️ Production Ready

รองรับ:

* Government systems (ปี พ.ศ.)
* ERP systems
* Database AD storage
* MUI Form validation
* Controlled React forms

---

# 📌 Roadmap (Optional Future Enhancements)

* Range Picker
* minDate / maxDate
* disableFuture / disablePast
* Keyboard navigation
* Animation slide
* Dark mode optimization

---

# 🏁 License

Internal / Custom Component
สามารถนำไปใช้ในระบบองค์กรได้ทันที

---

ถ้าต้องการ:

* เวอร์ชัน Range
* รองรับ Validation แบบ react-hook-form
* รองรับ MUI v6 slotProps
* แพ็กเป็น npm private package

บอกได้เลย เดี๋ยวจัดเวอร์ชัน Enterprise ให้ 🚀
