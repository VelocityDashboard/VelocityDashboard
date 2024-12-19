## VelocityDashboard Documentation (NOTE: This is the V1 so don't expect there not to be bugs!)

VelocityDashboard simplifies game server management, especially for Pterodactyl Panel. This documentation covers setup and usage of VelocityDashboard V1, focusing on user registration and login.

### Table of Contents

1.  Installation
2.  Configuration
3.  Usage
    *   Registration
    *   Login
    *   Dashboard
4.  Nginx Configuration
5.  Systemd Service
6.  Features (V1)
7.  Troubleshooting
8.  Future Development

### 1. Installation

1.  Prerequisites:
    *   Node.js (LTS recommended)
    *   npm (or yarn or pnpm)
    *   Pterodactyl Panel instance
    *   Nginx (if using a domain/subdomain)

2.  Install to `/var/www/VelocityDashboard/`:

    ```bash
    sudo mkdir -p /var/www/VelocityDashboard
    cd /var/www/VelocityDashboard
    sudo curl -L https://github.com/user-attachments/files/18199227/VelocityDashboard.zip
    sudo unzip VelocityDashboard.zip
    sudo rm VelocityDashboard.zip
    sudo chown -R $USER:$USER /var/www/VelocityDashboard # Give current user ownership
    cd /var/www/VelocityDashboard/VelocityDashboard-main
    npm install
    ```

3.  Database: The `users.db` file is created automatically on first run.

### 2. Configuration

1.  `.env` File: Config `.env` in `/var/www/VelocityDashboard/`:

    ```
    PANEL_URL=YOUR_PTERODACTYL_PANEL_URL
    API_KEY=YOUR_PTERODACTYL_API_KEY
    PORT=YOUR_PORT_FOR_THE_DASHBOARD_TO_BE_HOSTED_ON
    SESSION_SECRET=RANDOM_SESSION_SECRET
    ```

    **Important:** Never expose your API key client-side.

### 3. Systemd Service

Create `/etc/systemd/system/velocitydashboard.service`:

```ini
[Unit]
Description=VelocityDashboard
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/VelocityDashboard/VelocityDashboard-main
ExecStart=/usr/bin/node VelocityDashboard.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:

```
sudo systemctl daemon-reload
sudo systemctl enable velocitydashboard
sudo systemctl start velocitydashboard
sudo systemctl status velocitydashboard
```

### 4. Features (V1)

*   User Registration (with Pterodactyl Panel integration)
*   User Login
*   Secure API Interaction (server-side)
*   SQLite3 Database Integration
*   Added middleware auth.js
*   Improved UI
*   More stable and faster

### 5. Troubleshooting

*   "Cannot find module 'sqlite3'": Reinstall `sqlite3`. Check `node_modules`.
*   Other Errors: Check the server console (`sudo journalctl -u velocitydashboard`).
*   API Errors: Verify `PANEL_URL` and `API_KEY`. Check API key permissions.

### 7. Future Development

*   Server management
*   Resource monitoring
*   In-dashboard user management
*   UI/UX improvements
