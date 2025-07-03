import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Brain, Users, Clock, TrendingUp, FileText, Mic, Upload, Play } from 'lucide-react'
import './App.css'

function App() {
  const [meetings, setMeetings] = useState([])
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [summary, setSummary] = useState(null)
  const [actionItems, setActionItems] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch meetings on component mount
  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings/')
      const data = await response.json()
      setMeetings(data)
      if (data.length > 0) {
        setSelectedMeeting(data[0])
        fetchMeetingData(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
    }
  }

  const fetchMeetingData = async (meetingId) => {
    setLoading(true)
    try {
      // Fetch summary, action items, and insights in parallel
      const [summaryRes, actionItemsRes, insightsRes] = await Promise.all([
        fetch(`/api/analysis/summary/${meetingId}`),
        fetch(`/api/analysis/action-items/${meetingId}`),
        fetch(`/api/analysis/insights/${meetingId}`)
      ])

      const summaryData = await summaryRes.json()
      const actionItemsData = await actionItemsRes.json()
      const insightsData = await insightsRes.json()

      setSummary(summaryData)
      setActionItems(actionItemsData.action_items || [])
      setInsights(insightsData)
    } catch (error) {
      console.error('Error fetching meeting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMeetingSelect = (meeting) => {
    setSelectedMeeting(meeting)
    fetchMeetingData(meeting.id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MeetingMind</h1>
                <p className="text-sm text-gray-500">AI-Powered Meeting Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Meeting
              </Button>
              <Button size="sm">
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Meeting List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Meetings</CardTitle>
                <CardDescription>Select a meeting to view analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedMeeting?.id === meeting.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleMeetingSelect(meeting)}
                  >
                    <h4 className="font-medium text-sm">{meeting.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{meeting.date}</span>
                      <Badge variant={meeting.status === 'completed' ? 'default' : 'secondary'}>
                        {meeting.status}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {meeting.duration}
                      <Users className="h-3 w-3 ml-3 mr-1" />
                      {meeting.participants.length}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedMeeting ? (
              <div className="space-y-6">
                {/* Meeting Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedMeeting.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {selectedMeeting.date} • {selectedMeeting.duration} • {selectedMeeting.participants.join(', ')}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        View Transcript
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Analysis Tabs */}
                <Tabs defaultValue="summary" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="actions">Action Items</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  {/* Summary Tab */}
                  <TabsContent value="summary">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          AI-Generated Summary
                        </CardTitle>
                        <CardDescription>
                          Key points and decisions from the meeting
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : summary ? (
                          <div className="prose max-w-none">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                              {summary.summary}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-gray-500">No summary available</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Action Items Tab */}
                  <TabsContent value="actions">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Action Items
                        </CardTitle>
                        <CardDescription>
                          Tasks and follow-ups identified from the meeting
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : actionItems.length > 0 ? (
                          <div className="space-y-4">
                            {actionItems.map((item) => (
                              <div key={item.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{item.task}</h4>
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                      <span>Assigned to: <strong>{item.assignee}</strong></span>
                                      <span>Due: {item.due_date}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                                      {item.priority}
                                    </Badge>
                                    <Badge variant="outline">
                                      {item.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No action items identified</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Insights Tab */}
                  <TabsContent value="insights">
                    <div className="space-y-6">
                      {loading ? (
                        <Card>
                          <CardContent className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </CardContent>
                        </Card>
                      ) : insights ? (
                        <>
                          {/* Meeting Effectiveness */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Meeting Effectiveness</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-lg font-medium">Overall Score</span>
                                <span className="text-2xl font-bold text-green-600">
                                  {insights.meeting_effectiveness.score}/10
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                                  <ul className="text-sm space-y-1">
                                    {insights.meeting_effectiveness.strengths.map((strength, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="text-green-500 mr-2">•</span>
                                        {strength}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-medium text-orange-600 mb-2">Areas for Improvement</h4>
                                  <ul className="text-sm space-y-1">
                                    {insights.meeting_effectiveness.improvements.map((improvement, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="text-orange-500 mr-2">•</span>
                                        {improvement}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Participation & Sentiment */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>Participation Analysis</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {Object.entries(insights.duration_analysis.talk_time_distribution).map(([person, percentage]) => (
                                    <div key={person} className="flex items-center justify-between">
                                      <span className="text-sm font-medium">{person}</span>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ width: percentage }}
                                          ></div>
                                        </div>
                                        <span className="text-sm text-gray-500">{percentage}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Sentiment Analysis</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="flex justify-between">
                                    <span>Overall Sentiment</span>
                                    <Badge variant="default">{insights.sentiment_analysis.overall_sentiment}</Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Engagement Level</span>
                                    <Badge variant="secondary">{insights.sentiment_analysis.engagement_level}</Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Collaboration Score</span>
                                    <span className="font-medium">{insights.sentiment_analysis.collaboration_score}/10</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Key Topics */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Key Topics Discussed</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {insights.key_topics.map((topic, index) => (
                                  <Badge key={index} variant="outline">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      ) : (
                        <Card>
                          <CardContent className="text-center py-8">
                            <p className="text-gray-500">No insights available</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Meeting Selected</h3>
                  <p className="text-gray-500">Select a meeting from the sidebar to view AI analysis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Built by <strong>Super Mega Inc.</strong> • Powered by AI • MeetingMind v1.0</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

