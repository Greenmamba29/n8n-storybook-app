# N8N Interactive Storybook - System Components

## 🎯 Overview

This document provides a comprehensive breakdown of all system components in the N8N Interactive Storybook application, including their interfaces, dependencies, and integration patterns.

## 🏗️ Component Architecture Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND COMPONENTS                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Main App   │  │  File Upload │  │  Storybook   │              │
│  │    Page      │  │  Component   │  │   Player     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Accessibility│  │  Progress    │  │    Video     │              │
│  │  Controls    │  │   Tracker    │  │   Player     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────┐
│                      API LAYER                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Workflow   │  │  Storybook   │  │    Video     │              │
│  │  Upload API  │  │Generate API  │  │Generate API  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Accessibility│  │   Progress   │  │   Health     │              │
│  │  Check API   │  │  Track API   │  │  Check API   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────┐
│                   SERVICE LAYER                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   N8N        │  │    Agent     │  │    Video     │              │
│  │Integration   │  │Orchestrator  │  │  Generation  │              │
│  │  Service     │  │   Service    │  │   Service    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │Accessibility │  │   Content    │  │   Database   │              │
│  │   Service    │  │  Generator   │  │   Service    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────┐
│                    AGENT LAYER                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Tambo MCP  │  │ N8N Workflow │  │   OpenAI     │              │
│  │    Router    │  │   Analyzer   │  │   Content    │              │
│  │              │  │    Agent     │  │    Agent     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │    Wan2.2    │  │Accessibility │  │   Quality    │              │
│  │    Video     │  │ Enhancement  │  │ Assurance    │              │
│  │    Agent     │  │    Agent     │  │    Agent     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

## 📱 Frontend Components

### 1. **Main Application Page** (`src/app/page.tsx`)
**Purpose**: Primary user interface for N8N Interactive Storybook  
**Component Type**: Next.js Page Component  
**Key Features**:
- File upload interface with drag-and-drop
- URL and GitHub repository import
- Generation settings and options
- Real-time progress tracking
- Storybook display and interaction

```typescript
interface MainPageProps {
  children?: React.ReactNode;
}

interface PageState {
  workflow: N8NWorkflow | null;
  storybook: InteractiveStorybook | null;
  isGenerating: boolean;
  progress: GenerationProgress;
  error: Error | null;
}

export default function Page(): JSX.Element
```

**Dependencies**:
- `@/components/FileUpload`
- `@/components/StorybookPlayer`
- `@/components/ProgressTracker`
- `@/lib/n8n-integration`
- `@/lib/agent-orchestrator`

### 2. **File Upload Component** (`src/components/FileUpload.tsx`)
**Purpose**: Multi-format workflow file upload interface  
**Component Type**: React Functional Component  
**Supported Formats**: JSON, N8N, URL, GitHub Repository

```typescript
interface FileUploadProps {
  onFileSelect: (file: File | URL | GitHubRepo) => void;
  acceptedTypes: string[];
  maxSize: number;
  className?: string;
}

interface FileUploadState {
  dragActive: boolean;
  uploading: boolean;
  error: string | null;
  uploadProgress: number;
}
```

**Features**:
- Drag-and-drop file upload
- URL validation and fetching
- GitHub repository integration
- File type validation
- Upload progress tracking
- Error handling and validation

### 3. **Interactive Storybook Player** (`src/components/StorybookPlayer.tsx`)
**Purpose**: Interactive educational content player with accessibility  
**Component Type**: React Functional Component with Hooks  
**Core Features**:
- Step-by-step content navigation
- Interactive elements and quizzes
- Accessibility controls (screen reader, high contrast, keyboard nav)
- Video integration with closed captions
- Progress tracking and completion

```typescript
interface StorybookPlayerProps {
  storybook: InteractiveStorybook;
  onProgress: (progress: ProgressUpdate) => void;
  accessibilityMode: AccessibilityMode;
  className?: string;
}

interface StorybookState {
  currentStep: number;
  completedSteps: number[];
  userAnswers: Record<string, any>;
  accessibilitySettings: AccessibilitySettings;
}
```

**Accessibility Features**:
- WCAG 2.1 AA compliant
- Screen reader optimized
- Keyboard navigation support
- High contrast mode
- Text-to-speech integration
- Customizable font sizes

### 4. **Accessibility Controls** (`src/components/AccessibilityControls.tsx`)
**Purpose**: WCAG 2.1 AA compliance controls and settings  
**Component Type**: React Functional Component  

```typescript
interface AccessibilityControlsProps {
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  className?: string;
}

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  textToSpeech: boolean;
  reducedMotion: boolean;
}
```

**Features**:
- Real-time accessibility testing
- Dynamic contrast adjustment
- Text size scaling
- Motion reduction settings
- Screen reader optimization
- Keyboard navigation enhancement

### 5. **Progress Tracker** (`src/components/ProgressTracker.tsx`)
**Purpose**: Visual progress tracking for storybook completion  
**Component Type**: React Functional Component  

```typescript
interface ProgressTrackerProps {
  progress: LearningProgress;
  objectives: LearningObjective[];
  onObjectiveComplete: (objectiveId: string) => void;
  className?: string;
}

interface LearningProgress {
  overall: number;
  objectives: ObjectiveProgress[];
  timeSpent: number;
  completionRate: number;
}
```

### 6. **Video Player** (`src/components/VideoPlayer.tsx`)
**Purpose**: Accessible video player for educational content  
**Component Type**: React Functional Component with Video.js  

```typescript
interface VideoPlayerProps {
  videoSrc: string;
  subtitles?: SubtitleTrack[];
  onProgress: (progress: VideoProgress) => void;
  accessibilityMode: boolean;
  className?: string;
}
```

**Features**:
- Closed captions and subtitles
- Audio descriptions
- Keyboard controls
- Screen reader announcements
- Playback speed control
- Chapter navigation

## 🚀 API Layer Components

### 1. **Workflow Upload API** (`src/app/api/workflow/upload/route.ts`)
**Purpose**: Handle N8N workflow file uploads and validation  
**Type**: Next.js API Route  
**Methods**: POST  

```typescript
interface UploadRequest {
  file?: File;
  url?: string;
  githubRepo?: GitHubRepository;
}

interface UploadResponse {
  success: boolean;
  workflowId: string;
  workflow: N8NWorkflow;
  error?: string;
}
```

**Features**:
- Multi-format support (JSON, N8N, URL, GitHub)
- File validation and sanitization
- Workflow parsing and analysis
- Error handling and logging
- Rate limiting and security

### 2. **Storybook Generation API** (`src/app/api/storybook/generate/route.ts`)
**Purpose**: Orchestrate agents for storybook creation  
**Type**: Next.js API Route  
**Methods**: POST  

```typescript
interface GenerationRequest {
  workflowId: string;
  options: GenerationOptions;
  accessibilityLevel: AccessibilityLevel;
}

interface GenerationResponse {
  success: boolean;
  storybookId: string;
  storybook: InteractiveStorybook;
  generationTime: number;
  error?: string;
}
```

### 3. **Video Generation API** (`src/app/api/video/generate/route.ts`)
**Purpose**: Generate educational videos using Wan2.2 and RunPod  
**Type**: Next.js API Route  
**Methods**: POST  

```typescript
interface VideoGenerationRequest {
  storybookId: string;
  videoOptions: VideoGenerationOptions;
  runpodConfig: RunPodConfig;
}

interface VideoGenerationResponse {
  success: boolean;
  videoId: string;
  videoUrl: string;
  subtitlesUrl: string;
  processingTime: number;
}
```

### 4. **Accessibility Check API** (`src/app/api/accessibility/check/route.ts`)
**Purpose**: Real-time accessibility compliance testing  
**Type**: Next.js API Route  
**Methods**: POST  

```typescript
interface AccessibilityCheckRequest {
  content: string | HTMLElement;
  level: 'AA' | 'AAA';
  guidelines: WCAGGuideline[];
}

interface AccessibilityCheckResponse {
  success: boolean;
  violations: AccessibilityViolation[];
  score: ComplianceScore;
  suggestions: ImprovementSuggestion[];
}
```

## 🔧 Service Layer Components

### 1. **N8N Integration Service** (`src/lib/n8n-integration.ts`)
**Purpose**: Handle N8N workflow processing and analysis  
**Type**: TypeScript Service Class  

```typescript
export class N8NIntegrationService {
  private apiClient: N8NAPIClient;
  private parser: WorkflowParser;
  private validator: WorkflowValidator;

  async parseWorkflow(workflow: string | object): Promise<ParsedWorkflow>
  async validateWorkflow(workflow: ParsedWorkflow): Promise<ValidationResult>
  async analyzeComplexity(workflow: ParsedWorkflow): Promise<ComplexityAnalysis>
  async extractLearningObjectives(workflow: ParsedWorkflow): Promise<LearningObjective[]>
  async generateTutorialStructure(workflow: ParsedWorkflow): Promise<TutorialStructure>
}
```

**Features**:
- Workflow JSON parsing and validation
- Node dependency analysis
- Data flow mapping
- Complexity assessment
- Educational structure generation

### 2. **Agent Orchestrator Service** (`src/lib/agent-orchestrator.ts`)
**Purpose**: Coordinate multiple AI agents for content generation  
**Type**: TypeScript Service Class  

```typescript
export class AgentOrchestrator {
  private tamboRouter: TamboMCPRouter;
  private agents: Map<AgentType, Agent>;
  private eventBus: AgentEventBus;
  private stateManager: AgentStateManager;

  async initializeAgents(): Promise<void>
  async routeRequest(request: AgentRequest): Promise<AgentResponse>
  async orchestrateWorkflow(workflow: AgentWorkflow): Promise<ExecutionResult>
  async monitorAgents(): Promise<AgentHealthReport>
  async handleFailure(agent: Agent, error: AgentError): Promise<RecoveryAction>
}
```

**Core Methods**:
- Agent lifecycle management
- Request routing and load balancing
- Inter-agent communication
- Error handling and recovery
- Performance monitoring

### 3. **Video Generation Service** (`src/lib/video-generation.ts`)
**Purpose**: Manage video generation with Wan2.2 and RunPod  
**Type**: TypeScript Service Class  

```typescript
export class VideoGenerationService {
  private runpodClient: RunPodClient;
  private wan22Model: Wan22VideoModel;
  private audioGenerator: AudioGenerator;
  private subtitleGenerator: SubtitleGenerator;

  async generateVideo(script: VideoScript): Promise<GeneratedVideo>
  async synthesizeAudio(text: string, voice: VoiceOptions): Promise<AudioTrack>
  async generateSubtitles(audio: AudioTrack): Promise<SubtitleTrack[]>
  async optimizeForAccessibility(video: GeneratedVideo): Promise<AccessibleVideo>
}
```

### 4. **Accessibility Service** (`src/lib/accessibility.ts`)
**Purpose**: Ensure WCAG 2.1 AA compliance across all content  
**Type**: TypeScript Service Class  

```typescript
export class AccessibilityService {
  private axeCore: AxeCoreClient;
  private screenReaderOptimizer: ScreenReaderOptimizer;
  private contrastChecker: ContrastChecker;
  private keyboardNavigator: KeyboardNavigator;

  async checkCompliance(content: Content): Promise<ComplianceReport>
  async generateAltText(images: ImageContent[]): Promise<AltTextMap>
  async optimizeForScreenReaders(content: Content): Promise<OptimizedContent>
  async validateKeyboardNavigation(component: Component): Promise<NavigationReport>
}
```

## 🤖 Agent Layer Components

### 1. **Tambo MCP Router** (`src/lib/agents/tambo-mcp-router.ts`)
**Purpose**: Central orchestration hub using existing Tambo MCP system  
**Type**: MCP Provider Integration  
**Existing Asset**: ✅ `/Users/paco/Downloads/TAMBO_MCP_Router_Demo_Chatbot_Creation-2/tambo_mcp_integration_suite`

```typescript
export class TamboMCPRouter {
  private abacusClient: ABACUSClient;
  private componentManager: ComponentManager;
  private mcpProvider: MCPProvider;

  async routeRequest(request: AgentRequest): Promise<AgentResponse>
  async manageAgentLifecycle(agent: Agent): Promise<LifecycleResult>
  async optimizeRouting(metrics: PerformanceMetrics): Promise<RoutingOptimization>
  async handleMCPCommunication(message: MCPMessage): Promise<MCPResponse>
}
```

### 2. **N8N Workflow Analyzer Agent** (`src/lib/agents/n8n-analyzer.ts`)
**Purpose**: Intelligent N8N workflow analysis and educational mapping  
**Type**: Custom Agent Implementation  

```typescript
export class N8NWorkflowAnalyzer {
  private workflowParser: WorkflowParser;
  private graphAnalyzer: GraphAnalyzer;
  private educationalMapper: EducationalMapper;
  private complexityCalculator: ComplexityCalculator;

  async analyzeWorkflow(workflow: N8NWorkflow): Promise<WorkflowAnalysis>
  async generateEducationalStructure(): Promise<EducationalStructure>
  async assessComplexity(): Promise<ComplexityAssessment>
  async identifyLearningObjectives(): Promise<LearningObjective[]>
  async createInteractiveElements(): Promise<InteractiveElement[]>
}
```

### 3. **OpenAI Content Agent** (`src/lib/agents/openai-content.ts`)
**Purpose**: GPT-4 powered educational content generation  
**Type**: OpenAI API Integration  

```typescript
export class OpenAIContentAgent {
  private openaiClient: OpenAIClient;
  private functionCaller: FunctionCaller;
  private contentOptimizer: ContentOptimizer;
  private accessibilityEnhancer: AccessibilityEnhancer;

  async generateTutorialContent(analysis: WorkflowAnalysis): Promise<TutorialContent>
  async createInteractiveQuizzes(objectives: LearningObjective[]): Promise<Quiz[]>
  async optimizeForAccessibility(content: Content): Promise<AccessibleContent>
  async generateAltText(images: Image[]): Promise<AltTextMap>
}
```

**Function Calling Integration**:
```typescript
const functions = [
  {
    name: "generate_educational_content",
    description: "Generate structured educational content from workflow analysis",
    parameters: {
      type: "object",
      properties: {
        workflow_analysis: { type: "object" },
        learning_objectives: { type: "array" },
        target_audience: { type: "string" },
        accessibility_level: { type: "string" }
      },
      required: ["workflow_analysis", "learning_objectives"]
    }
  }
]
```

### 4. **Wan2.2 Video Agent** (`src/lib/agents/wan22-video.ts`)
**Purpose**: AI video generation with RunPod GPU acceleration  
**Type**: Cloud GPU Integration  

```typescript
export class Wan22VideoAgent {
  private runpodClient: RunPodClient;
  private wan22Model: Wan22Model;
  private videoProcessor: VideoProcessor;
  private audioSynthesizer: AudioSynthesizer;

  async generateVideo(script: VideoScript): Promise<GeneratedVideo>
  async synthesizeNarration(text: string): Promise<AudioTrack>
  async createSubtitles(audio: AudioTrack): Promise<SubtitleTrack[]>
  async optimizeForPlatforms(video: GeneratedVideo): Promise<OptimizedVideo[]>
}
```

**RunPod Configuration**:
```typescript
interface RunPodConfig {
  endpoint: string;
  gpu_type: 'RTX_4090' | 'A100' | 'V100';
  container: 'wan2.2-video-gen';
  timeout: number;
  scaling: {
    min_workers: number;
    max_workers: number;
    scale_up_threshold: number;
  }
}
```

### 5. **Accessibility Enhancement Agent** (`src/lib/agents/accessibility.ts`)
**Purpose**: Automated accessibility compliance and optimization  
**Type**: Axe-Core Integration  

```typescript
export class AccessibilityAgent {
  private axeCore: AxeCore;
  private ariaOptimizer: AriaOptimizer;
  private contrastAnalyzer: ContrastAnalyzer;
  private screenReaderTester: ScreenReaderTester;

  async validateCompliance(content: Content): Promise<ComplianceReport>
  async generateAriaLabels(elements: HTMLElement[]): Promise<AriaLabelMap>
  async optimizeColorContrast(theme: ColorTheme): Promise<AccessibleTheme>
  async testScreenReaderCompatibility(content: Content): Promise<CompatibilityReport>
}
```

### 6. **Quality Assurance Agent** (`src/lib/agents/quality-assurance.ts`)
**Purpose**: Content quality validation and optimization  
**Type**: Custom Quality Metrics Agent  

```typescript
export class QualityAssuranceAgent {
  private contentScorer: ContentScorer;
  private technicalValidator: TechnicalValidator;
  private uxTester: UXTester;
  private performanceOptimizer: PerformanceOptimizer;

  async scoreContent(content: GeneratedContent): Promise<QualityScore>
  async validateTechnicalAccuracy(content: Content): Promise<ValidationReport>
  async testUserExperience(storybook: InteractiveStorybook): Promise<UXReport>
  async optimizePerformance(assets: Asset[]): Promise<OptimizationReport>
}
```

## 🔄 Component Communication Patterns

### 1. **Event-Driven Architecture**
```typescript
interface ComponentEvent {
  id: string;
  type: EventType;
  source: ComponentId;
  target?: ComponentId;
  payload: any;
  timestamp: Date;
  priority: Priority;
}

class ComponentEventBus {
  private listeners: Map<EventType, EventHandler[]>;
  
  emit(event: ComponentEvent): void
  subscribe(eventType: EventType, handler: EventHandler): void
  unsubscribe(eventType: EventType, handler: EventHandler): void
}
```

### 2. **State Management**
```typescript
interface ApplicationState {
  workflow: WorkflowState;
  storybook: StorybookState;
  generation: GenerationState;
  accessibility: AccessibilityState;
  user: UserState;
}

class StateManager {
  private state: ApplicationState;
  private subscribers: StateSubscriber[];
  
  setState<K extends keyof ApplicationState>(
    key: K, 
    value: ApplicationState[K]
  ): void
  
  getState<K extends keyof ApplicationState>(key: K): ApplicationState[K]
  subscribe(subscriber: StateSubscriber): void
}
```

### 3. **API Client Integration**
```typescript
class APIClient {
  private baseURL: string;
  private timeout: number;
  private retryConfig: RetryConfig;
  
  async post<T>(endpoint: string, data: any): Promise<APIResponse<T>>
  async get<T>(endpoint: string): Promise<APIResponse<T>>
  async upload<T>(endpoint: string, file: File): Promise<APIResponse<T>>
  
  private handleError(error: APIError): Promise<never>
  private retry<T>(request: () => Promise<T>): Promise<T>
}
```

## 📊 Performance & Monitoring Components

### 1. **Performance Monitor** (`src/lib/monitoring/performance.ts`)
```typescript
export class PerformanceMonitor {
  private metrics: PerformanceMetric[];
  private thresholds: PerformanceThreshold[];
  
  trackComponentRender(component: string, duration: number): void
  trackAPICall(endpoint: string, duration: number, status: number): void
  trackUserInteraction(interaction: UserInteraction): void
  generateReport(): PerformanceReport
}
```

### 2. **Error Handler** (`src/lib/error/handler.ts`)
```typescript
export class ErrorHandler {
  private logger: Logger;
  private alerter: Alerter;
  
  handleComponentError(error: ComponentError): void
  handleAPIError(error: APIError): void
  handleAgentError(error: AgentError): void
  logError(error: Error, context: ErrorContext): void
}
```

## 🔧 Configuration Components

### 1. **Environment Config** (`src/config/environment.ts`)
```typescript
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  OPENAI_API_KEY: string;
  RUNPOD_API_KEY: string;
  SUPABASE_URL: string;
  TAMBO_MCP_ENDPOINT: string;
  MAX_FILE_SIZE: number;
  GENERATION_TIMEOUT: number;
}

export const config: EnvironmentConfig
```

### 2. **Agent Configuration** (`src/config/agents.ts`)
```typescript
interface AgentConfiguration {
  tambo_mcp: TamboMCPConfig;
  openai: OpenAIConfig;
  wan22: Wan22Config;
  accessibility: AccessibilityConfig;
  quality: QualityConfig;
}

export const agentConfig: AgentConfiguration
```

## 🎯 Integration Points

### **Frontend ↔ API Layer**
- RESTful API calls using fetch/axios
- Real-time updates via Server-Sent Events
- File uploads with progress tracking
- Error boundary handling

### **API Layer ↔ Service Layer**
- Service injection and dependency management
- Async/await error handling
- Request validation and sanitization
- Response caching and optimization

### **Service Layer ↔ Agent Layer**
- Agent orchestration via Tambo MCP
- Event-driven agent communication
- State synchronization across agents
- Performance monitoring and health checks

### **External Service Integration**
- OpenAI GPT-4 API for content generation
- RunPod GPU cloud for video processing
- Supabase for data persistence
- GitHub API for repository integration
- Axe-core for accessibility testing

---

## 🎉 Component Integration Benefits

### **Modularity**
- Independent component development and testing
- Easy replacement of individual components
- Scalable architecture for future enhancements

### **Maintainability**  
- Clear separation of concerns
- Well-defined interfaces and contracts
- Comprehensive error handling

### **Performance**
- Optimized component loading
- Efficient state management  
- Smart caching strategies

### **Accessibility**
- WCAG 2.1 AA compliance throughout
- Screen reader optimization
- Keyboard navigation support

This comprehensive component architecture ensures a robust, scalable, and accessible N8N Interactive Storybook application with sophisticated AI agent integration.
