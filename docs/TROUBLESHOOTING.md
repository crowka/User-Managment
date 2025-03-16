# Troubleshooting Guide

This document outlines common issues encountered while running the User Management system and their solutions.

## Development Server Issues

### 1. Next.js Command Not Found

**Issue:**
```bash
'next' is not recognized as an internal or external command
```

**Cause:**
- Next.js dependencies not properly installed
- `node_modules` folder might be corrupted
- Package installation issues

**Solution:**
1. Clean the installation:
   ```bash
   rm -rf node_modules .next package-lock.json
   npm install
   ```
2. Install Next.js explicitly:
   ```bash
   npm install next@14.2.24 --save-exact
   ```

### 2. Module Resolution Errors

**Issue:**
```typescript
Module not found: Can't resolve '@/stores/auth'
```

**Cause:**
- Path alias configuration mismatch between TypeScript and Next.js
- Files not in the expected directory structure
- Incorrect import paths

**Solution:**
1. Check `tsconfig.json` path aliases:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"],
         "@/stores/*": ["lib/stores/*"]
       }
     }
   }
   ```
2. Ensure files are in the correct directory structure:
   - Move `stores` to `lib/stores`
   - Update import paths to match the configured aliases

### 3. TypeScript Compilation Errors

**Issue:**
```typescript
Property 'supabase' does not exist on type 'AuthContextType'
```

**Cause:**
- Missing type definitions
- Incomplete interface definitions
- Mismatched types between components

**Solution:**
1. Update type definitions in `lib/types/auth.ts`:
   ```typescript
   export interface AuthContextType {
     user: AppUser | null;
     supabase: SupabaseClient;
     // ... other properties
   }
   ```
2. Ensure all components use the updated types
3. Update provider implementations to match the type definitions

### 4. Server Already Running

**Issue:**
Unable to start the development server because port 3000 is in use

**Solution:**
1. Find and kill the existing Node.js process:
   ```bash
   # Windows
   taskkill /F /IM node.exe
   
   # Unix
   pkill -f node
   ```
2. Restart the development server:
   ```bash
   npm run dev
   ```

## Best Practices for Development

1. **Clean Start:**
   - Always start with a clean installation when encountering dependency issues
   - Use `--save-exact` when installing critical dependencies like Next.js

2. **Type Safety:**
   - Keep type definitions up to date
   - Use TypeScript's strict mode
   - Run `tsc --noEmit` to check for type errors before starting the server

3. **Path Aliases:**
   - Maintain consistent path aliases between TypeScript and Next.js configs
   - Use absolute imports with aliases for better maintainability
   - Keep the directory structure aligned with path alias configuration

4. **Server Management:**
   - Always ensure no previous instances are running before starting the server
   - Check environment variables are properly set
   - Monitor server logs for compilation errors

## Common Error Messages and Solutions

| Error Message | Likely Cause | Solution |
|--------------|--------------|----------|
| Module not found | Incorrect import path or missing file | Check path aliases and file location |
| Type ... is missing properties | Incomplete interface implementation | Update type definitions and implementations |
| Cannot find module | Missing dependency or incorrect path | Check package.json and install missing dependencies |
| Port already in use | Previous server instance still running | Kill existing Node.js process and restart |

## Debugging Tools

1. **TypeScript Checker:**
   ```bash
   npx tsc --noEmit
   ```
   Use this to find type errors before running the server

2. **Next.js Development Mode:**
   ```bash
   npm run dev
   ```
   Provides detailed error messages and hot reloading

3. **Clean Build:**
   ```bash
   npm run build
   ```
   Use this to verify production build integrity

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [Supabase Documentation](https://supabase.io/docs) 