# 🚀 Digital Bodyguard - Netlify Deployment Guide

This guide will walk you through deploying the Digital Bodyguard AI application to Netlify.

## Prerequisites

Before you begin, make sure you have:

1. ✅ A [Netlify account](https://app.netlify.com/signup) (free tier works great)
2. ✅ A [Gemini API key](https://aistudio.google.com/) from Google AI Studio
3. ✅ (Optional) An [ElevenLabs API key](https://elevenlabs.io/) for voice features
4. ✅ (Optional) A [Datadog account](https://www.datadoghq.com/) for production monitoring

---

## 🎯 Quick Deploy (Recommended)

The fastest way to deploy is using the "Deploy to Netlify" button:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/senushidinara/DIGITAL-BODYGUARD)

This will:
1. Fork the repository to your GitHub account
2. Create a new site on Netlify
3. Connect the repository for automatic deployments

After deployment, you'll need to add environment variables (see below).

---

## 📝 Manual Deployment Steps

### Step 1: Fork or Clone the Repository

**Option A: Fork on GitHub**
1. Go to the [repository](https://github.com/senushidinara/DIGITAL-BODYGUARD)
2. Click the "Fork" button in the top-right corner

**Option B: Clone locally**
```bash
git clone https://github.com/senushidinara/DIGITAL-BODYGUARD.git
cd DIGITAL-BODYGUARD
```

### Step 2: Connect to Netlify

**Option A: Using Netlify Dashboard (Easiest)**

1. Log in to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select the `DIGITAL-BODYGUARD` repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
6. Click **"Deploy site"**

**Option B: Using Netlify CLI**

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize the site
netlify init

# Deploy
netlify deploy --prod
```

### Step 3: Configure Environment Variables

Environment variables are essential for the AI features to work. Here's how to add them:

#### Via Netlify Dashboard:

1. Go to your site in Netlify Dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **"Add a variable"** and add the following:

| Variable Name | Description | Required |
|--------------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key | ⚠️ Optional |
| `ELEVENLABS_AGENT_ID` | Your ElevenLabs agent ID | ⚠️ Optional |
| `DATADOG_WEBHOOK_SECRET` | Webhook authentication secret | ⚠️ Optional |

#### Via Netlify CLI:

```bash
# Set Gemini API key (required)
netlify env:set GEMINI_API_KEY "your_gemini_api_key_here"

# Set ElevenLabs credentials (optional)
netlify env:set ELEVENLABS_API_KEY "your_elevenlabs_key_here"
netlify env:set ELEVENLABS_AGENT_ID "your_agent_id_here"

# Set Datadog secret (optional)
netlify env:set DATADOG_WEBHOOK_SECRET "your_webhook_secret_here"
```

### Step 4: Trigger a Redeploy

After adding environment variables, trigger a new deployment:

**Via Dashboard:**
- Go to **Deploys** → Click **"Trigger deploy"** → **"Deploy site"**

**Via CLI:**
```bash
netlify deploy --prod
```

### Step 5: Verify Deployment

1. Open your deployed site URL (e.g., `https://your-site.netlify.app`)
2. You should see the Digital Bodyguard interface
3. Test the "Manual Interdiction" feature by clicking **"EVALUATE PAYLOAD"**
4. Check the console for any errors

---

## 🔧 Setting Up Integrations

### Datadog Integration

1. **Create a Webhook in Datadog:**
   - Go to Datadog → **Integrations** → **Webhooks**
   - Click **"New Webhook"**
   - Name: "Digital Bodyguard"
   - URL: `https://your-site.netlify.app/.netlify/functions/datadog-webhook`
   - Payload format: JSON

2. **Create Security Monitors:**
   - Go to **Monitors** → **New Monitor**
   - Example monitors:
     - Failed login attempts > 5 in 1 minute
     - Unauthorized API access
     - Unrecognized IP address logins

3. **Configure Alert Notifications:**
   - In monitor settings, add your webhook as a notification channel
   - Include relevant alert data in the JSON payload

### ElevenLabs Voice Setup

1. **Create a Conversational AI Agent:**
   - Sign up at [ElevenLabs](https://elevenlabs.io/)
   - Create a new Conversational AI agent
   - Choose a calm, professional voice profile
   - Configure the agent to handle security conversations

2. **Get Your Credentials:**
   - API Key: Found in your account settings
   - Agent ID: Found in your agent's configuration

3. **Test the Voice Feature:**
   ```bash
   curl -X POST https://your-site.netlify.app/.netlify/functions/trigger-voice-call \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "+1234567890",
       "script": "This is a test security alert from your Digital Bodyguard."
     }'
   ```

---

## 🧪 Testing Your Deployment

### Test 1: Frontend Interface
1. Open your site URL
2. The Digital Bodyguard interface should load
3. Try the manual alert simulation

### Test 2: Datadog Webhook
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/datadog-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "alert": "Test brute force attack",
    "location": "Moscow, RU",
    "user_current_location": "New York, US",
    "attempts": 50,
    "id": "test_001",
    "timestamp": "2024-01-01T10:00:00Z"
  }'
```

Expected response: `{"success":true,"message":"Alert received and queued for analysis",...}`

### Test 3: AI Threat Analysis
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/analyze-threat \
  -H "Content-Type: application/json" \
  -d '{
    "alert": "Suspicious login detected",
    "location": "Unknown",
    "user_current_location": "New York, US",
    "attempts": 3
  }'
```

Expected response: AI analysis with threat assessment

---

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY not configured" error

**Solution:**
1. Verify environment variable is set in Netlify Dashboard
2. Trigger a redeploy after adding the variable
3. Check function logs: `netlify functions:log analyze-threat`

### Issue: Build fails

**Solution:**
1. Check build logs in Netlify Dashboard
2. Verify `package.json` dependencies are correct
3. Try local build: `npm install && npm run build`

### Issue: Voice calls not working

**Solution:**
1. Verify `ELEVENLABS_API_KEY` is set
2. Check ElevenLabs account quota
3. Review function logs for API errors

### Issue: Serverless functions return 404

**Solution:**
1. Verify `netlify.toml` is in the repository root
2. Check functions are in `netlify/functions/` directory
3. Ensure TypeScript files are being compiled (Netlify handles this automatically)

---

## 📊 Monitoring Your Deployment

### Netlify Analytics
- Go to **Analytics** tab in Netlify Dashboard
- Monitor page views, performance, and bandwidth

### Function Logs
```bash
# View logs for a specific function
netlify functions:log datadog-webhook
netlify functions:log analyze-threat
netlify functions:log trigger-voice-call
```

### Set Up Alerts
- Configure Netlify to send you email notifications for:
  - Failed deployments
  - Build errors
  - Function errors (via external monitoring)

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Always use Netlify environment variables
2. **Use webhook secrets** - Add authentication to your Datadog webhook
3. **Enable HTTPS only** - Netlify provides this by default
4. **Monitor API usage** - Track Gemini and ElevenLabs API consumption
5. **Set up rate limiting** - Consider using Netlify Edge Functions for rate limiting
6. **Review function logs** - Regularly check for suspicious activity

---

## 🚀 Advanced Configuration

### Custom Domain

1. Go to **Domain settings** in Netlify Dashboard
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

### Deploy Previews

Netlify automatically creates deploy previews for pull requests:
- Preview URL format: `deploy-preview-{pr-number}--your-site.netlify.app`
- Great for testing changes before merging

### Split Testing

Test different versions:
1. Go to **Split Testing** in Netlify Dashboard
2. Set up branch-based split tests
3. Monitor which version performs better

---

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [ElevenLabs API Documentation](https://elevenlabs.io/docs)
- [Datadog Webhooks Guide](https://docs.datadoghq.com/integrations/webhooks/)

---

## 💬 Need Help?

If you encounter issues:
1. Check the [GitHub Issues](https://github.com/senushidinara/DIGITAL-BODYGUARD/issues)
2. Review Netlify function logs
3. Consult the main [README.md](README.md)

---

**🎉 Congratulations!** Your Digital Bodyguard is now live and protecting your digital assets!
