import bcrypt from "bcryptjs";

const PEPPER = process.env.PEPPER_SECRET || "";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(12); // Generate unique salt
  const hashedPassword = await bcrypt.hash(password + PEPPER, salt);
  return { hashedPassword, salt };
};

export const verifyPassword = async (password: string, hashedPassword: string, salt: string) => {
  return bcrypt.compare(password + PEPPER, hashedPassword);
};
