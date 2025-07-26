# Gemini Vox Integration Guide

This document explains how to integrate the Gemini Vox app with FiGenie Web to enable seamless navigation between the two applications.

## Overview

When users click the Chat/Voice FAB button in FiGenie Web, they are redirected to the Gemini Vox app with a `returnUrl` query parameter. The Gemini Vox app should handle this parameter to allow users to navigate back to the FiGenie dashboard.

## Implementation Steps

### 1. Parse Query Parameters on Load

When the Gemini Vox app loads, extract the `returnUrl` parameter:

```javascript
// In your main App component or initialization code
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get('returnUrl');
  
  if (returnUrl) {
    // Store in state or localStorage
    localStorage.setItem('figenie_return_url', returnUrl);
    // Or use React state
    setReturnUrl(decodeURIComponent(returnUrl));
  }
}, []);
```

### 2. Implement Back Navigation

Add a back button or navigation element that uses the return URL:

```javascript
const BackButton = () => {
  const handleBack = () => {
    const returnUrl = localStorage.getItem('figenie_return_url');
    
    if (returnUrl) {
      // IMPORTANT: Validate the URL for security
      try {
        const url = new URL(decodeURIComponent(returnUrl));
        
        // Whitelist allowed domains
        const allowedOrigins = [
          'https://your-figenie-domain.com',
          'http://localhost:3000',
          'http://localhost:3001'
          // Add your production domains here
        ];
        
        if (allowedOrigins.includes(url.origin)) {
          window.location.href = decodeURIComponent(returnUrl);
        } else {
          console.error('Return URL not in allowed origins');
          // Handle error - maybe show a message to user
        }
      } catch (e) {
        console.error('Invalid return URL format:', e);
        // Fallback to default behavior
        window.history.back();
      }
    } else {
      // No return URL provided - use default back behavior
      window.history.back();
    }
  };

  return (
    <button 
      onClick={handleBack}
      className="your-button-styles"
    >
      ← Back to Dashboard
    </button>
  );
};
```

### 3. Complete Integration Example

Here's a complete example for a React-based Gemini Vox app:

```javascript
import React, { useState, useEffect } from 'react';

function App() {
  const [returnUrl, setReturnUrl] = useState(null);

  useEffect(() => {
    // Parse URL parameters on component mount
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrlParam = urlParams.get('returnUrl');
    
    if (returnUrlParam) {
      const decodedUrl = decodeURIComponent(returnUrlParam);
      
      // Validate before storing
      try {
        new URL(decodedUrl); // This will throw if invalid
        setReturnUrl(decodedUrl);
      } catch (e) {
        console.error('Invalid return URL provided');
      }
    }
  }, []);

  const handleBackToDashboard = () => {
    if (!returnUrl) return;

    // Security: Validate the return URL
    try {
      const url = new URL(returnUrl);
      
      // Define allowed origins
      const allowedOrigins = [
        'https://figenie.com',
        'http://localhost:3000',
        // Add more as needed
      ];
      
      if (allowedOrigins.includes(url.origin)) {
        window.location.href = returnUrl;
      } else {
        alert('Invalid return URL');
      }
    } catch (e) {
      console.error('Error navigating back:', e);
    }
  };

  return (
    <div className="app">
      {/* Show back button only if return URL exists */}
      {returnUrl && (
        <header>
          <button onClick={handleBackToDashboard}>
            ← Back to FiGenie Dashboard
          </button>
        </header>
      )}
      
      {/* Rest of your Gemini Vox app */}
      <main>
        {/* Your chat/voice interface */}
      </main>
    </div>
  );
}

export default App;
```

## Security Considerations

1. **Always validate the return URL** to prevent open redirect vulnerabilities
2. **Use a whitelist of allowed domains** rather than accepting any URL
3. **Decode and parse the URL** before using it
4. **Handle errors gracefully** if the URL is invalid

## Testing

To test the integration:

1. From FiGenie: Click the Chat/Voice FAB button
2. Check that you're redirected to: `https://gemini-vox-218281830730.us-central1.run.app?returnUrl=http%3A%2F%2Flocalhost%3A3000%2Fdashboard`
3. In Gemini Vox: Click the back button
4. Verify you're returned to the FiGenie dashboard

## Additional Parameters (Optional)

You can extend this integration by passing additional parameters:

```javascript
// In FiGenie ChatVoiceFAB.tsx
const params = new URLSearchParams({
  returnUrl: window.location.origin + '/dashboard',
  userId: currentUser?.id,
  userName: currentUser?.name,
  theme: 'dark'
});

window.location.href = `https://gemini-vox-218281830730.us-central1.run.app?${params.toString()}`;
```

Then in Gemini Vox, parse all parameters:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const returnUrl = urlParams.get('returnUrl');
const userId = urlParams.get('userId');
const userName = urlParams.get('userName');
const theme = urlParams.get('theme');
```

## Support

For questions or issues with this integration, please contact the FiGenie development team.
