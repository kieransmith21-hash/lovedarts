# Deployment & Build Guide

## Pre-Deployment Checklist

### Architecture Validation
- [x] No `window.authService` references
- [x] No `window.profileService` references  
- [x] No `window.db` references
- [x] All services import from `src/supabase.ts`
- [x] All pages import from services
- [x] Event listeners auto-wire on module load
- [x] No circular imports
- [x] All exports are accessible

### File Structure
- [x] `src/supabase.ts` exists
- [x] `src/services/authService.ts` exists
- [x] `src/services/profileService.ts` exists
- [x] `src/pages/login.ts` exists
- [x] `src/pages/signup.ts` exists
- [x] No deprecated files remain

### HTML Configuration
- [x] Supabase library loads first
- [x] Module scripts use `type="module"`
- [x] No inline script handlers
- [x] OAuth placeholder functions still work
- [x] No references to deleted files

---

## Build Configuration

### Option 1: TypeScript Compiler (Recommended for Simple Projects)

#### Install TypeScript
```bash
npm install -D typescript
```

#### Create tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### Build Command
```bash
npx tsc
```

#### Output Structure
```
dist/
├── src/
│   ├── supabase.js
│   ├── pages/
│   │   ├── login.js
│   │   └── signup.js
│   └── services/
│       ├── authService.js
│       └── profileService.js
```

#### Updated HTML
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script type="module" src="dist/src/pages/login.js"></script>
<script type="module" src="dist/src/pages/signup.js"></script>
```

---

### Option 2: Vite (Recommended for Modern Development)

#### Install Vite
```bash
npm create vite@latest . -- --template vanilla-ts
npm install
```

#### vite.config.ts
```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'ES2020',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
})
```

#### Build Command
```bash
npm run build
```

#### Development Command
```bash
npm run dev
```

**Benefit:** Vite automatically handles module resolution, imports, and compilation.

---

### Option 3: Webpack

#### Install Webpack
```bash
npm install -D webpack webpack-cli ts-loader
```

#### webpack.config.js
```javascript
const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    login: './src/pages/login.ts',
    signup: './src/pages/signup.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
}
```

#### Build Command
```bash
npx webpack
```

---

## Deployment Process

### Step 1: Compile TypeScript
```bash
# Using TypeScript compiler
npx tsc

# Or using Vite
npm run build

# Or using Webpack
npx webpack
```

### Step 2: Verify Output
```bash
# Check that compiled files exist
ls -R dist/src/pages/
ls -R dist/src/services/
ls dist/src/supabase.js
```

**Expected output:**
```
dist/
├── src/
│   ├── supabase.js
│   ├── pages/
│   │   ├── login.js
│   │   └── signup.js
│   └── services/
│       ├── authService.js
│       └── profileService.js
```

### Step 3: Update HTML Script Paths

#### Before (Development)
```html
<script type="module" src="src/pages/login.ts"></script>
<script type="module" src="src/pages/signup.ts"></script>
```

#### After (Production)
```html
<script type="module" src="dist/src/pages/login.js"></script>
<script type="module" src="dist/src/pages/signup.js"></script>
```

Or use Vite with automatic path rewriting.

### Step 4: Deploy

```bash
# Upload to server/CDN
scp -r dist/* user@server:/var/www/lovedarts/
scp *.html user@server:/var/www/lovedarts/
scp *.md user@server:/var/www/lovedarts/
```

### Step 5: Verify Deployment

1. Open `https://your-domain.com/index.html`
2. Check browser console for errors
3. Test login flow:
   - Enter email/password
   - Click Login
   - Check for network requests to Supabase
4. Test signup flow:
   - Enter email/password/username
   - Click Sign Up
   - Check for auth and profile creation

---

## Production Optimization

### Minification
```json
// tsconfig.json (already included in build tools)
{
  "compilerOptions": {
    "target": "ES2020"
  }
}
```

### Source Maps (Optional, for debugging)
```json
{
  "compilerOptions": {
    "sourceMap": true,
    "declaration": true
  }
}
```

### Environment Variables

Create `.env.production`:
```
VITE_SUPABASE_URL=https://gdrspcldtijxszgyrpwb.supabase.co
VITE_SUPABASE_KEY=eyJhbGci...
```

Update `src/supabase.ts`:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabaseClient = (window as any).supabase.createClient(supabaseUrl, supabaseKey)
```

---

## Troubleshooting

### Build Errors

#### Error: "Cannot find module '../supabase'"
**Cause:** Import path incorrect
**Solution:** Verify file exists and path is relative correctly

```bash
# Check file structure
ls -la src/supabase.ts
ls -la src/services/authService.ts
```

#### Error: "Module not found: src/pages/login"
**Cause:** TypeScript not compiled
**Solution:** Run build command

```bash
npx tsc
ls dist/src/pages/
```

#### Error: "authService is undefined"
**Cause:** Module didn't load
**Solution:** Check HTML script paths and build output

```html
<!-- Verify path matches compiled output -->
<script type="module" src="dist/src/pages/login.js"></script>
```

### Runtime Errors

#### Browser Console: "Cannot read properties of undefined"
**Cause:** Service import failed
**Solution:** 
1. Check Network tab for failed module loads
2. Verify paths in script tags
3. Verify compiled files exist in dist/

#### Browser Console: "window.authService is undefined"
**Expected:** This should happen! Services are no longer global.
**Solution:** Check that code using authService imports it correctly

```typescript
// ✅ Correct
import { authService } from '../services/authService'
await authService.login(...)

// ❌ Wrong
await (window as any).authService.login(...)
```

---

## Performance Monitoring

### Check Module Loading
```javascript
// In browser console
document.querySelectorAll('script[type="module"]').forEach(s => {
  console.log('Module:', s.src, 'Status: Loaded')
})
```

### Check Network Requests
1. Open DevTools → Network tab
2. Filter by Type: fetch
3. Should see POST requests to Supabase for auth/profile operations

### Check for Console Errors
```javascript
// Should show no auth-related errors
console.log('Auth loaded:', typeof window.supabase !== 'undefined')
```

---

## Rollback Plan

If deployment fails:

### Quick Rollback (10 minutes)
1. Revert HTML script paths:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="OLD_INIT_PATH"></script>  <!-- Restore old init -->
   ```

2. Restore old service files from git:
   ```bash
   git checkout HEAD -- src/services/init.js
   git checkout HEAD -- supabase.js
   git checkout HEAD -- signup.js
   ```

### Full Rollback
```bash
# Revert to previous commit
git revert <commit-hash>
git push
```

### Preventive: Keep Backup Branch
```bash
git checkout -b deploy-backup
git push origin deploy-backup

# If issues: git merge deploy-backup
```

---

## Maintenance Checklist

### Weekly
- [ ] Check for Supabase auth errors in logs
- [ ] Monitor user signups/logins
- [ ] Review network requests in DevTools

### Monthly
- [ ] Review error logs
- [ ] Update dependencies
- [ ] Test signup/login flows end-to-end
- [ ] Verify no global references in code

### Quarterly
- [ ] Security audit (check API keys)
- [ ] Performance profiling
- [ ] Database usage review
- [ ] Update build tools

---

## Summary

| Step | Tool | Command | Output |
|------|------|---------|--------|
| 1. Install | npm | `npm install` | node_modules/ |
| 2. Configure | tsc/vite | Create config | .json file |
| 3. Build | tsc | `npx tsc` | dist/ |
| 4. Verify | bash | `ls dist/` | File structure |
| 5. Deploy | scp | `scp -r dist/*` | Deployed |
| 6. Test | Browser | Open URL | ✅ Works |

**Deployment is complete when:**
- ✅ All TypeScript compiles without errors
- ✅ All JavaScript files in dist/
- ✅ HTML script paths point to dist/
- ✅ Login form works end-to-end
- ✅ Signup form works end-to-end
- ✅ No global service errors in console

---

## Next Steps

1. **Set up build tool** (TypeScript, Vite, or Webpack)
2. **Configure project** (tsconfig.json or vite.config.ts)
3. **Build locally** and test
4. **Deploy to staging** first
5. **Test in staging** environment
6. **Deploy to production**
7. **Monitor** for errors

**Resources:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/)
- [Webpack Documentation](https://webpack.js.org/guides/)
- [Supabase Documentation](https://supabase.com/docs)
