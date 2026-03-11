<div align="center">
  <img src="https://raw.githubusercontent.com/ashhadahmd/MarkD./main/assets/images/adaptive-icon.png" width="128" />
  <h1>MarkD.</h1>
  <p><strong>The premium, high-performance attendance & academic tracker for SSUET.</strong></p>
  
  [![Version](https://img.shields.io/github/v/release/ashhadahmd/MarkD.?label=Latest%20Release&color=147A5C)](https://github.com/ashhadahmd/MarkD./releases)
  [![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-blue.svg)](https://github.com/ashhadahmd/MarkD.)
</div>

---

## ⚡ Overview

**MarkD.** is a third-party student companion app engineered to solve the usability and performance issues of the official SSUET Student Portal. Built entirely from the ground up by a fellow student, it provides a lightning-fast, caching-enabled, and visually stunning interface for tracking attendance, lecture logs, and profile statistics without the friction of the web portal.

> **Note:** This app is neither affiliated with nor officially endorsed by Sir Syed University of Engineering and Technology (SSUET). It serves purely as a quality-of-life upgrade for the SSUET student community.

## ✨ Features

- 📊 **Smart Dashboard**: Instantly view your overall attendance percentage, total classes, and absent/present counts the moment you open the app.
- 🕒 **Active Session Support**: Seamlessly browse without getting logged out. If your web session expires, MarkD silently renews it in the background using your stored credentials.
- 🧾 **Detailed Lecture Logs**: Never guess when you missed a class. View a comprehensive, day-by-day log of every lecture for every subject.
- 🎓 **Academic & Financial Summary**: Keep your CGPA and current outstanding portal balance pinned right to your home screen.
- 🔒 **Privacy-First Architecture**: Your credentials and portal data never touch a third-party server. All data rendering and secure scraping happens completely on-device.
- 🔄 **Over-The-Air Version Checks**: Built-in GitHub API checks ensure you are never running an outdated or incompatible build.

## 🛠️ Technology Stack

MarkD. relies on modern, cross-platform technologies to deliver a near-native experience:

- **Framework**: React Native with Expo & Expo Router
- **State Management**: Zustand (Persisted locally)
- **Styling Engine**: NativeWind (Tailwind CSS for React Native)
- **Scraping Layer**: Axios, React Native Cheerio, Tough Cookie
- **Animations**: React Native Reanimated

## 🚀 Getting Started

If you want to contribute, audit the code, or build it yourself:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Expo Go app on your physical device (or an Android/iOS emulator)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashhadahmd/MarkD.git
   cd MarkD.
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the bundler**
   ```bash
   npx expo start
   ```

4. **Launch**
   - Scan the QR code shown in the terminal using the Expo Go app.

## 📥 Download

The latest `.apk` for Android can always be found on the [Releases](https://github.com/ashhadahmd/MarkD./releases) page. The app will automatically notify you when a new release is published.

## 🤝 Support & Engineering

Found a bug or want to request a feature?
- **Bug Tracker**: Open an issue on this [GitHub Repository](https://github.com/ashhadahmd/MarkD./issues).
- **Direct Mail**: Reach out to `2023f-bcs-023@ssuet.edu.pk` with the subject "MarkD. Support Request".

---
<div align="center">
  <p><em>Engineered for the students, by a student.</em></p>
</div>
