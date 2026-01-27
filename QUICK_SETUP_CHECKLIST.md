# ✅ Quick CI/CD Setup Checklist

## 🎯 Goal
Sync `shorya8520137-svg/inventoryfullstack` → `shoryasingh-creator/hunyhunyinventory`

## 📝 Setup Steps (5 minutes)

### ☐ Step 1: Create Company Token
1. Login to **company account** (`shoryasingh-creator`)
2. Go to **Settings** → **Developer settings** → **Personal access tokens**
3. **Generate new token** with these permissions:
   - ✅ `repo` (full control)
   - ✅ `workflow` (update workflows)
4. **Copy token** (starts with `ghp_...`)

### ☐ Step 2: Add Token to Personal Repo
1. Go to **personal repo**: `https://github.com/shorya8520137-svg/inventoryfullstack`
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**:
   - Name: `COMPANY_TOKEN`
   - Value: [paste token from step 1]

### ☐ Step 3: Commit Workflow File
The workflow file `.github/workflows/sync-to-company.yml` is ready in your project.
```bash
git add .github/workflows/sync-to-company.yml
git commit -m "Add CI/CD workflow for company repo sync"
git push origin main
```

### ☐ Step 4: Test the Setup
**Option A - Automatic Test:**
```bash
echo "CI/CD test" >> README.md
git add README.md
git commit -m "Test CI/CD sync"
git push origin main
```

**Option B - Manual Test:**
1. Go to **Actions** tab in personal repo
2. Click **Sync to Company Repository**
3. Click **Run workflow**

### ☐ Step 5: Verify Success
1. Check **Actions** tab shows green ✅
2. Verify changes appear in company repo
3. Check workflow logs for details

## 🚨 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Authentication failed | Regenerate token, update secret |
| Permission denied | Check token has `repo` scope |
| Workflow not found | Ensure file is in `.github/workflows/` |
| Repository not found | Verify company repo exists and is accessible |

## 🎉 Success Indicators

- ✅ Green checkmark in Actions tab
- ✅ Commits appear in company repository
- ✅ Workflow runs in under 60 seconds
- ✅ No error messages in logs

## 📋 What Happens After Setup

### Automatic Sync
- **Every push to main** → Automatically syncs to company repo
- **Time**: 30-60 seconds
- **Notification**: Check Actions tab for status

### Manual Sync
- **Actions tab** → **Run workflow** → Sync anytime
- **Use case**: Test sync or push specific changes

---

**Total Setup Time: ~5 minutes**
**Result: Automatic sync from personal → company repository** 🚀