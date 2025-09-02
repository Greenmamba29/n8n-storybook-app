/**
 * N8N Integration Service
 * Handles direct integration with N8N instances and workflow processing
 */

import { n8nWorkflowAnalyzer, N8NWorkflow, EducationalContent } from '../lib/agents/n8n-workflow-analyzer';

export interface N8NCredentials {
  baseUrl: string;
  apiKey?: string;
  email?: string;
  password?: string;
  accessToken?: string;
}

export interface WorkflowExecutionData {
  executionId: string;
  workflowId: string;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  finished: boolean;
  data: any;
}

export interface N8NWebhookData {
  workflowId: string;
  executionId: string;
  data: any;
  headers: Record<string, string>;
  query: Record<string, string>;
}

export class N8NIntegrationService {
  private credentials: N8NCredentials | null = null;
  private baseUrl: string = '';
  private headers: Record<string, string> = {};

  constructor() {
    // Initialize from environment variables
    this.setupCredentials();
  }

  /**
   * Setup N8N credentials from environment variables
   */
  private setupCredentials(): void {
    const baseUrl = process.env.N8N_BASE_URL || process.env.NEXT_PUBLIC_N8N_BASE_URL;
    const apiKey = process.env.N8N_API_KEY;
    const email = process.env.N8N_EMAIL;
    const password = process.env.N8N_PASSWORD;

    if (baseUrl) {
      this.credentials = {
        baseUrl,
        apiKey,
        email,
        password,
      };
      this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
      
      if (apiKey) {
        this.headers['X-N8N-API-KEY'] = apiKey;
      }
      this.headers['Content-Type'] = 'application/json';
      this.headers['Accept'] = 'application/json';
    }
  }

  /**
   * Test connection to N8N instance
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/v1/workflows', { method: 'GET' });
      return response.ok;
    } catch (error) {
      console.error('N8N connection test failed:', error);
      return false;
    }
  }

  /**
   * Fetch all workflows from N8N instance
   */
  async fetchWorkflows(): Promise<N8NWorkflow[]> {
    try {
      const response = await this.makeRequest('/api/v1/workflows');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch workflows: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || data; // Handle different response formats
    } catch (error) {
      console.error('Failed to fetch N8N workflows:', error);
      throw new Error(`N8N API Error: ${error.message}`);
    }
  }

  /**
   * Fetch a specific workflow by ID
   */
  async fetchWorkflow(workflowId: string): Promise<N8NWorkflow> {
    try {
      const response = await this.makeRequest(`/api/v1/workflows/${workflowId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch workflow ${workflowId}: ${response.statusText}`);
      }

      const workflow = await response.json();
      return workflow.data || workflow;
    } catch (error) {
      console.error(`Failed to fetch workflow ${workflowId}:`, error);
      throw new Error(`N8N API Error: ${error.message}`);
    }
  }

  /**
   * Process workflow file upload (JSON format)
   */
  async processWorkflowFile(fileContent: string): Promise<N8NWorkflow> {
    try {
      const workflowData = JSON.parse(fileContent);
      
      // Validate N8N workflow format
      if (!this.isValidN8NWorkflow(workflowData)) {
        throw new Error('Invalid N8N workflow format');
      }

      return workflowData;
    } catch (error) {
      console.error('Failed to process workflow file:', error);
      throw new Error(`Workflow File Error: ${error.message}`);
    }
  }

  /**
   * Generate interactive storybook from N8N workflow
   */
  async generateStorybook(workflow: N8NWorkflow): Promise<EducationalContent> {
    try {
      console.log(`Generating storybook for workflow: ${workflow.name}`);
      
      // Use the N8N Workflow Analyzer agent
      const educationalContent = await n8nWorkflowAnalyzer.analyzeWorkflow(workflow);
      
      // Add metadata
      const storybook: EducationalContent = {
        ...educationalContent,
        // Add source workflow info
      };
      
      return storybook;
    } catch (error) {
      console.error('Failed to generate storybook:', error);
      throw new Error(`Storybook Generation Error: ${error.message}`);
    }
  }

  /**
   * Execute workflow (if connected to N8N instance)
   */
  async executeWorkflow(workflowId: string, inputData?: any): Promise<WorkflowExecutionData> {
    try {
      const payload = {
        workflowData: inputData || {},
      };

      const response = await this.makeRequest(`/api/v1/workflows/${workflowId}/execute`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute workflow: ${response.statusText}`);
      }

      const executionData = await response.json();
      return executionData.data || executionData;
    } catch (error) {
      console.error(`Failed to execute workflow ${workflowId}:`, error);
      throw new Error(`N8N Execution Error: ${error.message}`);
    }
  }

  /**
   * Fetch workflow executions
   */
  async fetchWorkflowExecutions(workflowId: string, limit: number = 20): Promise<WorkflowExecutionData[]> {
    try {
      const response = await this.makeRequest(
        `/api/v1/executions?filter=${JSON.stringify({ workflowId })}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch executions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error(`Failed to fetch executions for workflow ${workflowId}:`, error);
      throw new Error(`N8N API Error: ${error.message}`);
    }
  }

  /**
   * Handle webhook data from N8N
   */
  async handleWebhook(webhookData: N8NWebhookData): Promise<void> {
    try {
      console.log('Processing N8N webhook:', webhookData);
      
      // Process webhook data and potentially generate educational content
      if (webhookData.workflowId) {
        const workflow = await this.fetchWorkflow(webhookData.workflowId);
        
        // Could trigger storybook regeneration or update
        // This is where real-time workflow updates would be handled
      }
    } catch (error) {
      console.error('Failed to handle N8N webhook:', error);
    }
  }

  /**
   * Import workflow from various sources
   */
  async importWorkflow(source: 'file' | 'url' | 'github', data: string): Promise<N8NWorkflow> {
    try {
      let workflowContent: string = '';

      switch (source) {
        case 'file':
          workflowContent = data;
          break;
        
        case 'url':
          const response = await fetch(data);
          if (!response.ok) {
            throw new Error(`Failed to fetch from URL: ${response.statusText}`);
          }
          workflowContent = await response.text();
          break;
          
        case 'github':
          // GitHub raw URL processing
          const githubUrl = data.includes('github.com') 
            ? data.replace('github.com', 'raw.githubusercontent.com').replace('/blob', '')
            : data;
          
          const githubResponse = await fetch(githubUrl);
          if (!githubResponse.ok) {
            throw new Error(`Failed to fetch from GitHub: ${githubResponse.statusText}`);
          }
          workflowContent = await githubResponse.text();
          break;
          
        default:
          throw new Error(`Unsupported import source: ${source}`);
      }

      return await this.processWorkflowFile(workflowContent);
    } catch (error) {
      console.error('Failed to import workflow:', error);
      throw new Error(`Import Error: ${error.message}`);
    }
  }

  /**
   * Validate N8N workflow format
   */
  private isValidN8NWorkflow(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // Check required fields
    const requiredFields = ['nodes', 'connections'];
    const hasRequiredFields = requiredFields.every(field => field in data);
    
    if (!hasRequiredFields) return false;
    
    // Validate nodes array
    if (!Array.isArray(data.nodes) || data.nodes.length === 0) return false;
    
    // Validate node structure
    const validNodes = data.nodes.every((node: any) => 
      node && typeof node === 'object' && 
      'id' in node && 'type' in node && 'position' in node
    );
    
    if (!validNodes) return false;
    
    // Validate connections object
    if (typeof data.connections !== 'object') return false;
    
    return true;
  }

  /**
   * Make HTTP request to N8N API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.credentials?.baseUrl) {
      throw new Error('N8N credentials not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    };

    // Add authentication if available
    if (this.credentials.email && this.credentials.password && !this.credentials.apiKey) {
      // Use basic auth
      const auth = Buffer.from(`${this.credentials.email}:${this.credentials.password}`).toString('base64');
      requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': `Basic ${auth}`,
      };
    }

    return fetch(url, requestOptions);
  }

  /**
   * Get service status and configuration
   */
  getStatus() {
    return {
      configured: !!this.credentials?.baseUrl,
      hasApiKey: !!this.credentials?.apiKey,
      hasBasicAuth: !!(this.credentials?.email && this.credentials?.password),
      baseUrl: this.credentials?.baseUrl || 'Not configured',
    };
  }

  /**
   * Set credentials manually (for testing or dynamic configuration)
   */
  setCredentials(credentials: N8NCredentials): void {
    this.credentials = credentials;
    this.baseUrl = credentials.baseUrl.replace(/\/$/, '');
    
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (credentials.apiKey) {
      this.headers['X-N8N-API-KEY'] = credentials.apiKey;
    }
  }
}

// Export singleton instance
export const n8nIntegrationService = new N8NIntegrationService();
