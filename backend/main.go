package main

import (
	"log"
	"net/http"
	"os"

	"reimbursement-backend/internal/config"
	"reimbursement-backend/internal/database"
	"reimbursement-backend/internal/router"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Setup router terlebih dahulu
	r := router.Setup(db)

	// Tambahkan middleware CORS
	allowedOrigins := []string{
		"http://localhost:81",
		"http://127.0.0.1:81",
		"http://localhost:8000",
	}
	r.Use(router.NewCORSMiddleware(allowedOrigins))

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Get port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8585"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe("0.0.0.0:"+port, r); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}