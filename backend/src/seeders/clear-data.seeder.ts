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

const clearAllData = async () => {
  console.log("🗑️  Starting to clear all data...");

  try {
    await connectDatabase();
    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("🧹 Clearing tasks...");
    await TaskModel.deleteMany({}, { session });

    console.log("🧹 Clearing projects...");
    await ProjectModel.deleteMany({}, { session });

    console.log("🧹 Clearing members...");
    await MemberModel.deleteMany({}, { session });

    console.log("🧹 Clearing workspaces...");
    await WorkspaceModel.deleteMany({}, { session });

    console.log("🧹 Clearing accounts...");
    await AccountModel.deleteMany({}, { session });

    console.log("🧹 Clearing users...");
    await UserModel.deleteMany({}, { session });

    console.log("🧹 Clearing roles...");
    await RoleModel.deleteMany({}, { session });

    await session.commitTransaction();
    session.endSession();

    console.log("✅ All data cleared successfully!");
  } catch (error) {
    console.error("❌ Error during data clearing:", error);
  } finally {
    process.exit(0);
  }
};

clearAllData().catch((error) =>
  console.error("❌ Error running clear data script:", error)
);
