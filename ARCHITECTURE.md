# 🏗️ Digital Bodyguard Architecture

## System Overview

The Digital Bodyguard is a serverless, AI-powered security automation platform that follows a "Sense-Think-Act" pattern. The entire application is deployed on Netlify and uses serverless functions for backend processing.

## Technology Stack

### Frontend
- **Framework:** React 19.0.0
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS (via CDN)
- **UI Components:** Lucide React icons
- **Charts:** Recharts
- **Language:** TypeScript 5.8.2

### Backend (Serverless Functions)
- **Platform:** Netlify Functions
- **Runtime:** Node.js 20
- **Language:** TypeScript
- **AI Engine:** Google Gemini 2.0 Flash
- **Voice AI:** ElevenLabs Conversational AI

### Monitoring & Alerts
- **Telemetry:** Datadog
- **Observability:** Datadog LLM Observability (optional)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         NETLIFY PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              FRONTEND (React SPA)                       │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  • App.tsx (Main UI)                         │     │    │
│  │  │  • Threat Dashboard                          │     │    │
│  │  │  • Reasoning Terminal                        │     │    │
│  │  │  • Manual Alert Simulator                    │     │    │
│  │  │  • Voice Interdiction Display                │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            │ API Calls                          │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         SERVERLESS FUNCTIONS (Backend)                 │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────┐     │    │
│  │  │  datadog-webhook.ts                         │     │    │
│  │  │  • Receives security alerts from Datadog   │     │    │
│  │  │  • Validates payload                        │     │    │
│  │  │  • Returns acknowledgment                   │     │    │
│  │  └─────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────┐     │    │
│  │  │  analyze-threat.ts                          │     │    │
│  │  │  • Receives alert data                      │     │    │
│  │  │  • Calls Gemini AI for analysis             │     │    │
│  │  │  • Returns threat assessment                │     │    │
│  │  │  • Executes function calls                  │     │    │
│  │  └─────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────┐     │    │
│  │  │  trigger-voice-call.ts                      │     │    │
│  │  │  • Receives call request                    │     │    │
│  │  │  • Initiates ElevenLabs voice call          │     │    │
│  │  │  • Returns call status                      │     │    │
│  │  └─────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ External API Calls
                            ▼
        ┌───────────────────────────────────────────┐
        │         EXTERNAL SERVICES                  │
        │                                            │
        │  ┌──────────────────────────────────┐   │
        │  │  Google Gemini AI                │   │
        │  │  • Threat analysis               │   │
        │  │  • Function calling              │   │
        │  │  • Natural language generation   │   │
        │  └──────────────────────────────────┘   │
        │                                            │
        │  ┌──────────────────────────────────┐   │
        │  │  ElevenLabs                      │   │
        │  │  • Voice call initiation         │   │
        │  │  • Conversational AI             │   │
        │  └──────────────────────────────────┘   │
        │                                            │
        │  ┌──────────────────────────────────┐   │
        │  │  Datadog                         │   │
        │  │  • Security monitoring           │   │
        │  │  • Alert generation              │   │
        │  │  • Webhook triggers              │   │
        │  └──────────────────────────────────┘   │
        └───────────────────────────────────────────┘
```

## Data Flow

### 1. Alert Reception Flow

```
Datadog Monitor Trigger
         │
         ▼
Webhook POST to /netlify/functions/datadog-webhook
         │
         ▼
Validation & Logging
         │
         ▼
Queue for Analysis
         │
         ▼
Frontend Display (via polling or websocket)
```

### 2. Threat Analysis Flow

```
User/System Submits Alert
         │
         ▼
POST to /netlify/functions/analyze-threat
         │
         ▼
Parse Alert Data
         │
         ▼
Call Gemini AI with System Instructions
         │
         ▼
Gemini Analyzes Threat
         │
         ├─── Calculates Threat Probability (0-100%)
         │
         └─── Decides on Tools to Call
                  │
                  ├─── > 90%: lock_user_account()
                  │
                  ├─── 50-89%: trigger_elevenlabs_call()
                  │
                  └─── < 50%: Log and Monitor
         │
         ▼
Return Analysis + Function Calls to Frontend
         │
         ▼
Frontend Displays Results & Actions
```

### 3. Voice Interdiction Flow

```
Gemini Decides Voice Call Needed
         │
         ▼
POST to /netlify/functions/trigger-voice-call
         │
         ▼
ElevenLabs API Call
         │
         ├─── Phone Number
         ├─── Voice Script
         └─── Agent Configuration
         │
         ▼
Call Initiated
         │
         ▼
User Receives Call
         │
         ▼
Conversational AI Interaction
         │
         ▼
User Confirms/Denies Action
         │
         ▼
Result Logged & Displayed
```

## Component Breakdown

### Frontend Components

#### App.tsx
Main application component that orchestrates the entire UI:
- **State Management:** Uses React hooks for local state
- **Alert Processing:** Handles threat analysis workflow
- **Action Management:** Tracks security actions and their status
- **UI Sections:**
  - Header with system status
  - Risk environment chart
  - Manual interdiction input
  - Reasoning terminal (action log)
  - Threat ingestion feed

#### Constants.tsx
Configuration and constant values:
- System instructions for Gemini AI
- Icon definitions
- Initial sample alerts
- Security policy text

#### Types.ts
TypeScript type definitions:
- SecurityAlert
- SecurityAction
- AIReasoning
- SecurityLevel enum

### Backend Functions

#### datadog-webhook.ts
Webhook endpoint for Datadog alerts:
- **Input:** JSON payload from Datadog
- **Processing:** Validates and logs alert
- **Output:** Acknowledgment response
- **Security:** CORS headers, input validation

#### analyze-threat.ts
AI-powered threat analysis:
- **Input:** Security alert JSON
- **Processing:** 
  - Initializes Gemini AI client
  - Sends alert with system instructions
  - Receives AI analysis and function calls
- **Output:** Threat assessment and recommended actions
- **AI Configuration:**
  - Model: gemini-2.0-flash-exp
  - Temperature: 0.1 (deterministic)
  - Tools: lock_account, rotate_keys, trigger_voice

#### trigger-voice-call.ts
Voice call initiation:
- **Input:** Phone number and script
- **Processing:** Calls ElevenLabs API
- **Output:** Call status and ID
- **Fallback:** Simulates call if API key not configured

### Service Layer

#### services/gemini.ts
Client-side service for AI interaction:
- **Dual Mode:** Works in both dev and production
- **Production:** Calls serverless function
- **Development:** Direct API call (if configured)
- **Function Declarations:** Defines available tools for AI

## Security Architecture

### Authentication & Authorization
- **API Keys:** Stored as Netlify environment variables
- **No Client Exposure:** Keys never exposed to frontend
- **CORS:** Properly configured for function access

### Data Protection
- **HTTPS Only:** All communication encrypted
- **No Persistent Storage:** Stateless functions
- **Input Validation:** All inputs validated before processing

### Prompt Injection Protection
- **System Instructions:** Locked and not user-modifiable
- **Temperature Control:** Low temperature for consistent behavior
- **Output Validation:** Function calls validated before execution

## Scalability

### Serverless Benefits
- **Auto-scaling:** Functions scale automatically with load
- **Cost Efficient:** Pay only for actual usage
- **Global CDN:** Static assets served from edge locations
- **Zero Maintenance:** No server management required

### Performance Optimization
- **Bundle Size:** ~657KB gzipped to ~188KB
- **Code Splitting:** Consider dynamic imports for large routes
- **CDN Caching:** Static assets cached at edge
- **Function Cold Starts:** Minimal due to lightweight dependencies

## Monitoring & Observability

### Netlify Analytics
- Page views and traffic patterns
- Function invocation metrics
- Build and deploy logs

### Custom Monitoring (Optional)
- Datadog LLM Observability for AI calls
- Custom error tracking
- Performance monitoring

### Logging Strategy
- Function logs for debugging
- AI reasoning output logged
- Security events tracked

## Environment Variables

| Variable | Purpose | Required | Default |
|----------|---------|----------|---------|
| GEMINI_API_KEY | Gemini AI authentication | Yes | None |
| ELEVENLABS_API_KEY | ElevenLabs authentication | No | None |
| ELEVENLABS_AGENT_ID | Voice agent configuration | No | "default" |
| DATADOG_WEBHOOK_SECRET | Webhook security | No | None |

## Deployment Pipeline

```
Code Push to GitHub
         │
         ▼
Netlify Detects Change
         │
         ▼
Fetch Repository
         │
         ▼
Install Dependencies (npm install)
         │
         ▼
Build Frontend (npm run build)
         │
         ├─── Compile TypeScript
         ├─── Bundle with Vite
         ├─── Optimize assets
         └─── Copy public files
         │
         ▼
Build Functions
         │
         ├─── Compile TypeScript functions
         ├─── Bundle dependencies
         └─── Generate Lambda packages
         │
         ▼
Deploy to CDN
         │
         ├─── Upload static assets to edge
         ├─── Deploy functions to Lambda
         └─── Update routing rules
         │
         ▼
Site Live!
```

## Future Enhancements

### Planned Features
1. **Real-time Updates:** WebSocket support for live alerts
2. **User Authentication:** Multi-user support with auth
3. **Alert History:** Persistent storage with database
4. **Custom Rules:** User-defined threat detection rules
5. **Multi-channel Alerts:** SMS, Email, Slack integration
6. **Dashboard Analytics:** Threat trends and statistics
7. **API Rate Limiting:** Edge function-based rate limiting
8. **Advanced AI Models:** Support for multiple AI providers

### Scalability Improvements
1. **Database Integration:** Add PostgreSQL or DynamoDB
2. **Message Queue:** Use SQS or Redis for async processing
3. **Caching Layer:** Add Redis for frequently accessed data
4. **Load Testing:** Performance testing at scale

## Troubleshooting Guide

### Common Issues

**Build Failures**
- Check TypeScript compilation errors
- Verify all dependencies are installed
- Review build logs in Netlify dashboard

**Function Errors**
- Verify environment variables are set
- Check function logs for errors
- Test functions locally with Netlify CLI

**AI Not Responding**
- Confirm GEMINI_API_KEY is valid
- Check API quota limits
- Review Gemini API status page

**Voice Calls Failing**
- Verify ELEVENLABS_API_KEY is set
- Check ElevenLabs account balance
- Test with curl command first

## Best Practices

### Development
1. Test locally with `npm run dev:netlify`
2. Use `.env` for local development
3. Never commit `.env` files
4. Run build before pushing changes

### Production
1. Monitor function logs regularly
2. Set up error notifications
3. Review AI outputs for quality
4. Keep dependencies updated
5. Test all integrations end-to-end

### Security
1. Rotate API keys periodically
2. Use webhook secrets
3. Monitor for unusual activity
4. Keep audit logs
5. Follow principle of least privilege

---

This architecture provides a robust, scalable, and secure foundation for the Digital Bodyguard AI security automation platform.
