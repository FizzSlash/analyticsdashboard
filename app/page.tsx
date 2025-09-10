import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, Mail } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Klaviyo Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive email marketing analytics for your Klaviyo campaigns, flows, and audience insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Campaign Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track open rates, click rates, and revenue from your email campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Flow Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Monitor automated flow performance and revenue attribution
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Audience Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Analyze subscriber growth and engagement metrics
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Subject Line Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Optimize subject lines with performance analytics
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Your Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                To access your personalized analytics dashboard, visit:
              </p>
              <code className="bg-gray-100 px-3 py-2 rounded text-sm">
                /client/your-brand-slug
              </code>
              <p className="text-xs text-gray-500 mt-4">
                Replace "your-brand-slug" with your unique brand identifier
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
