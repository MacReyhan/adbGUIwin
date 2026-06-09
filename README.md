# 📁 `README.md`

```markdown
<div align="center">

# 📱 ADB Manager

### A modern, lightweight Windows GUI for ADB & scrcpy

[![Release](https://img.shields.io/github/v/release/MacReyhan/adbGUIwin?style=flat-square&color=blue)](https://github.com/MacReyhan/adbGUIwin/releases)
[![License](https://img.shields.io/github/license/MacReyhan/adbGUIwin?style=flat-square&color=green)](LICENSE)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri-24C8DB?style=flat-square&logo=tauri)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Fluent UI](https://img.shields.io/badge/Fluent%20UI-Microsoft-0078D4?style=flat-square&logo=microsoft)](https://react.fluentui.dev/)

**Control your Android devices effortlessly — no command line required.**

[Download](#-download) • [Features](#-features) • [Screenshots](#-screenshots) • [Build from Source](#-build-from-source) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🔌 Device Management
- 📋 Auto-detect connected ADB devices
- 🔄 Switch between multiple devices easily
- ♻️ One-click ADB server restart

### 🖥️ Screen Resolution (DPI)
- 🎚️ Preset DPI values (320 → 560)
- ✏️ Custom DPI input
- 🔁 Reset to device default
- 👁️ Live current DPI display

### 📲 APK Installer
- 📂 File picker — no drag-and-drop needed
- ⚡ Quick install to selected device
- 📊 Real-time install feedback

### 🎮 Scrcpy Screen Mirroring
Full settings panel with:
- 📐 Max resolution (1024 → 2560)
- 🎬 Video codec (h264 / h265 / av1)
- 📊 Bitrate control (2M → 32M)
- 🎯 FPS selection (30 → 120)
- 🌙 Stay awake / Screen off / Always on top
- 🔇 No audio mode
- 🖼️ Fullscreen launch

### 🔄 Reboot Menu
- 🟢 Normal reboot
- 🛠️ Recovery mode
- ⚙️ Bootloader
- 🚀 Fastboot

### 🛠️ Smart Binary Management
- 🔍 Auto-detects system ADB & scrcpy
- 📥 One-click download to `C:\Android\`
- 📁 Manual path selection
- ✅ Uses native system binaries for maximum speed

---

## 📥 Download

### Latest Release
👉 [**Download Latest Version**](https://github.com/MacReyhan/adbGUIwin/releases/latest)

Available formats:
- 🟢 **`.msi`** — Windows MSI installer (recommended)
- 🟢 **`.exe`** — NSIS setup installer

### System Requirements
- 🖥️ Windows 10 or 11 (64-bit)
- 📱 USB debugging enabled on Android device
- 🔌 USB cable or wireless ADB connection

---

## 🚀 Quick Start

1. **Install the app** using the MSI or EXE installer
2. **Connect your Android device** via USB (with USB debugging enabled)
3. **First launch:** If ADB isn't installed, click **Settings → Download ADB** to auto-install to `C:\Android\`
4. **Done!** Your device appears in the dropdown automatically

---

## 📸 Screenshots

> _Add your app screenshots here_

```
[Main Interface]
[Scrcpy Settings Panel]
[Settings / Path Configuration]
```

---

## 🏗️ Build from Source

### Prerequisites
- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://rustup.rs/) (stable)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with **Desktop development with C++**

### Setup

```bash
# Clone the repo
git clone https://github.com/MacReyhan/adbGUIwin.git
cd adbGUIwin

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

Built files will be in `src-tauri/target/release/bundle/`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🦀 Backend | [Tauri 2](https://tauri.app/) + [Rust](https://www.rust-lang.org/) |
| ⚛️ Frontend | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| 🎨 UI Library | [Fluent UI](https://react.fluentui.dev/) (Microsoft) |
| ⚡ Bundler | [Vite](https://vitejs.dev/) |
| 📦 Package Manager | [pnpm](https://pnpm.io/) |
| 🤖 CI/CD | [GitHub Actions](https://github.com/features/actions) |

---

## 🤝 Contributing

Contributions, issues, and feature requests are **highly welcomed**! 🎉

### 💡 Have an Idea?
Open a [Feature Request Issue](https://github.com/MacReyhan/adbGUIwin/issues/new?template=feature_request.md) and describe what you'd like to see.

### 🐛 Found a Bug?
Report it via [Bug Report Issue](https://github.com/MacReyhan/adbGUIwin/issues/new?template=bug_report.md).

### 🍴 Want to Contribute Code?

1. **Fork** the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

All PRs are welcome — from typo fixes to major features! 💪

### ⭐ Show Your Support
If this project helps you, please consider giving it a **star** ⭐ — it really helps!

---

## 📋 Roadmap

Planned features for future releases:

- [ ] 🌐 Wireless ADB connect (IP + port)
- [ ] 📊 Live logcat viewer panel
- [ ] 📸 Screenshot button
- [ ] 🎮 Scrcpy preset profiles (Gaming / Streaming / Low Latency)
- [ ] 🔋 Device info panel (model, Android version, battery)
- [ ] 💾 Save settings between sessions
- [ ] 🌓 Light/Dark theme toggle
- [ ] 🪟 Windows 11 Mica/Acrylic effects
- [ ] 🔄 Auto-updater
- [ ] 🌍 Multi-language support

Want any of these prioritized? **Open an issue!**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- 🤖 **Built with [Arena.ai](https://arena.ai/)** using the **Claude** model
- 🛠️ [ADB / Platform Tools](https://developer.android.com/tools/adb) by Google
- 📱 [scrcpy](https://github.com/Genymobile/scrcpy) by Genymobile
- 🎨 [Fluent UI](https://react.fluentui.dev/) by Microsoft
- 🦀 [Tauri](https://tauri.app/) framework

---

## 📬 Connect

- 💬 [GitHub Issues](https://github.com/MacReyhan/adbGUIwin/issues) — bugs & features
- 🍴 [Pull Requests](https://github.com/MacReyhan/adbGUIwin/pulls) — contributions
- ⭐ [Star this repo](https://github.com/MacReyhan/adbGUIwin) — show support

---

<div align="center">

**Made with ❤️ using [Arena.ai](https://arena.ai/) + Claude**

[⬆ Back to top](#-adb-manager)

</div>
```