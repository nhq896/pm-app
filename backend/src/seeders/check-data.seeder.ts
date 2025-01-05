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

const checkSeedData = async () => {
  console.log("🔍 Checking seed data in database...");

  try {
    await connectDatabase();

    // Count documents in each collection
    const roleCounts = await RoleModel.countDocuments();
    const userCounts = await UserModel.countDocuments();
    const accountCounts = await AccountModel.countDocuments();
    const workspaceCounts = await WorkspaceModel.countDocuments();
    const memberCounts = await MemberModel.countDocuments();
    const projectCounts = await ProjectModel.countDocuments();
    const taskCounts = await TaskModel.countDocuments();

    console.log("\n📊 DATABASE STATISTICS:");
    console.log("========================");
    console.log(`👥 Users: ${userCounts}`);
    console.log(`🔐 Accounts: ${accountCounts}`);
    console.log(`🏢 Workspaces: ${workspaceCounts}`);
    console.log(`👥 Members: ${memberCounts}`);
    console.log(`📁 Projects: ${projectCounts}`);
    console.log(`✅ Tasks: ${taskCounts}`);
    console.log(`🛡️  Roles: ${roleCounts}`);

    // Check if we have expected sample data
    if (
      userCounts >= 6 &&
      workspaceCounts >= 4 &&
      projectCounts >= 13 &&
      taskCounts >= 37
    ) {
      console.log("\n✅ SAMPLE DATA STATUS: Complete!");

      // Show sample users
      console.log("\n👤 SAMPLE USERS:");
      const users = await UserModel.find({}).select("name email").limit(5);
      users.forEach((user) => {
        console.log(`   - ${user.name} (${user.email})`);
      });

      // Show workspaces
      console.log("\n🏢 WORKSPACES:");
      const workspaces = await WorkspaceModel.find({}).select(
        "name description"
      );
      workspaces.forEach((workspace) => {
        console.log(`   - ${workspace.name}`);
      });

      // Show task distribution by status
      console.log("\n📈 TASK STATUS DISTRIBUTION:");
      const tasksByStatus = await TaskModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      tasksByStatus.forEach((status) => {
        console.log(`   - ${status._id}: ${status.count} tasks`);
      });
    } else {
      console.log("\n⚠️  SAMPLE DATA STATUS: Incomplete or missing!");
      console.log("\n💡 To seed sample data, run:");
      console.log("   npm run seed:all");
    }

    if (roleCounts === 0) {
      console.log("\n❌ ROLES MISSING! Run: npm run seed:roles");
    } else if (roleCounts >= 3) {
      console.log("\n✅ ROLES: Complete!");
      const roles = await RoleModel.find({}).select("name");
      roles.forEach((role) => {
        console.log(`   - ${role.name}`);
      });
    }
  } catch (error) {
    console.error("❌ Error checking data:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

checkSeedData().catch((error) =>
  console.error("❌ Error running check data script:", error)
);
