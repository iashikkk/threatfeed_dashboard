# ⚡ ThreatFeed Dashboard

A real-time **IOC (Indicators of Compromise) Monitoring Dashboard** built with **React + Vite**.  
It provides visualization, filtering, and export features for security threat data such as **IPs, Subnets, and URLs**.

---

## 🚀 Features

- 📊 **IOC Summary** with Pie Chart (IPs, Subnets, URLs)
- 📈 **IOC Trend Line Chart** with Up/Down indicators
- 🔍 **Search & Filter** (by IOC type, source, etc.)
- ⏳ **Sorting & Pagination** (Latest, Oldest, Alphabetical)
- 🌙 **Dark Mode Toggle**
- 🔄 **Auto Refresh** (every 10s)
- ⚙️ **Settings Sidebar**
- 📥 **Export Data** (CSV & JSON)
- 📌 **Trend Modal** → Click on chart points to view detailed trends (IPs, Subnets, URLs)
- 🎨 Responsive UI built with **CSS variables** for light/dark theme

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 7
- **Charts:** Recharts
- **Styling:** CSS (custom, dark mode with variables)
- **Version Control:** Git & GitHub

---

## 📂 Project Structure

threatfeed_dashboard/
│── public/
│ └── iocs.json # Sample IOC feed (data)
│── src/
│ ├── App.jsx # Main application
│ ├── index.css # Global styles
│ └── main.jsx # Entry point
│── package.json # Dependencies & scripts
│── vite.config.js # Vite configuration
└── README.md # Project info



---

## 🔧 Installation & Setup

1. Clone the repository:
   
   git clone https://github.com/iashikkk/threatfeed_dashboard.git
   cd threatfeed_dashboard
Install dependencies:

bash
npm install
Run in development mode:

bash
npm run dev
Build for production:

bash
npm run build
Preview build:

bash
npm run preview
📊 IOC Data Format
The IOC feed is stored in public/iocs.json.
Example:

json
Copy code
[
  {
    "value": "192.168.1.1",
    "type": "ip",
    "source": "ThreatIntel",
    "timestamp": "2025-09-06T10:30:00Z"
  },
  {
    "value": "malicious-site.com",
    "type": "url",
    "source": "OSINT",
    "timestamp": "2025-09-06T11:00:00Z"
  }
]
🌍 Deployment


Just connect the repo and set the build command:
npm run build
and output directory:
dist



📜 License

This project is open-source and available under the MIT License.

