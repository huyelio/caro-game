# 🚀 DEPLOYMENT GUIDE - Caro Game Platform

Hướng dẫn chi tiết deploy ứng dụng Caro Game lên production.

---

## 📋 CHUẨN BỊ

### Yêu cầu

- Node.js ≥ 18.x
- PostgreSQL ≥ 13.x
- Git

### Environment Variables

Tạo file `.env` với các biến sau:

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=caro_game
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d

# Client URL
CLIENT_URL=https://your-frontend-url.com
```

---

## 🎯 OPTION 1: RENDER (RECOMMENDED - FREE TIER)

### Bước 1: Setup Database (PostgreSQL)

1. Truy cập [Render.com](https://render.com)
2. Tạo **PostgreSQL** database mới:
   - Name: `caro-db`
   - Plan: Free (hoặc paid)
3. Lưu lại **Internal Database URL** và **External Database URL**

### Bước 2: Deploy Backend

1. Push code lên GitHub
2. Tạo **Web Service** mới trên Render:

   - **Name**: `caro-backend`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: `/`

3. Thêm Environment Variables:

   ```
   PORT=3001
   NODE_ENV=production
   DB_HOST=<your-render-db-host>
   DB_PORT=5432
   DB_NAME=caro_game
   DB_USER=<your-db-user>
   DB_PASSWORD=<your-db-password>
   JWT_SECRET=<your-secret-key>
   CLIENT_URL=https://your-frontend.onrender.com
   ```

4. Deploy và chờ build hoàn tất

### Bước 3: Setup Database Schema

1. Kết nối vào database qua **PSQL Console** trên Render
2. Chạy SQL script từ `server/src/database/schema.sql`

Hoặc dùng command:

```bash
# Local connection
psql -h <db-host> -U <db-user> -d caro_game -f server/src/database/schema.sql
```

### Bước 4: Deploy Frontend

1. Build React app locally:

   ```bash
   cd client
   npm install
   npm run build
   ```

2. Tạo **Static Site** mới trên Render:

   - **Name**: `caro-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`

3. Thêm Environment Variable:

   ```
   REACT_APP_API_URL=https://caro-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://caro-backend.onrender.com
   ```

4. Deploy!

---

## 🎯 OPTION 2: VERCEL + SUPABASE

### Bước 1: Setup Database (Supabase)

1. Truy cập [Supabase.com](https://supabase.com)
2. Tạo project mới
3. Vào **SQL Editor** và chạy script `server/src/database/schema.sql`
4. Lưu lại **Connection String** từ Settings → Database

### Bước 2: Deploy Backend (Vercel)

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Tạo file `vercel.json` trong thư mục `server/`:

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. Deploy:

   ```bash
   cd server
   vercel --prod
   ```

4. Thêm environment variables trên Vercel Dashboard

### Bước 3: Deploy Frontend (Vercel)

1. Deploy frontend:

   ```bash
   cd client
   vercel --prod
   ```

2. Thêm environment variables:
   - `REACT_APP_API_URL`
   - `REACT_APP_SOCKET_URL`

---

## 🎯 OPTION 3: HEROKU

### Bước 1: Install Heroku CLI

```bash
npm install -g heroku
heroku login
```

### Bước 2: Create Heroku App

```bash
heroku create caro-game-app
heroku addons:create heroku-postgresql:hobby-dev
```

### Bước 3: Setup Database

```bash
# Get database credentials
heroku pg:credentials:url

# Connect and run schema
heroku pg:psql < server/src/database/schema.sql
```

### Bước 4: Configure Environment

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key
heroku config:set CLIENT_URL=https://caro-game-app.herokuapp.com
```

### Bước 5: Deploy

```bash
git push heroku main
```

---

## 🎯 OPTION 4: VPS (DigitalOcean/AWS/Linode)

### Bước 1: Setup Server

```bash
# SSH into server
ssh root@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 (Process Manager)
npm install -g pm2
```

### Bước 2: Setup Database

```bash
sudo -u postgres psql

CREATE DATABASE caro_game;
CREATE USER caro_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE caro_game TO caro_user;
\q

# Run schema
psql -U caro_user -d caro_game -f /path/to/schema.sql
```

### Bước 3: Deploy Application

```bash
# Clone repository
git clone https://github.com/your-repo/caro-game.git
cd caro-game

# Install dependencies
npm run install:all

# Build client
cd client
npm run build
cd ..

# Create .env file
nano server/.env
# (Add all environment variables)

# Start with PM2
pm2 start server/src/index.js --name caro-server
pm2 startup
pm2 save
```

### Bước 4: Setup Nginx (Reverse Proxy)

```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/caro-game
```

Nội dung file:

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # Serve React app
    location / {
        root /path/to/caro-game/client/build;
        try_files $uri /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/caro-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Bước 5: Setup SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

---

## 🔧 POST-DEPLOYMENT CHECKLIST

- [ ] Database schema đã được tạo
- [ ] Environment variables đã được set đúng
- [ ] CORS đã được cấu hình cho domain production
- [ ] SSL/HTTPS đã được enable
- [ ] Socket.IO connection hoạt động
- [ ] API endpoints trả về đúng
- [ ] User registration/login hoạt động
- [ ] Game matchmaking hoạt động
- [ ] Bot AI hoạt động
- [ ] Stats được lưu vào database

---

## 🐛 TROUBLESHOOTING

### Socket.IO không kết nối được

**Nguyên nhân**: CORS hoặc WebSocket transport

**Giải pháp**:

```javascript
// server/src/index.js
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});
```

### Database connection failed

**Kiểm tra**:

1. Database credentials đúng chưa
2. Database có allow external connections không
3. Firewall có block port 5432 không

### Build failed on Render/Vercel

**Kiểm tra**:

1. `package.json` có đầy đủ dependencies
2. Node version phù hợp (≥18.x)
3. Build commands đúng

---

## 📊 MONITORING

### PM2 (for VPS)

```bash
pm2 list              # List all processes
pm2 logs caro-server  # View logs
pm2 restart caro-server
pm2 stop caro-server
```

### Heroku

```bash
heroku logs --tail
heroku ps
heroku restart
```

### Render

- Xem logs trực tiếp trên Dashboard
- Auto-restart on crash
- Health checks included

---

## 🎉 KẾT LUẬN

Sau khi deploy thành công, ứng dụng của bạn sẽ:

- ✅ Chạy trên production server
- ✅ Có SSL/HTTPS
- ✅ Database persistent
- ✅ Real-time game hoạt động
- ✅ Authentication hoạt động
- ✅ Scalable & maintainable

**Chúc mừng! Bạn đã deploy thành công! 🚀**

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, check:

1. Server logs
2. Browser console
3. Network tab (DevTools)
4. Database connection

**Happy Deploying! 🎮✨**
