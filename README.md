# Klaviyo Analytics Dashboard

A comprehensive analytics dashboard for Klaviyo email marketing campaigns, flows, and audience insights. Built with Next.js, Supabase, and TypeScript.

## Features

- **Campaign Analytics**: Track open rates, click rates, and revenue from email campaigns
- **Flow Performance**: Monitor automated email flow performance and revenue attribution
- **Audience Growth**: Analyze subscriber growth and engagement metrics
- **Subject Line Insights**: Optimize subject lines with performance analytics
- **Revenue Attribution**: Track revenue from campaigns vs flows
- **Time-based Analysis**: Identify optimal sending times and days
- **Real-time Sync**: Automated data synchronization with Klaviyo API

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Charts**: Recharts
- **API Integration**: Klaviyo REST API
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account and project
- Klaviyo account with API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd klaviyo-analytics-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `env.example` to `.env.local` and fill in your values:
   ```bash
   cp env.example .env.local
   ```

   Required environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Encryption Key for API Keys (generate a random 32 character string)
   ENCRYPTION_KEY=your_32_character_encryption_key

   # Optional: API key for sync endpoints
   SYNC_API_KEY=your_sync_api_key
   ```

4. **Set up Supabase Database**
   
   Run the SQL schema provided in your Supabase SQL editor to create all necessary tables.

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Initial Setup

1. **Run the database migration**:
   Execute `database/auth-migration.sql` in your Supabase SQL editor to create the authentication tables.

2. **Create your first agency**:
   ```bash
   node scripts/setup-agency.js
   ```
   This will create your agency and admin user account.

### Agency Admin Workflow

1. **Login** at `/login` with your admin credentials
2. **Access Admin Dashboard** at `/agency/your-agency-slug/admin`
3. **Add Clients** using the client management interface
4. **Invite Users** to give clients access to their dashboards

### Adding Clients

**Via Admin Interface (Recommended)**:
1. Login to your agency dashboard
2. Go to the "Clients" tab
3. Click "Add Client"
4. Fill in client details and Klaviyo API key
5. Client dashboard is immediately available

**Via API** (for automation):
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_auth_token" \
  -d '{
    "brand_name": "Your Brand Name",
    "brand_slug": "your-brand-slug",
    "klaviyo_api_key": "your_klaviyo_private_api_key",
    "agency_id": "your_agency_id"
  }'
```

### User Access Control

**Agency Admins**:
- Full access to agency dashboard
- Can create/edit/delete clients
- Can invite client users
- Can access all client dashboards in their agency

**Client Users**:
- Can only access their specific client dashboard
- Receive email invitation to set password
- Dashboard URL: `/client/client-brand-slug`

### Accessing Client Dashboards

Client dashboards are now protected and require authentication:
```
https://yoursite.com/client/your-brand-slug
```
Users must login first and have proper permissions.

### Data Synchronization

#### Manual Sync
- Sync all clients: `POST /api/sync`
- Sync specific client: `POST /api/sync/[clientId]`

#### Automated Sync
Set up a cron job or use Vercel Cron to regularly sync data:

```bash
# Example: Sync every hour
0 * * * * curl -X POST https://yoursite.com/api/sync -H "Authorization: Bearer your_sync_api_key"
```

## Dashboard Features

### Key Metrics
- Total campaigns sent
- Total subscribers with growth rate
- Average open and click rates  
- Total revenue from email marketing
- Active flows and engagement rates

### Charts & Visualizations
- Revenue trend over time
- Subscriber growth tracking
- Campaign performance metrics
- Daily revenue breakdown

### Performance Tables
- Top performing campaigns by open rate, click rate, or revenue
- Top performing flows by completion rate or revenue
- Subject line performance analysis

### Customization
Each client dashboard supports:
- Custom brand colors
- Logo integration
- Branded styling

## API Endpoints

### Client Management
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client

### Data Synchronization  
- `GET /api/sync` - API information
- `POST /api/sync` - Sync all clients
- `POST /api/sync/[clientId]` - Sync specific client

## Database Schema

The application uses a comprehensive database schema with the following main tables:

- `clients` - Client configuration and API keys
- `campaign_metrics` - Campaign performance data
- `flow_metrics` - Automated flow performance  
- `audience_metrics` - Subscriber and engagement data
- `revenue_attribution` - Revenue tracking by source
- `subject_line_performance` - Subject line optimization data
- `time_performance_insights` - Optimal sending time analysis

## Security

- API keys are encrypted before storage using AES-256-GCM
- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive configuration
- Optional API key authentication for sync endpoints

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## Customization

### Adding New Metrics
1. Add fields to relevant database tables
2. Update TypeScript interfaces in `lib/supabase.ts`
3. Modify sync service in `lib/sync-service.ts`
4. Update dashboard components to display new metrics

### Custom Charts
Use the chart components in `components/dashboard/charts.tsx`:
- `CustomLineChart` - Line charts with trend data
- `CustomBarChart` - Bar charts for comparisons  
- `CustomAreaChart` - Area charts for cumulative data
- `CustomPieChart` - Pie charts for distributions

### Styling
- Modify `tailwind.config.js` for global theme changes
- Update `app/globals.css` for custom CSS classes
- Client-specific colors are applied dynamically

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify environment variables are correct
   - Check Supabase project settings
   - Ensure RLS policies allow access

2. **Klaviyo API Errors**
   - Verify API key has correct permissions
   - Check API rate limits
   - Ensure API key is properly encrypted

3. **Sync Issues**
   - Check client API key validity
   - Verify network connectivity
   - Review sync service logs

### Debugging
Enable verbose logging by setting:
```env
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review Klaviyo API documentation for API-related issues
