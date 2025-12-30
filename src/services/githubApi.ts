const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = import.meta.env.VITE_GITHUB_OWNER || '';
const REPO_NAME = import.meta.env.VITE_GITHUB_REPO || '';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

export interface WorkflowRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed' | 'waiting';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface Artifact {
  id: number;
  node_id: string;
  name: string;
  size_in_bytes: number;
  url: string;
  archive_download_url: string;
  expired: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

/**
 * Triggers a repository_dispatch event to start the download workflow
 */
export async function triggerDownloadWorkflow(youtubeUrl: string): Promise<void> {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN.');
  }

  if (!REPO_OWNER || !REPO_NAME) {
    throw new Error('Repository information is not configured. Please set VITE_GITHUB_OWNER and VITE_GITHUB_REPO.');
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'download_video',
        client_payload: {
          url: youtubeUrl,
        },
      }),
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to trigger workflow: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    throw new Error(errorMessage);
  }
}

/**
 * Gets the latest workflow runs for the repository
 */
export async function getWorkflowRuns(): Promise<WorkflowRun[]> {
  if (!REPO_OWNER || !REPO_NAME) {
    throw new Error('Repository information is not configured.');
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=10`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to fetch workflow runs: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.workflow_runs || [];
}

/**
 * Gets a specific workflow run by ID
 */
export async function getWorkflowRun(runId: number): Promise<WorkflowRun> {
  if (!REPO_OWNER || !REPO_NAME) {
    throw new Error('Repository information is not configured.');
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to fetch workflow run: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * Gets artifacts for a specific workflow run
 */
export async function getWorkflowRunArtifacts(runId: number): Promise<Artifact[]> {
  if (!REPO_OWNER || !REPO_NAME) {
    throw new Error('Repository information is not configured.');
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}/artifacts`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to fetch artifacts: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.artifacts || [];
}

/**
 * Downloads an artifact and returns it as a blob URL
 * Artifacts require authentication, so we fetch it with the token and create a blob URL
 */
export async function downloadArtifact(artifactId: number): Promise<{ blobUrl: string; fileName: string }> {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is required to download artifacts.');
  }

  if (!REPO_OWNER || !REPO_NAME) {
    throw new Error('Repository information is not configured.');
  }

  // Fetch the artifact zip file
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/actions/artifacts/${artifactId}/zip`,
    {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/zip',
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to download artifact: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      
      // Check for storage limit errors in the response
      const errorText = JSON.stringify(errorData).toLowerCase();
      if (
        errorText.includes('storage') || 
        errorText.includes('limit') || 
        errorText.includes('quota') ||
        errorText.includes('exceeded') ||
        errorText.includes('insufficient')
      ) {
        errorMessage = 'Storage limit exceeded. Please delete old artifacts or wait for them to expire (artifacts are retained for 2 days).';
      }
    } catch {
      const errorText = await response.text();
      if (errorText) {
        const lowerErrorText = errorText.toLowerCase();
        if (
          lowerErrorText.includes('storage') || 
          lowerErrorText.includes('limit') || 
          lowerErrorText.includes('quota') ||
          lowerErrorText.includes('exceeded') ||
          lowerErrorText.includes('insufficient')
        ) {
          errorMessage = 'Storage limit exceeded. Please delete old artifacts or wait for them to expire (artifacts are retained for 2 days).';
        } else {
          errorMessage += ` - ${errorText}`;
        }
      }
    }
    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const fileName = `video-${artifactId}.zip`;

  return { blobUrl, fileName };
}

/**
 * Checks if a workflow run failed due to storage limit
 */
async function checkForStorageLimitError(runId: number): Promise<string | null> {
  try {
    // Get workflow run jobs to check for storage limit errors
    const jobsResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}/jobs`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      const jobs = jobsData.jobs || [];
      
      for (const job of jobs) {
        const steps = job.steps || [];
        for (const step of steps) {
          if (step.conclusion === 'failure') {
            const errorText = step.name?.toLowerCase() || '';
            const errorMessage = step.message || '';
            
            // Check for storage limit related errors
            if (
              errorText.includes('artifact') && 
              (errorMessage.includes('storage') || 
               errorMessage.includes('limit') || 
               errorMessage.includes('quota') ||
               errorMessage.includes('exceeded') ||
               errorMessage.includes('insufficient'))
            ) {
              return 'Storage limit exceeded. Please delete old artifacts or wait for them to expire (artifacts are retained for 2 days).';
            }
          }
        }
      }
    }
  } catch (error) {
    // If we can't check, continue with normal error handling
    console.warn('Could not check for storage limit error:', error);
  }
  
  return null;
}

/**
 * Polls for workflow completion and downloads the artifact when done
 */
export async function pollForCompletion(
  maxAttempts: number = 60,
  intervalMs: number = 5000
): Promise<{ blobUrl: string; fileName: string }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const runs = await getWorkflowRuns();
    // Filter to only "Download YouTube Video" workflow runs
    const downloadRuns = runs.filter(run => run.name === 'Download YouTube Video');
    const latestRun = downloadRuns[0];

    if (latestRun && latestRun.status === 'completed') {
      if (latestRun.conclusion === 'success') {
        // Wait a bit for the artifact to be uploaded
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const artifacts = await getWorkflowRunArtifacts(latestRun.id);
        const videoArtifact = artifacts.find(a => a.name === 'video-download');
        
        if (videoArtifact) {
          return await downloadArtifact(videoArtifact.id);
        } else {
          throw new Error('Video artifact not found. The download may have failed.');
        }
      } else if (latestRun.conclusion === 'failure') {
        // Check for storage limit errors
        const storageError = await checkForStorageLimitError(latestRun.id);
        if (storageError) {
          throw new Error(storageError);
        }
        throw new Error('Workflow failed. Check the Actions tab for details.');
      }
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Timeout waiting for workflow to complete.');
}

