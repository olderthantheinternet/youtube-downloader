# Quick GitHub Setup Guide

This guide provides the exact steps to complete the GitHub setup for this project.

## ✅ Already Completed

- ✅ Git repository initialized
- ✅ All files committed
- ✅ GitHub Actions workflows created:
  - `.github/workflows/download-video.yml` - Downloads YouTube videos
  - `.github/workflows/deploy.yml` - Builds and deploys to GitHub Pages
- ✅ `.env.example` template created
- ✅ README updated with comprehensive instructions

## 📋 Next Steps (Manual Actions Required)

### Step 1: Create GitHub Repository

**Option A: Using GitHub Web Interface**
1. Visit: https://github.com/new
2. Repository name: `youtube-downloader`
3. Description: "YouTube video downloader using GitHub Actions"
4. Choose Public or Private
5. **Do NOT** check any initialization options (README, .gitignore, license)
6. Click "Create repository"

**Option B: Using GitHub CLI** (if installed)
```bash
gh repo create youtube-downloader --public --source=. --remote=origin --push
```

### Step 2: Push Code to GitHub

After creating the repository, run:

```bash
# Add remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/youtube-downloader.git

# Push to GitHub
git push -u origin main
```

### Step 3: Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `youtube-downloader-token`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Click "Generate token"
6. **Copy the token** - you'll need it for the next step

### Step 4: Configure GitHub Secrets

Go to: `https://github.com/YOUR_USERNAME/youtube-downloader/settings/secrets/actions`

Click "New repository secret" and create these three secrets:

1. **Name**: `VITE_GITHUB_OWNER`
   - **Value**: Your GitHub username (e.g., `your-username`)

2. **Name**: `VITE_GITHUB_REPO`
   - **Value**: `youtube-downloader`

3. **Name**: `VITE_GITHUB_TOKEN`
   - **Value**: The Personal Access Token you created in Step 3

### Step 5: Enable GitHub Pages

1. Go to: `https://github.com/YOUR_USERNAME/youtube-downloader/settings/pages`
2. Under "Source", select: **GitHub Actions**
3. Click "Save"

### Step 6: Verify Setup

1. **Check deployment**: 
   - Go to the Actions tab: `https://github.com/YOUR_USERNAME/youtube-downloader/actions`
   - The "Build and Deploy" workflow should run automatically
   - Once complete, your app will be at: `https://YOUR_USERNAME.github.io/youtube-downloader/`

2. **Test the app**:
   - Visit your deployed app
   - Enter a YouTube URL
   - Check the Actions tab to see the download workflow run

## 🔐 Security Notes

⚠️ **Important**: The GitHub token will be embedded in the built JavaScript bundle. This means anyone can see it in the browser's developer tools.

**For production use, consider:**
- Using a backend API to proxy GitHub API calls
- Using GitHub Apps instead of Personal Access Tokens
- Implementing rate limiting

## 📝 Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values:
   ```env
   VITE_GITHUB_OWNER=your_github_username
   VITE_GITHUB_REPO=youtube-downloader
   VITE_GITHUB_TOKEN=your_personal_access_token
   ```

3. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

## 🐛 Troubleshooting

### Workflow not running
- Check that you've pushed code to the `main` branch
- Verify GitHub Pages is enabled and set to "GitHub Actions"
- Check the Actions tab for error messages

### Token errors
- Verify the token has `repo` and `workflow` scopes
- Ensure secrets are correctly named (case-sensitive)
- Check that the token hasn't expired

### Build failures
- Verify Node.js 20+ is available in GitHub Actions
- Check the Actions tab logs for specific errors

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

