package handlers

import (
	"net/http"
	"reimbursement-backend/internal/app/models"
	"reimbursement-backend/internal/app/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"time"
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
		ApprovedAt:  time.Now(),
		ApprovedID:  nil,
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
	responseDTOs := make([]models.ReimbursementResponse, 0, len(reimbursements))

	// Iterasi setiap data dari database untuk ditransformasi ke format DTO
	for _, r := range reimbursements {

		// Bagian untuk memproses 'Approvals' (nested object)
		approvalDTOs := make([]models.ApprovalResponse, 0, len(r.Approvals))
		for _, a := range r.Approvals {
			var approverName string
			// SOLUSI UNTUK ERROR 'a.Approver != nil':
			// Cek apakah ID Approver bukan zero value. Ini cara yang benar
			// untuk struct non-pointer.
			if a.Approver.ID != uuid.Nil {
				approverName = a.Approver.Name
			}

			// Buat DTO untuk setiap approval
			approvalDTO := models.ApprovalResponse{
				ID:        a.ID,
				// SOLUSI UNTUK ERROR 'cannot use a.Status':
				// Lakukan konversi tipe eksplisit ke string.
				Status:    string(a.Status),
				CreatedAt: a.CreatedAt,
				Approver:  approverName,
				// SOLUSI UNTUK ERROR 'a.Notes undefined':
				// Saya akan mengasumsikan tidak ada field 'Notes' untuk saat ini.
				// Jika ada, tambahkan di sini (misal: Notes: a.Comment)
			}
			approvalDTOs = append(approvalDTOs, approvalDTO)
		}

		var userName string
		// SOLUSI UNTUK ERROR 'r.User != nil':
		// Cek apakah ID User bukan zero value.
		if r.User.ID != uuid.Nil {
			userName = r.User.Name
		}

		// Buat DTO utama untuk reimbursement
		dto := models.ReimbursementResponse{
			ID:          r.ID,
			Description: r.Description,
			Amount:      r.Amount,
		
			Status:      string(r.Status),
			CreatedAt:   r.CreatedAt,
			User:        userName,
			Approvals:   approvalDTOs,
		}
		responseDTOs = append(responseDTOs, dto)
	}

	// Kirim hasil akhir yang sudah diformat
	c.JSON(http.StatusOK, responseDTOs)
	// c.JSON(http.StatusOK, gin.H{"reimbursements": reimbursements})
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

