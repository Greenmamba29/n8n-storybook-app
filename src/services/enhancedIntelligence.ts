// Enhanced TAMBO Intelligence System with Advanced Contextual Awareness
import { geminiClient } from './geminiClient';
import { abacusClient } from './abacusClient';
import { tamboClient } from './tamboClient';

// Enhanced Context Interfaces
interface UserProfile {
  id: string;
  tier: 'Free' | 'Pro' | 'Enterprise';
  role: 'End User' | 'Developer' | 'Admin' | 'Support';
  permissions: string[];
  preferences: {
    communication_style: 'casual' | 'professional' | 'technical';
    complexity_level: 'basic' | 'intermediate' | 'advanced';
    preferred_agents: string[];
  };
  history: {
    successful_routes: { [key: string]: number };
    failed_routes: { [key: string]: number };
    common_intents: string[];
    satisfaction_scores: number[];
  };
}

interface ConversationContext {
  session_id: string;
  messages: ConversationMessage[];
  active_intent: string | null;
  intent_confidence: number;
  current_workflow: string | null;
  pending_actions: string[];
  escalation_level: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface ConversationMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  intent: string;
  entities: { [key: string]: string };
  sentiment: string;
  handled_by: string;
  success: boolean;
}

interface EnhancedRoutingDecision {
  primary_agent: string;
  primary_route: string;
  fallback_agents: string[];
  confidence: number;
  reasoning: string[];
  context_factors: {
    user_history: number;
    conversation_flow: number;
    business_rules: number;
    technical_complexity: number;
  };
  recommended_approach: 'direct' | 'escalate' | 'multi_agent' | 'human_handoff';
  expected_resolution_time: string;
  success_probability: number;
}

interface BusinessRule {
  id: string;
  condition: (context: ConversationContext, profile: UserProfile) => boolean;
  action: 'route_to' | 'escalate' | 'require_auth' | 'block' | 'redirect';
  target: string;
  priority: number;
  description: string;
}

class EnhancedTamboIntelligence {
  private businessRules: BusinessRule[];
  private userProfiles: Map<string, UserProfile>;
  private activeContexts: Map<string, ConversationContext>;

  constructor() {
    this.businessRules = this.initializeBusinessRules();
    this.userProfiles = new Map();
    this.activeContexts = new Map();
  }

  /**
   * Main intelligence routing with full contextual awareness
   */
  async intelligentRoute(
    userMessage: string,
    userId: string,
    sessionId: string,
    additionalContext: any = {}
  ): Promise<EnhancedRoutingDecision> {
    
    // 1. Get or create user profile with learning
    const userProfile = await this.getOrCreateUserProfile(userId);
    
    // 2. Get or create conversation context
    const conversationContext = this.getOrCreateConversationContext(sessionId, userMessage);
    
    // 3. Advanced message analysis with multiple AI layers
    const messageAnalysis = await this.analyzeMessageWithContext(
      userMessage, 
      userProfile, 
      conversationContext
    );
    
    // 4. Apply business rules and constraints
    const businessRuleResult = this.applyBusinessRules(userProfile, conversationContext, messageAnalysis);
    
    // 5. Multi-factor routing decision
    const routingDecision = await this.computeEnhancedRouting(
      messageAnalysis,
      userProfile,
      conversationContext,
      businessRuleResult,
      additionalContext
    );
    
    // 6. Learn from decision and update profiles
    this.updateLearningModels(userProfile, conversationContext, routingDecision);
    
    return routingDecision;
  }

  /**
   * Deep message analysis with contextual understanding
   */
  private async analyzeMessageWithContext(
    message: string,
    profile: UserProfile,
    context: ConversationContext
  ) {
    // Multi-layered analysis combining all AI systems
    const [geminiAnalysis, abacusAnalysis, patternAnalysis] = await Promise.all([
      this.getGeminiContextualAnalysis(message, profile, context),
      this.getAbacusRouting(message, profile.tier),
      this.getPatternAnalysis(message, context)
    ]);

    // Intent progression tracking
    const intentProgression = this.analyzeIntentProgression(context, message);
    
    // Entity extraction and business object recognition
    const entities = this.extractBusinessEntities(message);
    
    // Sentiment and urgency analysis
    const sentiment = await this.analyzeSentiment(message, context);
    const urgency = this.assessUrgency(message, context, profile);

    return {
      message,
      gemini: geminiAnalysis,
      abacus: abacusAnalysis,
      patterns: patternAnalysis,
      intent_progression: intentProgression,
      entities,
      sentiment,
      urgency,
      complexity: this.assessComplexity(message, entities),
      requires_escalation: this.requiresEscalation(message, context, profile)
    };
  }

  /**
   * Enhanced Gemini analysis with full context
   */
  private async getGeminiContextualAnalysis(message: string, profile: UserProfile, context: ConversationContext) {
    const contextualPrompt = `
TAMBO Intelligence: Contextual Message Analysis

USER PROFILE:
- ID: ${profile.id}
- Tier: ${profile.tier}
- Role: ${profile.role}
- Communication Style: ${profile.preferences.communication_style}
- Complexity Level: ${profile.preferences.complexity_level}
- Success History: ${JSON.stringify(profile.history.successful_routes)}
- Recent Satisfaction: ${profile.history.satisfaction_scores.slice(-5).join(', ')}

CONVERSATION CONTEXT:
- Session ID: ${context.session_id}
- Active Intent: ${context.active_intent || 'None'}
- Current Workflow: ${context.current_workflow || 'None'}
- Escalation Level: ${context.escalation_level}
- Recent Messages: ${JSON.stringify(context.messages.slice(-5).map(m => ({
  content: m.content.substring(0, 100),
  intent: m.intent,
  success: m.success
})))}

CURRENT MESSAGE: "${message}"

ANALYZE and provide JSON response with:
{
  "primary_intent": "specific_intent_detected",
  "intent_confidence": 0.95,
  "business_context": "what business need is being expressed",
  "technical_complexity": "low/medium/high",
  "user_emotional_state": "frustrated/neutral/satisfied/excited",
  "conversation_stage": "initial/clarification/resolution/followup",
  "expected_agents": ["primary_agent", "fallback_agent"],
  "contextual_factors": {
    "builds_on_previous": true/false,
    "requires_escalation": true/false,
    "multi_step_process": true/false,
    "user_expertise_level": "beginner/intermediate/expert"
  },
  "business_priority": "low/medium/high/critical",
  "reasoning": ["factor1", "factor2", "factor3"]
}`;

    try {
      const response = await geminiClient.processChat(contextualPrompt, {});
      return this.parseGeminiContextualResponse(response);
    } catch (error) {
      console.error('Gemini contextual analysis failed:', error);
      return this.getDefaultAnalysis(message);
    }
  }

  /**
   * Multi-factor routing computation
   */
  private async computeEnhancedRouting(
    analysis: any,
    profile: UserProfile,
    context: ConversationContext,
    businessRules: any,
    additionalContext: any
  ): Promise<EnhancedRoutingDecision> {
    
    // Factor 1: User history and success patterns
    const historyScore = this.computeHistoryScore(profile, analysis.gemini.expected_agents);
    
    // Factor 2: Conversation flow and context
    const contextScore = this.computeContextScore(context, analysis);
    
    // Factor 3: Business rules and constraints  
    const businessScore = this.computeBusinessScore(businessRules, profile);
    
    // Factor 4: Technical complexity and agent capabilities
    const complexityScore = this.computeComplexityScore(analysis, profile);
    
    // Factor 5: Current system load and agent availability
    const availabilityScore = await this.computeAvailabilityScore();

    // Weighted decision algorithm
    const routingCandidates = this.generateRoutingCandidates(analysis, profile, context);
    const bestCandidate = this.selectBestCandidate(
      routingCandidates,
      {
        history: historyScore,
        context: contextScore,
        business: businessScore,
        complexity: complexityScore,
        availability: availabilityScore
      }
    );

    return {
      primary_agent: bestCandidate.agent,
      primary_route: bestCandidate.route,
      fallback_agents: bestCandidate.fallbacks,
      confidence: bestCandidate.confidence,
      reasoning: bestCandidate.reasoning,
      context_factors: {
        user_history: historyScore,
        conversation_flow: contextScore,
        business_rules: businessScore,
        technical_complexity: complexityScore
      },
      recommended_approach: bestCandidate.approach,
      expected_resolution_time: bestCandidate.estimated_time,
      success_probability: bestCandidate.success_probability
    };
  }

  /**
   * Learning system to improve over time
   */
  private updateLearningModels(
    profile: UserProfile,
    context: ConversationContext,
    decision: EnhancedRoutingDecision
  ) {
    // Update user profile with new patterns
    profile.history.common_intents.push(context.active_intent || 'general');
    
    // Track routing decision for future learning
    const routeKey = `${decision.primary_agent}:${decision.primary_route}`;
    profile.history.successful_routes[routeKey] = 
      (profile.history.successful_routes[routeKey] || 0) + 1;

    // Update conversation context
    context.pending_actions.push(`routed_to_${decision.primary_agent}`);
    context.escalation_level = Math.max(0, context.escalation_level - 1); // Successful routing reduces escalation

    // Store updated profile
    this.userProfiles.set(profile.id, profile);
    this.activeContexts.set(context.session_id, context);
  }

  /**
   * Initialize comprehensive business rules
   */
  private initializeBusinessRules(): BusinessRule[] {
    return [
      {
        id: 'enterprise_priority_support',
        condition: (context, profile) => profile.tier === 'Enterprise' && context.urgency === 'high',
        action: 'route_to',
        target: 'PriorityTriageAgent',
        priority: 10,
        description: 'Enterprise users get priority support for high urgency issues'
      },
      {
        id: 'billing_requires_auth',
        condition: (context, profile) => context.active_intent?.includes('billing') || false,
        action: 'require_auth',
        target: 'BillingAgent',
        priority: 9,
        description: 'Billing inquiries require user authentication'
      },
      {
        id: 'technical_complexity_escalation',
        condition: (context, profile) => context.escalation_level > 2 && profile.role === 'End User',
        action: 'escalate',
        target: 'TechnicalSpecialistAgent',
        priority: 8,
        description: 'Complex technical issues should be escalated for end users'
      },
      {
        id: 'free_tier_limitations',
        condition: (context, profile) => profile.tier === 'Free' && context.active_intent === 'advanced_features',
        action: 'redirect',
        target: 'UpgradeAgent',
        priority: 7,
        description: 'Free tier users requesting advanced features should be shown upgrade options'
      }
    ];
  }

  // Helper methods for scoring and analysis
  private computeHistoryScore(profile: UserProfile, candidateAgents: string[]): number {
    let score = 0;
    candidateAgents.forEach(agent => {
      const successCount = profile.history.successful_routes[agent] || 0;
      score += successCount * 0.1; // Weight successful interactions
    });
    return Math.min(score, 1.0);
  }

  private computeContextScore(context: ConversationContext, analysis: any): number {
    let score = 0.5; // Base score
    
    if (analysis.gemini?.contextual_factors?.builds_on_previous) score += 0.2;
    if (context.active_intent === analysis.gemini?.primary_intent) score += 0.3;
    if (context.escalation_level === 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private computeBusinessScore(businessRules: any, profile: UserProfile): number {
    // Implementation for business rules scoring
    return 0.8;
  }

  private computeComplexityScore(analysis: any, profile: UserProfile): number {
    const userExpertise = profile.preferences.complexity_level;
    const messageComplexity = analysis.complexity;
    
    if (userExpertise === 'advanced' && messageComplexity === 'high') return 1.0;
    if (userExpertise === 'basic' && messageComplexity === 'high') return 0.3;
    
    return 0.7;
  }

  private async computeAvailabilityScore(): Promise<number> {
    // Mock implementation - in real system would check agent load
    return 0.9;
  }

  private generateRoutingCandidates(analysis: any, profile: UserProfile, context: ConversationContext) {
    // Generate multiple routing options with scoring
    return [
      {
        agent: 'ContentRouterAgent',
        route: '/content',
        confidence: 0.8,
        reasoning: ['Default routing based on analysis'],
        approach: 'direct' as const,
        estimated_time: '2-5 minutes',
        success_probability: 0.85,
        fallbacks: ['TriageAgent', 'GeneralSupportAgent']
      }
    ];
  }

  private selectBestCandidate(candidates: any[], scores: any) {
    // Select best candidate based on weighted scores
    return candidates[0]; // Simplified for now
  }

  // Additional helper methods...
  private getOrCreateUserProfile(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        id: userId,
        tier: 'Pro',
        role: 'End User',
        permissions: ['basic_access'],
        preferences: {
          communication_style: 'professional',
          complexity_level: 'intermediate',
          preferred_agents: []
        },
        history: {
          successful_routes: {},
          failed_routes: {},
          common_intents: [],
          satisfaction_scores: []
        }
      });
    }
    return this.userProfiles.get(userId)!;
  }

  private getOrCreateConversationContext(sessionId: string, message: string): ConversationContext {
    if (!this.activeContexts.has(sessionId)) {
      this.activeContexts.set(sessionId, {
        session_id: sessionId,
        messages: [],
        active_intent: null,
        intent_confidence: 0,
        current_workflow: null,
        pending_actions: [],
        escalation_level: 0,
        sentiment: 'neutral',
        urgency: 'medium'
      });
    }
    
    const context = this.activeContexts.get(sessionId)!;
    context.messages.push({
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      intent: 'analyzing',
      entities: {},
      sentiment: 'neutral',
      handled_by: 'pending',
      success: false
    });
    
    return context;
  }

  private parseGeminiContextualResponse(response: string) {
    try {
      const jsonMatch = response.match(/{[\s\S]*}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse Gemini contextual response:', error);
    }
    return this.getDefaultAnalysis(response);
  }

  private getDefaultAnalysis(message: string) {
    return {
      primary_intent: 'general_inquiry',
      intent_confidence: 0.6,
      business_context: 'General user request',
      technical_complexity: 'medium',
      user_emotional_state: 'neutral',
      conversation_stage: 'initial',
      expected_agents: ['ContentRouterAgent'],
      contextual_factors: {
        builds_on_previous: false,
        requires_escalation: false,
        multi_step_process: false,
        user_expertise_level: 'intermediate'
      },
      business_priority: 'medium',
      reasoning: ['Default analysis due to processing error']
    };
  }

  private getAbacusRouting(message: string, tier: string) {
    return abacusClient.routeRequest(tier, message, 'development');
  }

  private getPatternAnalysis(message: string, context: ConversationContext) {
    // Pattern matching and analysis
    return {
      message_type: 'query',
      patterns_detected: [],
      similarity_to_previous: 0.3
    };
  }

  private analyzeIntentProgression(context: ConversationContext, message: string) {
    // Track how user intent evolves through conversation
    return {
      intent_chain: context.messages.map(m => m.intent),
      progression_type: 'linear',
      completion_likelihood: 0.7
    };
  }

  private extractBusinessEntities(message: string) {
    // Extract business-relevant entities (components, agents, processes, etc.)
    const entities: { [key: string]: string } = {};
    
    // Simple regex-based extraction (could be enhanced with NLP)
    const componentMatch = message.match(/component[:\s]+([a-zA-Z0-9-_]+)/i);
    if (componentMatch) entities.component = componentMatch[1];
    
    const agentMatch = message.match(/agent[:\s]+([a-zA-Z0-9-_]+)/i);
    if (agentMatch) entities.agent = agentMatch[1];
    
    return entities;
  }

  private async analyzeSentiment(message: string, context: ConversationContext) {
    // Could integrate with sentiment analysis API
    const negativeWords = ['frustrated', 'angry', 'broken', 'terrible', 'hate', 'worst'];
    const positiveWords = ['great', 'love', 'excellent', 'perfect', 'amazing', 'wonderful'];
    
    const words = message.toLowerCase().split(' ');
    let sentiment = 'neutral';
    
    if (words.some(word => negativeWords.includes(word))) sentiment = 'negative';
    if (words.some(word => positiveWords.includes(word))) sentiment = 'positive';
    
    return sentiment;
  }

  private assessUrgency(message: string, context: ConversationContext, profile: UserProfile) {
    const urgentKeywords = ['urgent', 'critical', 'emergency', 'immediately', 'asap', 'broken'];
    const message_lower = message.toLowerCase();
    
    if (urgentKeywords.some(keyword => message_lower.includes(keyword))) return 'high';
    if (context.escalation_level > 1) return 'high';
    if (profile.tier === 'Enterprise') return 'medium';
    
    return 'low';
  }

  private assessComplexity(message: string, entities: any) {
    let complexity = 'low';
    
    if (Object.keys(entities).length > 2) complexity = 'medium';
    if (message.length > 500) complexity = 'medium';
    if (message.includes('integration') || message.includes('MCP') || message.includes('API')) {
      complexity = 'high';
    }
    
    return complexity;
  }

  private requiresEscalation(message: string, context: ConversationContext, profile: UserProfile) {
    return context.escalation_level > 2 || 
           profile.tier === 'Enterprise' ||
           message.toLowerCase().includes('speak to manager');
  }

  private applyBusinessRules(profile: UserProfile, context: ConversationContext, analysis: any) {
    const applicableRules = this.businessRules.filter(rule => 
      rule.condition(context, profile)
    ).sort((a, b) => b.priority - a.priority);
    
    return {
      applicable_rules: applicableRules,
      primary_action: applicableRules[0]?.action || 'route_to',
      target: applicableRules[0]?.target || null,
      overrides_default: applicableRules.length > 0
    };
  }
}

export const enhancedIntelligence = new EnhancedTamboIntelligence();
export type { EnhancedRoutingDecision, UserProfile, ConversationContext };
