import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Dashboard Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            The client dashboard you're looking for doesn't exist or may have been removed.
          </p>
          <p className="text-sm text-gray-500">
            Please check the URL and try again, or contact support if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
