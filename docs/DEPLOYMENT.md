# Production Deployment Guide

This document provides instructions for deploying the application to production environments while keeping API keys and sensitive information secure.

## Environment Variables

For security reasons, API keys and other sensitive information should never be hardcoded in the application or committed to version control. Instead, they should be set as environment variables in your production environment.

### Required Environment Variables

The following environment variables must be set in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (private, server-side only)

## Deployment Options

### Option 1: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. In the Vercel dashboard, go to your project settings
3. Navigate to the "Environment Variables" section
4. Add each of the required environment variables
5. Deploy your application

Vercel will automatically use these environment variables during the build process and in the runtime environment.

### Option 2: Netlify

1. Connect your GitHub repository to Netlify
2. In the Netlify dashboard, go to your site settings
3. Navigate to the "Build & deploy" > "Environment variables" section
4. Add each of the required environment variables
5. Deploy your application

### Option 3: Docker

If deploying with Docker:

1. Create a `.env.production` file (do not commit this to version control)
2. Pass environment variables to your Docker container:

```bash
docker run -p 3000:3000 \
  --env-file .env.production \
  your-image-name
```

Or set them directly:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-key \
  your-image-name
```

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use different API keys for development and production**
3. **Regularly rotate your API keys**
4. **Use the principle of least privilege** - only use the service role key when absolutely necessary
5. **Monitor your API usage** for unusual patterns that might indicate a compromised key

## Checking Environment Variables

To verify that your environment variables are correctly set, you can add a temporary API endpoint:

```javascript
// pages/api/check-env.js (REMOVE AFTER VERIFICATION)
export default function handler(req, res) {
  res.status(200).json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
  });
}
```

**Important**: Remove this endpoint after verification to avoid exposing information about your environment configuration. 