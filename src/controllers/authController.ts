import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/db";
import AppProperties from "../config/appProperties";
import { UserAccount } from "../entities/users";

const { JWT_SECRET } = AppProperties;

export const loginUsers = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "email and password are required" });
  }

  try {
    const repo = AppDataSource.getRepository(UserAccount);

    const user = await repo.findOne({
      where: { email },
      relations: { role: true },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: "Invalid password" });
    }

    const payload = {
      userId: user.id,
      instituteId: user.instituteId,
      roleId: user.roleId,
      roleCode: user.role?.code,
      email: user.email,
      fullName: user.fullName,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    user.lastLoginAt = new Date();
    await repo.save(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      userContext: {
        id: user.id,
        instituteId: user.instituteId,
        roleId: user.roleId,
        roleCode: user.role?.code,
        regNo: user.regNo,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
