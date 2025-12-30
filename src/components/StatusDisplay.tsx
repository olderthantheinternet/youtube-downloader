import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface StatusDisplayProps {
  status: 'idle' | 'triggering' | 'processing' | 'completed' | 'error'
  message?: string
  downloadUrl?: string
  fileName?: string
}

export function StatusDisplay({ status, message, downloadUrl, fileName }: StatusDisplayProps) {
  if (status === 'idle') {
    return null
  }

  if (status === 'triggering' || status === 'processing') {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>
          {status === 'triggering' ? 'Triggering workflow...' : 'Processing video...'}
        </AlertTitle>
        <AlertDescription>
          {message || 'Please wait while we download and process your video.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {message || 'An error occurred while processing your video.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'completed' && downloadUrl) {
    return (
      <Alert>
        <AlertTitle>Download Ready!</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">Your video has been processed successfully.</p>
          <a
            href={downloadUrl}
            download={fileName}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              // Clean up blob URL after download starts
              setTimeout(() => {
                if (downloadUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(downloadUrl);
                }
              }, 100);
            }}
          >
            Download {fileName || 'Video'}
          </a>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}

