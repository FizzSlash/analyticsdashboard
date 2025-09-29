// Complete Brand Color System - Every color respects client branding

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

// Complete brand color system with semantic mappings
export function getBrandColorClasses(client: any) {
  const colors = getBrandColors(client)
  const primaryRgb = hexToRgb(colors.primary)
  const secondaryRgb = hexToRgb(colors.secondary)
  
  return {
    // Primary color variations (for main actions)
    primary: {
      solid: colors.primary,
      bg20: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(0, 0, 0, 0.2)',
      bg30: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)` : 'rgba(0, 0, 0, 0.3)',
      bg50: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)` : 'rgba(0, 0, 0, 0.5)',
      bg80: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)` : 'rgba(0, 0, 0, 0.8)',
      text: colors.primary
    },
    
    // Secondary color variations (for secondary actions)
    secondary: {
      solid: colors.secondary,
      bg20: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.2)` : 'rgba(99, 102, 241, 0.2)',
      bg30: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.3)` : 'rgba(99, 102, 241, 0.3)', 
      bg50: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.5)` : 'rgba(99, 102, 241, 0.5)',
      bg80: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.8)` : 'rgba(99, 102, 241, 0.8)',
      text: colors.secondary
    },

    // Semantic actions mapped to brand colors
    actions: {
      // Primary actions use primary brand color
      primary_button: colors.primary,
      primary_bg: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)` : 'rgba(0, 0, 0, 0.8)',
      
      // Secondary actions use secondary brand color  
      secondary_button: colors.secondary,
      secondary_bg: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.8)` : 'rgba(99, 102, 241, 0.8)',
      
      // Keep semantic colors for specific meanings
      success: '#10B981',      // Green for success/approval
      warning: '#F59E0B',      // Orange for warnings/pending
      error: '#EF4444',        // Red for errors/rejection
      neutral: '#6B7280'       // Gray for neutral
    },

    // Background
    background: colors.background_image
  }
}

// Semantic button styling with brand colors
export function getBrandButton(type: 'primary' | 'secondary' | 'success' | 'warning' | 'error', client: any) {
  const brandColors = getBrandColorClasses(client)
  
  switch (type) {
    case 'primary':
      return {
        className: 'text-white transition-all hover:opacity-90',
        style: { backgroundColor: brandColors.primary.bg80 }
      }
    case 'secondary':
      return {
        className: 'text-white transition-all hover:opacity-90',
        style: { backgroundColor: brandColors.secondary.bg80 }
      }
    case 'success':
      return {
        className: 'bg-green-600/80 hover:bg-green-600 text-white transition-colors',
        style: {}
      }
    case 'warning':
      return {
        className: 'bg-orange-600/80 hover:bg-orange-600 text-white transition-colors',
        style: {}
      }
    case 'error':
      return {
        className: 'bg-red-600/80 hover:bg-red-600 text-white transition-colors',
        style: {}
      }
    default:
      return {
        className: 'text-white transition-all hover:opacity-90',
        style: { backgroundColor: brandColors.primary.bg80 }
      }
  }
}

// Status badge colors with brand awareness
export function getStatusBadgeClass(status: string, client: any): string {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'completed':
    case 'scheduled - close':
      return 'bg-green-500/30 text-green-300 border-green-400'
    case 'ready for client approval':
    case 'client approval':
      return 'bg-orange-500/30 text-orange-300 border-orange-400'
    case 'client revisions':
    case 'rejected':
      return 'bg-red-500/30 text-red-300 border-red-400'
    default:
      const brandColors = getBrandColorClasses(client)
      return `text-white/80`
  }
}