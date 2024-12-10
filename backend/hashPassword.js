import bcrypt from "bcryptjs";

const generateHashedPassword = async () => {
  const password = "test123"; // The plain-text password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log("Hashed Password:", hashedPassword);
};

generateHashedPassword();
