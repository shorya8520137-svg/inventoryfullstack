# 🔄 CI/CD Setup Guide: Personal → Company Repository Sync

## 📋 Overview
This setup automatically syncs your personal repository to your company repository whenever you push to the main branch.

**Flow**: `shorya8520137-svg/inventoryfullstack` → `shoryasingh-creator/hunyhunyinventory`

## 🚀 Setup Instructions

### Step 1: Create Personal Access Token (Company Account)

1. **Login to your company GitHub account** (`shoryasingh-creator`)
2. **Go to Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Click "Generate new token (classic)"**
4. **Configure the token**:
   - **Note**: `CI/CD Sync Token for inventoryfullstack`
   - **Expiration**: `No expiration` (or 1 year)
   - **Scopes**: Check these boxes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Upload packages)

5. **Click "Generate token"**
6. **Copy the token** (starts with `ghp_...`) - **Save it safely!**

### Step 2: Add Token to Personal Repository Secrets

1. **Go to your personal repository**: `https://github.com/shorya8520137-svg/inventoryfullstack`
2. **Click Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Add the secret**:
   - **Name**: `COMPANY_TOKEN`
   - **Secret**: Paste the token you copied from Step 1
5. **Click "Add secret"**

### Step 3: Verify Workflow File

The workflow file `.github/workflows/sync-to-company.yml` should be in your personal repository. This file:
- ✅ Triggers on every push to `main` branch
- ✅ Can be manually triggered
- ✅ Syncs all changes to company repository
- ✅ Provides detailed logs

### Step 4: Test the Setup

#### Option A: Automatic Test (Push to main)
```bash
# Make a small change and push to main
echo "# CI/CD Test" >> TEST_SYNC.md
git add TEST_SYNC.md
git commit -m "Test CI/CD sync setup"
git push origin main
```

#### Option B: Manual Test
1. Go to your personal repository on GitHub
2. Click **Actions** tab
3. Click **Sync to Company Repository** workflow
4. Click **Run workflow** button
5. Click **Run workflow** (green button)

### Step 5: Monitor the Sync

1. **Check Actions tab** in your personal repository
2. **Look for the workflow run** - should show green checkmark ✅
3. **Verify company repository** - changes should appear there
4. **Check the logs** for detailed sync information

## 🔧 How It Works

### Automatic Sync
- **Trigger**: Every push to `main` branch in personal repo
- **Action**: Automatically pushes changes to company repo
- **Time**: Usually completes in 30-60 seconds

### Manual Sync
- **Trigger**: Click "Run workflow" in Actions tab
- **Use Case**: Sync specific changes or test the setup
- **Custom Message**: Optional sync message

### What Gets Synced
- ✅ All source code changes
- ✅ New files and folders
- ✅ Deleted files
- ✅ Commit history
- ✅ README and documentation updates

### What Doesn't Get Synced
- ❌ GitHub Issues
- ❌ Pull Requests
- ❌ Repository settings
- ❌ Secrets and environment variables

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Authentication failed" Error
**Problem**: Invalid or expired token
**Solution**: 
- Regenerate token in company account
- Update `COMPANY_TOKEN` secret in personal repo

#### 2. "Permission denied" Error
**Problem**: Token doesn't have required permissions
**Solution**: 
- Ensure token has `repo` and `workflow` scopes
- Make sure company account has write access to destination repo

#### 3. "Repository not found" Error
**Problem**: Incorrect repository URL or permissions
**Solution**: 
- Verify company repository exists: `shoryasingh-creator/hunyhunyinventory`
- Check repository is not private (or token has access)

#### 4. Workflow doesn't trigger
**Problem**: Workflow file not in correct location
**Solution**: 
- Ensure file is at `.github/workflows/sync-to-company.yml`
- Check file is committed to `main` branch

### Debug Steps

1. **Check workflow logs**:
   - Go to Actions tab in personal repository
   - Click on failed workflow run
   - Expand each step to see detailed logs

2. **Verify token permissions**:
   - Try accessing company repo with token manually
   - Check token hasn't expired

3. **Test manual sync**:
   - Use "Run workflow" button to test
   - Check if automatic vs manual sync behaves differently

## 📊 Monitoring & Maintenance

### Regular Checks
- **Monthly**: Verify sync is working correctly
- **Quarterly**: Check token expiration date
- **As needed**: Update workflow if requirements change

### Success Indicators
- ✅ Green checkmarks in Actions tab
- ✅ Recent commits appear in company repository
- ✅ No error notifications
- ✅ Sync summary shows success

### Performance
- **Sync Time**: 30-60 seconds typically
- **Frequency**: Every push to main (can be multiple times per day)
- **Resource Usage**: Minimal (uses GitHub's free Actions minutes)

## 🔐 Security Best Practices

1. **Token Security**:
   - Never commit tokens to code
   - Use repository secrets only
   - Regenerate tokens periodically

2. **Access Control**:
   - Token only has access to specific repository
   - Limited scope permissions
   - Monitor token usage in GitHub settings

3. **Audit Trail**:
   - All syncs are logged in Actions
   - Commit history preserved
   - Easy to track what was synced when

## 🎯 Next Steps

After setup is complete:

1. **Test thoroughly** with a few commits
2. **Monitor for a week** to ensure reliability
3. **Document the process** for your team
4. **Consider adding notifications** (Slack, email) if needed
5. **Set up branch protection** rules if required

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review GitHub Actions documentation
3. Verify all setup steps were completed
4. Check repository permissions and token scopes

---

**Your CI/CD pipeline is now ready! Every change you make to your personal repository will automatically sync to your company repository.** 🚀