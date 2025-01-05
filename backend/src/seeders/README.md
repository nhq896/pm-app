# Database Seeders

Thư mục này chứa các scripts để seed dữ liệu mẫu cho database MongoDB.

## 📁 Cấu trúc

- `role.seeder.ts` - Seed roles và permissions cho hệ thống
- `sample-data.seeder.ts` - Seed dữ liệu mẫu đầy đủ
- `clear-data.seeder.ts` - Xóa tất cả dữ liệu trong database

## 🚀 Cách sử dụng

### Script commands có sẵn:

```bash
# Seed chỉ roles (cần thiết trước khi seed data khác)
npm run seed:roles

# Seed dữ liệu mẫu (cần roles có sẵn)
npm run seed:sample

# Seed tất cả (roles + sample data)
npm run seed:all

# Xóa tất cả dữ liệu
npm run seed:clear

# Reset hoàn toàn (xóa + seed lại từ đầu)
npm run seed:reset
```

### Thứ tự khuyến nghị:

#### Lần đầu setup:

```bash
cd backend
npm run seed:all
```

#### Reset database về trạng thái ban đầu:

```bash
npm run seed:reset
```

#### Chỉ thêm dữ liệu mẫu (khi đã có roles):

```bash
npm run seed:sample
```

## 📊 Dữ liệu mẫu bao gồm:

### 👤 Users (6 users)

- **Test User** (test@example.com) - Owner của "Test Workspace" ⭐ **MAIN TEST ACCOUNT**
- **Nguyễn Văn An** (an@example.com) - Owner của "Tech Solutions"
- **Trần Thị Bình** (binh@example.com) - Owner của "E-commerce"
- **Lê Minh Cường** (cuong@example.com) - Owner của "Marketing"
- **Phạm Thu Dung** (dung@example.com) - Member
- **Hoàng Văn Em** (em@example.com) - Member

**Password cho tất cả accounts: `password123`**

### 🏢 Workspaces (4 workspaces)

1. **Test Workspace** - Workspace để test và demo tính năng ⭐
2. **Công ty TNHH Tech Solutions** - Phần mềm & ứng dụng
3. **Startup E-commerce** - Thương mại điện tử
4. **Agency Marketing Digital** - Marketing & quảng cáo

### 📁 Projects (13 projects)

- **Test Workspace**: Demo Project, Task Management System, E-learning Platform, Chat Application, Dashboard Analytics, Blog CMS
- **Tech Solutions**: Website Công ty, Mobile App iOS, API Backend
- **E-commerce**: Sàn thương mại điện tử, Payment Gateway
- **Marketing**: Campaign Facebook Ads, Content Marketing

### ✅ Tasks (37 tasks)

- **24 tasks** cho Test Workspace với đa dạng tính năng
- **13 tasks** cho các workspace khác
- Status phân bổ: DONE(10), TODO(9), IN_PROGRESS(8), IN_REVIEW(5), BACKLOG(5)
- Priority khác nhau: LOW, MEDIUM, HIGH
- Có assignee và due dates đa dạng

### 👥 Members & Roles

- Mỗi workspace có Owner, Admin và Members
- Phân quyền theo hệ thống RBAC

## ⚠️ Lưu ý quan trọng

1. **Cần có file `.env`** đã cấu hình MONGO_URI trước khi chạy
2. **Roles cần được seed trước** dữ liệu khác (vì có dependency)
3. **Dữ liệu mẫu sẽ ghi đè** nếu chạy nhiều lần
4. Script sử dụng **MongoDB transactions** để đảm bảo data integrity

## 🔧 Troubleshooting

### Lỗi "Roles not found":

```bash
# Chạy lại seed roles trước
npm run seed:roles
npm run seed:sample
```

### Lỗi connection MongoDB:

- Kiểm tra MONGO_URI trong file `.env`
- Đảm bảo MongoDB server đang chạy

### Lỗi duplicate key:

```bash
# Clear data và seed lại
npm run seed:reset
```
