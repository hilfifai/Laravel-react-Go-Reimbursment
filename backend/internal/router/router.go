package router

import (
	"reimbursement-backend/internal/app/handlers"
	"reimbursement-backend/internal/app/repositories"
	"reimbursement-backend/internal/app/services"
	"reimbursement-backend/internal/config"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	// Load config
	cfg := config.Load()

	// Add CORS middleware
	r.Use(CORSMiddleware())

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	reimbursementRepo := repositories.NewReimbursementRepository(db)
	approvalRepo := repositories.NewApprovalRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret)
	reimbursementService := services.NewReimbursementService(reimbursementRepo, approvalRepo)
	userService := services.NewUserService(userRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	reimbursementHandler := handlers.NewReimbursementHandler(reimbursementService)
	userHandler := handlers.NewUserHandler(userService)

	// Public routes
	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
		}
	}

	// Protected routes
	protected := api.Group("/")
	protected.Use(AuthMiddleware(cfg.JWTSecret))
	{
		// Employee routes
		reimbursements := protected.Group("/reimbursements")
		{
			reimbursements.POST("", reimbursementHandler.CreateReimbursement)
			reimbursements.GET("", reimbursementHandler.GetMyReimbursements)
			reimbursements.GET("/:id", reimbursementHandler.GetReimbursementByID)
		}

		// Manager routes
		manager := protected.Group("/")
		manager.Use(RoleMiddleware("manager", "admin"))
		{
			manager.GET("/reimbursements/pending", reimbursementHandler.GetPendingReimbursements)
			manager.PUT("/reimbursements/:id/approve", reimbursementHandler.ApproveReimbursement)
			manager.PUT("/reimbursements/:id/reject", reimbursementHandler.RejectReimbursement)
		}

		// Admin routes
		admin := protected.Group("/")
		admin.Use(RoleMiddleware("admin"))
		{
			admin.GET("/reimbursements/all", reimbursementHandler.GetAllReimbursements)
			
			users := admin.Group("/users")
			{
				users.GET("", userHandler.GetAllUsers)
				users.GET("/:id", userHandler.GetUserByID)
				users.POST("", userHandler.CreateUser)
				users.PUT("/:id", userHandler.UpdateUser)
				users.DELETE("/:id", userHandler.DeleteUser)
			}
		}
	}

	return r
}

