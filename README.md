# Reimbursement System

Sistem reimbursement dengan arsitektur Golang backend dan Laravel frontend SPA yang mendukung approval layering dan history transaksi.

## Arsitektur

- **Backend**: Golang dengan Gin framework
- **Frontend**: Laravel SPA dengan React
- **Database**: PostgreSQL
- **Autentikasi**: JWT (JSON Web Token)

## Fitur

### Role-based Access Control
- **Employee**: Membuat dan melihat pengajuan reimbursement sendiri
- **Manager**: Approve/reject pengajuan reimbursement
- **Admin**: Melihat semua pengajuan dan mengelola pengguna

### Modul Reimbursement
- Pengajuan reimbursement dengan amount, deskripsi, dan tanggal
- Approval layering dengan history transaksi
- Status tracking (pending, approved, rejected)
- Dashboard dengan statistik

## Instalasi dan Setup

### Prerequisites

- Go 
- PHP 8.1+
- Node.js 18+
- PostgreSQL 
- Composer

### Backend Setup

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

3. Setup database PostgreSQL dan buat database `reimbursement_db`

4. Copy dan edit file environment:
   
   
   Edit `.env` dengan konfigurasi database Anda:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/reimbursement_db?sslmode=disable
   ENVIRONMENT=development
   PORT=8080
   ```

5. Jalankan aplikasi:
   ```bash
   go run cmd/api/main.go
   ```

Backend akan berjalan di `http://localhost:8585`

### Frontend Setup

1. Masuk ke direktori frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   composer install
   npm install
   ```


Frontend akan berjalan di `http://localhost:8000`

## API Documentation

Dokumentasi lengkap API tersedia di [View Postman Documentation](https://web.postman.co/workspace/6efb56e6-e405-43e9-a4a7-44c31efa527b)

### Endpoint Utama

- `POST /api/v1/auth/register` - Registrasi pengguna
- `POST /api/v1/auth/login` - Login pengguna
- `GET /api/v1/reimbursements` - Lihat pengajuan sendiri
- `POST /api/v1/reimbursements` - Buat pengajuan baru
- `GET /api/v1/reimbursements/pending` - Lihat pending approvals 
- `PUT /api/v1/reimbursements/{id}/approve` - Approve pengajuan 
- `PUT /api/v1/reimbursements/{id}/reject` - Reject pengajuan 
- `GET /api/v1/reimbursements/all` - Lihat semua pengajuan 
- `GET /api/v1/users` - User management 


## Deployment

### Production Environment

1. Setup production database
2. Update environment variables untuk production
3. Build aplikasi:
   ```bash
   # Backend
   go build -o main cmd/api/main.go
   
   # Frontend
   npm run build
   ```

### Docker Deployment

Gunakan Docker Compose untuk deployment yang mudah:

```bash
docker-compose up -d
```
