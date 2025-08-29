import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

// Loading Spinner Component
export const LoadingSpinner = ({ 
  size = 40, 
  color = '#2e7d32', 
  text = 'Loading...', 
  showText = true,
  fullHeight = false,
  variant = 'spinner' // 'spinner', 'skeleton', 'dots'
}) => {
  if (variant === 'skeleton') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2,
        ...(fullHeight && { 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          justifyContent: 'center',
          zIndex: 9999
        })
      }}>
        <Skeleton variant="circular" width={size} height={size} />
        {showText && (
          <Skeleton variant="text" width={120} height={24} />
        )}
      </Box>
    );
  }

  if (variant === 'dots') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2,
        ...(fullHeight && { 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          justifyContent: 'center',
          zIndex: 9999
        })
      }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: color,
                animation: 'bounce 1.4s ease-in-out infinite both',
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </Box>
        {showText && (
          <Typography variant="body2" color="text.secondary">
            {text}
          </Typography>
        )}
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { 
              transform: scale(0);
            } 
            40% { 
              transform: scale(1.0);
            }
          }
        `}</style>
      </Box>
    );
  }

  // Default spinner
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 2,
      ...(fullHeight && { 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        justifyContent: 'center',
        zIndex: 9999
      })
    }}>
      <CircularProgress size={size} sx={{ color }} />
      {showText && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
    </Box>
  );
};

// Page Loading Component (cho full page)
export const PageLoading = ({ text = 'Loading...' }) => (
  <Box sx={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    fontFamily: '"Open Sans", sans-serif',
    zIndex: 9999
  }}>
    <LoadingSpinner size={60} text={text} color="#2e7d32" />
  </Box>
);

// Inline Loading Component (cho buttons, small areas)
export const InlineLoading = ({ size = 16, color = 'inherit' }) => (
  <CircularProgress size={size} sx={{ color }} />
);

// Data Loading State Component (cho data fetching)
export const DataLoadingState = ({ 
  text = 'Loading data...', 
  size = 60, 
  color = '#2e7d32',
  minHeight = '60vh',
  fullScreen = false
}) => (
  <Box sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: fullScreen ? '100vh' : minHeight,
    flexDirection: 'column',
    gap: 3,
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999
    })
  }}>
    <LoadingSpinner size={size} color={color} text={text} />
  </Box>
 );

// Error State Component
export const ErrorState = ({ 
  error, 
  onRetry, 
  isRetrying, 
  retryText = 'Retry',
  errorTitle = 'Error Loading Data'
}) => (
  <Box sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    flexDirection: 'column',
    gap: 3
  }}>
    <Box sx={{
      textAlign: 'center',
      p: 4,
      borderRadius: 2,
      border: '1px solid #fecaca',
      backgroundColor: '#fef2f2',
      maxWidth: 500
    }}>
      <Typography variant="h6" sx={{color: '#dc2626', fontWeight: 600, mb: 2}}>
        {errorTitle}
      </Typography>
      <Typography variant="body1" sx={{color: '#7f1d1d', mb: 3}}>
        {error}
      </Typography>
      {onRetry && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner 
            size={16} 
            color="#dc2626" 
            text={isRetrying ? 'Retrying...' : retryText}
            variant={isRetrying ? 'spinner' : 'dots'}
          />
        </Box>
      )}
    </Box>
  </Box>
);

// Empty State Component
export const EmptyState = ({ 
  title = 'No data available',
  description = 'There are no items to display',
  icon = '📭'
}) => (
  <Box sx={{
    textAlign: 'center',
    py: 8,
    px: 4
  }}>
    <Typography variant="h4" sx={{ mb: 2, opacity: 0.6 }}>
      {icon}
    </Typography>
    <Typography variant="h6" sx={{ color: '#64748b', mb: 1, fontWeight: 600 }}>
      {title}
    </Typography>
    <Typography variant="body1" sx={{ color: '#64748b' }}>
      {description}
    </Typography>
  </Box>
); 