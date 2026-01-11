<div align="center">
   
# 🎬 Discord Rich Presence for MPC

**Discord Rich Presence for Media Player Classic (Home Cinema and Black Edition)**

*Show what you're watching on Discord with real-time updates!*

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey.svg)](https://www.microsoft.com/windows)

</div>

---

## ✨ Features

- 🎯 **Real-time Updates** - Updates every second for live playback progress
- 🎨 **Modern Rich Presence** - Beautiful Discord presence with emojis and progress indicators
- 📊 **Progress Tracking** - Shows playback percentage and time remaining
- 🎮 **Interactive Buttons** - Quick access to MPC Web Interface
- 🔄 **Auto-reconnect** - Automatically reconnects if Discord or MPC disconnects
- ⚙️ **Highly Configurable** - Customize filename display, time format, and more

## 🎥 Preview

![Media Player Classic Rich Presence on Discord](http://i.imgur.com/CX1nler.png)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/en/download/current/))
- **MPC-HC** or **MPC-BE** with Web Interface enabled
- **Discord Desktop App** (not the web version)

### Installation

1. **Enable MPC Web Interface**
   - Open Media Player Classic
   - Go to `View > Options > Player > Web Interface`
   - Enable `Listen on port:` (default: `13579`)
   - Click OK

   ![Enable Web Interface](https://i.imgur.com/OrhhIAS.png)

2. **Clone the Repository**
   ```bash
   git clone [https://github.com/nedelcuu/MPC-DiscordRPC.git](https://github.com/nedelcuu/MPC-DiscordRPC.git)
   cd MPC-DiscordRPC
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```
   > 💡 You can safely ignore peer and optional dependency warnings.

4. **Start the Application**
   ```bash
   npm start
   ```
   > 🎉 The app runs in the background - you can close the terminal!

5. **Stop the Application** (when needed)
   ```bash
   npm stop
   ```

## 📖 Configuration

Edit `config.js` to customize your experience:

### Available Options

| Option | Default | Description |
|--------|---------|-------------|
| `port` | `13579` | MPC Web Interface port number |
| `ignoreBrackets` | `true` | Remove `[tags]` from filenames (e.g., `[1080p]`, `[Group Name]`) |
| `ignoreFiletype` | `false` | Hide file extensions (e.g., `.mp4`, `.mkv`) |
| `replaceUnderscore` | `true` | Replace `_` with spaces in filenames |
| `replaceDots` | `true` | Replace dots with spaces (except file extension) |
| `showRemainingTime` | `false` | Show remaining time instead of elapsed time |

### Example Configuration

```javascript
exports.port = 13579
exports.ignoreBrackets = true
exports.ignoreFiletype = false
exports.replaceUnderscore = true
exports.replaceDots = true
exports.showRemainingTime = false
```

## 🔄 Updating

1. Stop the application:
   ```bash
   npm stop
   ```

2. Pull the latest changes:
   ```bash
   git pull
   ```

3. Install any new dependencies:
   ```bash
   npm install
   ```

4. Start the application:
   ```bash
   npm start
   ```

## 🛠️ How It Works

This application:
1. Connects to MPC's Web Interface (running on `localhost:13579`)
2. Fetches playback data every second
3. Parses the information (filename, position, duration, state)
4. Updates your Discord Rich Presence in real-time
5. Automatically reconnects if connections are lost

## 📋 Requirements

- **Operating System**: Windows
- **Node.js**: 18.0.0 or higher
- **MPC-HC/MPC-BE**: Latest version with Web Interface enabled
- **Discord**: Desktop application (required for Rich Presence)

## 🐛 Troubleshooting

### Discord Rich Presence Not Showing
- ✅ Make sure Discord **desktop app** is running (not web version)
- ✅ Check that MPC Web Interface is enabled
- ✅ Verify the port in `config.js` matches MPC's port
- ✅ Restart both Discord and the application

### Connection Errors
- ✅ Ensure MPC is running and Web Interface is enabled
- ✅ Check firewall settings (port `13579` should be accessible)
- ✅ Verify the port number in `config.js` is correct

### Updates Not Appearing
- ✅ Check the log file: `mpc-discordrpc.log`
- ✅ Ensure you're using the latest version
- ✅ Try restarting the application: `npm stop && npm start`

## 🤝 Contributing

We welcome contributions from the community! Whether it's a bug fix, new feature, or documentation improvement:

1. **🐛 Found a bug?** [Open an issue](https://github.com/nedelcuu/MPC-DiscordRPC/issues).
2. **💡 Have an idea?** Start a discussion or submit a feature request.
3. **🔧 Ready to code?** Fork the repo and submit a Pull Request.

## 📜 Credits & Legacy

This project is a modern revival (2025) of the original MPC-DiscordRPC.

| Role | User | Contribution |
| :--- | :--- | :--- |
| **Current Maintainer** | **[Alex Ionut](https://github.com/nedelcuu)** | Modernization, Node 18+ support, Refactoring |
| **Original Creator** | **[angeloanan](https://github.com/angeloanan)** | Original concept and core logic |
| **Contributor** | **[Der-Eddy](https://www.eddy-dev.net)** | Legacy updates |
| **Contributor** | **[Lucas Miranda](https://github.com/liddack)** | Legacy updates |
| **Contributor** | **[MaciejGorczyca](https://github.com/MaciejGorczyca)** | Legacy updates |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

- **GitHub**: [@nedelcuu](https://github.com/nedelcuu)
- **Email**: contact@alexionut.ro
- **Website**: [alexionut.ro](https://alexionut.ro)

---

<div align="center">

**Made with ❤️ for Media Player Classic users**

⭐ Star this repo if you find it useful!

</div>
