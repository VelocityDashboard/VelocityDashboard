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
    cd /var/www/
    sudo curl -L https://github.com/VelocityDashboard/VelocityDashboard/archive/refs/tags/VelocityDashboard_V_1.1.0.zip -o VelocityDashboard.zip # Replace with your ZIP URL
    sudo unzip VelocityDashboard.zip
    sudo rm VelocityDashboard.zip
    sudo chown -R $USER:$USER /var/www/VelocityDashboard # Give current user ownership
    cd /var/www/VelocityDashboard
    npm install
    ```

3.  Database: The `users.db` file is created automatically on first run.

### 2. Configuration

1.  `.env` File: Create `.env` in `/var/www/VelocityDashboard/`:

    ```
    PANEL_URL=YOUR_PTERODACTYL_PANEL_URL
    API_KEY=YOUR_PTERODACTYL_API_KEY
    PORT=YOUR_PORT_FOR_THE_DASHBOARD_TO_BE_HOSTED_ON
    SESSION_SECRET=RANDOM_SESSION_SECRET
    ```

    **Important:** Never expose your API key client-side.

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/velocitydashboard` (or add to existing config):

```nginx
server {
    listen 80;
    server_name dash.yourdomain.com;

    access_log /var/log/nginx/velocitydashboard_access.log;

    location / {
        proxy_pass http://127.0.0.1:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
    }

    location /public/ {
        root /var/www/VelocityDashboard/public/;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    error_page 404 /var/www/VelocityDashboard/public/404.html;
    error_page 500 502 503 504 /var/www/VelocityDashboard/public/500.html;
    location = /500.html {
        root /var/www/VelocityDashboard/public/;
    }
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/velocitydashboard /etc/nginx/sites-enabled/
sudo nginx -t # Test configuration
sudo systemctl restart nginx
```

### 4. Systemd Service

Create `/etc/systemd/system/velocitydashboard.service`:

```ini
[Unit]
Description=VelocityDashboard
After=network.target

[Service]
User=$USER
WorkingDirectory=/var/www/VelocityDashboard
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

### 5. Features (V1)

*   User Registration (with Pterodactyl Panel integration)
*   User Login
*   Secure API Interaction (server-side)
*   SQLite3 Database Integration

### 6. Troubleshooting

*   "Cannot find module 'sqlite3'": Reinstall `sqlite3`. Check `node_modules`.
*   Other Errors: Check the server console (`sudo journalctl -u velocitydashboard`).
*   API Errors: Verify `PANEL_URL` and `API_KEY`. Check API key permissions.
*   Nginx Errors: Check Nginx error logs (`/var/log/nginx/error.log`).

### 7. Future Development

*   Server management
*   Resource monitoring
*   In-dashboard user management
*   UI/UX improvements
