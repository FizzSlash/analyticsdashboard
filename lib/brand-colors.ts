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

export function getAllBrandColors(client: any) {
  return {
    primary: client?.primary_color || '#000000',
    secondary: client?.secondary_color || '#6366F1',
    accent: client?.accent_color || client?.secondary_color || '#6366F1',
    success: client?.success_color || '#10B981',
    warning: client?.warning_color || '#F59E0B',
    error: client?.error_color || '#EF4444',
    chart1: client?.chart_color_1 || client?.primary_color || '#000000',
    chart2: client?.chart_color_2 || client?.secondary_color || '#6366F1',
    chart3: client?.chart_color_3 || '#6366F1',
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
  const allColors = getAllBrandColors(client)
  const primaryRgb = hexToRgb(allColors.primary)
  const secondaryRgb = hexToRgb(allColors.secondary)
  const accentRgb = hexToRgb(allColors.accent)
  
  return {
    // Primary color variations (for main actions)
    primary: {
      solid: allColors.primary,
      bg20: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(0, 0, 0, 0.2)',
      bg30: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)` : 'rgba(0, 0, 0, 0.3)',
      bg50: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)` : 'rgba(0, 0, 0, 0.5)',
      bg80: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)` : 'rgba(0, 0, 0, 0.8)',
      text: allColors.primary
    },
    
    // Secondary color variations (for secondary actions)
    secondary: {
      solid: allColors.secondary,
      bg20: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.2)` : 'rgba(99, 102, 241, 0.2)',
      bg30: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.3)` : 'rgba(99, 102, 241, 0.3)', 
      bg50: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.5)` : 'rgba(99, 102, 241, 0.5)',
      bg80: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.8)` : 'rgba(99, 102, 241, 0.8)',
      text: allColors.secondary
    },

    // Accent color variations
    accent: {
      solid: allColors.accent,
      bg20: accentRgb ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.2)` : 'rgba(99, 102, 241, 0.2)',
      bg30: accentRgb ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3)` : 'rgba(99, 102, 241, 0.3)',
      bg50: accentRgb ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.5)` : 'rgba(99, 102, 241, 0.5)',
      bg80: accentRgb ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.8)` : 'rgba(99, 102, 241, 0.8)',
      text: allColors.accent
    },

    // Fully customizable semantic actions
    actions: {
      // Primary actions use primary brand color
      primary_button: allColors.primary,
      primary_bg: primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)` : 'rgba(0, 0, 0, 0.8)',
      
      // Secondary actions use secondary brand color  
      secondary_button: allColors.secondary,
      secondary_bg: secondaryRgb ? `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.8)` : 'rgba(99, 102, 241, 0.8)',
      
      // Use client-customizable semantic colors
      success: allColors.success,
      warning: allColors.warning,
      error: allColors.error,
      accent: allColors.accent,
      neutral: '#6B7280'
    },

    // Chart colors (fully customizable)
    charts: {
      primary: allColors.chart1,
      secondary: allColors.chart2,
      tertiary: allColors.chart3,
      colors: [allColors.chart1, allColors.chart2, allColors.chart3]
    },

    // Background
    background: allColors.background_image
  }
}

// Semantic button styling with brand colors
export function getBrandButton(type: 'primary' | 'secondary' | 'success' | 'warning' | 'error', client: any) {
  const brandColors = getBrandColorClasses(client)
  const successRgb = hexToRgb(brandColors.actions.success)
  const warningRgb = hexToRgb(brandColors.actions.warning)
  const errorRgb = hexToRgb(brandColors.actions.error)
  
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
        className: 'text-white transition-all hover:opacity-90',
        style: { 
          backgroundColor: successRgb ? `rgba(${successRgb.r}, ${successRgb.g}, ${successRgb.b}, 0.8)` : brandColors.actions.success
        }
      }
    case 'warning':
      return {
        className: 'text-white transition-all hover:opacity-90',
        style: { 
          backgroundColor: warningRgb ? `rgba(${warningRgb.r}, ${warningRgb.g}, ${warningRgb.b}, 0.8)` : brandColors.actions.warning
        }
      }
    case 'error':
      return {
        className: 'text-white transition-all hover:opacity-90',
        style: { 
          backgroundColor: errorRgb ? `rgba(${errorRgb.r}, ${errorRgb.g}, ${errorRgb.b}, 0.8)` : brandColors.actions.error
        }
      }
    default:
      return {
        className: 'text-white transition-all hover:opacity-90',
        style: { backgroundColor: brandColors.primary.bg80 }
      }
  }
}

// Status badge colors with full brand control
export function getStatusBadgeClass(status: string, client: any): string {
  const allColors = getAllBrandColors(client)
  const successRgb = hexToRgb(allColors.success)
  const warningRgb = hexToRgb(allColors.warning)
  const errorRgb = hexToRgb(allColors.error)
  const primaryRgb = hexToRgb(allColors.primary)
  
  switch (status.toLowerCase()) {
    case 'approved':
    case 'completed':
    case 'scheduled - close':
      return successRgb 
        ? `text-white border`
        : 'bg-green-500/30 text-green-300 border-green-400'
    case 'ready for client approval':
    case 'client approval':
      return warningRgb
        ? `text-white border`
        : 'bg-orange-500/30 text-orange-300 border-orange-400'
    case 'client revisions':
    case 'rejected':
      return errorRgb
        ? `text-white border`
        : 'bg-red-500/30 text-red-300 border-red-400'
    default:
      return primaryRgb 
        ? `text-white border`
        : `text-white/80`
  }
}

// Get chart colors for analytics
export function getChartColors(client: any): string[] {
  const allColors = getAllBrandColors(client)
  return [allColors.chart1, allColors.chart2, allColors.chart3]
}