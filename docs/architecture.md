# AWS Architectures

3 production-ready AWS architectures :

1. Case: < 10 Monthly Users (Ultra Low Traffic / MVP)

```mermaid
flowchart TD
    Users["Users"]
    Route53["Route53 (DNS)"]
    CloudFront["CloudFront (CDN) + WAF"]
    Lambda1["Lambda<br/>(Next SSR + BFF)"]
    Cognito["Cognito Hosted UI"]
    S3["S3<br/>(Static assets)"]
    Lambda2["Lambda (ElysiaJS backend)"]
    NeonDB["Neon Database"]

    Users --> Route53
    Route53 --> CloudFront
    CloudFront --> Lambda1
    CloudFront --> S3
    Lambda1 --> Cognito
    Lambda1 --> Lambda2
    Lambda2 --> NeonDB
```

2. Case: > 3000 Monthly Users (Growing Startup)

```mermaid
flowchart TD
    Users["Users"]
    Route53["Route53 (DNS)"]
    CloudFront["CloudFront (CDN) + WAF"]
    ALB1["Internet Facing ALB (Listener rules to apply auth to only specific nextjs pages)"]
    Cognito["Cognito Hosted UI"]
    ECS1["ECS Cluster (Next.js)"]
    S3["S3<br/>(Static assets)"]
    ALB2["Internal ALB"]
    ECS2["ECS Cluster (ElysiaJS) Microservices"]
    Redis["Redis (Optional)"]
    NeonDB["Neon Database"]

    Users --> Route53
    Route53 --> CloudFront
    CloudFront --> ALB1
    CloudFront --> S3
    ALB1 --> Cognito
    ALB1 --> ECS1
    Cognito --> ECS1
    ECS1 --> ALB2
    ALB2 --> ECS2
    ECS1 --> Redis
    ECS2 --> Redis
    ECS2 --> NeonDB
```

3. Case: > 10000 Monthly Users (High Traffic / Enterprise)

```mermaid
flowchart TD
    Users["Users"]
    Route53["Route53 (DNS)"]
    CloudFront["CloudFront (CDN) + WAF"]
    ALB1["Internet Facing ALB (Listener rules to apply auth to only specific nextjs pages)"]
    Cognito["Cognito Hosted UI"]
    ECS1["ECS Cluster (Next.js)"]
    S3["S3<br/>(Static assets)"]
    ALB2["Internal ALB"]
    ECS2["ECS Cluster (ElysiaJS) HTTPS Microservices"]
    ECS3["ECS Cluster (Worker Service)"]
    SQS["SQS (Message Queue)"]
    Redis["Redis (Optional)"]
    NeonDB["Neon Database"]

    Users --> Route53
    Route53 --> CloudFront
    CloudFront --> ALB1
    CloudFront --> S3
    ALB1 --> Cognito
    ALB1 --> ECS1
    Cognito --> ECS1
    ECS1 --> ALB2
    ALB2 --> ECS2
    ECS2 --> SQS
    SQS --> ECS3
    ECS3 --> ECS2
    ECS1 --> Redis
    ECS2 --> Redis
    ECS2 --> NeonDB
```
