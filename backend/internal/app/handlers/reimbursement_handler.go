package handlers

import (
	"net/http"
	"reimbursement-backend/internal/app/models"
	"reimbursement-backend/internal/app/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReimbursementHandler struct {
	reimbursementService services.ReimbursementService
}

func NewReimbursementHandler(reimbursementService services.ReimbursementService) *ReimbursementHandler {
	return &ReimbursementHandler{
		reimbursementService: reimbursementService,
	}
}

type CreateReimbursementRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
}

type ApprovalRequest struct {
	Comments string `json:"comments"`
}

func (h *ReimbursementHandler) CreateReimbursement(c *gin.Context) {
	var req CreateReimbursementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	reimbursement := &models.Reimbursement{
		UserID:      userID.(uuid.UUID),
		Title:       req.Title,
		Description: req.Description,
		Amount:      req.Amount,
	}

	if err := h.reimbursementService.CreateReimbursement(reimbursement); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":       "Reimbursement created successfully",
		"reimbursement": reimbursement,
	})
}

func (h *ReimbursementHandler) GetMyReimbursements(c *gin.Context) {
	userID, _ := c.Get("user_id")
	reimbursements, err := h.reimbursementService.GetReimbursementsByUser(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reimbursements": reimbursements})
}

func (h *ReimbursementHandler) GetReimbursementByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	reimbursement, err := h.reimbursementService.GetReimbursementByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reimbursement not found"})
		return
	}

	// Check if user can access this reimbursement
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")
	
	if userRole != "admin" && userRole != "manager" && reimbursement.UserID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reimbursement": reimbursement})
}

func (h *ReimbursementHandler) GetPendingReimbursements(c *gin.Context) {
	reimbursements, err := h.reimbursementService.GetPendingReimbursements()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reimbursements": reimbursements})
}

func (h *ReimbursementHandler) GetAllReimbursements(c *gin.Context) {
	reimbursements, err := h.reimbursementService.GetAllReimbursements()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reimbursements": reimbursements})
}

func (h *ReimbursementHandler) ApproveReimbursement(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var req ApprovalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	approverID, _ := c.Get("user_id")
	if err := h.reimbursementService.ApproveReimbursement(id, approverID.(uuid.UUID), req.Comments); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reimbursement approved successfully"})
}

func (h *ReimbursementHandler) RejectReimbursement(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var req ApprovalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	approverID, _ := c.Get("user_id")
	if err := h.reimbursementService.RejectReimbursement(id, approverID.(uuid.UUID), req.Comments); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reimbursement rejected successfully"})
}

