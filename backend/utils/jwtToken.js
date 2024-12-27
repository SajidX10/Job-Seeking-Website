export const sendToken = (user, statusCode, res, message) => {
  // Generate JWT token for the user
  const token = user.getJWTToken();

  // Define cookie options
  const options = {
    expires: new Date(
      Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000 // Ensure COOKIE_EXPIRE is converted to a number
    ),
    httpOnly: true, // Prevent client-side access to the cookie
    secure: process.env.NODE_ENV === "production", // Set secure to true only in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Use "None" for cross-origin cookies in production
  };

  // Set the cookie and send the response
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    message,
    token,
  });
};
