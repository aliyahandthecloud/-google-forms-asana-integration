require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// 🎨 STEP 1: EMOJI MAP (This is YOUR custom logic!)
// ============================================================================
// Maps request types to emojis for visual identification
const EMOJI_MAP = {
  'New Customer Onboarding': '🆕',
  'Integration Issue': '🛠️',
  'Feature Requests': '✨',
  'Training Requests': '📚',
  'Account/Billing Question': '🧾',
  'Something else?': '❓',
};

// ============================================================================
// 📂 STEP 2: SECTION ROUTING MAP (This is YOUR custom logic!)
// ============================================================================
// Maps form request types to Asana section names
// NOTE: Form uses singular (Feature Request) but Asana uses plural (Feature Requests)
const SECTION_MAP = {
  'New Customer Onboarding': '🆕 New Customer Onboarding',
  'Integration Issue': '🛠️ Integration Issue',
  'Feature Requests': '✨ Feature Requests',
  'Training Requests': '📚 Training Requests',
  'Account/Billing Question': '🧾 Account/Billing Question',
  'Something else?': '❓ Something Else?',
};

// Middleware - think of these as helpers that process requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test endpoint to make sure server is working
// Debug endpoint to see all sections
app.get('/debug-sections', async (req, res) => {
  try {
    const sections = await getProjectSections();
    res.json({
      count: sections.length,
      sections: sections.map((s) => ({
        name: s.name,
        gid: s.gid,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Google Forms → Asana Integration Server is running! 🚀');
});

// This is where Google Forms will send data
app.post('/webhook', async (req, res) => {
  try {
    console.log('Received form submission:', req.body);

    // Extract form data
    const formData = parseFormData(req.body);
    console.log('Parsed form data:', formData);

    // Create Asana task
    const asanaTask = await createAsanaTask(formData);
    console.log('Created Asana task:', asanaTask.data.name);

    res.status(200).json({
      success: true,
      message: 'Task created successfully!',
      taskId: asanaTask.data.gid,
    });
  } catch (error) {
    console.error('Error processing webhook:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Function to parse the form data from Google Forms
function parseFormData(body) {
  return {
    name:
      `${body.firstName || ''} ${body.lastName || ''}`.trim() ||
      'Unnamed Request',
    email: body.email || 'no-email@provided.com',
    requestType: body.requestType || 'General',
    description: body.description || 'No description provided',
    priority: body.priority || 'Medium',
  };
}

// ============================================================================
// 📂 STEP 2: HELPER FUNCTIONS FOR SECTION ROUTING
// ============================================================================

/**
 * Get all sections in the Asana project
 * This asks Asana: "What sections do you have?"
 */
async function getProjectSections() {
  try {
    const response = await axios.get(
      `https://app.asana.com/api/1.0/projects/${process.env.ASANA_PROJECT_ID}/sections`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ASANA_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(
      '❌ Error fetching sections:',
      error.response?.data || error.message
    );
    return [];
  }
}

/**
 * Find the section ID for a given section name
 * This looks through all sections to find the one we want
 */
async function getSectionIdByName(sectionName) {
  const sections = await getProjectSections();
  const section = sections.find((s) => s.name === sectionName);

  if (!section) {
    console.warn(
      `⚠️  Section "${sectionName}" not found. Task will go to default location.`
    );
    return null;
  }

  console.log(`✓ Found section: ${sectionName} (ID: ${section.gid})`);
  return section.gid;
}

// Function to create a task in Asana
async function createAsanaTask(formData) {
  const asanaUrl = 'https://app.asana.com/api/1.0/tasks';

  // Map priority levels to Asana's system
  const priorityMap = {
    Low: 'low',
    Medium: 'medium',
    High: 'high',
    Urgent: 'high', // Asana doesn't have "urgent", so we use high
  };

  // ============================================================================
  // 🎨 GET THE EMOJI FOR THIS REQUEST TYPE
  // ============================================================================
  // Look up the emoji, or use ❓ if request type isn't in our map
  const emoji = EMOJI_MAP[formData.requestType] || EMOJI_MAP['Something else?'];

  // ============================================================================
  // 📂 STEP 2: GET THE SECTION ID FOR THIS REQUEST TYPE
  // ============================================================================
  let sectionId = null;
  const sectionName = SECTION_MAP[formData.requestType];

  if (sectionName) {
    console.log(`🔍 Looking for section: ${sectionName}`);
    sectionId = await getSectionIdByName(sectionName);
  }

  const taskData = {
    data: {
      // ============================================================================
      // 🎨 ADD EMOJI TO TASK NAME (Changed this line!)
      // ============================================================================
      name: `${emoji} [${formData.requestType}] ${formData.name}`,
      notes: `
Request from: ${formData.email}
Type: ${formData.requestType}
Priority: ${formData.priority}

Description:
${formData.description}
            `.trim(),
      projects: [process.env.ASANA_PROJECT_ID],
      priority: priorityMap[formData.priority] || 'medium',
      // ============================================================================
      // 📂 ADD TO SECTION IF WE FOUND ONE
      // ============================================================================
      ...(sectionId && {
        memberships: [
          {
            project: process.env.ASANA_PROJECT_ID,
            section: sectionId,
          },
        ],
      }),
    },
  };

  const headers = {
    Authorization: `Bearer ${process.env.ASANA_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(asanaUrl, taskData, { headers });
    console.log(`✅ Task created in section: ${sectionName || 'default'}`);
    return response.data;
  } catch (error) {
    console.error('Asana API Error:', error.response?.data || error.message);
    throw new Error(
      `Failed to create Asana task: ${
        error.response?.data?.errors?.[0]?.message || error.message
      }`
    );
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Webhook endpoint: http://localhost:${PORT}/webhook`);
});

module.exports = app;
