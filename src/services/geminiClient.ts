
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Enhanced TAMBO intelligence using Google Gemini AI
interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
}

interface DecisionContext {
  userTier: string;
  environment: string;
  requestType: string;
  payload: string;
  metadata?: any;
}

interface IntelligentDecision {
  agent: string;
  route: string;
  intent: string;
  confidence: number;
  reasoning: string;
  recommendations: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    concerns: string[];
  };
  nextSteps: string[];
}

interface ComponentAnalysis {
  componentId: string;
  updateFeasibility: 'safe' | 'risky' | 'dangerous';
  suggestedChanges: string[];
  securityConcerns: string[];
  implementationPlan: string[];
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
}

class GeminiIntelligenceClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: GeminiConfig;

  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }

    this.config = {
      apiKey,
      model: 'gemini-1.5-flash',
      temperature: 0.3,
      maxOutputTokens: 2048
    };

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: this.config.maxOutputTokens,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  /**
   * Intelligent request routing with Gemini AI analysis
   */
  async analyzeAndRoute(context: DecisionContext): Promise<IntelligentDecision> {
    const prompt = this.buildRoutingPrompt(context);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseIntelligentDecision(response, context);
    } catch (error) {
      console.error('Gemini routing analysis failed:', error);
      
      // Fallback to rule-based routing
      return this.fallbackRouting(context);
    }
  }

  /**
   * Component update intelligence with security analysis
   */
  async analyzeComponentUpdate(
    componentId: string,
    updateInstructions: string,
    currentCode?: string
  ): Promise<ComponentAnalysis> {
    const prompt = this.buildComponentAnalysisPrompt(componentId, updateInstructions, currentCode);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseComponentAnalysis(response, componentId);
    } catch (error) {
      console.error('Gemini component analysis failed:', error);
      
      // Return safe defaults
      return {
        componentId,
        updateFeasibility: 'risky',
        suggestedChanges: ['Manual review required'],
        securityConcerns: ['AI analysis unavailable'],
        implementationPlan: ['Review request manually', 'Test in development first'],
        estimatedComplexity: 'moderate'
      };
    }
  }

  /**
   * Chat intelligence for conversational interactions
   */
  async processChat(message: string, context: any = {}): Promise<string> {
    const prompt = this.buildChatPrompt(message, context);
    
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini chat processing failed:', error);
      return "I'm experiencing some difficulty processing that request. Please try rephrasing or contact support if the issue persists.";
    }
  }

  /**
   * Agent diagnostics with AI insights
   */
  async analyzeDiagnostics(agent: string, scope: string, performanceData?: any): Promise<any> {
    const prompt = this.buildDiagnosticsPrompt(agent, scope, performanceData);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseDiagnosticsResponse(response, agent);
    } catch (error) {
      console.error('Gemini diagnostics analysis failed:', error);
      
      return {
        agent,
        status: 'analysis_error',
        insights: 'AI analysis unavailable',
        recommendations: ['Manual diagnostics required'],
        riskLevel: 'unknown'
      };
    }
  }

  private buildRoutingPrompt(context: DecisionContext): string {
    return `
You are TAMBO's intelligent routing system with deep knowledge of MCP (Model Context Protocol) integrations.

CONTEXT:
- User Tier: ${context.userTier}
- Environment: ${context.environment}
- Request Type: ${context.requestType}
- Payload: "${context.payload}"

AVAILABLE AGENTS & ROUTES:
1. TriageAgent (/triage) - Support requests, errors, issues, bugs
2. ContentRouterAgent (/content) - Blog posts, articles, media, documentation
3. FeedbackMinerAgent (/feedback) - User feedback, reviews, comments, ratings
4. PricingIntelligenceAgent (/pricing) - Pricing inquiries, upgrades, billing
5. AuditAgent (/audit) - Logging, compliance, records, security audits
6. MCPIntegrationAgent (/mcp) - MCP server operations, protocol handling
7. TamboDesignAgent (/design) - UI/UX modifications, component updates

ANALYZE the request and provide your decision in this EXACT JSON format:
{
  "agent": "<selected_agent_name>",
  "route": "<selected_route>",
  "intent": "<detected_user_intent>",
  "confidence": <0.0_to_1.0>,
  "reasoning": "<brief_explanation_of_your_decision>",
  "recommendations": ["<actionable_recommendations>"],
  "riskAssessment": {
    "level": "<low|medium|high>",
    "concerns": ["<potential_issues>"]
  },
  "nextSteps": ["<recommended_follow_up_actions>"]
}

Consider:
- User tier privileges and limitations
- Environment safety (production vs development)
- Request complexity and potential impact
- Security implications
- Best practices for MCP integrations
`;
  }

  private buildComponentAnalysisPrompt(componentId: string, instructions: string, currentCode?: string): string {
    return `
You are TAMBO's component security and feasibility analyzer.

COMPONENT UPDATE REQUEST:
- Component ID: ${componentId}
- Update Instructions: "${instructions}"
- Current Code: ${currentCode ? `\n${currentCode}` : 'Not provided'}

ANALYZE for:
1. Security vulnerabilities
2. Breaking changes potential
3. Implementation complexity
4. Best practices compliance
5. Testing requirements

Provide analysis in this EXACT JSON format:
{
  "componentId": "${componentId}",
  "updateFeasibility": "<safe|risky|dangerous>",
  "suggestedChanges": ["<specific_implementation_steps>"],
  "securityConcerns": ["<potential_security_issues>"],
  "implementationPlan": ["<step_by_step_implementation>"],
  "estimatedComplexity": "<simple|moderate|complex>"
}

Flag as DANGEROUS if:
- XSS vulnerabilities possible
- Direct DOM manipulation without sanitization
- External API calls without validation
- State mutations without proper guards
`;
  }

  private buildChatPrompt(message: string, context: any): string {
    return `
You are TAMBO BUDDY, the intelligent assistant for the TAMBO MCP Integration Suite.

Context: ${JSON.stringify(context, null, 2)}
User Message: "${message}"

Respond as TAMBO BUDDY with:
- Helpful and professional tone
- Technical accuracy about MCP integrations
- Actionable guidance
- Security awareness
- Clear next steps when applicable

Keep responses concise but complete. If the request involves:
- Component modifications: Emphasize safety and testing
- MCP operations: Explain protocols and best practices
- Routing decisions: Clarify logic and reasoning
- Diagnostics: Provide actionable insights
`;
  }

  private buildDiagnosticsPrompt(agent: string, scope: string, data?: any): string {
    return `
Analyze the health and performance of the TAMBO agent.

AGENT: ${agent}
SCOPE: ${scope}
DATA: ${JSON.stringify(data, null, 2)}

Provide comprehensive diagnostics in JSON format:
{
  "agent": "${agent}",
  "status": "<healthy|degraded|critical|unknown>",
  "insights": "<key_findings_and_observations>",
  "recommendations": ["<specific_improvement_actions>"],
  "riskLevel": "<low|medium|high|critical>",
  "metrics": {
    "performance": "<assessment>",
    "reliability": "<assessment>",
    "security": "<assessment>"
  }
}
`;
  }

  private parseIntelligentDecision(response: string, context: DecisionContext): IntelligentDecision {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and ensure all required fields
        return {
          agent: parsed.agent || 'ContentRouterAgent',
          route: parsed.route || '/content',
          intent: parsed.intent || 'general_request',
          confidence: parsed.confidence || 0.7,
          reasoning: parsed.reasoning || 'AI analysis completed',
          recommendations: parsed.recommendations || [],
          riskAssessment: parsed.riskAssessment || { level: 'medium', concerns: [] },
          nextSteps: parsed.nextSteps || []
        };
      }
    } catch (error) {
      console.error('Failed to parse Gemini decision:', error);
    }
    
    return this.fallbackRouting(context);
  }

  private parseComponentAnalysis(response: string, componentId: string): ComponentAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          componentId: parsed.componentId || componentId,
          updateFeasibility: parsed.updateFeasibility || 'risky',
          suggestedChanges: parsed.suggestedChanges || [],
          securityConcerns: parsed.securityConcerns || [],
          implementationPlan: parsed.implementationPlan || [],
          estimatedComplexity: parsed.estimatedComplexity || 'moderate'
        };
      }
    } catch (error) {
      console.error('Failed to parse component analysis:', error);
    }
    
    return {
      componentId,
      updateFeasibility: 'risky',
      suggestedChanges: ['Analysis failed - manual review required'],
      securityConcerns: ['Could not assess security implications'],
      implementationPlan: ['Review manually', 'Test thoroughly'],
      estimatedComplexity: 'complex'
    };
  }

  private parseDiagnosticsResponse(response: string, agent: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse diagnostics response:', error);
    }
    
    return {
      agent,
      status: 'unknown',
      insights: response || 'Analysis completed',
      recommendations: ['Manual review recommended'],
      riskLevel: 'medium'
    };
  }

  private fallbackRouting(context: DecisionContext): IntelligentDecision {
    const payload = context.payload.toLowerCase();
    let agent = 'ContentRouterAgent';
    let route = '/content';
    let intent = 'general_request';
    
    if (payload.includes('support') || payload.includes('error') || payload.includes('issue')) {
      agent = 'TriageAgent';
      route = '/triage';
      intent = 'support_request';
    } else if (payload.includes('feedback') || payload.includes('review')) {
      agent = 'FeedbackMinerAgent';
      route = '/feedback';
      intent = 'feedback_analysis';
    } else if (payload.includes('pricing') || payload.includes('upgrade')) {
      agent = 'PricingIntelligenceAgent';
      route = '/pricing';
      intent = 'pricing_inquiry';
    } else if (payload.includes('mcp') || payload.includes('integration')) {
      agent = 'MCPIntegrationAgent';
      route = '/mcp';
      intent = 'mcp_operation';
    }
    
    return {
      agent,
      route,
      intent,
      confidence: 0.6,
      reasoning: 'Fallback rule-based routing applied',
      recommendations: ['Consider providing more specific details'],
      riskAssessment: { level: 'low', concerns: [] },
      nextSteps: ['Process request with selected agent']
    };
  }
}

export const geminiClient = new GeminiIntelligenceClient();
export default GeminiIntelligenceClient;
