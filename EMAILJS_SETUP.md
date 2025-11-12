# EmailJS Setup Guide

## Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Add Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.) or "Other SMTP"
4. For Hostinger email, you'll likely need to use "Other SMTP" with these settings:
   - SMTP Server: `smtp.hostinger.com`
   - Port: `587` (or `465` for SSL)
   - Username: Your full Hostinger email address
   - Password: Your email password
   - Security: TLS/SSL

## Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

**Subject:** New Contact Form Message from {{from_name}}

**Content:**
```
Hello,

You have received a new message from your website contact form:

Name: {{from_name}}
Email: {{from_email}}

Message:
{{message}}

---
This message was sent from your website contact form.
```

4. Save the template and note the Template ID

## Step 4: Get Your Keys
1. Go to "Account" → "General"
2. Note your Public Key
3. Go to "Email Services" and note your Service ID
4. Go to "Email Templates" and note your Template ID

## Step 5: Update Your Code
Replace these values in your `ContactSection.tsx` file:

```typescript
const serviceId = 'YOUR_SERVICE_ID'; // Replace with your actual service ID
const templateId = 'YOUR_TEMPLATE_ID'; // Replace with your actual template ID  
const publicKey = 'YOUR_PUBLIC_KEY'; // Replace with your actual public key
```

## Step 6: Test Your Form
1. Start your development server: `npm run dev`
2. Go to your contact form
3. Fill out and submit the form
4. Check your Hostinger email for the message

## Free Plan Limits
- 200 emails per month
- Perfect for most small business websites
- No credit card required

## Troubleshooting
- Make sure your SMTP settings are correct for Hostinger
- Check that your template variables match the code ({{from_name}}, {{from_email}}, {{message}})
- Verify your public key is correct
- Check browser console for any error messages

## Security Note
Never commit your actual EmailJS keys to version control. Consider using environment variables for production.



