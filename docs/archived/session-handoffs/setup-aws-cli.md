# 🔧 AWS CLI Setup Guide - System Architect

## 🎯 Overview
As your System Architect, I'm setting up AWS CLI configuration to enable our deployment orchestration. This is critical for:

- **CloudFormation deployment** of our infrastructure
- **Lambda function management** and updates
- **API Gateway configuration** and testing
- **SageMaker endpoint** setup for Sealion LLM
- **CV service coordination** with your co-worker
- **Monitoring and logging** setup

## 🚀 Setup Process

### Step 1: Configure AWS CLI
```bash
aws configure
```

You'll need to provide:
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region name**: `us-east-1` (recommended)
- **Default output format**: `json` (recommended)

### Step 2: Verify Configuration
```bash
aws sts get-caller-identity
```

This should return your AWS account details.

### Step 3: Test Basic Access
```bash
aws s3 ls
aws ec2 describe-regions --region us-east-1
```

## 🔑 Required AWS Permissions

Your AWS user/role needs these permissions for our deployment:

### Essential Services
- **CloudFormation**: Full access for infrastructure deployment
- **Lambda**: Full access for function management
- **API Gateway**: Full access for API configuration
- **S3**: Full access for frontend hosting
- **CloudFront**: Full access for CDN setup
- **RDS**: Full access for database management
- **SageMaker**: Full access for LLM endpoint management
- **IAM**: Limited access for role creation
- **EC2**: Limited access for VPC configuration

### Recommended IAM Policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:*",
                "lambda:*",
                "apigateway:*",
                "s3:*",
                "cloudfront:*",
                "rds:*",
                "sagemaker:*",
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PassRole",
                "ec2:DescribeVpcs",
                "ec2:DescribeSubnets",
                "ec2:DescribeSecurityGroups",
                "ec2:CreateSecurityGroup",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:AuthorizeSecurityGroupEgress"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🌍 Region Configuration

### Recommended Regions
1. **Primary**: `us-east-1` (N. Virginia)
   - Best for global services
   - Lowest latency for most services
   - Most services available

2. **Secondary**: `us-west-2` (Oregon)
   - Good alternative
   - Lower costs in some cases

### Region-Specific Considerations
- **SageMaker**: Available in most regions
- **Lambda**: Available in all regions
- **API Gateway**: Available in all regions
- **CloudFront**: Global service
- **RDS**: Available in most regions

## 🔧 Configuration Files

### AWS Credentials File
Location: `~/.aws/credentials`
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
```

### AWS Config File
Location: `~/.aws/config`
```ini
[default]
region = us-east-1
output = json
```

## 🧪 Testing Commands

### Basic Connectivity
```bash
# Test authentication
aws sts get-caller-identity

# Test S3 access
aws s3 ls

# Test EC2 access
aws ec2 describe-regions

# Test Lambda access
aws lambda list-functions
```

### Service-Specific Tests
```bash
# Test CloudFormation
aws cloudformation list-stacks

# Test API Gateway
aws apigateway get-rest-apis

# Test SageMaker
aws sagemaker list-endpoints

# Test RDS
aws rds describe-db-instances
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **Access Denied Errors**
```bash
# Check your permissions
aws iam get-user
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

#### 2. **Region Issues**
```bash
# Set default region
aws configure set region us-east-1

# Check available regions
aws ec2 describe-regions
```

#### 3. **Credential Issues**
```bash
# Reconfigure credentials
aws configure

# Check credential file
cat ~/.aws/credentials
```

#### 4. **Profile Issues**
```bash
# Use specific profile
aws --profile YOUR_PROFILE sts get-caller-identity

# List profiles
aws configure list-profiles
```

## 🔒 Security Best Practices

### 1. **Use IAM Roles (Recommended)**
- Create specific IAM roles for different tasks
- Use temporary credentials when possible
- Rotate access keys regularly

### 2. **Least Privilege Principle**
- Only grant necessary permissions
- Use specific resource ARNs when possible
- Regular permission audits

### 3. **Multi-Factor Authentication**
- Enable MFA on AWS account
- Use MFA for sensitive operations
- Consider AWS SSO for team access

## 📊 Next Steps After Setup

### 1. **Deploy Infrastructure**
```bash
# Deploy our CloudFormation stack
aws cloudformation deploy \
  --template-file aws-deployment/infrastructure/cloudformation-template.yaml \
  --stack-name simisai-production \
  --capabilities CAPABILITY_IAM
```

### 2. **Set Up SageMaker Endpoint**
```bash
# Create SageMaker endpoint for Sealion LLM
aws sagemaker create-endpoint \
  --endpoint-name sealion-chat-endpoint \
  --endpoint-config-name sealion-chat-config
```

### 3. **Test CV Service Integration**
```bash
# Test connectivity with co-worker's CV service
curl -X POST https://cv-service.example.com/detect \
  -H "Content-Type: application/json" \
  -d '{"image":"test","device_type":"thermometer"}'
```

### 4. **Deploy Lambda Functions**
```bash
# Deploy chat service
aws lambda update-function-code \
  --function-name simisai-production-chat-function \
  --zip-file fileb://chat-service.zip

# Deploy CV service
aws lambda update-function-code \
  --function-name simisai-production-cv-function \
  --zip-file fileb://cv-service.zip
```

## 🎯 System Architect Recommendations

### Immediate Actions
1. **Configure AWS CLI** with your credentials
2. **Test basic connectivity** to AWS services
3. **Verify permissions** for required services
4. **Set up default region** (us-east-1 recommended)

### Short-term Goals
1. **Deploy infrastructure** using CloudFormation
2. **Set up SageMaker endpoint** for Sealion LLM
3. **Test CV service integration** with co-worker
4. **Deploy Lambda functions** for backend services

### Long-term Goals
1. **Implement CI/CD pipeline** with AWS
2. **Set up monitoring and alerting** with CloudWatch
3. **Optimize costs** and performance
4. **Implement security best practices**

## 📞 Support

If you encounter issues:
1. **Check AWS documentation** for specific services
2. **Verify IAM permissions** for your user/role
3. **Test with minimal permissions** first
4. **Contact AWS support** for account-specific issues

---

## 🚀 Ready to Proceed?

Once AWS CLI is configured, we can:
1. **Deploy our complete infrastructure**
2. **Set up SageMaker for Sealion LLM**
3. **Coordinate with your co-worker's CV service**
4. **Begin the migration from Render to AWS**

The System Architect is ready to orchestrate the entire AWS deployment! 🏗️
