# Authentication Role Structure

## Overview

This document outlines how authentication and role-based permissions work in our application.

## User Object Structure

Authenticated users have the following structure in our system:

```javascript
{
  id: 'user-id',
  email: 'user@example.com',
  role: 'authenticated',      // This is from Supabase, not our custom role
  app_metadata: {
    role: 'admin'            // This is our custom role used for permissions
  }
}
