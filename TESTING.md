# Testing Documentation

This document outlines the testing strategy and setup for the User Management System.

## Testing Framework

We use Jest as our primary testing framework. The setup includes:

- Jest for test running and assertions
- React Testing Library for component testing
- Node-mocks-http for API route testing
- Mock implementations for Supabase client

## Running Tests

To run all tests:

```bash
npm test
```

To run tests in watch mode (recommended during development):

```bash
npm run test:watch
```

To run a specific test file:

```bash
npm test -- path/to/test-file.js
```

## Test Structure

Tests are organized in the `__tests__` directory, mirroring the structure of the source code:

```
__tests__/
  ├── components/       # Component tests
  ├── lib/              # Library/utility tests
  ├── middleware/       # Middleware tests
  ├── pages/            # Page component and API route tests
  └── simple.test.js    # Basic test to verify Jest setup
```

## Mocking Strategy

### Supabase Client

The Supabase client is mocked in each test file that requires it. The mock implementation provides:

- Authentication methods (signIn, signUp, signOut, etc.)
- Database query methods (from, select, insert, update, delete, etc.)
- Storage methods for file uploads

Example mock implementation:

```javascript
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
  getServiceSupabase: jest.fn(),
}));
```

### API Routes

API routes are tested using `node-mocks-http` to create mock request and response objects:

```javascript
import { createMocks } from 'node-mocks-http';

const { req, res } = createMocks({
  method: 'GET',
  headers: {
    authorization: 'Bearer test-token',
  },
});
```

## Test Coverage

# User Management System - End User Functionality Overview

## 1. User Types and Registration Paths

### Personal User Path
- Standard personal user registration with email/password
- Basic profile information collection (name, email, password)
- Email verification process
- Terms acceptance during registration

### Business User Path
- Corporate user registration with extended business information
- Company details collection (name, size, industry, website)
- Business contact information (position, department)
- Company address and VAT ID verification
- Option for company validation/verification
- Corporate profile management tools

## 2. Authentication Methods

### Traditional Authentication
- Email/password login
- "Remember me" functionality 
- Password reset flow

### Single Sign-On (SSO) Options
- **Business-oriented SSO**: 
  - Microsoft (Office/Azure)
  - Google Workspace
  - LinkedIn
- **General SSO**:
  - GitHub
  - Facebook
  - Twitter
  - Apple

### Multi-Factor Authentication
- Two-factor authentication (2FA) setup
- Multiple 2FA methods (TOTP, SMS, Email)
- Backup codes generation
- 2FA recovery process

## 3. Profile Management

### Personal Profile Features
- Basic profile editing (name, bio)
- Personal avatar upload with cropping
- Location and contact information
- Public/private profile toggle

### Corporate Profile Features
- Company profile management
- Company logo/avatar management
- Department and position information
- Team member connection/visibility
- Business domain verification
- Corporate address management

## 4. Subscription and Licensing

### Personal Tiers
- **Free Tier**: Basic personal profile, standard authentication
- **Basic Tier**: Additional profile features, data export
- **Premium Tier**: Advanced security features, priority support

### Business Tiers
- **Business Basic**: Small company features, limited team members
- **Business Premium**: Enhanced business features, expanded team
- **Enterprise Tier**: 
  - Team management capabilities
  - Advanced analytics and reporting
  - Custom integration options
  - Admin console for user management
  - Role-based access control
  - Organization-wide policies

### Payment Options
- Monthly/yearly billing cycles
- Team/seat-based pricing
- Payment method management
- Invoice generation and download
- Subscription management

## 5. Security and Privacy Controls

### Personal Security
- Basic privacy controls
- Profile visibility settings
- Personal data management

### Business Security
- Role-based access control (RBAC)
- Team permission management
- Admin controls for corporate accounts
- Organization-wide security policies
- Session management for team members
- Corporate data protection controls

## 6. Notification Preferences

### Communication Channels
- Email notifications
- Push notifications (web)
- Mobile notifications
- SMS notifications

### Business-specific Notifications
- Team activity alerts
- Admin action notifications
- Security policy alerts
- Organization-wide announcements

## 7. Data Management

### Personal Data
- Personal profile export options
- Individual account settings

### Business Data
- Corporate data export capabilities
- Team data management
- Organizational data controls
- Batch operations for team members
- Data retention policies

## 8. Platform and Device Support

### Web Platform
- Desktop browser experience
- Responsive web design

### Mobile Support
- iOS optimized interface
- Android optimized interface
- Native mobile experiences

## User Flow Test Paths

### Personal User Flows

1. **New Personal User Registration**
   - Personal sign up → Email verification → Profile completion → Dashboard

2. **Personal Authentication Flow**
   - Personal login → (Optional 2FA) → Personal dashboard

3. **Personal Profile Management**
   - Dashboard → Personal profile → Edit profile → Upload avatar → Save changes

4. **Personal Subscription Management**
   - Plans page → Select personal plan → Payment → Access features

### Business User Flows

1. **New Business Registration**
   - Business sign up option → Company details → Verification → Business dashboard

2. **Business Authentication Flow**
   - Business login → (Business SSO options) → (2FA) → Business dashboard

3. **Corporate Profile Setup**
   - Business dashboard → Company profile → Add team info → Add company details

4. **Business Subscription Setup**
   - Business plans page → Select team size → Enterprise features → Payment

5. **Team Member Management**
   - Admin console → Add team members → Assign roles → Set permissions

6. **Business Security Configuration**
   - Business settings → Security policies → 2FA requirements → Session limits

## Cross-cutting Test Scenarios

1. **User Type Transition**
   - Test converting personal account to business account
   - Verify business-specific fields appear after conversion

2. **SSO Connection Testing**
   - Test all SSO providers for both personal and business accounts
   - Verify business-specific SSO options (Microsoft, Google Workspace)

3. **Multi-device Testing**
   - Verify experiences across desktop, tablet and mobile
   - Test platform-specific optimizations

4. **Subscription Tier Feature Testing**
   - Verify feature availability across different tiers
   - Test business-specific features in enterprise tiers
   - Verify licensing limits (e.g., team member counts)

5. **Security Policy Enforcement**
   - Test business admin-enforced security policies
   - Verify organization-wide settings propagation
