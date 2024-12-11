import { User } from "../models/userSchema.js";

export const sendNotification = async (userId, message) => {
  try {
    const user = await User.findById(userId);

    if (!user) throw new Error("User not found!");

    user.notifications.push({ message });
    await user.save();
  } catch (error) {
    console.error("Error sending notification:", error.message);
  }
};
