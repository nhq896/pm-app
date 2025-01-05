import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";

// Models
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import WorkspaceModel from "../models/workspace.model";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import RoleModel from "../models/roles-permission.model";

// Enums
import { ProviderEnum } from "../enums/account-provider.enum";
import { Roles } from "../enums/role.enum";
import { TaskStatusEnum, TaskPriorityEnum } from "../enums/task.enum";

// Utils
import { hashValue } from "../utils/bcrypt";

const seedSampleData = async () => {
  console.log("🚀 Starting sample data seeding...");

  try {
    await connectDatabase();
    const session = await mongoose.startSession();
    session.startTransaction();

    // Lấy roles từ DB
    const ownerRole = await RoleModel.findOne({ name: Roles.OWNER }).session(
      session
    );
    const adminRole = await RoleModel.findOne({ name: Roles.ADMIN }).session(
      session
    );
    const memberRole = await RoleModel.findOne({ name: Roles.MEMBER }).session(
      session
    );

    if (!ownerRole || !adminRole || !memberRole) {
      throw new Error("Roles not found. Please run role seeder first!");
    }

    // 1. Tạo Users mẫu
    console.log("👤 Creating sample users...");

    const usersData = [
      {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        profilePicture:
          "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150",
      },
      {
        name: "Nguyễn Văn An",
        email: "an@example.com",
        password: "password123",
        profilePicture:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      },
      {
        name: "Trần Thị Bình",
        email: "binh@example.com",
        password: "password123",
        profilePicture:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      },
      {
        name: "Lê Minh Cường",
        email: "cuong@example.com",
        password: "password123",
        profilePicture:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      },
      {
        name: "Phạm Thu Dung",
        email: "dung@example.com",
        password: "password123",
        profilePicture:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      },
      {
        name: "Hoàng Văn Em",
        email: "em@example.com",
        password: "password123",
        profilePicture:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      },
    ];

    // Hash passwords và tạo users một cách tuần tự để trigger pre-save hooks
    const createdUsers = [];
    for (const userData of usersData) {
      const user = new UserModel(userData);
      await user.save({ session });
      createdUsers.push(user);
    }

    console.log(`✅ Created ${createdUsers.length} users`);

    // 2. Tạo Accounts cho users
    console.log("🔐 Creating accounts...");
    const accounts = createdUsers.map((user) => ({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: user.email,
    }));

    await AccountModel.insertMany(accounts, { session });
    console.log(`✅ Created ${accounts.length} accounts`);

    // 3. Tạo Workspaces mẫu
    console.log("🏢 Creating sample workspaces...");

    const workspaces = [
      {
        name: "Test Workspace",
        description: "Workspace để test và demo các tính năng",
        owner: createdUsers[0]._id, // Test User
      },
      {
        name: "Công ty TNHH Tech Solutions",
        description: "Workspace cho dự án phát triển phần mềm và ứng dụng",
        owner: createdUsers[1]._id, // Nguyễn Văn An
      },
      {
        name: "Startup E-commerce",
        description: "Workspace cho dự án thương mại điện tử",
        owner: createdUsers[2]._id, // Trần Thị Bình
      },
      {
        name: "Agency Marketing Digital",
        description: "Workspace cho các chiến dịch marketing và quảng cáo",
        owner: createdUsers[3]._id, // Lê Minh Cường
      },
    ];

    const createdWorkspaces = await WorkspaceModel.insertMany(workspaces, {
      session,
    });
    console.log(`✅ Created ${createdWorkspaces.length} workspaces`);

    // 4. Cập nhật currentWorkspace cho users
    console.log("🔄 Updating user current workspaces...");
    for (let i = 0; i < createdUsers.length; i++) {
      const workspaceIndex = i < createdWorkspaces.length ? i : 0;
      await UserModel.findByIdAndUpdate(
        createdUsers[i]._id,
        { currentWorkspace: createdWorkspaces[workspaceIndex]._id },
        { session }
      );
    }

    // 5. Tạo Members cho workspaces
    console.log("👥 Creating workspace members...");

    const members = [
      // Workspace 0 - Test Workspace
      {
        userId: createdUsers[0]._id, // Test User
        workspaceId: createdWorkspaces[0]._id,
        role: ownerRole._id,
      },
      {
        userId: createdUsers[1]._id, // Nguyễn Văn An
        workspaceId: createdWorkspaces[0]._id,
        role: adminRole._id,
      },
      {
        userId: createdUsers[2]._id, // Trần Thị Bình
        workspaceId: createdWorkspaces[0]._id,
        role: memberRole._id,
      },

      // Workspace 1 - Tech Solutions
      {
        userId: createdUsers[1]._id, // Nguyễn Văn An
        workspaceId: createdWorkspaces[1]._id,
        role: ownerRole._id,
      },
      {
        userId: createdUsers[2]._id, // Trần Thị Bình
        workspaceId: createdWorkspaces[1]._id,
        role: adminRole._id,
      },
      {
        userId: createdUsers[3]._id, // Lê Minh Cường
        workspaceId: createdWorkspaces[1]._id,
        role: memberRole._id,
      },
      {
        userId: createdUsers[4]._id, // Phạm Thu Dung
        workspaceId: createdWorkspaces[1]._id,
        role: memberRole._id,
      },

      // Workspace 2 - E-commerce
      {
        userId: createdUsers[2]._id, // Trần Thị Bình
        workspaceId: createdWorkspaces[2]._id,
        role: ownerRole._id,
      },
      {
        userId: createdUsers[1]._id, // Nguyễn Văn An
        workspaceId: createdWorkspaces[2]._id,
        role: adminRole._id,
      },
      {
        userId: createdUsers[5]._id, // Hoàng Văn Em
        workspaceId: createdWorkspaces[2]._id,
        role: memberRole._id,
      },

      // Workspace 3 - Marketing
      {
        userId: createdUsers[3]._id, // Lê Minh Cường
        workspaceId: createdWorkspaces[3]._id,
        role: ownerRole._id,
      },
      {
        userId: createdUsers[4]._id, // Phạm Thu Dung
        workspaceId: createdWorkspaces[3]._id,
        role: adminRole._id,
      },
      {
        userId: createdUsers[5]._id, // Hoàng Văn Em
        workspaceId: createdWorkspaces[3]._id,
        role: memberRole._id,
      },
    ];

    await MemberModel.insertMany(members, { session });
    console.log(`✅ Created ${members.length} members`);

    // 6. Tạo Projects mẫu
    console.log("📁 Creating sample projects...");

    const projects = [
      // Workspace 0 - Test Workspace projects
      {
        name: "Demo Project",
        description: "Dự án demo để test tính năng",
        emoji: "🎯",
        workspace: createdWorkspaces[0]._id,
        createdBy: createdUsers[0]._id, // Test User
      },
      {
        name: "Task Management System",
        description: "Hệ thống quản lý công việc và dự án",
        emoji: "📋",
        workspace: createdWorkspaces[0]._id,
        createdBy: createdUsers[0]._id, // Test User
      },
      {
        name: "E-learning Platform",
        description: "Nền tảng học tập trực tuyến",
        emoji: "🎓",
        workspace: createdWorkspaces[0]._id,
        createdBy: createdUsers[1]._id, // Nguyễn Văn An
      },
      {
        name: "Chat Application",
        description: "Ứng dụng chat realtime với Socket.io",
        emoji: "💬",
        workspace: createdWorkspaces[0]._id,
        createdBy: createdUsers[2]._id, // Trần Thị Bình
      },
      {
        name: "Dashboard Analytics",
        description: "Dashboard phân tích dữ liệu và báo cáo",
        emoji: "📊",
        workspace: createdWorkspaces[0]._id,
        createdBy: createdUsers[0]._id, // Test User
      },
      {
        name: "Blog CMS",
        description: "Hệ thống quản lý nội dung blog",
        emoji: "📝",
        workspace: createdWorkspaces[0]._id,
        createdBy: createdUsers[1]._id, // Nguyễn Văn An
      },

      // Workspace 1 - Tech Solutions projects
      {
        name: "Website Công ty",
        description:
          "Phát triển website giới thiệu công ty với React & Node.js",
        emoji: "🌐",
        workspace: createdWorkspaces[1]._id,
        createdBy: createdUsers[1]._id, // Nguyễn Văn An
      },
      {
        name: "Mobile App iOS",
        description: "Ứng dụng di động cho nền tảng iOS",
        emoji: "📱",
        workspace: createdWorkspaces[1]._id,
        createdBy: createdUsers[2]._id, // Trần Thị Bình
      },
      {
        name: "API Backend",
        description: "Phát triển API backend cho các dự án",
        emoji: "⚡",
        workspace: createdWorkspaces[1]._id,
        createdBy: createdUsers[1]._id, // Nguyễn Văn An
      },

      // Workspace 2 - E-commerce projects
      {
        name: "Sàn thương mại điện tử",
        description: "Xây dựng marketplace online",
        emoji: "🛒",
        workspace: createdWorkspaces[2]._id,
        createdBy: createdUsers[2]._id, // Trần Thị Bình
      },
      {
        name: "Payment Gateway",
        description: "Tích hợp cổng thanh toán",
        emoji: "💳",
        workspace: createdWorkspaces[2]._id,
        createdBy: createdUsers[1]._id, // Nguyễn Văn An
      },

      // Workspace 3 - Marketing projects
      {
        name: "Campaign Facebook Ads",
        description: "Chiến dịch quảng cáo Facebook cho khách hàng",
        emoji: "📢",
        workspace: createdWorkspaces[3]._id,
        createdBy: createdUsers[3]._id, // Lê Minh Cường
      },
      {
        name: "Content Marketing",
        description: "Sản xuất nội dung marketing cho website",
        emoji: "✍️",
        workspace: createdWorkspaces[3]._id,
        createdBy: createdUsers[4]._id, // Phạm Thu Dung
      },
    ];

    const createdProjects = await ProjectModel.insertMany(projects, {
      session,
    });
    console.log(`✅ Created ${createdProjects.length} projects`);

    // 7. Tạo Tasks mẫu
    console.log("✅ Creating sample tasks...");

    const tasks = [
      // Test Workspace - Demo Project tasks
      {
        title: "Setup Project Structure",
        description: "Tạo cấu trúc dự án cơ bản với các thư mục chính",
        project: createdProjects[0]._id, // Demo Project
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.DONE,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[0]._id, // Test User
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
      {
        title: "Create Database Schema",
        description: "Thiết kế và triển khai database schema cho dự án",
        project: createdProjects[0]._id, // Demo Project
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.DONE,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[1]._id, // Nguyễn Văn An
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        title: "Implement Authentication",
        description: "Tích hợp hệ thống xác thực với JWT và OAuth",
        project: createdProjects[0]._id, // Demo Project
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.IN_PROGRESS,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[2]._id, // Trần Thị Bình
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      },
      {
        title: "Design UI Components",
        description: "Thiết kế các component UI cơ bản cho dự án",
        project: createdProjects[0]._id, // Demo Project
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.IN_REVIEW,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[1]._id, // Nguyễn Văn An
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      {
        title: "Write Unit Tests",
        description: "Viết unit tests cho các modules chính",
        project: createdProjects[0]._id, // Demo Project
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.TODO,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: null,
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },

      // Test Workspace - Task Management System tasks
      {
        title: "Create Task Model",
        description: "Tạo model và schema cho tasks trong hệ thống",
        project: createdProjects[1]._id, // Task Management System
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.DONE,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[0]._id, // Test User
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        title: "Build Task Dashboard",
        description: "Phát triển dashboard hiển thị tổng quan tasks",
        project: createdProjects[1]._id, // Task Management System
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.IN_PROGRESS,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[1]._id, // Nguyễn Văn An
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      },
      {
        title: "Implement Drag & Drop",
        description: "Tích hợp tính năng kéo thả cho kanban board",
        project: createdProjects[1]._id, // Task Management System
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.BACKLOG,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[2]._id, // Trần Thị Bình
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
      },
      {
        title: "Add Real-time Notifications",
        description: "Thêm thông báo real-time khi có cập nhật task",
        project: createdProjects[1]._id, // Task Management System
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.TODO,
        priority: TaskPriorityEnum.LOW,
        assignedTo: null,
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days
      },

      // Test Workspace - E-learning Platform tasks
      {
        title: "Design Course Structure",
        description: "Thiết kế cấu trúc khóa học và bài giảng",
        project: createdProjects[2]._id, // E-learning Platform
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.DONE,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[1]._id, // Nguyễn Văn An
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      },
      {
        title: "Build Video Player",
        description: "Phát triển video player tùy chỉnh cho bài giảng",
        project: createdProjects[2]._id, // E-learning Platform
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.IN_PROGRESS,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[2]._id, // Trần Thị Bình
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      },
      {
        title: "Create Quiz System",
        description: "Xây dựng hệ thống quiz và đánh giá học viên",
        project: createdProjects[2]._id, // E-learning Platform
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.TODO,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[0]._id, // Test User
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days
      },
      {
        title: "Implement Progress Tracking",
        description: "Theo dõi tiến độ học tập của học viên",
        project: createdProjects[2]._id, // E-learning Platform
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.BACKLOG,
        priority: TaskPriorityEnum.LOW,
        assignedTo: null,
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days
      },

      // Test Workspace - Chat Application tasks
      {
        title: "Setup Socket.io Server",
        description: "Cấu hình server Socket.io cho real-time messaging",
        project: createdProjects[3]._id, // Chat Application
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.DONE,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[2]._id, // Trần Thị Bình
        createdBy: createdUsers[2]._id,
        dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      },
      {
        title: "Build Chat Interface",
        description: "Thiết kế giao diện chat với emoji và file sharing",
        project: createdProjects[3]._id, // Chat Application
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.IN_PROGRESS,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[1]._id, // Nguyễn Văn An
        createdBy: createdUsers[2]._id,
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
      },
      {
        title: "Add Voice Messages",
        description: "Tích hợp tính năng gửi tin nhắn voice",
        project: createdProjects[3]._id, // Chat Application
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.TODO,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[0]._id, // Test User
        createdBy: createdUsers[2]._id,
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days
      },
      {
        title: "Implement Group Chat",
        description: "Phát triển tính năng chat nhóm và quản lý members",
        project: createdProjects[3]._id, // Chat Application
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.IN_REVIEW,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[1]._id, // Nguyễn Văn An
        createdBy: createdUsers[2]._id,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      },

      // Test Workspace - Dashboard Analytics tasks
      {
        title: "Create Data Models",
        description: "Thiết kế models cho analytics và reporting",
        project: createdProjects[4]._id, // Dashboard Analytics
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.DONE,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[0]._id, // Test User
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
      {
        title: "Build Chart Components",
        description: "Tạo các components chart với Chart.js hoặc D3",
        project: createdProjects[4]._id, // Dashboard Analytics
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.IN_PROGRESS,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[1]._id, // Nguyễn Văn An
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days
      },
      {
        title: "Add Data Filtering",
        description: "Thêm tính năng lọc dữ liệu theo thời gian và category",
        project: createdProjects[4]._id, // Dashboard Analytics
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.TODO,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[2]._id, // Trần Thị Bình
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
      },
      {
        title: "Export Report Feature",
        description: "Tính năng xuất báo cáo ra PDF và Excel",
        project: createdProjects[4]._id, // Dashboard Analytics
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.BACKLOG,
        priority: TaskPriorityEnum.LOW,
        assignedTo: null,
        createdBy: createdUsers[0]._id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },

      // Test Workspace - Blog CMS tasks
      {
        title: "Design Content Editor",
        description: "Thiết kế rich text editor cho việc viết bài",
        project: createdProjects[5]._id, // Blog CMS
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.DONE,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[1]._id, // Nguyễn Văn An
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
      },
      {
        title: "Build Comment System",
        description: "Hệ thống comment với reply và moderation",
        project: createdProjects[5]._id, // Blog CMS
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.IN_PROGRESS,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[2]._id, // Trần Thị Bình
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days
      },
      {
        title: "Add SEO Features",
        description: "Tích hợp các tính năng SEO: meta tags, sitemap, etc.",
        project: createdProjects[5]._id, // Blog CMS
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.TODO,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[0]._id, // Test User
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days
      },
      {
        title: "Implement Media Gallery",
        description: "Quản lý hình ảnh và media files cho blog",
        project: createdProjects[5]._id, // Blog CMS
        workspace: createdWorkspaces[0]._id,
        status: TaskStatusEnum.IN_REVIEW,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[1]._id, // Nguyễn Văn An
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days
      },

      // Website Công ty tasks (Other workspaces)
      {
        title: "Thiết kế UI/UX Homepage",
        description: "Tạo wireframe và mockup cho trang chủ website",
        project: createdProjects[6]._id, // Website Công ty
        workspace: createdWorkspaces[1]._id,
        status: TaskStatusEnum.DONE,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[1]._id,
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      {
        title: "Phát triển Frontend React",
        description: "Code giao diện frontend với React và TailwindCSS",
        project: createdProjects[6]._id, // Website Công ty
        workspace: createdWorkspaces[1]._id, // Tech Solutions
        status: TaskStatusEnum.IN_PROGRESS,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[2]._id,
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
      {
        title: "Setup Backend API",
        description: "Cấu hình Node.js, Express và MongoDB",
        project: createdProjects[6]._id, // Website Công ty
        workspace: createdWorkspaces[1]._id, // Tech Solutions
        status: TaskStatusEnum.TODO,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[3]._id,
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
      },

      // Mobile App tasks
      {
        title: "Research iOS Development",
        description: "Nghiên cứu công nghệ và framework phù hợp",
        project: createdProjects[7]._id, // Mobile App iOS
        workspace: createdWorkspaces[1]._id, // Tech Solutions
        status: TaskStatusEnum.DONE,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[2]._id,
        createdBy: createdUsers[2]._id,
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        title: "Tạo Project Structure",
        description: "Setup project Swift với Xcode",
        project: createdProjects[7]._id, // Mobile App iOS
        workspace: createdWorkspaces[1]._id, // Tech Solutions
        status: TaskStatusEnum.IN_REVIEW,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[3]._id,
        createdBy: createdUsers[2]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      },

      // API Backend tasks
      {
        title: "Thiết kế Database Schema",
        description: "Thiết kế cấu trúc database và relationships",
        project: createdProjects[8]._id, // API Backend
        workspace: createdWorkspaces[1]._id, // Tech Solutions
        status: TaskStatusEnum.BACKLOG,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: null,
        createdBy: createdUsers[1]._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      },

      // E-commerce tasks
      {
        title: "Phân tích yêu cầu khách hàng",
        description: "Thu thập và phân tích requirements từ stakeholders",
        project: createdProjects[9]._id, // Sàn thương mại điện tử
        workspace: createdWorkspaces[2]._id, // E-commerce
        status: TaskStatusEnum.DONE,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[2]._id,
        createdBy: createdUsers[2]._id,
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        title: "Thiết kế catalog sản phẩm",
        description: "Tạo giao diện hiển thị danh sách sản phẩm",
        project: createdProjects[9]._id, // Sàn thương mại điện tử
        workspace: createdWorkspaces[2]._id, // E-commerce
        status: TaskStatusEnum.IN_PROGRESS,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[5]._id,
        createdBy: createdUsers[2]._id,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days
      },

      // Payment Gateway tasks
      {
        title: "Tích hợp VNPay",
        description: "Setup và test payment gateway VNPay",
        project: createdProjects[10]._id, // Payment Gateway
        workspace: createdWorkspaces[2]._id, // E-commerce
        status: TaskStatusEnum.TODO,
        priority: TaskPriorityEnum.HIGH,
        assignedTo: createdUsers[1]._id,
        createdBy: createdUsers[2]._id,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
      },

      // Marketing tasks
      {
        title: "Lập chiến lược content",
        description: "Xây dựng content plan cho Q1 2024",
        project: createdProjects[11]._id, // Campaign Facebook Ads
        workspace: createdWorkspaces[3]._id, // Marketing
        status: TaskStatusEnum.IN_REVIEW,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: createdUsers[4]._id,
        createdBy: createdUsers[3]._id,
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
      },
      {
        title: "Thiết kế banner quảng cáo",
        description: "Tạo creative cho Facebook và Google Ads",
        project: createdProjects[11]._id, // Campaign Facebook Ads
        workspace: createdWorkspaces[3]._id, // Marketing
        status: TaskStatusEnum.TODO,
        priority: TaskPriorityEnum.LOW,
        assignedTo: createdUsers[5]._id,
        createdBy: createdUsers[3]._id,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      },

      // Content Marketing tasks
      {
        title: "Viết blog về SEO",
        description: "Tạo bài viết hướng dẫn SEO cho website",
        project: createdProjects[12]._id, // Content Marketing
        workspace: createdWorkspaces[3]._id, // Marketing
        status: TaskStatusEnum.BACKLOG,
        priority: TaskPriorityEnum.MEDIUM,
        assignedTo: null,
        createdBy: createdUsers[4]._id,
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days
      },
    ];

    await TaskModel.insertMany(tasks, { session });
    console.log(`✅ Created ${tasks.length} tasks`);

    await session.commitTransaction();
    session.endSession();

    console.log("🎉 Sample data seeding completed successfully!");
    console.log(`
📊 Summary:
- ${createdUsers.length} Users
- ${accounts.length} Accounts  
- ${createdWorkspaces.length} Workspaces
- ${members.length} Members
- ${createdProjects.length} Projects
- ${tasks.length} Tasks

🔐 Demo accounts (password: password123):
- test@example.com (Owner - Test Workspace) ⭐ MAIN TEST ACCOUNT
- an@example.com (Owner - Tech Solutions)
- binh@example.com (Owner - E-commerce) 
- cuong@example.com (Owner - Marketing)
- dung@example.com (Member)
- em@example.com (Member)
    `);
  } catch (error) {
    console.error("❌ Error during sample data seeding:", error);
  } finally {
    process.exit(0);
  }
};

seedSampleData().catch((error) =>
  console.error("❌ Error running sample data seed script:", error)
);
