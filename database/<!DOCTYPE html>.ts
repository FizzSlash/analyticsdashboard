<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaign Approval Calendar</title>
  <!-- Include React and ReactDOM -->
  <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
  <!-- Include Babel for JSX -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- Include Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Include Lodash -->
  <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
  <style>
    body {
      background-color: rgba(20, 19, 28, 0.7);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    /* Container styling with transparent white stroke */
    .calendar-container {
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
      background-color: rgba(20, 19, 28, 0.3);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .campaign-email {
      background-color: rgba(136, 84, 208, 0.2);
      border-left: 3px solid rgba(136, 84, 208, 0.8);
    }
    
    .campaign-email:hover {
      background-color: rgba(136, 84, 208, 0.3);
    }
    
    .campaign-sms {
      background-color: rgba(255, 220, 0, 0.2);
      border-left: 3px solid rgba(255, 220, 0, 0.8);
    }
    
    .campaign-sms:hover {
      background-color: rgba(255, 220, 0, 0.3);
    }
    
    /* Status badge styling */
    .status-badge {
      background-color: white !important;
      border: 1px solid rgba(136, 84, 208, 0.4) !important;
      color: rgb(136, 84, 208) !important;
      font-weight: 500;
      padding: 2px 8px;
      white-space: normal;
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Tab styling */
    .tab-active {
      background-color: rgba(99, 102, 241, 0.8);
      color: white;
      font-weight: 500;
    }
    
    .tab-inactive {
      background-color: rgba(31, 41, 55, 0.5);
      color: rgba(255, 255, 255, 0.7);
    }
    
    .tab-inactive:hover {
      background-color: rgba(31, 41, 55, 0.8);
      color: white;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background-color: rgba(36, 35, 49, 0.5);
      border-radius: 8px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
    }
    
    .submit-btn {
      background-color: rgba(255, 255, 255, 0.2);
      color: #FFF;
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 12px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      display: block;
      width: 100%;
      transition: all 0.3s;
      margin-top: 15px;
      backdrop-filter: blur(5px);
    }
    
    .submit-btn:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
    
    /* Calendar cell styling with subtle borders */
    .calendar-cell {
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.2s ease;
    }
    
    .calendar-cell:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
    
    /* Header styling for consistency */
    .header-container {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background-color: rgba(0, 0, 0, 0.2);
    }
  </style>
</head>
<body class="bg-transparent">
  <div id="root" class="min-h-screen pt-8 pb-0"></div>

  <script type="text/babel">
    // Import React hooks
    const { useState, useEffect } = React;
    
    // Function to extract client name from URL parameters
    const getClientNameFromUrl = () => {
      // Try to get the client name from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const clientParam = urlParams.get('client');
      
      if (clientParam) {
        return clientParam;
      }
      
      // Fallback: Try to extract from path (for direct URL access)
      const path = window.location.pathname;
      const segments = path.split('/').filter(segment => segment !== '');
      
      // If we have at least one path segment, use it
      if (segments.length > 0 && segments[0] !== 'test' && segments[0] !== 'cal.html') {
        return segments[0];
      }
      
      // Final fallback
      return 'unknown-client';
    };
    
    const CampaignCalendar = () => {
      // Extract client name from URL parameters
      const [clientName, setClientName] = useState(() => getClientNameFromUrl());
      
      // Regular state variables
      const [campaigns, setCampaigns] = useState([]);
      const [selectedCampaign, setSelectedCampaign] = useState(null);
      const [clientRevisions, setClientRevisions] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [currentMonth, setCurrentMonth] = useState(new Date());
      const [selectedDate, setSelectedDate] = useState(null);
      const [updateStatus, setUpdateStatus] = useState(null);
      const [showModal, setShowModal] = useState(false);
      const [activeTab, setActiveTab] = useState('calendar');

      // Your webhook URLs
      const fetchCampaignsUrl = 'https://hook.us2.make.com/dlcqdia9qozi8lca39jytiu27xrf1t1l';
      const updateCampaignUrl = 'https://hook.us2.make.com/wem64vvx9irk7tys6itjpyt27bqorbvg';

      useEffect(() => {
        fetchCampaigns();
      }, []);

      const fetchCampaigns = async () => {
        try {
          setLoading(true);
          
          // Add client name as a query parameter
          const url = `${fetchCampaignsUrl}?client=${encodeURIComponent(clientName)}`;
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch campaigns: ${response.status}`);
          }
          
          const text = await response.text();
          
          let formattedCampaigns = [];
          
          try {
            // Try to parse as JSON
            const data = JSON.parse(text);
            
            // Handle array or single object
            if (Array.isArray(data)) {
              formattedCampaigns = data.map(formatCampaign);
            } else if (data && typeof data === 'object') {
              // Check if it's the new format with nested structure
              if (data.id || data.Tasks || data.Stage || data.Client) {
                formattedCampaigns = [formatCampaign(data)];
              } else {
                // Try to process all keys as potential campaigns
                Object.entries(data).forEach(([key, value]) => {
                  if (value && typeof value === 'object') {
                    formattedCampaigns.push(formatCampaign(value));
                  }
                });
              }
            }
          } catch (e) {
            // If JSON parsing fails, try to extract data from text
            formattedCampaigns = extractCampaignsFromText(text);
          }
          
          setCampaigns(formattedCampaigns);
        } catch (error) {
          console.error('Error fetching campaigns:', error);
          setError(error.message);
          setCampaigns([]);
        } finally {
          setLoading(false);
        }
      };

      // Extract campaigns from non-JSON text
      const extractCampaignsFromText = (text) => {
        const campaigns = [];
        
        // Try to split on record boundaries
        const sections = text.split(/id:[\s]*/g).filter(Boolean);
        
        for (const section of sections) {
          try {
            // Extract all key-value pairs
            const lines = section.split('\n');
            const campaign = { 
              id: '', 
              recordId: '',
              Notes: '', 
              Tasks: '', 
              Stage: '', 
              Client: '', 
              'Campaign Type': [], 
              'Send Date': '',
              File: []
            };
            
            // First line should be the ID - this is the recordId in the format "recZrp1Ab0Cz8Cy3Y"
            if (lines[0] && lines[0].trim()) {
              campaign.recordId = lines[0].trim();
              campaign.id = lines[0].trim(); // Use the same value for id for now
            }
            
            // Look for file URL in the text
            const urlMatch = section.match(/url:\s+(https?:\/\/[^\s]+)/);
            if (urlMatch && urlMatch[1]) {
              const fileUrl = urlMatch[1];
              
              // Add file info to campaign
              campaign.File = [{
                url: fileUrl
              }];
            }
            
            // Process remaining lines for fields
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line && line.includes(':')) {
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();
                const trimmedKey = key.trim();
                
                // Map to your field names
                if (trimmedKey === 'Notes') {
                  campaign.Notes = value;
                } else if (trimmedKey === 'Tasks') {
                  campaign.Tasks = value;
                } else if (trimmedKey === 'Stage') {
                  campaign.Stage = value;
                } else if (trimmedKey === 'Client') {
                  campaign.Client = value;
                } else if (trimmedKey === 'Campaign Type') {
                  campaign['Campaign Type'] = value;
                } else if (trimmedKey === 'Send Date') {
                  campaign['Send Date'] = value;
                } else if (trimmedKey === 'Client Revisions') {
                  campaign.ClientRevisions = value;
                }
              }
            }
            
            // Only add if we have at least an ID and one field
            if (campaign.recordId && (campaign.Tasks || campaign.Notes)) {
              campaigns.push(formatCampaign(campaign));
            }
          } catch (e) {
            console.error('Error parsing campaign section:', e);
          }
        }
        
        return campaigns;
      };
      
      // Format a campaign into a standard structure
      const formatCampaign = (data) => {
        // Extract URL from File array if it exists
        let previewUrl = '';
        
        // Check if File field exists and contains items
        if (data.File && Array.isArray(data.File) && data.File.length > 0) {
          // Try to find url property in the file object or its children
          const fileData = data.File[0];
          
          if (fileData) {
            if (fileData.url) {
              previewUrl = fileData.url;
            } else if (fileData.children && fileData.children.length > 0) {
              // Look one level deeper if needed
              const childFile = fileData.children.find(child => child.url);
              if (childFile) {
                previewUrl = childFile.url;
              }
            }
          }
        }
        
        // FIX: Properly handle the date to avoid timezone issues
        const fixDate = (dateStr) => {
          if (!dateStr) return new Date();
          
          // Create a date object that properly respects the date as entered
          const parts = dateStr.split(/[-/]/);
          if (parts.length >= 3) {
            // If format is YYYY-MM-DD or similar
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
            const day = parseInt(parts[2], 10);
            
            return new Date(year, month, day, 12, 0, 0); // Set to noon to avoid any timezone shifts
          }
          
          // Fallback to standard parsing but force it to local time
          const date = new Date(dateStr);
          return new Date(
            date.getFullYear(),
            date.getMonth(), 
            date.getDate(),
            12, 0, 0 // Set to noon to avoid any timezone shifts
          );
        };
        
        // Create campaign object based on your data structure
        return {
          id: data.id || 'unknown-' + Math.random().toString(36).substr(2, 9),
          recordId: data.recordId || '', // Store the record ID but don't display it
          title: data.Tasks || 'Untitled Campaign',
          type: data['Campaign Type'] && Array.isArray(data['Campaign Type']) && 
                data['Campaign Type'].includes('sms') ? 'sms' : 'email',
          start: fixDate(data['Send Date']),
          end: fixDate(data['Send Date']),
          description: data.Notes || '',
          status: data.Stage || 'Pending',
          clientId: data.Client || '',
          clientRevisions: data.ClientRevisions || '',
          previewUrl: previewUrl,  // URL for preview
          rawData: data // Keep the raw data for reference
        };
      };

      const handleSelectCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setClientRevisions(campaign.clientRevisions || '');
        setUpdateStatus(null);
        setShowModal(true);
      };

      const handleApproval = async (approved) => {
        try {
          setUpdateStatus({ loading: true, error: null });
          
          // Create payload with all campaign data plus approval status and revisions
          const payload = {
            ...selectedCampaign.rawData, // Include all original data
            campaignId: selectedCampaign.id,
            recordId: selectedCampaign.recordId, // Include the record ID in the payload
            approved: approved ? "YES" : "NO",
            clientRevisions: clientRevisions,
            // Add client name from URL parameter
            client: clientName
          };
          
          const response = await fetch(updateCampaignUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) throw new Error('Failed to send approval data');
          
          setUpdateStatus({ 
            loading: false, 
            success: true, 
            message: `Campaign feedback sent successfully!` 
          });
          
          // Clear selected campaign after a delay to show success message
          setTimeout(() => {
            setSelectedCampaign(null);
            setClientRevisions('');
            setUpdateStatus(null);
            setShowModal(false);
          }, 2000);
          
        } catch (error) {
          console.error('Error sending approval data:', error);
          setUpdateStatus({ 
            loading: false, 
            error: true, 
            message: error.message || 'Error sending approval data' 
          });
        }
      };

      const getCampaignTypeClass = (type) => {
        return type === 'sms' ? 'campaign-sms' : 'campaign-email';
      };

      // Calendar navigation
      const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
      };

      const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
      };

      // Generate calendar days
      const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Get day of week of first day (0 = Sunday)
        const firstDayOfWeek = firstDay.getDay();
        
        // Array for all days to display
        const days = [];
        
        // Add empty slots for days before first of month
        for (let i = 0; i < firstDayOfWeek; i++) {
          days.push({ date: null, isCurrentMonth: false });
        }
        
        // Add all days in month
        for (let i = 1; i <= lastDay.getDate(); i++) {
          days.push({ 
            date: new Date(year, month, i),
            isCurrentMonth: true 
          });
        }
        
        return days;
      };

      const days = getDaysInMonth(currentMonth);
      
      // Group campaigns by date for calendar display
      const campaignsByDate = _.groupBy(campaigns, campaign => 
        campaign.start.toDateString()
      );

      // Get day name headers
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      // Format date for display
      const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      };
      
      // Client approval status check
      function isClientApprovalStatus(status) {
        if (!status) return false;
        return status.toLowerCase().includes('client approval');
      }
      
      // Get count of campaigns pending approval
      const pendingApprovalCount = campaigns.filter(camp => isClientApprovalStatus(camp.status)).length;

      return (
        <div className="container mx-auto px-4 pt-4 pb-0">
          <div className="calendar-container">
            <div className="p-6 bg-transparent text-white header-container">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">CONTENT CALENDAR</h1>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTab('calendar')} 
                    className={`px-4 py-2 rounded transition-all ${activeTab === 'calendar' ? 'border-b-2 border-white bg-transparent' : 'bg-transparent'}`}
                  >
                    Calendar
                  </button>
                  <button 
                    onClick={() => setActiveTab('approvals')} 
                    className={`px-4 py-2 rounded transition-all flex items-center ${activeTab === 'approvals' ? 'border-b-2 border-white bg-transparent' : 'bg-transparent'}`}
                  >
                    Pending Approvals
                    {pendingApprovalCount > 0 && (
                      <span className="ml-2 bg-white bg-opacity-20 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs border border-white">
                        {pendingApprovalCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-800 text-white">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
            {loading && (
              <div className="flex justify-center items-center py-4 bg-transparent text-white">
                <p>Loading campaigns...</p>
              </div>
            )}
            
            {activeTab === 'calendar' && (
              <div className="p-6 bg-transparent">
                <div className="flex justify-between items-center mb-4 text-white">
                  <button onClick={prevMonth} className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">
                    &lt; Previous
                  </button>
                  <h2 className="text-xl font-semibold">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex space-x-2">
                    <button onClick={nextMonth} className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">
                      Next &gt;
                    </button>
                  </div>
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 rounded-lg overflow-hidden">
                  {/* Weekday headers */}
                  {weekdays.map(day => (
                    <div key={day} className="p-2 bg-gray-800 bg-opacity-30 text-center font-semibold text-white">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {days.map((day, index) => {
                    // Get campaigns for this day - show ALL campaigns
                    const dayCampaigns = day.date ? 
                      (campaignsByDate[day.date.toDateString()] || []) : [];
                    
                    return (
                      <div 
                        key={index}
                        className={`min-h-28 p-1 calendar-cell ${
                          day.isCurrentMonth ? 'bg-opacity-30 bg-gray-800' : 'bg-transparent bg-opacity-20'
                        } ${
                          selectedDate && day.date && selectedDate.toDateString() === day.date.toDateString() 
                            ? 'ring-1 ring-white ring-opacity-20' 
                            : ''
                        } text-white`}
                        onClick={() => day.date && setSelectedDate(day.date)}
                      >
                        {day.date && (
                          <>
                            <div className="text-right text-sm p-1">
                              {day.date.getDate()}
                            </div>
                            <div className="mt-1">
                              {dayCampaigns.map(campaign => (
                                <div 
                                  key={campaign.id}
                                  className={`mb-1 py-1 px-2 text-xs text-white rounded cursor-pointer ${getCampaignTypeClass(campaign.type)}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectCampaign(campaign);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-semibold truncate">{campaign.title}</span>
                                    <span className="mt-1 text-xs px-2 py-1 rounded inline-block w-auto status-badge">
                                      {campaign.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {activeTab === 'approvals' && (
              <div className="p-6 bg-transparent">
                <h2 className="text-xl font-semibold text-white mb-4">Campaigns Awaiting Approval</h2>
                
                {campaigns.filter(camp => isClientApprovalStatus(camp.status)).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaigns
                      .filter(camp => isClientApprovalStatus(camp.status))
                      .map(campaign => (
                        <div 
                          key={campaign.id}
                          className={`p-4 rounded cursor-pointer hover:bg-opacity-50 transition-all ${getCampaignTypeClass(campaign.type)}`}
                          onClick={() => handleSelectCampaign(campaign)}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-white text-lg">{campaign.title}</span>
                            <span className="text-xs mt-1 text-white opacity-80">{formatDate(campaign.start)}</span>
                            <span className="mt-2 text-xs px-2 py-1 rounded inline-block w-auto status-badge">
                              {campaign.status}
                            </span>
                            <p className="mt-2 text-sm text-white opacity-80 line-clamp-3 whitespace-normal break-words">
                              {campaign.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-transparent border border-gray-600 rounded">
                    <p>No campaigns pending approval</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {showModal && selectedCampaign && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col md:flex-row">
                  {/* Main content area - now 50% width */}
                  <div className="p-4 w-full md:w-1/2 overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-white truncate">{selectedCampaign.title}</h2>
                      <button 
                        className="text-gray-400 hover:text-white text-xl font-bold ml-2"
                        onClick={() => setShowModal(false)}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="mb-2 text-white">
                          <span className="font-semibold text-gray-400">Date:</span>{' '}
                          <span className="whitespace-normal break-words">{formatDate(selectedCampaign.start)}</span>
                        </p>
                        <div className="mb-2 flex flex-wrap items-center">
                          <span className="font-semibold text-gray-400">Status:</span>{' '}
                          <span className="ml-2 px-2 py-1 rounded text-purple-600 inline-block status-badge">
                            {selectedCampaign.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-white">
                          <span className="font-semibold text-gray-400">Type:</span>{' '}
                          <span className={`ml-2 px-2 py-1 rounded text-white ${getCampaignTypeClass(selectedCampaign.type)}`}>
                            {selectedCampaign.type === 'sms' ? 'SMS' : 'Email'}
                          </span>
                        </p>
                        <p className="mb-2 text-white whitespace-normal break-words">
                          <span className="font-semibold text-gray-400">Client:</span>{' '}
                          {selectedCampaign.clientId}
                        </p>
                      </div>
                    </div>
                    
                    {/* Always show campaign info regardless of status */}
                    <div className="mb-4">
                      <p className="font-semibold text-gray-400 mb-1">Campaign Details:</p>
                      <p className="p-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded text-white whitespace-normal break-words">
                        {selectedCampaign.description || "No campaign details available."}
                      </p>
                    </div>
                    
                    {/* Campaign Preview button - only for Client Approval status */}
                    {isClientApprovalStatus(selectedCampaign.status) && selectedCampaign.previewUrl && (
                      <div className="mt-6 mb-4">
                        <a 
                          href={selectedCampaign.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-3 px-4 bg-transparent text-white text-center rounded hover:bg-white hover:bg-opacity-10 transition-colors duration-200 flex items-center justify-center border border-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Open Campaign Preview
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Client Review section - now 50% width */}
                  <div className="w-full md:w-1/2 p-4 border-t md:border-t-0 md:border-l border-gray-700 bg-gray-800 bg-opacity-30 overflow-hidden">
                    <h3 className="text-lg font-semibold mb-4 text-white">Client Review</h3>
                    
                    {updateStatus?.loading ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>Loading...</p>
                      </div>
                    ) : updateStatus?.success ? (
                      <div className="bg-green-900 bg-opacity-20 border border-green-700 text-green-200 px-4 py-3 rounded mb-4">
                        {updateStatus.message}
                      </div>
                    ) : updateStatus?.error ? (
                      <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                        {updateStatus.message}
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block font-semibold mb-2 text-white">Client Revisions:</label>
                          <textarea
                            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
                            rows={6}
                            value={clientRevisions}
                            onChange={(e) => setClientRevisions(e.target.value)}
                            placeholder="Enter your revision requests here..."
                            disabled={!isClientApprovalStatus(selectedCampaign.status)}/>
                        </div>
                        
                        {isClientApprovalStatus(selectedCampaign.status) ? (
                          <div className="space-y-3 mt-4">
                            <button
                              onClick={() => handleApproval(true)}
                              className="w-full py-3 bg-transparent border border-white text-white rounded hover:bg-white hover:bg-opacity-10"
                            >
                              Approve Campaign
                            </button>
                            <button
                              onClick={() => handleApproval(false)}
                              className="w-full py-3 bg-transparent border border-white text-white rounded hover:bg-white hover:bg-opacity-10"
                            >
                              Request Revisions
                            </button>
                          </div>
                        ) : (
                          <div className="bg-transparent border border-gray-600 text-gray-300 p-3 rounded mt-4">
                            <p>This campaign is not ready for client approval.</p>
                            <p className="mt-2 text-sm">Current status: <span className="font-semibold">{selectedCampaign.status}</span></p>
                            <p className="mt-2 text-sm">Only campaigns with "Client Approval" status can be approved or revised.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    // Render the app
    ReactDOM.render(
      <CampaignCalendar />,
      document.getElementById('root')
    );
  </script>
</body>
</html>