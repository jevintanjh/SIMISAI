# System Architect: AWS Deployment Orchestrator

## 🎯 Mission Statement
Orchestrate the migration of SIMISAI from Render to AWS with seamless integration of Sealion LLM via SageMaker and CV service connectivity.

## 📋 Current State Analysis

### Render Deployment Status
- **Frontend**: Astro + React application
- **Backend**: Node.js + Express server
- **Database**: PostgreSQL (likely Neon)
- **CV Service**: Python YOLOv8 model
- **Real-time**: WebSocket chat system

### Target AWS Architecture
- **Frontend**: S3 + CloudFront
- **Backend**: Lambda + API Gateway
- **AI Services**: SageMaker (Sealion LLM) + CV Lambda
- **Database**: RDS PostgreSQL
- **Real-time**: API Gateway WebSocket

## 🔗 Integration Points with Co-worker's CV Service

### CV Service Connectivity Requirements
1. **API Endpoint**: Ensure consistent API contract
2. **Authentication**: Shared IAM roles/permissions
3. **Network**: VPC configuration for Lambda access
4. **Monitoring**: CloudWatch integration
5. **Error Handling**: Graceful fallback mechanisms

### CV Service Integration Contract
```typescript
interface CVServiceContract {
  endpoint: string;
  authentication: 'IAM' | 'API_KEY' | 'NONE';
  requestFormat: {
    image: string; // base64 encoded
    confidence_threshold: number;
    device_type?: string;
  };
  responseFormat: {
    detections: DetectionResult[];
    processing_time: number;
    model_version: string;
  };
}
```

## 🚀 Migration Strategy

### Phase 1: Infrastructure Setup (Week 1-2)
1. **AWS Account Setup**
   - Create IAM roles and policies
   - Set up VPC and networking
   - Configure RDS PostgreSQL
   - Deploy SageMaker endpoint

2. **CV Service Integration**
   - Coordinate with co-worker on API contract
   - Set up Lambda function for CV service calls
   - Implement error handling and retries
   - Test connectivity and performance

### Phase 2: Backend Migration (Week 3-4)
1. **API Gateway Setup**
   - Create REST API endpoints
   - Set up WebSocket API for chat
   - Configure CORS and authentication
   - Implement rate limiting

2. **Lambda Functions**
   - Chat service with SageMaker integration
   - Device management API
   - User session management
   - CV service proxy

### Phase 3: Frontend Migration (Week 5-6)
1. **S3 + CloudFront Setup**
   - Configure S3 bucket for static assets
   - Set up CloudFront distribution
   - Configure custom domain and SSL
   - Implement cache invalidation

2. **Frontend Updates**
   - Update API endpoints to AWS
   - Implement error handling
   - Add loading states
   - Test mobile responsiveness

### Phase 4: Testing & Optimization (Week 7-8)
1. **Integration Testing**
   - End-to-end functionality
   - Performance testing
   - Security testing
   - Load testing

2. **Monitoring & Alerting**
   - CloudWatch dashboards
   - Error tracking
   - Performance metrics
   - Cost monitoring

## 🔧 Technical Implementation Plan

### 1. SageMaker Integration
```typescript
// SageMaker service integration
export class SageMakerChatService {
  private client: SageMakerRuntimeClient;
  private endpointName: string;
  
  async sendMessage(message: string, context: ChatContext): Promise<string> {
    const payload = {
      message,
      context: {
        deviceType: context.deviceType,
        currentStep: context.currentStep,
        language: context.language,
        userPreferences: context.userPreferences
      }
    };
    
    const command = new InvokeEndpointCommand({
      EndpointName: this.endpointName,
      ContentType: 'application/json',
      Body: JSON.stringify(payload)
    });
    
    const response = await this.client.send(command);
    return JSON.parse(response.Body.toString());
  }
}
```

### 2. CV Service Integration
```typescript
// CV service integration with co-worker's setup
export class CVServiceProxy {
  private cvEndpoint: string;
  private httpClient: AxiosInstance;
  
  async detectDevices(imageData: string): Promise<DetectionResult[]> {
    try {
      const response = await this.httpClient.post(this.cvEndpoint, {
        image: imageData,
        confidence_threshold: 0.5,
        device_type: 'thermometer' // or detected from context
      });
      
      return response.data.detections;
    } catch (error) {
      console.error('CV service error:', error);
      // Implement fallback or retry logic
      throw new Error('CV service unavailable');
    }
  }
}
```

### 3. Database Migration
```sql
-- RDS PostgreSQL setup
CREATE DATABASE simisai_production;
CREATE USER simisai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE simisai_production TO simisai_user;

-- Migrate existing schema
-- (Use Drizzle migrations)
```

## 📊 Monitoring & Observability

### CloudWatch Metrics
- **API Gateway**: Request count, latency, error rate
- **Lambda**: Duration, memory usage, error count
- **SageMaker**: Invocation count, model latency
- **RDS**: Connection count, query performance
- **CloudFront**: Cache hit ratio, origin latency

### Alerting Rules
- High error rate (>5%)
- High latency (>2s)
- Low cache hit ratio (<80%)
- Database connection issues
- SageMaker endpoint failures

## 🔒 Security Considerations

### IAM Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sagemaker:InvokeEndpoint"
      ],
      "Resource": "arn:aws:sagemaker:region:account:endpoint/sealion-chat-endpoint"
    },
    {
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBInstances",
        "rds:Connect"
      ],
      "Resource": "arn:aws:rds:region:account:db:simisai-production"
    }
  ]
}
```

### Network Security
- VPC with private subnets
- Security groups for Lambda functions
- NAT Gateway for outbound internet access
- WAF for API Gateway protection

## 💰 Cost Optimization

### Estimated Monthly Costs
- **S3 + CloudFront**: ~$50-100
- **Lambda**: ~$20-50
- **API Gateway**: ~$30-80
- **SageMaker**: ~$200-500 (depending on usage)
- **RDS**: ~$100-200
- **Total**: ~$400-930/month

### Cost Optimization Strategies
- Lambda provisioned concurrency for critical functions
- CloudFront cache optimization
- RDS instance sizing
- SageMaker auto-scaling
- S3 lifecycle policies

## 🚨 Risk Mitigation

### High-Risk Areas
1. **CV Service Dependency**: Single point of failure
2. **SageMaker Costs**: Can spike with high usage
3. **Database Migration**: Data loss risk
4. **WebSocket Migration**: Real-time functionality

### Mitigation Strategies
1. **CV Service**: Implement fallback to local model
2. **SageMaker**: Set up cost alerts and usage limits
3. **Database**: Blue-green deployment strategy
4. **WebSocket**: Gradual migration with feature flags

## 📅 Timeline & Milestones

### Week 1-2: Foundation
- [ ] AWS infrastructure setup
- [ ] CV service connectivity testing
- [ ] SageMaker endpoint deployment
- [ ] Database migration planning

### Week 3-4: Backend
- [ ] Lambda functions development
- [ ] API Gateway configuration
- [ ] SageMaker integration
- [ ] CV service integration

### Week 5-6: Frontend
- [ ] S3 + CloudFront setup
- [ ] Frontend API updates
- [ ] Testing and debugging
- [ ] Performance optimization

### Week 7-8: Production
- [ ] End-to-end testing
- [ ] Monitoring setup
- [ ] Security review
- [ ] Go-live preparation

## 🤝 Coordination with Co-worker

### CV Service Requirements
1. **API Contract**: Standardized request/response format
2. **Authentication**: IAM-based or API key
3. **Error Handling**: Consistent error codes and messages
4. **Monitoring**: CloudWatch integration
5. **Documentation**: API documentation and examples

### Communication Protocol
- Daily standups for progress updates
- Shared Slack channel for technical discussions
- Weekly architecture review meetings
- Shared documentation repository

## 📋 Success Criteria

### Technical Metrics
- [ ] 99.9% uptime
- [ ] <2s API response time
- [ ] <5% error rate
- [ ] Successful CV service integration
- [ ] SageMaker response time <1s

### Business Metrics
- [ ] Zero data loss during migration
- [ ] Maintained user experience
- [ ] Cost within budget
- [ ] Security compliance
- [ ] Scalability achieved

---

## 🎯 Next Actions

1. **Coordinate with co-worker** on CV service API contract
2. **Set up AWS infrastructure** foundation
3. **Deploy SageMaker endpoint** for Sealion LLM
4. **Create Lambda functions** for backend services
5. **Test CV service connectivity** and integration

This system architect subagent will guide the entire migration process, ensuring seamless integration with your co-worker's CV service while maintaining the quality and performance of the SIMISAI application.
