📖 Overview
This integration eliminates manual data entry by automatically creating Asana tasks from Google Form submissions. Each submission is intelligently routed to the appropriate Asana section with emoji labels for visual organization.

🎥 Video Demo [Watch the Demo Video]: https://www.loom.com/share/90dbadb6074a4c25bb3b7cb937dcc5ed

✨ Key Features

🎯 Automatic Routing: Form submissions automatically go to the correct Asana section
🎨 Emoji Labels: Visual identification with custom emoji mapping
⚡ Instant Processing: Real-time task creation via Google Apps Script triggers
📊 Priority Mapping: Automatic priority assignment (Low, Medium, High, Urgent)
🔧 Customizable: Easy to modify section mappings and emoji choices
📝 Rich Context: Includes requester email, description, and metadata

🏗️ Architecture
┌─────────────────┐
│  Google Form    │
│  (User Input)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google Sheets   │
│ (Data Storage)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Apps Script    │
│  (Trigger)      │
└────────┬────────┘
         │ POST /webhook
         ▼
┌─────────────────┐
│ Express Server  │
│ (Node.js)       │
└────────┬────────┘
         │ Asana API
         ▼
┌─────────────────┐
│  Asana Project  │
│  (Tasks)        │
└─────────────────┘
🚀 Quick Start
Prerequisites

Node.js >= 14.0.0
Google Form connected to Google Sheets
Asana account with API access
ngrok (for local development) or a deployed server

Installation

Clone the repository

bash   git clone https://github.com/aliyahandthecloud/-google-forms-asana-integration.git
   cd -google-forms-asana-integration

Install dependencies

bash   npm install

Configure environment variables

bash   cp .env.example .env
Edit .env with your credentials:
env   ASANA_ACCESS_TOKEN=your_asana_personal_access_token
   ASANA_PROJECT_ID=your_asana_project_id
   PORT=3000

Start the server

bash   node server.js

Expose your local server (development)

bash   ngrok http 3000
Copy the ngrok HTTPS URL for the Apps Script configuration.
⚙️ Configuration
Step 1: Set Up Google Form
Create a Google Form with these field names:

First Name (Short answer)
Last Name (Short answer)
Email (Short answer)
Request Type (Multiple choice):

New Customer Onboarding
Integration Issue
Feature Requests
Training Requests
Account/Billing Question
Something else?


Request Description (Paragraph)
Priority (Multiple choice): Low, Medium, High, Urgent

Step 2: Configure Google Apps Script

Open your Google Sheet (linked to the form)
Go to Extensions > Apps Script
Paste the code from trigger.gs
Update the webhook URL with your server URL:

javascript   const WEBHOOK_URL = 'YOUR_SERVER_URL/webhook';

Set up a trigger:

Click Triggers (clock icon)
Add Trigger
Function: onFormSubmit
Event source: From spreadsheet
Event type: On form submit



Step 3: Create Asana Sections
In your Asana project, create these sections (must match exactly):

🆕 New Customer Onboarding
🛠️ Integration Issue
✨ Feature Requests
📚 Training Requests
🧾 Account/Billing Question
❓ Something Else?

Step 4: Customize Mappings (Optional)
Edit server.js to customize emoji and section mappings:
javascriptconst EMOJI_MAP = {
  'New Customer Onboarding': '🆕',
  'Integration Issue': '🛠️',
  // Add your own...
};

const SECTION_MAP = {
  'New Customer Onboarding': '🆕 New Customer Onboarding',
  'Integration Issue': '🛠️ Integration Issue',
  // Add your own...
};
📚 API Documentation
Endpoints
GET /
Health check endpoint.
Response:
json{
  "message": "Google Forms → Asana Integration Server is running! 🚀"
}
GET /debug-sections
Lists all sections in your Asana project (useful for debugging).
Response:
json{
  "count": 6,
  "sections": [
    {
      "name": "🆕 New Customer Onboarding",
      "gid": "1234567890"
    }
  ]
}
POST /webhook
Receives form submissions from Google Apps Script.
Request Body:
json{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah.johnson@example.com",
  "requestType": "Feature Requests",
  "description": "Add dark mode to dashboard",
  "priority": "High"
}
Response:
json{
  "success": true,
  "message": "Task created successfully!",
  "taskId": "1234567890"
}
🧪 Testing
Test with cURL
bashcurl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "requestType": "Feature Requests",
    "description": "This is a test request",
    "priority": "Medium"
  }'
🚢 Deployment
Option 1: Railway

Install Railway CLI: npm install -g @railway/cli
Login: railway login
Initialize: railway init
Add environment variables in Railway dashboard
Deploy: railway up

Option 2: Render

Connect your GitHub repository
Set environment variables in dashboard
Deploy automatically on push

Important: After deploying, update the webhook URL in your Apps Script!
🐛 Troubleshooting
Tasks not appearing in Asana

Check server logs for errors
Verify section names match exactly (including emojis)
Use /debug-sections endpoint to see available sections
Confirm Asana Project ID is correct

Apps Script not triggering

Check trigger is set to "On form submit"
Verify webhook URL is correct (include https://)
Check Apps Script execution logs
Test manually by running the function

Server connection errors

Verify ngrok is running (for local development)
Check firewall settings
Confirm environment variables are set
Check server logs: node server.js

📊 Project Structure
google-forms-asana-integration/
├── server.js              # Express server with routing logic
├── trigger.gs             # Google Apps Script trigger code
├── .env.example           # Environment variable template
├── .gitignore            # Git ignore file
├── package.json          # Node.js dependencies
├── package-lock.json     # Dependency lock file
└── README.md             # This file
🔒 Security Best Practices

✅ Never commit .env file
✅ Use environment variables for all secrets
✅ Keep Asana access token secure
✅ Use HTTPS in production
✅ Regularly rotate API tokens

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
👤 Contact
Aliyah Brack

LinkedIn: linkedin.com/in/aliyah-brack
Email: aliyahbrackpm@gmail.com
GitHub: @aliyahandthecloud


⭐ If this project helped you, please consider giving it a star!
