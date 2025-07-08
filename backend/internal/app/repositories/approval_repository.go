package repositories

import (
	"reimbursement-backend/internal/app/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ApprovalRepository interface {
	Create(approval *models.Approval) error
	GetByID(id uuid.UUID) (*models.Approval, error)
	GetByReimbursementID(reimbursementID uuid.UUID) ([]models.Approval, error)
	Update(approval *models.Approval) error
	Delete(id uuid.UUID) error
}

type approvalRepository struct {
	db *gorm.DB
}

func NewApprovalRepository(db *gorm.DB) ApprovalRepository {
	return &approvalRepository{db: db}
}

func (r *approvalRepository) Create(approval *models.Approval) error {
	return r.db.Create(approval).Error
}

func (r *approvalRepository) GetByID(id uuid.UUID) (*models.Approval, error) {
	var approval models.Approval
	err := r.db.Preload("Reimbursement").Preload("Approver").Where("id = ?", id).First(&approval).Error
	if err != nil {
		return nil, err
	}
	return &approval, nil
}

func (r *approvalRepository) GetByReimbursementID(reimbursementID uuid.UUID) ([]models.Approval, error) {
	var approvals []models.Approval
	err := r.db.Preload("Reimbursement").Preload("Approver").Where("reimbursement_id = ?", reimbursementID).Find(&approvals).Error
	return approvals, err
}

func (r *approvalRepository) Update(approval *models.Approval) error {
	return r.db.Save(approval).Error
}

func (r *approvalRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Approval{}, id).Error
}

