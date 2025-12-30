# YouTube Downloader

A React-based YouTube video downloader that uses GitHub Actions to download videos in the background.

## Features

- Clean, modern UI built with React, TypeScript, and Tailwind CSS
- Downloads YouTube videos using GitHub Actions
- Automatic workflow triggering via repository_dispatch
- Artifact management for downloaded videos
- Deployed to GitHub Pages

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- GitHub account
- GitHub Personal Access Token with `repo` and `workflow` scopes

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/youtube-downloader.git
cd youtube-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your GitHub credentials:
```env
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=youtube-downloader
VITE_GITHUB_TOKEN=your_github_personal_access_token
```

5. Start the development server:
```bash
npm run dev
```

## GitHub Setup Instructions

### 1. Create GitHub Repository

**Option A: Using GitHub Web Interface**
1. Go to https://github.com/new
2. Repository name: `youtube-downloader` (or your preferred name)
3. Description: "YouTube video downloader using GitHub Actions"
4. Visibility: Choose Public or Private
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

**Option B: Using GitHub CLI**
```bash
gh repo create youtube-downloader --public --source=. --remote=origin --push
```

### 2. Push Code to GitHub

If you haven't already pushed the code:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/youtube-downloader.git

# Push to GitHub
git push -u origin main
```

### 3. Create GitHub Personal Access Token

The app needs a GitHub token to trigger workflows and download artifacts:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Direct link: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `youtube-downloader-token`
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `read:org` (if using organization repos)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### 4. Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

Create these secrets:

1. **`VITE_GITHUB_OWNER`**
   - Value: Your GitHub username or organization name
   - Example: `your-username`

2. **`VITE_GITHUB_REPO`**
   - Value: Repository name
   - Example: `youtube-downloader`

3. **`VITE_GITHUB_TOKEN`**
   - Value: The Personal Access Token you created above
   - This token will be used by the build process to embed in the frontend

**Important Security Note**: The GitHub token will be embedded in the built JavaScript bundle. For production use, consider:
- Using a backend proxy to handle API calls
- Using GitHub Apps instead of Personal Access Tokens
- Implementing rate limiting

### 5. Enable GitHub Pages

1. Go to repository → Settings → Pages
2. Source: Select **GitHub Actions** (recommended)
3. Save

The deployment workflow will automatically deploy your app to GitHub Pages when you push to the `main` branch.

### 6. Verify Setup

1. **Test the deployment workflow**: 
   - Push any change to the `main` branch
   - Go to the Actions tab and verify the "Build and Deploy" workflow runs successfully
   - Your app should be available at `https://YOUR_USERNAME.github.io/youtube-downloader/`

2. **Test the download workflow**:
   - Use the deployed app to enter a YouTube URL
   - Check the Actions tab to see the "Download YouTube Video" workflow run
   - The video should be downloaded and available as an artifact

## Project Structure

```
youtube-downloader/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Build and deploy to GitHub Pages
│       └── download-video.yml  # Download YouTube videos
├── src/
│   ├── components/
│   │   ├── VideoDownloader.tsx # Main downloader component
│   │   └── StatusDisplay.tsx   # Status display component
│   └── services/
│       └── githubApi.ts        # GitHub API integration
├── .env.example                # Environment variables template
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## How It Works

1. User enters a YouTube URL in the web interface
2. Frontend calls `triggerDownloadWorkflow()` which sends a `repository_dispatch` event to GitHub
3. GitHub Actions workflow (`download-video.yml`) is triggered
4. Workflow downloads the video using `yt-dlp`
5. Video is uploaded as a GitHub Actions artifact
6. Frontend polls for workflow completion
7. Once complete, frontend downloads the artifact and provides it to the user

## Important Notes

- GitHub Actions has usage limits (free tier: 2,000 minutes/month)
- Artifacts are retained for 2 days by default (configurable in workflow)
- The GitHub token in the frontend is exposed in the built JavaScript - consider using a backend proxy for production
- For production, consider using GitHub Apps instead of Personal Access Tokens for better security

## Troubleshooting

### Workflow not triggering
- Check that `repository_dispatch` event type matches exactly: `download_video`
- Verify the GitHub token has `workflow` scope
- Check the Actions tab for error messages

### Token errors
- Verify token has correct scopes (`repo`, `workflow`)
- Ensure token hasn't expired
- Check that secrets are correctly set in repository settings

### Build failures
- Check Node.js version compatibility (requires Node 20+)
- Verify all dependencies are installed
- Check Actions tab for detailed error messages

### Deployment issues
- Ensure GitHub Pages is enabled in repository settings
- Verify Pages source is set to "GitHub Actions"
- Check that the deploy workflow has completed successfully

## License

This project is open source and available under the MIT License.
