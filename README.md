<div align="center">

<img src="./icons/icon128.png" alt="TikTok Pro Tools logo" width="96" height="96">

# TikTok Pro Tools

**Supercharge your TikTok web experience with playback controls, advanced audio tools, cleaner viewing, TikTok Shop utilities, and media downloads.**

[![Install on Chrome Web Store](https://img.shields.io/badge/Install-Chrome%20Web%20Store-4285F4?style=for-the-badge\&logo=googlechrome\&logoColor=white)](https://chromewebstore.google.com/detail/tiktok-pro-tools/kpamdlioiocdedfbjmmicgbcdmebpkli)
[![Install on Firefox Add-ons](https://img.shields.io/badge/Install-Firefox%20Add--ons-FF7139?style=for-the-badge\&logo=firefoxbrowser\&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/tiktok-pro-tools-official/)

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/kpamdlioiocdedfbjmmicgbcdmebpkli?label=Chrome%20version\&style=flat-square\&logo=googlechrome)](https://chromewebstore.google.com/detail/tiktok-pro-tools/kpamdlioiocdedfbjmmicgbcdmebpkli)
[![Firefox Add-on](https://img.shields.io/amo/v/tiktok-pro-tools-official?label=Firefox%20version\&style=flat-square\&logo=firefoxbrowser)](https://addons.mozilla.org/en-US/firefox/addon/tiktok-pro-tools-official/)
[![GitHub Stars](https://img.shields.io/github/stars/diepvantien/Tiktok-Pro-Tools?style=flat-square\&logo=github)](https://github.com/diepvantien/Tiktok-Pro-Tools/stargazers)

**Officially available for Google Chrome and Mozilla Firefox.**
No manual installation is required for regular users.

</div>

<p align="center">
  <img src="./assets/tiktok-pro-tools-banner.webp" alt="TikTok Pro Tools - extension features and official installation options" width="900">
</p>

---

## 📥 Install TikTok Pro Tools

Install the extension directly from your browser's official add-on store:

| Browser             | Official installation link                                                                                                  |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------- |
| **Google Chrome**   | [Install from Chrome Web Store](https://chromewebstore.google.com/detail/tiktok-pro-tools/kpamdlioiocdedfbjmmicgbcdmebpkli) |
| **Mozilla Firefox** | [Install from Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tiktok-pro-tools-official/)                   |

### Get Started

1. Install TikTok Pro Tools from one of the official store links above.
2. Open [TikTok.com](https://www.tiktok.com/).
3. Pin the extension icon to your browser toolbar for quick access.
4. Click the **TikTok Pro Tools** icon and enable the features you want.
5. Refresh your TikTok tab once if a newly enabled feature does not apply immediately.

> **Tip:** Install from an official store to automatically receive the newest stable updates.

---

## ✨ Features

### 🎬 Playback Control

| Feature                     | Description                                                                               |
| :-------------------------- | :---------------------------------------------------------------------------------------- |
| **Background Play**         | Keep TikTok videos playing when you switch tabs or minimize the browser.                  |
| **Smart Auto-Pause**        | Pause TikTok automatically when another tab starts playing audio, then resume afterwards. |
| **Auto Picture-in-Picture** | Continue watching in a floating mini-player when you leave the TikTok tab.                |
| **Playback Speed Control**  | Fine-tune video speed from **0.25× to 4×**.                                               |

### 🎧 Audio Enhancement

| Feature                  | Description                                                                             |
| :----------------------- | :-------------------------------------------------------------------------------------- |
| **Advanced Equalizer**   | Customize audio with presets such as Bass Boost, Vocal, Pop, Rock, Classical, and more. |
| **360° Audio / 8D Mode** | Add an immersive rotating spatial audio effect.                                         |
| **Volume Normalizer**    | Balance loud and quiet videos for more consistent listening.                            |

### 🧹 Cleaner Viewing & Content Control

| Feature                      | Description                                                                  |
| :--------------------------- | :--------------------------------------------------------------------------- |
| **Clean Mode**               | Reduce overlays and interface distractions for a cleaner viewing experience. |
| **Keyword Video Filtering**  | Automatically skip videos containing selected terms.                         |
| **Comment Blur by Keywords** | Hide unwanted comments based on your keyword rules.                          |
| **Watch-Time Statistics**    | Track your time spent on TikTok locally in your browser.                     |

### 🛍️ TikTok Shop Utilities

| Feature                      | Description                                                                                 |
| :--------------------------- | :------------------------------------------------------------------------------------------ |
| **Shop Video Compatibility** | Improve access to supported TikTok Shop video content.                                      |
| **Product Viewer**           | View available product details such as image, price, seller, description, and product link. |

### 📥 Media Downloads

| Feature                     | Description                                                            |
| :-------------------------- | :--------------------------------------------------------------------- |
| **Video Download**          | Download supported TikTok videos through the extension interface.      |
| **MP3 Audio Extraction**    | Save audio from supported TikTok videos as MP3.                        |
| **Photo Carousel Download** | Download images from supported photo carousel posts.                   |
| **Paste-a-Link Download**   | Paste a TikTok URL in the extension popup to retrieve available media. |

---

## 🔐 Privacy First

TikTok Pro Tools is designed with privacy in mind:

* No analytics tracking.
* No background telemetry.
* Settings, keywords, equalizer preferences, and watch-time statistics are stored locally in your browser.
* Requests to `tikwm.com` are made only when you explicitly use a media download feature.
* TikTok product or video page requests are made only when related product-viewing features are enabled.

Read the full policy: **[Privacy Policy](./PRIVACY_POLICY.md)**

---

## 🔑 Permissions Explained

| Permission / Access      | Why It Is Needed                                                                    |
| :----------------------- | :---------------------------------------------------------------------------------- |
| `storage`                | Save preferences, equalizer settings, keywords, and local statistics.               |
| TikTok site access       | Apply playback, interface, filtering, and product-viewing features on TikTok pages. |
| `tabs` / audio awareness | Support smart auto-pause when another tab begins playing media.                     |
| `downloads`              | Save selected videos, audio, or images through your browser's download flow.        |
| `alarms`                 | Support lightweight background functionality such as time tracking.                 |
| `declarativeNetRequest`  | Support compatible TikTok Shop product-page handling where needed.                  |
| `tikwm.com` access       | Retrieve supported media download links only after you request a download.          |

---

## 🧩 Development Installation

Regular users should install TikTok Pro Tools from the official browser stores.
The instructions below are intended only for local testing, development, or source-code review.

### Chrome / Chromium-Based Browsers

1. Clone this repository:

   ```bash
   git clone https://github.com/diepvantien/Tiktok-Pro-Tools.git
   cd Tiktok-Pro-Tools
   ```

2. Open your browser's extension management page:

   ```text
   chrome://extensions/
   ```

3. Enable **Developer mode**.

4. Click **Load unpacked**.

5. Select the cloned `Tiktok-Pro-Tools` directory.

6. Open TikTok and test the extension.

> For regular Firefox usage, install the official release from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tiktok-pro-tools-official/).

---

## 🐞 Issues & Feature Requests

Found a bug or have an idea for improvement?

[![Report an Issue](https://img.shields.io/badge/Report-an%20Issue-181717?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/diepvantien/Tiktok-Pro-Tools/issues/new)

When reporting a problem, please include:

* Browser name and version.
* Extension version.
* Clear steps to reproduce the issue.
* Screenshots or screen recordings, when useful.

---

## ☕ Donate & Support the Project

TikTok Pro Tools is developed and maintained by **Diep Van Tien**.

If this extension is useful to you, your donation helps maintain the project and develop new features.

<p align="center">
  <a href="https://buymeacoffee.com/tixuno">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee">
  </a>
  <a href="https://me.momo.vn/OeIGiJsViJfDfntmiRId">
    <img src="https://img.shields.io/badge/Donate-MoMo-AE2070?style=for-the-badge&logoColor=white" alt="Donate via MoMo">
  </a>
</p>

| Support Method        | Link                                                                    |
| :-------------------- | :---------------------------------------------------------------------- |
| ☕ **Buy Me a Coffee** | [buymeacoffee.com/tixuno](https://buymeacoffee.com/tixuno)              |
| 💗 **MoMo**           | [Donate via MoMo](https://me.momo.vn/OeIGiJsViJfDfntmiRId)              |
| ⭐ **GitHub Star**     | [Star this repository](https://github.com/diepvantien/Tiktok-Pro-Tools) |
| ✉️ **Contact**        | [dieptien290620@gmail.com](mailto:dieptien290620@gmail.com)             |

Other ways to support:

* Give this repository a ⭐ star.
* Share the official Chrome and Firefox installation links.
* Leave a positive review on your browser's extension store.
* Report bugs and suggest features.

> Thank you for supporting independent development! ❤️

---

## ⭐ Star History

<a href="https://star-history.com/#diepvantien/Tiktok-Pro-Tools&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=diepvantien/Tiktok-Pro-Tools&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=diepvantien/Tiktok-Pro-Tools&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=diepvantien/Tiktok-Pro-Tools&type=Date" />
  </picture>
</a>

---

## 📄 License

This source code is available for **non-commercial use** under the terms in the [LICENSE](./LICENSE) file.

**Commercial use requires a separate license.** Please contact the author for commercial licensing details.

---

## 🔗 Official Links

| Resource          | Link                                                                                                                    |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------- |
| Chrome Web Store  | [Install for Google Chrome](https://chromewebstore.google.com/detail/tiktok-pro-tools/kpamdlioiocdedfbjmmicgbcdmebpkli) |
| Firefox Add-ons   | [Install for Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/tiktok-pro-tools-official/)                |
| GitHub Repository | [Source code and issues](https://github.com/diepvantien/Tiktok-Pro-Tools)                                               |
| Privacy Policy    | [Read the privacy policy](./PRIVACY_POLICY.md)                                                                          |
| Buy Me a Coffee   | [Support via Buy Me a Coffee](https://buymeacoffee.com/tixuno)                                                          |
| MoMo              | [Donate via MoMo](https://me.momo.vn/OeIGiJsViJfDfntmiRId)                                                              |
| Contact           | [dieptien290620@gmail.com](mailto:dieptien290620@gmail.com)                                                             |

---

<div align="center">

Made with ❤️ for TikTok power users by **Diep Van Tien**

[Install for Chrome](https://chromewebstore.google.com/detail/tiktok-pro-tools/kpamdlioiocdedfbjmmicgbcdmebpkli) ·
[Install for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tiktok-pro-tools-official/) ·
[Buy Me a Coffee](https://buymeacoffee.com/tixuno) ·
[Donate via MoMo](https://me.momo.vn/OeIGiJsViJfDfntmiRId) ·
[Report an Issue](https://github.com/diepvantien/Tiktok-Pro-Tools/issues)

</div>
