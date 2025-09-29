// Brand Color System - Uses client primary/secondary colors throughout portal

interface ClientColors {
  primary: string
  secondary: string
  background_image?: string
}

export function getBrandColors(client: any): ClientColors {
  return {
    primary: client?.primary_color || '#000000', // Default to black
    secondary: client?.secondary_color || '#6366F1', // Default to purple
    background_image: client?.background_image_url
  }
}

// Convert hex to RGB for alpha transparency
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Generate brand-aware color classes
export function getBrandColorClasses(client: any) {
  const colors = getBrandColors(client)
  const primaryRgb = hexToRgb(colors.primary)
  const secondaryRgb = hexToRgb(colors.secondary)
  
  return {
    // Primary color variations
    primary: {
      solid: colors.primary,
      bg20: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(0, 0, 0, 0.2)',
      bg30: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)` : 'rgba(0, 0, 0, 0.3)',
      bg50: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)` : 'rgba(0, 0, 0, 0.5)',
      bg80: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)` : 'rgba(0, 0, 0, 0.8)',
      text: colors.primary
    },
    
    // Secondary color variations  
    secondary: {
      solid: colors.secondary,
      bg20: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.2)` : 'rgba(99, 102, 241, 0.2)',
      bg30: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.3)` : 'rgba(99, 102, 241, 0.3)', 
      bg50: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.5)` : 'rgba(99, 102, 241, 0.5)',
      bg80: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.8)` : 'rgba(99, 102, 241, 0.8)',
      text: colors.secondary
    },

    // Status colors (still semantic but tinted toward brand)
    status: {
      success: '#10B981', // Keep green for success
      warning: '#F59E0B', // Keep orange for warnings  
      error: '#EF4444',   // Keep red for errors
      info: colors.secondary, // Use secondary color for info
      neutral: '#6B7280'  // Keep gray for neutral
    },

    // Background
    background: colors.background_image
  }
}

// Status color functions with brand awareness
export function getStatusColor(status: string, client: any): string {
  const brandColors = getBrandColorClasses(client)
  
  switch (status.toLowerCase()) {
    case 'approved':
    case 'completed':
    case 'success':
      return 'bg-green-500/20 text-green-300 border-green-400/30'
    
    case 'pending':
    case 'review':
    case 'in_progress':
      return `bg-[${brandColors.secondary.bg20}] border-[${brandColors.secondary.bg50}]`
    
    case 'rejected':
    case 'error':
    case 'overdue':
      return 'bg-red-500/20 text-red-300 border-red-400/30'
    
    case 'client_approval':
    case 'ready for client approval':
      return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
    
    default:
      return `bg-[${brandColors.primary.bg20}] border-[${brandColors.primary.bg50}]`
  }
}

// Priority color functions with brand awareness
export function getPriorityColor(priority: string, client: any): string {
  const brandColors = getBrandColorClasses(client)
  
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'bg-red-500/20 text-red-300 border-red-400/30'
    case 'high':
      return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
    case 'medium':
      return `bg-[${brandColors.secondary.bg20}] border-[${brandColors.secondary.bg50}]`
    case 'low':
      return 'bg-green-500/20 text-green-300 border-green-400/30'
    default:
      return `bg-[${brandColors.primary.bg20}] border-[${brandColors.primary.bg50}]`
  }
}