export type Effort = "S" | "M" | "L";

export interface ModuleItem {
  id: string;
  name: string;
  description: string;
  effort: Effort;
  risks: string[];
  score: number;
}

export interface AnalysisResult {
  modules: ModuleItem[];
  flags: string[];
}

interface DetectedFeatures {
  auth: boolean;
  dashboard: boolean;
  reporting: boolean;
  billing: boolean;
  api: boolean;
  notifications: boolean;
  admin: boolean;
  data: boolean;
  search: boolean;
  realtime: boolean;
  ai: boolean;
  mobile: boolean;
  multiTenant: boolean;
  offline: boolean;
  // More specific feature detection
  otp: boolean;
  sso: boolean;
  mfa: boolean;
  passwordReset: boolean;
  userRegistration: boolean;
  fileUpload: boolean;
  emailService: boolean;
  smsService: boolean;
  webhook: boolean;
  paymentGateway: boolean;
  subscription: boolean;
  invoice: boolean;
  refund: boolean;
  audit: boolean;
  logging: boolean;
  caching: boolean;
  queue: boolean;
  websocket: boolean;
  realtimeSync: boolean;
  conflictResolution: boolean;
  searchIndex: boolean;
  filtering: boolean;
  sorting: boolean;
  pagination: boolean;
  export: boolean;
  chart: boolean;
  dashboard: boolean;
  widget: boolean;
  navigation: boolean;
  responsive: boolean;
  accessibility: boolean;
  testing: boolean;
  deployment: boolean;
  monitoring: boolean;
  security: boolean;
  encryption: boolean;
  compliance: boolean;
}

// Enhanced keyword detection for granular module breakdown
const detailedKeywordMap: { key: keyof DetectedFeatures; rx: RegExp; baseScore: number }[] = [
  // Authentication specific
  { key: "otp", rx: /(otp|one[- ]?time[- ]?password|verification[- ]?code|sms[- ]?code|email[- ]?code)/i, baseScore: 2 },
  { key: "sso", rx: /(sso|single[- ]?sign[- ]?on|oauth|openid|saml|ldap|active[- ]?directory)/i, baseScore: 3 },
  { key: "mfa", rx: /(mfa|multi[- ]?factor|2fa|two[- ]?factor|authenticator|totp|hardware[- ]?token)/i, baseScore: 3 },
  { key: "passwordReset", rx: /(password[- ]?reset|forgot[- ]?password|reset[- ]?link|password[- ]?recovery)/i, baseScore: 2 },
  { key: "userRegistration", rx: /(register|signup|sign[- ]?up|user[- ]?onboarding|account[- ]?creation)/i, baseScore: 2 },
  
  // Communication services
  { key: "emailService", rx: /(email|smtp|sendgrid|mailgun|ses|email[- ]?service)/i, baseScore: 2 },
  { key: "smsService", rx: /(sms|text[- ]?message|twilio|sms[- ]?service|mobile[- ]?notification)/i, baseScore: 2 },
  { key: "webhook", rx: /(webhook|callback|event[- ]?notification|http[- ]?post)/i, baseScore: 2 },
  
  // Payment specific
  { key: "paymentGateway", rx: /(stripe|paypal|square|braintree|payment[- ]?gateway|credit[- ]?card)/i, baseScore: 3 },
  { key: "subscription", rx: /(subscription|recurring|billing[- ]?cycle|plan|tier)/i, baseScore: 3 },
  { key: "invoice", rx: /(invoice|billing|receipt|payment[- ]?confirmation)/i, baseScore: 2 },
  { key: "refund", rx: /(refund|return|chargeback|dispute|reversal)/i, baseScore: 2 },
  
  // Data & Storage
  { key: "fileUpload", rx: /(upload|file|attachment|document|image|video|s3|blob|storage)/i, baseScore: 2 },
  { key: "audit", rx: /(audit|log|tracking|history|activity[- ]?log)/i, baseScore: 1 },
  { key: "logging", rx: /(logging|log[- ]?management|monitoring|debugging)/i, baseScore: 1 },
  { key: "caching", rx: /(cache|caching|redis|memcached|performance)/i, baseScore: 2 },
  
  // Real-time features
  { key: "queue", rx: /(queue|job|background[- ]?task|worker|celery|bull)/i, baseScore: 2 },
  { key: "websocket", rx: /(websocket|ws|socket[- ]?io|real[- ]?time|live)/i, baseScore: 3 },
  { key: "realtimeSync", rx: /(sync|synchronization|collaboration|concurrent|conflict)/i, baseScore: 3 },
  { key: "conflictResolution", rx: /(conflict[- ]?resolution|merge|version[- ]?control|optimistic[- ]?locking)/i, baseScore: 3 },
  
  // Search & Filtering
  { key: "searchIndex", rx: /(search[- ]?index|elasticsearch|solr|full[- ]?text[- ]?search)/i, baseScore: 3 },
  { key: "filtering", rx: /(filter|facet|category|tag|classification)/i, baseScore: 1 },
  { key: "sorting", rx: /(sort|order|ranking|priority)/i, baseScore: 1 },
  { key: "pagination", rx: /(pagination|page|limit|offset|cursor)/i, baseScore: 1 },
  
  // Reporting & Analytics
  { key: "export", rx: /(export|csv|pdf|excel|download|report[- ]?generation)/i, baseScore: 2 },
  { key: "chart", rx: /(chart|graph|visualization|plot|dashboard)/i, baseScore: 2 },
  { key: "dashboard", rx: /(dashboard|overview|home|main[- ]?screen)/i, baseScore: 2 },
  { key: "widget", rx: /(widget|component|card|panel|module)/i, baseScore: 1 },
  
  // UI/UX
  { key: "navigation", rx: /(navigation|menu|sidebar|breadcrumb|routing)/i, baseScore: 1 },
  { key: "responsive", rx: /(responsive|mobile[- ]?friendly|adaptive|breakpoint)/i, baseScore: 2 },
  { key: "accessibility", rx: /(accessibility|a11y|screen[- ]?reader|wcag|aria)/i, baseScore: 2 },
  
  // Infrastructure
  { key: "testing", rx: /(test|testing|qa|quality[- ]?assurance|automation)/i, baseScore: 2 },
  { key: "deployment", rx: /(deploy|deployment|ci|cd|pipeline|devops)/i, baseScore: 2 },
  { key: "monitoring", rx: /(monitoring|alerting|metrics|health[- ]?check|uptime)/i, baseScore: 2 },
  
  // Security
  { key: "security", rx: /(security|secure|protection|vulnerability)/i, baseScore: 2 },
  { key: "encryption", rx: /(encrypt|encryption|ssl|tls|cipher|hash)/i, baseScore: 2 },
  { key: "compliance", rx: /(compliance|gdpr|hipaa|pci|sox|audit[- ]?trail)/i, baseScore: 3 },
];

// Legacy keyword map for backward compatibility
const keywordMap: { key: keyof DetectedFeatures; rx: RegExp; module: string; baseScore: number }[] = [
  { key: "auth", rx: /(auth|login|log\s*in|signup|sign\s*up|register|sso|oauth|mfa|password)/i, module: "Authentication & User Management", baseScore: 3 },
  { key: "dashboard", rx: /(dashboard|home\b|overview|ui\s*shell|interface)/i, module: "Dashboard & UI Shell", baseScore: 2 },
  { key: "reporting", rx: /(report|analytics|chart|kpi|export|csv|pdf|metric|insight)/i, module: "Reporting & Analytics", baseScore: 3 },
  { key: "billing", rx: /(billing|payment|stripe|paypal|subscription|invoice|checkout|cart)/i, module: "Billing & Payments", baseScore: 4 },
  { key: "api", rx: /(api|webhook|integration|sdk|third[- ]party|rest|graphql)/i, module: "APIs & Integrations", baseScore: 3 },
  { key: "notifications", rx: /(email|sms|push|notification|notify|alert|message)/i, module: "Notifications & Communications", baseScore: 2 },
  { key: "admin", rx: /(admin|settings|role|permission|rbac|access|manage|user\s*mgmt)/i, module: "Admin & Access Control", baseScore: 2 },
  { key: "data", rx: /(data\b|database|schema|model|storage|file\s*upload|s3|blob|postgres|mongo|sql)/i, module: "Data Model & Storage", baseScore: 3 },
  { key: "search", rx: /(search|filter|sort|facet|query|lookup)/i, module: "Search & Filtering", baseScore: 2 },
  { key: "realtime", rx: /(realtime|real[- ]time|live\b|websocket|ws|sync|collaborative|collaboration)/i, module: "Realtime & Subscriptions", baseScore: 3 },
  { key: "ai", rx: /(ai|ml|llm|genai|openai|vertex|claude|recommendation|predict)/i, module: "AI & Machine Learning", baseScore: 4 },
  { key: "mobile", rx: /(mobile|app|ios|android|react\s*native|flutter)/i, module: "Mobile App", baseScore: 4 },
  { key: "multiTenant", rx: /(multi[- ]tenant|tenancy|workspace|organization)/i, module: "Multi-Tenancy & Isolation", baseScore: 3 },
  { key: "offline", rx: /(offline|cache|sync|background)/i, module: "Offline Support", baseScore: 2 },
];

const boosters: { rx: RegExp; weight: number }[] = [
  { rx: /(multi[- ]tenant|tenancy)/i, weight: 2 },
  { rx: /(role[- ]?based|rbac)/i, weight: 1 },
  { rx: /(ai|ml|llm|genai)/i, weight: 2 },
  { rx: /(offline|cache|sync)/i, weight: 2 },
  { rx: /(scale|million|large\s*data|big\s*data|performance|high\s*volume)/i, weight: 2 },
  { rx: /(security|pii|gdpr|hipaa|pci|encrypt|compliance)/i, weight: 2 },
  { rx: /(custom|complex|advanced)/i, weight: 1 },
];

function detectFeatures(text: string): DetectedFeatures {
  const features: DetectedFeatures = {
    auth: false,
    dashboard: false,
    reporting: false,
    billing: false,
    api: false,
    notifications: false,
    admin: false,
    data: false,
    search: false,
    realtime: false,
    ai: false,
    mobile: false,
    multiTenant: false,
    offline: false,
    // More specific feature detection
    otp: false,
    sso: false,
    mfa: false,
    passwordReset: false,
    userRegistration: false,
    fileUpload: false,
    emailService: false,
    smsService: false,
    webhook: false,
    paymentGateway: false,
    subscription: false,
    invoice: false,
    refund: false,
    audit: false,
    logging: false,
    caching: false,
    queue: false,
    websocket: false,
    realtimeSync: false,
    conflictResolution: false,
    searchIndex: false,
    filtering: false,
    sorting: false,
    pagination: false,
    export: false,
    chart: false,
    widget: false,
    navigation: false,
    responsive: false,
    accessibility: false,
    testing: false,
    deployment: false,
    monitoring: false,
    security: false,
    encryption: false,
    compliance: false,
  };

  // Use detailed keyword detection first
  for (const entry of detailedKeywordMap) {
    if (entry.rx.test(text)) {
      features[entry.key] = true;
    }
  }

  // Use legacy keyword map for backward compatibility
  for (const entry of keywordMap) {
    if (entry.rx.test(text)) {
      features[entry.key] = true;
    }
  }

  return features;
}

function sizeFromScore(score: number): Effort {
  if (score <= 2) return "S";
  if (score <= 5) return "M";
  return "L";
}

function tokenize(input: string): string[] {
  return input
    .split(/\n|\+|,|\||;|\band\b|\s&\s/gi)
    .map((s) => s.trim())
    .filter(Boolean);
}

function idFor(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generateDescription(moduleName: string, text: string, features: DetectedFeatures): string {
  const descriptions: Record<string, string> = {
    "Authentication & User Management": features.multiTenant 
      ? "Secure user authentication with role-based access across multiple workspaces and orgs"
      : features.admin
      ? "Manage user accounts, credentials, and permissions with admin controls"
      : "Handle user registration, login, and secure session management",

    "Dashboard & UI Shell": features.realtime
      ? "Real-time interactive dashboard displaying live data and system status"
      : features.ai
      ? "Intelligent dashboard with AI-powered insights and personalized recommendations"
      : "Main interface with navigation, layout, and widget organization",

    "Reporting & Analytics": features.realtime
      ? "Real-time analytics and live reporting with automated data refresh"
      : features.ai
      ? "AI-driven analytics with predictive insights and anomaly detection"
      : "Generate reports, analyze trends, and export data in multiple formats",

    "Billing & Payments": features.multiTenant
      ? "Process multi-tenant payments with per-workspace billing and usage tracking"
      : features.api
      ? "Secure payment processing via API-driven gateways with webhook support"
      : "Handle secure transactions, invoices, and subscription management",

    "APIs & Integrations": features.realtime
      ? "Real-time API integrations with bi-directional data sync and webhooks"
      : features.data
      ? "Connect external services and APIs with robust error handling"
      : "Build and maintain integrations with third-party platforms",

    "Notifications & Communications": features.realtime
      ? "Real-time notifications with instant delivery and presence awareness"
      : features.multiTenant
      ? "Multi-channel notifications per workspace with user preferences"
      : "Send emails, push notifications, and SMS alerts to users",

    "Admin & Access Control": features.multiTenant
      ? "Granular role-based access control across tenants with audit trails"
      : features.api
      ? "API key management, rate limiting, and permission policies"
      : "Manage user roles, permissions, and system settings",

    "Data Model & Storage": features.multiTenant
      ? "Database schema supporting multi-tenant isolation and data segregation"
      : features.realtime
      ? "Real-time data synchronization with conflict resolution"
      : "Design database schema, manage migrations, and optimize queries",

    "Search & Filtering": features.realtime
      ? "Real-time search with instant result updates as data changes"
      : features.ai
      ? "Smart search with AI-powered ranking and natural language support"
      : "Full-text search with filtering, sorting, and faceted navigation",

    "Realtime & Subscriptions": features.multiTenant
      ? "Real-time data streams with tenant-aware permission channels"
      : features.ai
      ? "AI-driven real-time predictions and streaming recommendations"
      : "Live data synchronization with WebSocket connections and subscriptions",

    "AI & Machine Learning": features.realtime
      ? "Real-time AI inference and predictions with live model updates"
      : features.data
      ? "ML model training pipeline with historical data and continuous learning"
      : "Implement AI features like recommendations, predictions, or NLP",

    "Mobile App": features.realtime
      ? "Cross-platform mobile app with real-time offline sync"
      : features.offline
      ? "Mobile app with offline support and background sync"
      : "Native or cross-platform mobile application for iOS and Android",

    "Multi-Tenancy & Isolation": "Logical and physical isolation of data and features per tenant with shared infrastructure",
  };

  return descriptions[moduleName] || moduleName;
}

function generateContextualRisks(moduleName: string, text: string, features: DetectedFeatures): string[] {
  const risks: string[] = [];

  switch (moduleName) {
    case "Authentication & User Management":
      if (features.multiTenant) risks.push("Cross-tenant auth and session isolation must be bulletproof");
      if (features.api) risks.push("API token revocation and refresh strategy not yet defined");
      if (!text.match(/mfa|2fa|multi.*factor/i)) risks.push("No mention of MFA/2FA; verify if required");
      risks.push("Password reset flow and email verification process unclear");
      break;

    case "Dashboard & UI Shell":
      if (features.realtime) risks.push("Real-time sync may cause UI flickering or update storms");
      if (features.admin) risks.push("Different widget visibility per role needs careful access control");
      risks.push("Responsive design and mobile breakpoints not specified");
      break;

    case "Reporting & Analytics":
      if (features.realtime) risks.push("Real-time dashboards may have latency or aggregation issues");
      if (features.ai) risks.push("ML model accuracy and retraining frequency unclear");
      if (!text.match(/export|csv|pdf|download/i)) risks.push("No export capability mentioned; verify requirements");
      risks.push("Large dataset performance and pagination strategy needed");
      break;

    case "Billing & Payments":
      if (features.multiTenant) risks.push("Per-tenant billing, metering, and usage reconciliation complex");
      if (features.api) risks.push("Webhook reliability and idempotency for payment events critical");
      if (!text.match(/refund|proration|tax|credit/i)) risks.push("Refund, proration, and tax handling not specified");
      risks.push("PCI compliance scope and security certifications required");
      break;

    case "APIs & Integrations":
      if (features.realtime) risks.push("WebSocket or streaming API error recovery and backoff strategy unclear");
      if (features.multiTenant) risks.push("Per-tenant API keys and rate limits add complexity");
      if (!text.match(/rate.*limit|throttl|quota/i)) risks.push("Rate limiting and quota enforcement not mentioned");
      risks.push("API versioning and backward compatibility strategy needed");
      break;

    case "Notifications & Communications":
      if (features.realtime) risks.push("Delivery guarantee and message ordering in real-time channels unclear");
      if (features.multiTenant) risks.push("Cross-tenant notification leaks must be prevented");
      if (!text.match(/email|sms|push|channel/i)) risks.push("Preferred notification channels (email/SMS/push) not specified");
      risks.push("Unsubscribe, opt-in compliance, and delivery retries not defined");
      break;

    case "Admin & Access Control":
      if (features.multiTenant) risks.push("Tenant admin isolation and super-admin privileges need careful design");
      if (features.api) risks.push("API permission mapping to UI actions may create security gaps");
      risks.push("Audit logging completeness and retention policy unclear");
      break;

    case "Data Model & Storage":
      if (features.multiTenant) risks.push("Cross-tenant data isolation at database level is critical");
      if (features.realtime) risks.push("Conflict resolution and eventual consistency handling needed");
      if (!text.match(/backup|replica|disaster/i)) risks.push("Backup, recovery, and disaster plan not mentioned");
      risks.push("Data retention, encryption, and compliance requirements unclear");
      break;

    case "Search & Filtering":
      if (features.realtime) risks.push("Index staleness and eventual consistency during real-time updates");
      if (features.ai) risks.push("AI relevance tuning and model updates affect search quality");
      risks.push("Search performance with large datasets and pagination needed");
      break;

    case "Realtime & Subscriptions":
      if (features.multiTenant) risks.push("Permission-aware channels and cross-tenant leak prevention essential");
      if (features.data) risks.push("Data consistency during concurrent updates and reconnections");
      risks.push("Connection recovery, backoff, and heartbeat strategy required");
      break;

    case "AI & Machine Learning":
      if (features.realtime) risks.push("Model latency and inference timeouts in real-time scenarios");
      risks.push("Training data, model validation, and A/B testing process unclear");
      risks.push("Model governance, monitoring, and drift detection needed");
      break;

    case "Mobile App":
      if (features.realtime) risks.push("Offline sync, conflict resolution, and battery drain in background");
      risks.push("App store review, signing, and distribution process not planned");
      risks.push("Platform-specific bugs and fragmentation across iOS/Android versions");
      break;

    case "Multi-Tenancy & Isolation":
      risks.push("Row-level security and data partition strategy must be enforced");
      risks.push("Cross-tenant feature leaks and metadata exposure risks");
      break;
  }

  return risks.slice(0, 2);
}

// Detailed module templates for granular breakdown
function generateDetailedModules(features: DetectedFeatures, text: string): ModuleItem[] {
  const modules: ModuleItem[] = [];
  
  // Authentication modules
  if (features.auth || features.otp || features.sso || features.mfa || features.passwordReset || features.userRegistration) {
    if (features.otp) {
      modules.push({
        id: "login-ui-screen",
        name: "Login UI Screen",
        description: "Create username/password + OTP input page with form validation and responsive design",
        effort: "S",
        risks: ["Form validation rules and error handling not specified", "Mobile responsiveness requirements unclear"],
        score: 2
      });
      
      modules.push({
        id: "otp-generation-service",
        name: "OTP Generation Service",
        description: "Generate & send OTP using SMS/Email provider with rate limiting and security",
        effort: "M",
        risks: ["OTP expiration time and retry limits not defined", "SMS/Email provider integration complexity"],
        score: 3
      });
      
      modules.push({
        id: "otp-verification-api",
        name: "OTP Verification API",
        description: "Validate OTP and authenticate user with session management",
        effort: "M",
        risks: ["Session timeout and refresh token strategy unclear", "OTP validation security requirements"],
        score: 3
      });
      
      modules.push({
        id: "retry-cooldown-logic",
        name: "Retry & Cooldown Logic",
        description: "Limit OTP attempts and enable cooldown period to prevent abuse",
        effort: "S",
        risks: ["Cooldown duration and attempt limits not specified", "Rate limiting implementation complexity"],
        score: 2
      });
    }
    
    if (features.audit || features.logging) {
      modules.push({
        id: "audit-logs",
        name: "Audit Logs",
        description: "Log login attempts and OTP failures with security event tracking",
        effort: "S",
        risks: ["Log retention policy and compliance requirements unclear", "Performance impact of extensive logging"],
        score: 1
      });
    }
    
    if (features.sso) {
      modules.push({
        id: "sso-integration",
        name: "SSO Integration",
        description: "Integrate with OAuth/SAML providers for single sign-on authentication",
        effort: "L",
        risks: ["Provider-specific configuration and certificate management", "User mapping and attribute synchronization"],
        score: 4
      });
    }
    
    if (features.mfa) {
      modules.push({
        id: "mfa-setup",
        name: "MFA Setup & Management",
        description: "Configure multi-factor authentication with TOTP and backup codes",
        effort: "M",
        risks: ["Backup code generation and recovery process", "MFA enforcement policies not defined"],
        score: 3
      });
    }
    
    if (features.passwordReset) {
      modules.push({
        id: "password-reset-flow",
        name: "Password Reset Flow",
        description: "Secure password reset with email verification and token validation",
        effort: "M",
        risks: ["Reset token expiration and security requirements", "Email template and branding consistency"],
        score: 3
      });
    }
  }
  
  // Payment modules
  if (features.billing || features.paymentGateway || features.subscription || features.invoice || features.refund) {
    if (features.paymentGateway) {
      modules.push({
        id: "payment-gateway-integration",
        name: "Payment Gateway Integration",
        description: "Integrate with Stripe/PayPal for secure payment processing",
        effort: "M",
        risks: ["Webhook reliability and idempotency handling", "PCI compliance and security requirements"],
        score: 3
      });
    }
    
    if (features.subscription) {
      modules.push({
        id: "subscription-management",
        name: "Subscription Management",
        description: "Handle recurring billing, plan changes, and proration logic",
        effort: "L",
        risks: ["Proration calculations and billing cycle alignment", "Subscription state management complexity"],
        score: 4
      });
    }
    
    if (features.invoice) {
      modules.push({
        id: "invoice-generation",
        name: "Invoice Generation",
        description: "Generate PDF invoices with tax calculations and payment terms",
        effort: "M",
        risks: ["Tax calculation accuracy and compliance requirements", "PDF template customization and branding"],
        score: 3
      });
    }
    
    if (features.refund) {
      modules.push({
        id: "refund-processing",
        name: "Refund Processing",
        description: "Handle refund requests with approval workflow and payment reversal",
        effort: "M",
        risks: ["Refund policy enforcement and approval workflow", "Payment gateway refund API limitations"],
        score: 3
      });
    }
  }
  
  // Communication modules
  if (features.emailService || features.smsService || features.webhook) {
    if (features.emailService) {
      modules.push({
        id: "email-service",
        name: "Email Service",
        description: "Send transactional emails with templates and delivery tracking",
        effort: "M",
        risks: ["Email deliverability and spam prevention", "Template management and personalization"],
        score: 3
      });
    }
    
    if (features.smsService) {
      modules.push({
        id: "sms-service",
        name: "SMS Service",
        description: "Send SMS notifications with carrier compliance and delivery status",
        effort: "M",
        risks: ["SMS cost optimization and carrier restrictions", "Delivery status tracking and retry logic"],
        score: 3
      });
    }
    
    if (features.webhook) {
      modules.push({
        id: "webhook-management",
        name: "Webhook Management",
        description: "Send and receive webhooks with retry logic and signature verification",
        effort: "M",
        risks: ["Webhook reliability and failure handling", "Signature verification and security"],
        score: 3
      });
    }
  }
  
  // Data & Storage modules
  if (features.fileUpload || features.caching || features.data) {
    if (features.fileUpload) {
      modules.push({
        id: "file-upload-service",
        name: "File Upload Service",
        description: "Handle file uploads with validation, virus scanning, and cloud storage",
        effort: "M",
        risks: ["File size limits and storage costs", "Virus scanning and security validation"],
        score: 3
      });
    }
    
    if (features.caching) {
      modules.push({
        id: "caching-layer",
        name: "Caching Layer",
        description: "Implement Redis/Memcached for performance optimization and cache invalidation",
        effort: "M",
        risks: ["Cache invalidation strategy and consistency", "Memory usage and cache hit ratio optimization"],
        score: 3
      });
    }
  }
  
  // Real-time modules
  if (features.websocket || features.realtimeSync || features.conflictResolution) {
    if (features.websocket) {
      modules.push({
        id: "websocket-connection",
        name: "WebSocket Connection",
        description: "Establish real-time connections with heartbeat and reconnection logic",
        effort: "M",
        risks: ["Connection stability and reconnection strategy", "Scalability with concurrent connections"],
        score: 3
      });
    }
    
    if (features.realtimeSync) {
      modules.push({
        id: "realtime-sync",
        name: "Real-time Sync",
        description: "Synchronize data changes across clients with conflict resolution",
        effort: "L",
        risks: ["Conflict resolution strategy and data consistency", "Performance with large datasets"],
        score: 4
      });
    }
  }
  
  // Search & Filtering modules
  if (features.searchIndex || features.filtering || features.sorting || features.pagination) {
    if (features.searchIndex) {
      modules.push({
        id: "search-index",
        name: "Search Index",
        description: "Build and maintain search index with Elasticsearch/Solr integration",
        effort: "L",
        risks: ["Index performance and memory requirements", "Search relevance tuning and maintenance"],
        score: 4
      });
    }
    
    if (features.filtering || features.sorting) {
      modules.push({
        id: "filter-sort-ui",
        name: "Filter & Sort UI",
        description: "Create filtering and sorting interface with dynamic query building",
        effort: "S",
        risks: ["UI performance with large result sets", "Filter combination complexity"],
        score: 2
      });
    }
    
    if (features.pagination) {
      modules.push({
        id: "pagination-service",
        name: "Pagination Service",
        description: "Implement efficient pagination with cursor-based or offset-based navigation",
        effort: "S",
        risks: ["Performance with large datasets", "Consistency during data updates"],
        score: 2
      });
    }
  }
  
  // Reporting & Analytics modules
  if (features.export || features.chart || features.dashboard) {
    if (features.export) {
      modules.push({
        id: "export-service",
        name: "Export Service",
        description: "Generate CSV/PDF exports with background processing and download links",
        effort: "M",
        risks: ["Large dataset export performance", "File storage and cleanup management"],
        score: 3
      });
    }
    
    if (features.chart) {
      modules.push({
        id: "chart-components",
        name: "Chart Components",
        description: "Create interactive charts and visualizations with data binding",
        effort: "M",
        risks: ["Chart performance with large datasets", "Responsive design across devices"],
        score: 3
      });
    }
    
    if (features.dashboard) {
      modules.push({
        id: "dashboard-layout",
        name: "Dashboard Layout",
        description: "Design responsive dashboard with widget management and customization",
        effort: "M",
        risks: ["Widget performance and loading optimization", "User customization and permissions"],
        score: 3
      });
    }
  }
  
  // UI/UX modules
  if (features.navigation || features.responsive || features.accessibility) {
    if (features.navigation) {
      modules.push({
        id: "navigation-system",
        name: "Navigation System",
        description: "Build responsive navigation with breadcrumbs and menu management",
        effort: "S",
        risks: ["Mobile navigation UX and accessibility", "Menu hierarchy and permissions"],
        score: 2
      });
    }
    
    if (features.responsive) {
      modules.push({
        id: "responsive-design",
        name: "Responsive Design",
        description: "Ensure mobile-first responsive design across all components",
        effort: "M",
        risks: ["Cross-browser compatibility and testing", "Performance on mobile devices"],
        score: 3
      });
    }
    
    if (features.accessibility) {
      modules.push({
        id: "accessibility-compliance",
        name: "Accessibility Compliance",
        description: "Implement WCAG 2.1 AA compliance with screen reader support",
        effort: "M",
        risks: ["Accessibility testing and validation", "Keyboard navigation and focus management"],
        score: 3
      });
    }
  }
  
  // Infrastructure modules
  if (features.testing || features.deployment || features.monitoring) {
    if (features.testing) {
      modules.push({
        id: "test-automation",
        name: "Test Automation",
        description: "Set up unit, integration, and E2E testing with CI/CD integration",
        effort: "M",
        risks: ["Test coverage targets and maintenance", "Test data management and cleanup"],
        score: 3
      });
    }
    
    if (features.deployment) {
      modules.push({
        id: "deployment-pipeline",
        name: "Deployment Pipeline",
        description: "Configure CI/CD pipeline with staging environments and rollback capability",
        effort: "M",
        risks: ["Environment configuration management", "Deployment rollback and recovery procedures"],
        score: 3
      });
    }
    
    if (features.monitoring) {
      modules.push({
        id: "monitoring-alerts",
        name: "Monitoring & Alerts",
        description: "Set up application monitoring with alerting and performance tracking",
        effort: "M",
        risks: ["Alert fatigue and false positive management", "Performance baseline establishment"],
        score: 3
      });
    }
  }
  
  // Security modules
  if (features.security || features.encryption || features.compliance) {
    if (features.security) {
      modules.push({
        id: "security-hardening",
        name: "Security Hardening",
        description: "Implement security best practices and vulnerability scanning",
        effort: "M",
        risks: ["Security testing and penetration testing", "Security policy enforcement"],
        score: 3
      });
    }
    
    if (features.encryption) {
      modules.push({
        id: "encryption-service",
        name: "Encryption Service",
        description: "Implement data encryption at rest and in transit with key management",
        effort: "L",
        risks: ["Key management and rotation strategy", "Performance impact of encryption"],
        score: 4
      });
    }
    
    if (features.compliance) {
      modules.push({
        id: "compliance-framework",
        name: "Compliance Framework",
        description: "Implement GDPR/HIPAA compliance with audit trails and data protection",
        effort: "L",
        risks: ["Compliance requirements interpretation", "Audit trail completeness and retention"],
        score: 4
      });
    }
  }
  
  return modules;
}

function generateGaps(text: string, features: DetectedFeatures, modules: ModuleItem[]): string[] {
  const gaps: string[] = [];
  const textLower = text.toLowerCase();

  if (features.billing && !textLower.match(/refund|return|proration|dunning/)) {
    gaps.push("Billing module present but refund, proration, and dunning workflows not mentioned.");
  }

  if (features.auth && !textLower.match(/mfa|2fa|sso|ldap/)) {
    gaps.push("Auth present without details on MFA/2FA or enterprise SSO support.");
  }

  if (features.realtime && !textLower.match(/conflict|eventual|consistency|sync/)) {
    gaps.push("Real-time feature mentioned but conflict resolution and consistency model unclear.");
  }

  if (features.api && !textLower.match(/rate.*limit|throttl|quota|backoff/)) {
    gaps.push("API integrations present but rate limiting and throttling strategy not defined.");
  }

  if (features.data && !textLower.match(/backup|disaster|recovery|migration/)) {
    gaps.push("Data storage required but backup, recovery, and migration plans missing.");
  }

  if ((features.auth || features.billing || features.data) && !textLower.match(/security|encrypt|pii|gdpr|hipaa/)) {
    gaps.push("Sensitive data handling mentioned but encryption, PII protection, or compliance requirements not specified.");
  }

  if (features.multiTenant && !textLower.match(/isolat|segregat|partition|tenant.*data/)) {
    gaps.push("Multi-tenancy required but data isolation and segregation strategy not detailed.");
  }

  if (!textLower.match(/test|qa|qc|performance|load/)) {
    gaps.push("No mention of testing, QA, or performance optimization strategy.");
  }

  if (!textLower.match(/deploy|devops|ci|cd|production/)) {
    gaps.push("Deployment, CI/CD pipeline, and production monitoring not discussed.");
  }

  if (features.mobile && !textLower.match(/app\s*store|play\s*store|ios|android|native|cross.*platform/)) {
    gaps.push("Mobile app planned but platform support (iOS/Android) and distribution strategy unclear.");
  }

  return gaps.slice(0, 4);
}

// AI-powered module analysis function (client-side)
async function analyzeWithAI(input: string): Promise<ModuleItem[]> {
  try {
    const response = await fetch('/api/ai-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.modules || [];

  } catch (error) {
    console.error("AI analysis failed:", error);
    return []; // Return empty array to trigger fallback
  }
}

export async function analyzeDescription(input: string): Promise<AnalysisResult> {
  const text = input.trim();
  const tokens = tokenize(text);
  const features = detectFeatures(text);

  // Try AI analysis first
  let modules: ModuleItem[] = [];
  
  try {
    modules = await analyzeWithAI(text);
    console.log("Using AI-powered analysis");
  } catch (error) {
    console.log("AI analysis failed, falling back to rule-based system");
  }

  // If AI analysis didn't work, use rule-based system
  if (modules.length === 0) {
    console.log("Using rule-based analysis");
    modules = generateDetailedModules(features, text);

    // If no detailed modules were generated, fall back to legacy approach
    if (modules.length === 0) {
    const found = new Map<string, ModuleItem>();

    // Discover modules by keyword matching
    for (const entry of keywordMap) {
      if (features[entry.key]) {
        const name = entry.module;
        const prev = found.get(name);
        const booster = boosters.reduce((acc, b) => (b.rx.test(text) ? acc + b.weight : acc), 0);
        const score = (prev?.score ?? 0) + entry.baseScore + booster;
        
        found.set(name, {
          id: idFor(name),
          name,
          description: generateDescription(name, text, features),
          effort: sizeFromScore(score),
          risks: generateContextualRisks(name, text, features),
          score,
        });
      }
    }

    // Create specific modules for unmatched tokens instead of generic "Core Feature"
    for (const t of tokens) {
      const matched = keywordMap.some((k) => k.rx.test(t));
      if (!matched && t.length > 2) {
        const capName = t.charAt(0).toUpperCase() + t.slice(1);
        const name = capName;
        const booster = boosters.reduce((acc, b) => (b.rx.test(t) ? acc + b.weight : acc), 0);
        const score = 2 + booster;
        
        found.set(name, {
          id: idFor(name),
          name,
          description: `${capName} functionality and user workflows`,
          effort: sizeFromScore(score),
          risks: [
            `${capName} requirements and scope need further clarification`,
            `Integration points with other modules not yet defined`,
          ],
          score,
        });
      }
    }

    modules = Array.from(found.values());
    }
  }

  // Ensure 3–8 modules by merging or padding
  if (modules.length > 8) {
    modules.sort((a, b) => b.score - a.score);
    const keep = modules.slice(0, 7);
    const rest = modules.slice(7);
    if (rest.length) {
      const totalScore = rest.reduce((s, m) => s + m.score, 0);
      keep.push({
        id: "supporting-work",
        name: "Supporting & Glue Work",
        description: "Cross-cutting infrastructure, testing, and deployment tasks",
        effort: sizeFromScore(Math.max(3, Math.round(totalScore / Math.max(1, rest.length)))),
        risks: ["Hidden integration effort and testing scope not yet quantified"],
        score: Math.max(3, Math.round(totalScore / Math.max(1, rest.length))),
      });
    }
    modules = keep;
  }

  if (modules.length < 3) {
    const existingNames = new Set(modules.map((m) => m.name));
    
    if (!existingNames.has("Testing & Quality Assurance")) {
      modules.push({
        id: "testing-qa",
        name: "Testing & Quality Assurance",
        description: "Comprehensive test strategy, automation, and quality gates",
        effort: "S",
        risks: ["Test coverage targets and automation scope not defined"],
        score: 2,
      });
    }
    
    if (modules.length < 3 && !existingNames.has("Deployment & Infrastructure")) {
      modules.push({
        id: "deployment",
        name: "Deployment & Infrastructure",
        description: "CI/CD pipelines, environment setup, and production monitoring",
        effort: "S",
        risks: ["Hosting provider and deployment tooling not specified"],
        score: 2,
      });
    }
  }

  // Sort by score descending for better presentation
  modules.sort((a, b) => b.score - a.score);

  // Generate smart gaps
  const gaps = generateGaps(text, features, modules);

  // Add additional validation flags
  if (text.length < 15) gaps.unshift("Description is very brief; more context needed for accurate scoping");

  return { modules: modules.slice(0, 8), flags: gaps };
}
