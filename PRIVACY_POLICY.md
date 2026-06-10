# Privacy Policy for TikTok Pro Tools

**Effective Date:** April 18, 2026

## Introduction
TikTok Pro Tools ("we", "our", or "us") respects your privacy. This Privacy Policy explains how our Browser Extension collects, uses, and protects your information.

## Data Collection and Usage
TikTok Pro Tools is designed to function entirely within your local browser. It does not collect, record, or transmit any personally identifiable information, browsing history, or user behavior to external servers, with the following single exception:

**Video Downloading:** When you explicitly use the "Download" feature within the extension to download a TikTok video, the extension sends the video URL to our third-party API provider (`tikwm.com`) solely for the purpose of retrieving the download links for the video and audio streams. No user data, cookies, or account information is sent during this process.

## Permissions Requested and Justifications

To provide its functionality, the extension requires specific Chrome browser permissions:

- **Host Permissions (`*://*.tiktok.com/*`)**: Required to inject scripts that control the video player (e.g., speed control, equalizer, Auto PiP, auto-pause) and customize the TikTok interface (e.g., clean mode, removing text overlays).
- **Host Permissions (`https://tikwm.com/*`)**: Required to fetch fast and watermark-free video download links when requested by the user.
- **`storage`**: Used exclusively to save your local extension settings (e.g., your preferred playback speed, EQ presets, and blocked keywords) directly on your device.
- **`downloads`**: Allows the extension to trigger the native Chrome download manager to save videos and audio directly to your hard drive.
- **`declarativeNetRequest`**: Used strictly to modify network headers to bypass region locks and unlock regional shop videos for the user locally.
- **`alarms`**: Used to perform lightweight background tasks (like calculating total watch time limits) reliably.

## Analytics and Tracking
We do **not** use Google Analytics, trackers, or any other telemetry to monitor your usage. All "statistics" displayed within the extension (such as videos watched, or watch time) are tracked and stored locally on your device and never leave your browser.

## Third-Party Services
This extension interacts with `tikwm.com` for video downloading functionality. We are not responsible for the privacy practices of third-party external services.

## Contact Us
If you have any questions or concerns about this Privacy Policy or your data, please contact the developer at:
**Email:** dieptien290620@gmail.com
