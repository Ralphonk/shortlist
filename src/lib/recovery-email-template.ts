/** Email-client-friendly tables and inline styles; no remote assets or tracking. */
export function recoveryEmailTemplate(code: string) {
  if (!/^\d{6}$/.test(code)) {
    throw new Error("Invalid verification code format");
  }

  return {
    subject: "Reset your password | Shortlist",
    text: `Shortlist

Reset your password

Enter this verification code in the Shortlist password-reset window:

${code}

This code expires in 5 minutes and can only be used once.

Never share this code. Shortlist will never ask you to send it by email.
If you didn't request a password reset, you can ignore this email. Your password hasn't changed.

Your next chapter starts here.
Shortlist`,
    html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset your password</title></head>
<body style="margin:0;padding:0;background-color:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#202735;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">Your Shortlist password-reset code is valid for 5 minutes. Never share it.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f6f7f9;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;background-color:#ffffff;border:1px solid #e9ecf0;border-radius:16px;">
<tr><td style="padding:28px 28px 24px;border-bottom:1px solid #e9ecf0;">
<div style="font-size:30px;line-height:36px;font-weight:700;letter-spacing:-1px;color:#202735;"><span style="color:#7152dc;">&#9672;</span> shortlist</div>
<div style="margin-top:6px;padding-left:31px;font-size:10px;line-height:16px;letter-spacing:2px;color:#969ca8;">YOUR NEXT CHAPTER</div>
</td></tr>
<tr><td style="padding:30px 28px;">
<h1 style="margin:0 0 14px;font-size:26px;line-height:34px;font-weight:600;color:#202735;">Reset your password</h1>
<p style="margin:0 0 24px;font-size:16px;line-height:25px;color:#606775;">Let&rsquo;s get you back to your workspace. Enter the code below in the password-reset window.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:22px 12px;background-color:#f3f0fc;border:1px solid #e8e0fb;border-radius:10px;">
<div style="margin-bottom:10px;font-size:12px;line-height:18px;letter-spacing:1.5px;color:#7f6aab;">YOUR VERIFICATION CODE</div>
<div style="font-family:Consolas,'Courier New',monospace;font-size:34px;line-height:44px;letter-spacing:6px;font-weight:700;color:#6241cc;white-space:nowrap;">${code}</div>
</td></tr></table>
<p style="margin:16px 0 26px;text-align:center;font-size:14px;line-height:22px;color:#606775;">Expires in <strong>5 minutes</strong> &middot; One-time use</p>
<p style="margin:0 0 10px;font-size:14px;line-height:23px;color:#343b49;"><strong>Keep this code private.</strong> Shortlist will never ask you to send it by email.</p>
<p style="margin:0;font-size:14px;line-height:23px;color:#7a8290;">Didn&rsquo;t request this? You can ignore this email. Your password hasn&rsquo;t changed.</p>
</td></tr>
<tr><td style="padding:20px 28px;border-top:1px solid #e9ecf0;font-size:12px;line-height:20px;color:#7a8290;">Your next chapter starts here.<br><strong style="color:#7152dc;">Shortlist</strong> &nbsp; Account security</td></tr>
</table></td></tr></table></body></html>`,
  };
}
