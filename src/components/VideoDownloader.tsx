import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusDisplay } from "./StatusDisplay"
import { triggerDownloadWorkflow, pollForCompletion } from "@/services/githubApi"

export function VideoDownloader() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [status, setStatus] = useState<'idle' | 'triggering' | 'processing' | 'completed' | 'error'>('idle')
  const [message, setMessage] = useState<string>()
  const [downloadUrl, setDownloadUrl] = useState<string>()
  const [fileName, setFileName] = useState<string>()

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  const handleDownload = async () => {
    if (!youtubeUrl.trim()) {
      setStatus('error')
      setMessage('Please enter a YouTube URL')
      return
    }

    if (!validateYouTubeUrl(youtubeUrl)) {
      setStatus('error')
      setMessage('Please enter a valid YouTube URL')
      return
    }

    try {
      setStatus('triggering')
      setMessage('Triggering download workflow...')
      
      await triggerDownloadWorkflow(youtubeUrl)
      
      setStatus('processing')
      setMessage('Workflow triggered. Waiting for video to be processed...')
      
      const { blobUrl, fileName } = await pollForCompletion(60, 5000)
      
      setDownloadUrl(blobUrl)
      setFileName(fileName)
      setStatus('completed')
      setMessage('Video processed successfully!')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
      console.error('Download error:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>YouTube Video Downloader</CardTitle>
        <CardDescription>
          Enter a YouTube URL to download the video at the highest quality with audio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleDownload()
              }
            }}
            disabled={status === 'triggering' || status === 'processing'}
            className="flex-1"
          />
          <Button
            onClick={handleDownload}
            disabled={status === 'triggering' || status === 'processing'}
          >
            {status === 'triggering' || status === 'processing' ? 'Processing...' : 'Download'}
          </Button>
        </div>
        <StatusDisplay
          status={status}
          message={message}
          downloadUrl={downloadUrl}
          fileName={fileName}
        />
      </CardContent>
    </Card>
  )
}

