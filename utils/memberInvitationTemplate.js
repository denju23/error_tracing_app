// utils/templates/memberInvitationTemplate.js

const memberInvitationTemplate = (name,role, projectId, invitationUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hello ${name || "User"},</h2>
      <p>You have been invited to join the project <strong>${projectId}</strong>.</p>
      <p>Your role: <strong>${role}</strong></p>
      <p>Click the button below to accept the invitation:</p>
      <a href="${invitationUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #28a745;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 10px;
      ">Accept Invitation</a>
      <p>Or visit: <a href="${invitationUrl}">${invitationUrl}</a></p>
      <br />
      <p>Thanks,<br />Project Team</p>
    </div>
  `;
};

export default memberInvitationTemplate;
