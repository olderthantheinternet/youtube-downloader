import { VideoDownloader } from "./components/VideoDownloader"
import "./App.css"

function App() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">YouTube Video Downloader</h1>
          <p className="text-muted-foreground">
            Download YouTube videos at the highest quality with audio
          </p>
        </div>
        <VideoDownloader />
      </div>
    </div>
  )
}

export default App
