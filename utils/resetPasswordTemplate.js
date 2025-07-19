const resetPasswordTemplate = (name, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hello ${name || "User"},</h2>
      <p>We received a request to reset your password.</p>
      <p>Click the button below to reset your password. This link will expire in 5 minutes.</p>
      <a href="${resetUrl}" style="
          display:inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 10px;
      ">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <br>
      <p>Thanks,<br>The Support Team</p>
    </div>
  `;
};

export default resetPasswordTemplate;
