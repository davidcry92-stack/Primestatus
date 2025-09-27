import { useEffect, useState } from 'react';

const ScreenshotProtection = ({ children }) => {
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    // Advanced screenshot protection measures
    const protectionMeasures = () => {
      // Disable right-click context menu
      const disableRightClick = (e) => {
        e.preventDefault();
        return false;
      };

      // Disable keyboard shortcuts for screenshots/dev tools
      const disableKeyboardShortcuts = (e) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
        if (
          e.keyCode === 123 || // F12
          (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
          (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
          (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
          (e.ctrlKey && e.shiftKey && e.keyCode === 75) || // Ctrl+Shift+K
          (e.metaKey && e.altKey && e.keyCode === 73) || // Cmd+Alt+I (Mac)
          (e.metaKey && e.keyCode === 83) || // Cmd+S (Mac save)
          (e.ctrlKey && e.keyCode === 83) || // Ctrl+S (Windows save)
          (e.keyCode === 44) // Print Screen
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      // Detect developer tools
      const detectDevTools = () => {
        const threshold = 160;
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          // Dev tools detected - could redirect or show warning
          console.clear();
          document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-size:24px;color:red;">Unauthorized access detected. Session terminated.</div>';
        }
      };

      // Blur content when window loses focus (potential screenshot attempt)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          document.body.style.filter = 'blur(10px)';
        } else {
          document.body.style.filter = 'none';
        }
      };

      // Add event listeners
      document.addEventListener('contextmenu', disableRightClick);
      document.addEventListener('keydown', disableKeyboardShortcuts);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Periodic dev tools detection
      const devToolsInterval = setInterval(detectDevTools, 1000);

      // Disable text selection
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.mozUserSelect = 'none';
      document.body.style.msUserSelect = 'none';

      // Add CSS to prevent screenshots
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        
        /* Hide content from screen recording software */
        @media print {
          * { display: none !important; }
        }
        
        /* Watermark overlay */
        body::before {
          content: 'StatusXSmoakland - Members Only';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          color: rgba(255, 255, 255, 0.1);
          pointer-events: none;
          z-index: 9999;
          user-select: none;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.removeEventListener('contextmenu', disableRightClick);
        document.removeEventListener('keydown', disableKeyboardShortcuts);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(devToolsInterval);
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.body.style.mozUserSelect = '';
        document.body.style.msUserSelect = '';
        document.head.removeChild(style);
      };
    };

    const cleanup = protectionMeasures();
    setIsProtected(true);

    return cleanup;
  }, []);

  // Show loading while protection is being applied
  if (!isProtected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Securing session...</div>
      </div>
    );
  }

  return children;
};

export default ScreenshotProtection;