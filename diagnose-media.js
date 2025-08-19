// Media Access Diagnostic Tool
// Run this script with Node.js to check for camera and microphone issues

const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('\n=== WebRTC Media Access Diagnostic Tool ===\n');
console.log('This tool will help diagnose camera and microphone access issues.');

// Check operating system
const platform = os.platform();
const release = os.release();
console.log(`\nOperating System: ${platform} (${release})`);

// Check Node.js version
console.log(`Node.js Version: ${process.version}`);

// Check for browser processes
const checkBrowsers = () => {
  return new Promise((resolve) => {
    const command = platform === 'win32' 
      ? 'tasklist /fi "imagename eq chrome*" /fi "imagename eq msedge*" /fi "imagename eq firefox*"'
      : 'ps -ef | grep -E "chrome|firefox|safari" | grep -v grep';
    
    exec(command, (error, stdout) => {
      console.log('\n=== Active Browser Processes ===');
      if (error) {
        console.log('Error checking browser processes:', error);
        resolve();
        return;
      }
      
      if (stdout.trim()) {
        console.log(stdout);
      } else {
        console.log('No browser processes found running.');
      }
      resolve();
    });
  });
};

// Check for camera and microphone devices
const checkMediaDevices = () => {
  return new Promise((resolve) => {
    if (platform === 'win32') {
      exec('powershell "Get-PnpDevice | Where-Object { $_.Class -eq \'Camera\' -or $_.Class -eq \'AudioEndpoint\' } | Select-Object Status, Class, FriendlyName | Format-Table -AutoSize"', (error, stdout) => {
        console.log('\n=== Camera and Audio Devices ===');
        if (error) {
          console.log('Error checking media devices:', error);
          resolve();
          return;
        }
        
        if (stdout.trim()) {
          console.log(stdout);
        } else {
          console.log('No camera or audio devices found.');
          console.log('This could indicate a hardware issue or missing drivers.');
        }
        resolve();
      });
    } else {
      // For macOS/Linux
      exec('ls -la /dev/video* 2>/dev/null || echo "No video devices found"', (error, stdout) => {
        console.log('\n=== Camera Devices ===');
        console.log(stdout.trim());
        
        exec('ls -la /dev/snd/* 2>/dev/null || echo "No audio devices found"', (error, stdout) => {
          console.log('\n=== Audio Devices ===');
          console.log(stdout.trim());
          resolve();
        });
      });
    }
  });
};

// Check for browser permissions (Windows only)
const checkBrowserPermissions = () => {
  return new Promise((resolve) => {
    if (platform === 'win32') {
      console.log('\n=== Browser Camera/Microphone Permissions ===');
      console.log('Checking Windows privacy settings...');
      
      // Check camera privacy settings
      exec('powershell "Get-ItemProperty -Path \'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\webcam\' -Name \'Value\' | Select-Object Value"', (error, stdout) => {
        if (error) {
          console.log('Could not check camera permissions:', error.message);
        } else {
          const allowed = stdout.includes('Allow');
          console.log(`Camera access at system level: ${allowed ? 'ALLOWED' : 'DENIED'}`);
        }
        
        // Check microphone privacy settings
        exec('powershell "Get-ItemProperty -Path \'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\microphone\' -Name \'Value\' | Select-Object Value"', (error, stdout) => {
          if (error) {
            console.log('Could not check microphone permissions:', error.message);
          } else {
            const allowed = stdout.includes('Allow');
            console.log(`Microphone access at system level: ${allowed ? 'ALLOWED' : 'DENIED'}`);
          }
          resolve();
        });
      });
    } else {
      console.log('\n=== Browser Camera/Microphone Permissions ===');
      console.log('Permission checking is only available on Windows.');
      console.log('On macOS/Linux, check browser settings manually.');
      resolve();
    }
  });
};

// Check for port availability
const checkPorts = () => {
  return new Promise((resolve) => {
    const portsToCheck = [3001, 8080, 5173];
    console.log('\n=== Port Availability ===');
    
    const command = platform === 'win32'
      ? `powershell "Get-NetTCPConnection -LocalPort 3001,8080,5173 -ErrorAction SilentlyContinue | Select-Object LocalPort, State, OwningProcess"`
      : `for port in ${portsToCheck.join(' ')}; do lsof -i :$port; done`;
    
    exec(command, (error, stdout) => {
      if (error && !stdout.trim()) {
        console.log('No processes found using the checked ports.');
        console.log('Ports 3001, 8080, and 5173 appear to be available.');
      } else {
        console.log('Processes using relevant ports:');
        console.log(stdout || 'None');
      }
      resolve();
    });
  });
};

// Generate HTML test page
const generateTestPage = () => {
  return new Promise((resolve) => {
    console.log('\n=== Creating Camera/Microphone Test Page ===');
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Camera and Microphone Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        video { width: 100%; background: #000; }
        .controls { margin-top: 20px; }
        button { padding: 10px 15px; margin-right: 10px; }
        .status { margin-top: 20px; padding: 10px; border-radius: 5px; }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
        .log { margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; height: 200px; overflow-y: auto; }
    </style>
</head>
<body>
    <h1>Camera and Microphone Test</h1>
    <p>This page tests if your browser can access your camera and microphone.</p>
    
    <video id="video" autoplay playsinline></video>
    
    <div class="controls">
        <button id="startButton">Start Camera & Mic</button>
        <button id="startVideoOnly">Video Only</button>
        <button id="startAudioOnly">Audio Only</button>
        <button id="stopButton" disabled>Stop</button>
    </div>
    
    <div id="status" class="status"></div>
    
    <div class="log" id="log">
        <strong>Log:</strong><br>
    </div>
    
    <script>
        const video = document.getElementById('video');
        const startButton = document.getElementById('startButton');
        const startVideoOnly = document.getElementById('startVideoOnly');
        const startAudioOnly = document.getElementById('startAudioOnly');
        const stopButton = document.getElementById('stopButton');
        const status = document.getElementById('status');
        const log = document.getElementById('log');
        
        let stream = null;
        
        function addLog(message) {
            const now = new Date();
            const timestamp = now.toLocaleTimeString();
            log.innerHTML += timestamp + ': ' + message + '<br>';
            log.scrollTop = log.scrollHeight;
        }
        
        function startMedia(constraints) {
            return new Promise(async (resolve, reject) => {
                try {
                    addLog('Requesting media with constraints: ' + JSON.stringify(constraints));
                    
                    // Check if mediaDevices API is available
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        throw new Error('MediaDevices API not supported in this browser');
                    }
                    
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                    
                    const videoTracks = stream.getVideoTracks();
                    const audioTracks = stream.getAudioTracks();
                    
                    addLog('Got ' + videoTracks.length + ' video tracks and ' + audioTracks.length + ' audio tracks');
                    
                    if (videoTracks.length > 0) {
                        addLog('Using video device: ' + videoTracks[0].label);
                    }
                    
                    if (audioTracks.length > 0) {
                        addLog('Using audio device: ' + audioTracks[0].label);
                    }
                    
                    video.srcObject = stream;
                    
                    status.className = 'status success';
                    status.textContent = 'Success! Media access working.';
                    
                    startButton.disabled = true;
                    startVideoOnly.disabled = true;
                    startAudioOnly.disabled = true;
                    stopButton.disabled = false;
                    
                    resolve(stream);
                } catch (error) {
                    addLog('Error: ' + error.message);
                    addLog('Error name: ' + error.name);
                    
                    status.className = 'status error';
                    
                    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                        status.textContent = 'Access denied. Please allow access in your browser settings.';
                    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                        status.textContent = 'No camera or microphone found. Please connect a device and try again.';
                    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                        status.textContent = 'Could not access your device. It may be in use by another application.';
                    } else if (error.name === 'OverconstrainedError') {
                        status.textContent = 'Your device does not meet the required constraints.';
                    } else if (error.name === 'TypeError') {
                        status.textContent = 'Invalid media constraints specified.';
                    } else {
                        status.textContent = 'Error accessing media: ' + error.message;
                    }
                    
                    reject(error);
                }
            });
        }
        
        startButton.addEventListener('click', () => {
            startMedia({ video: true, audio: true })
                .catch(error => console.error('Failed to get media:', error));
        });
        
        startVideoOnly.addEventListener('click', () => {
            startMedia({ video: true, audio: false })
                .catch(error => console.error('Failed to get video:', error));
        });
        
        startAudioOnly.addEventListener('click', () => {
            startMedia({ video: false, audio: true })
                .catch(error => console.error('Failed to get audio:', error));
        });
        
        stopButton.addEventListener('click', () => {
            if (stream) {
                addLog('Stopping all tracks...');
                stream.getTracks().forEach(track => {
                    track.stop();
                    addLog('Stopped ' + track.kind + ' track');
                });
                video.srcObject = null;
                stream = null;
                
                startButton.disabled = false;
                startVideoOnly.disabled = false;
                startAudioOnly.disabled = false;
                stopButton.disabled = true;
                
                status.className = 'status';
                status.textContent = 'Media stopped.';
            }
        });
        
        // Log browser information
        addLog('Browser: ' + navigator.userAgent);
        if (navigator.mediaDevices) {
            addLog('MediaDevices API is available');
            
            navigator.mediaDevices.enumerateDevices()
                .then(devices => {
                    const videoDevices = devices.filter(device => device.kind === 'videoinput');
                    const audioDevices = devices.filter(device => device.kind === 'audioinput');
                    
                    addLog('Found ' + videoDevices.length + ' video input devices');
                    addLog('Found ' + audioDevices.length + ' audio input devices');
                    
                    videoDevices.forEach((device, index) => {
                        addLog('Video device ' + (index + 1) + ': ' + (device.label || 'Label not available (permission needed)'));
                    });
                    
                    audioDevices.forEach((device, index) => {
                        addLog('Audio device ' + (index + 1) + ': ' + (device.label || 'Label not available (permission needed)'));
                    });
                })
                .catch(err => {
                    addLog('Error enumerating devices: ' + err);
                });
        } else {
            addLog('MediaDevices API is NOT available');
        }
    </script>
</body>
</html>`;
    
    const filePath = path.join(process.cwd(), 'media-test.html');
    
    fs.writeFile(filePath, htmlContent, (err) => {
      if (err) {
        console.log('Error creating test page:', err);
      } else {
        console.log(`Test page created at: ${filePath}`);
        console.log('Open this file in your browser to test camera and microphone access.');
      }
      resolve();
    });
  });
};

// Generate recommendations
const generateRecommendations = () => {
  console.log('\n=== Recommendations ===');
  console.log('1. Check browser permissions:');
  console.log('   - In Chrome: chrome://settings/content/camera and chrome://settings/content/microphone');
  console.log('   - In Edge: edge://settings/content/camera and edge://settings/content/microphone');
  console.log('   - In Firefox: about:preferences#privacy (Permissions section)');
  
  console.log('\n2. Check system permissions:');
  if (platform === 'win32') {
    console.log('   - Windows: Settings > Privacy > Camera/Microphone');
  } else if (platform === 'darwin') {
    console.log('   - macOS: System Preferences > Security & Privacy > Privacy > Camera/Microphone');
  } else {
    console.log('   - Linux: Check your distribution-specific settings');
  }
  
  console.log('\n3. Try these troubleshooting steps:');
  console.log('   - Restart your browser');
  console.log('   - Try a different browser');
  console.log('   - Check if camera is being used by another application');
  console.log('   - Update browser to the latest version');
  console.log('   - Update camera/audio drivers');
  console.log('   - Try connecting an external webcam/microphone');
  
  console.log('\n4. For WebRTC specific issues:');
  console.log('   - Check if the signaling server is running (port 3001)');
  console.log('   - Ensure your network allows WebRTC connections');
  console.log('   - Try disabling any VPN or proxy services');
  console.log('   - Check browser console for specific error messages');
};

// Run all checks
async function runDiagnostics() {
  await checkBrowsers();
  await checkMediaDevices();
  await checkBrowserPermissions();
  await checkPorts();
  await generateTestPage();
  generateRecommendations();
  
  console.log('\n=== Diagnostic Complete ===');
  console.log('If you continue to experience issues, please provide this diagnostic output');
  console.log('along with any error messages you see in the browser console.');
}

runDiagnostics().catch(console.error);