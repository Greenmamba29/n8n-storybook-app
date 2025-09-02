
// Real Tambo API Integration with Safety Guardrails
interface TamboConfig {
  apiKey: string;
  baseUrl: string;
  safeMode: boolean;
  maxRequestsPerMinute: number;
}

interface TamboComponent {
  id: string;
  name: string;
  code: string;
  props: any;
  category: string;
  tags: string[];
}

interface SafetyGuards {
  canModifyComponent: (componentId: string) => boolean;
  validateChange: (change: any) => boolean;
  rateLimitCheck: () => boolean;
}

class TamboAPIClient {
  private config: TamboConfig;
  private requestCount = 0;
  private requestWindow = Date.now();
  private safetyGuards: SafetyGuards;
  
  // Protected component IDs that should not be modified in demo mode
  private readonly PROTECTED_COMPONENTS = [
    'core-layout',
    'main-navigation', 
    'app-shell',
    'error-boundary'
  ];

  constructor() {
    this.config = {
      apiKey: 'tambo_2crvFKf2vvsK8WYmBToavxmgJF+jeuR0o5yNaNUBxhP1L56c6YeCZao0/voar1gR47s4yevBC0QQ/XfIfBE9aAueUIBiHEosmPHJv4JVjqY=',
      baseUrl: 'https://api.tambo.co/v1',
      safeMode: true, // Enable safety mode by default
      maxRequestsPerMinute: 30 // Rate limiting
    };
    
    this.safetyGuards = {
      canModifyComponent: (componentId: string) => {
        // Block modifications to protected components in safe mode
        if (this.config.safeMode && this.PROTECTED_COMPONENTS.includes(componentId)) {
          console.warn(`⚠️ Protected component ${componentId} cannot be modified in safe mode`);
          return false;
        }
        return true;
      },
      
      validateChange: (change: any) => {
        // Validate that changes don't contain dangerous code
        const dangerousPatterns = [
          'dangerouslySetInnerHTML',
          'eval(',
          'Function(',
          'setTimeout(',
          'setInterval(',
          'document.cookie',
          'localStorage.clear()',
          'window.location'
        ];
        
        const changeStr = JSON.stringify(change);
        for (const pattern of dangerousPatterns) {
          if (changeStr.includes(pattern)) {
            console.error(`🚫 Dangerous pattern detected: ${pattern}`);
            return false;
          }
        }
        return true;
      },
      
      rateLimitCheck: () => {
        const now = Date.now();
        const windowDuration = 60 * 1000; // 1 minute
        
        // Reset window if needed
        if (now - this.requestWindow > windowDuration) {
          this.requestCount = 0;
          this.requestWindow = now;
        }
        
        if (this.requestCount >= this.config.maxRequestsPerMinute) {
          console.warn('⏳ Rate limit exceeded. Please wait before making more requests.');
          return false;
        }
        
        this.requestCount++;
        return true;
      }
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.safetyGuards.rateLimitCheck()) {
      throw new Error('Rate limit exceeded');
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Tambo API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getComponent(componentId: string): Promise<TamboComponent> {
    try {
      return await this.makeRequest(`/components/${componentId}`);
    } catch (error) {
      console.error('Failed to fetch component:', error);
      // Return mock data in case of API failure
      return {
        id: componentId,
        name: componentId,
        code: '// Component temporarily unavailable',
        props: {},
        category: 'unknown',
        tags: []
      };
    }
  }

  async updateComponent(componentId: string, changes: any): Promise<TamboComponent> {
    // Apply safety guards
    if (!this.safetyGuards.canModifyComponent(componentId)) {
      throw new Error(`Component ${componentId} is protected and cannot be modified`);
    }
    
    if (!this.safetyGuards.validateChange(changes)) {
      throw new Error('Change validation failed - potentially dangerous code detected');
    }

    try {
      console.log(`🔧 Safely updating component: ${componentId}`, changes);
      
      const response = await this.makeRequest(`/components/${componentId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          changes,
          safeMode: this.config.safeMode,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'tambo-design-buddy'
          }
        }),
      });
      
      console.log(`✅ Component ${componentId} updated successfully`);
      return response;
    } catch (error) {
      console.error('Failed to update component:', error);
      throw error;
    }
  }

  async searchComponents(query: string): Promise<TamboComponent[]> {
    try {
      return await this.makeRequest(`/components/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  // Safety controls
  enableSafeMode() {
    this.config.safeMode = true;
    console.log('🛡️ Safe mode enabled - protected components cannot be modified');
  }

  disableSafeMode() {
    this.config.safeMode = false;
    console.warn('⚠️ Safe mode disabled - use with caution');
  }

  getStatus() {
    return {
      safeMode: this.config.safeMode,
      requestsRemaining: this.config.maxRequestsPerMinute - this.requestCount,
      protectedComponents: this.PROTECTED_COMPONENTS.length
    };
  }
}

export const tamboClient = new TamboAPIClient();
export default TamboAPIClient;
