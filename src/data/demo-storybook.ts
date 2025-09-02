import { EducationalContent } from '../lib/agents/n8n-workflow-analyzer';

export const demoStorybook: EducationalContent = {
  id: 'demo-storybook-001',
  title: 'Email Marketing Automation Workflow',
  description: 'Learn how to create an automated email marketing system using N8N workflow automation.',
  complexity: 'intermediate',
  estimatedDuration: 15,
  tags: ['automation', 'email', 'marketing', 'webhook'],
  learningObjectives: [
    'Understand webhook configuration for data collection',
    'Learn email validation techniques in automation',
    'Master database integration for subscriber management',
    'Implement automated email responses',
    'Handle errors gracefully in workflows'
  ],
  steps: [
    {
      id: 'step-1',
      title: 'Setting up the Webhook Trigger',
      description: 'Configure a webhook to receive new subscriber data from your website forms.',
      explanation: 'Webhooks are HTTP endpoints that receive data from external sources. In this step, we create a webhook that listens for POST requests containing subscriber information.',
      type: 'setup',
      duration: 3,
      code: `// Webhook configuration
{
  "path": "marketing-signup",
  "httpMethod": "POST",
  "responseMode": "responseNode",
  "options": {}
}`,
      visualAids: [
        {
          type: 'diagram',
          title: 'Webhook Flow',
          altText: 'Diagram showing data flow from website form to N8N webhook',
          description: 'Website form sends POST request to N8N webhook endpoint'
        }
      ],
      quiz: {
        question: 'What HTTP method should be used for the webhook to receive form data?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctAnswer: 1,
        explanation: 'POST is used because we are sending data to be processed by the server.'
      }
    },
    {
      id: 'step-2',
      title: 'Email Validation Function',
      description: 'Add a function node to validate the email format before processing.',
      explanation: 'Email validation ensures data quality and prevents errors downstream. We use a regular expression to check if the email format is valid.',
      type: 'logic',
      duration: 4,
      code: `// Email validation function
const email = items[0].json.email;
const isValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);

return [{
  json: {
    ...items[0].json,
    emailValid: isValid
  }
}];`,
      visualAids: [
        {
          type: 'code',
          title: 'Regular Expression Breakdown',
          altText: 'Explanation of email validation regex pattern',
          description: 'The regex pattern checks for valid email structure'
        }
      ],
      quiz: {
        question: 'Why is email validation important in automation workflows?',
        options: [
          'To make the code look complex',
          'To ensure data quality and prevent downstream errors',
          'To slow down the process',
          'It is not important'
        ],
        correctAnswer: 1,
        explanation: 'Email validation prevents invalid data from causing errors in subsequent steps.'
      }
    },
    {
      id: 'step-3',
      title: 'Database Integration',
      description: 'Store validated subscriber information in a PostgreSQL database.',
      explanation: 'Database storage allows you to maintain a persistent record of subscribers and enables advanced querying and reporting capabilities.',
      type: 'integration',
      duration: 4,
      code: `// Database insert configuration
{
  "operation": "insert",
  "table": "subscribers",
  "columns": ["email", "name", "signup_date"],
  "returnFields": "id,email,created_at"
}`,
      visualAids: [
        {
          type: 'table',
          title: 'Subscribers Table Structure',
          altText: 'Database table showing subscriber data columns',
          description: 'Table structure with email, name, and signup_date columns'
        }
      ]
    },
    {
      id: 'step-4',
      title: 'Automated Welcome Email',
      description: 'Send a personalized welcome email to new subscribers.',
      explanation: 'Automated welcome emails improve user experience and engagement. They can include personalized content and important information about your service.',
      type: 'communication',
      duration: 3,
      code: `// Email configuration
{
  "subject": "Welcome to our newsletter!",
  "html": "<h1>Welcome {{name}}!</h1><p>Thank you for joining our community.</p>",
  "to": "{{email}}",
  "attachments": []
}`,
      visualAids: [
        {
          type: 'email',
          title: 'Email Template Preview',
          altText: 'Preview of welcome email template with personalization',
          description: 'HTML email template with dynamic content placeholders'
        }
      ],
      quiz: {
        question: 'What is the benefit of sending automated welcome emails?',
        options: [
          'It increases server costs',
          'It improves user engagement and experience',
          'It complicates the workflow',
          'It is required by law'
        ],
        correctAnswer: 1,
        explanation: 'Welcome emails create a positive first impression and help establish a relationship with new subscribers.'
      }
    },
    {
      id: 'step-5',
      title: 'Error Handling',
      description: 'Implement proper error handling to manage failed operations.',
      explanation: 'Error handling ensures your workflow continues operating even when individual operations fail, and helps you identify and resolve issues quickly.',
      type: 'logic',
      duration: 2,
      code: `// Error handling configuration
{
  "continueOnFail": true,
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 1000
}`,
      visualAids: [
        {
          type: 'flowchart',
          title: 'Error Handling Flow',
          altText: 'Flowchart showing error handling and retry logic',
          description: 'Decision flow for handling errors and retries'
        }
      ]
    }
  ],
  interactiveElements: [
    {
      id: 'simulation-webhook',
      type: 'simulation',
      title: 'Webhook Testing Simulation',
      description: 'Test the webhook endpoint with sample data',
      accessibility: {
        screenReaderText: 'Interactive webhook testing simulation',
        audioDescription: 'Simulation showing webhook receiving and processing form data',
        keyboardNavigation: 'Use Tab to navigate, Enter to trigger simulation'
      }
    },
    {
      id: 'diagram-workflow',
      type: 'diagram',
      title: 'Complete Workflow Diagram',
      description: 'Visual representation of the entire automation flow',
      accessibility: {
        screenReaderText: 'Interactive workflow diagram showing all connected nodes',
        audioDescription: 'Diagram displays webhook, validation, database, and email nodes connected in sequence',
        keyboardNavigation: 'Use arrow keys to navigate between workflow nodes'
      }
    },
    {
      id: 'code-editor',
      type: 'code-playground',
      title: 'Email Validation Code Editor',
      description: 'Modify and test email validation logic',
      accessibility: {
        screenReaderText: 'Code editor for email validation function',
        audioDescription: 'Editable code showing email validation logic with regex pattern',
        keyboardNavigation: 'Standard code editor keyboard shortcuts apply'
      }
    }
  ],
  accessibilityFeatures: {
    screenReaderCompatible: true,
    keyboardNavigation: true,
    highContrast: true,
    audioDescriptions: true,
    closedCaptions: true,
    wcagCompliance: 'AA'
  },
  metadata: {
    createdAt: new Date().toISOString(),
    author: 'N8N Storybook AI',
    version: '1.0.0',
    language: 'en'
  }
};
