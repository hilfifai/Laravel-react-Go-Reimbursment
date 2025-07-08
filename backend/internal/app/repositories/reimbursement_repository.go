package repositories

import (
	"reimbursement-backend/internal/app/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReimbursementRepository interface {
	Create(reimbursement *models.Reimbursement) error
	GetByID(id uuid.UUID) (*models.Reimbursement, error)
	GetByUserID(userID uuid.UUID) ([]models.Reimbursement, error)
	GetPending() ([]models.Reimbursement, error)
	GetAll() ([]models.Reimbursement, error)
	Update(reimbursement *models.Reimbursement) error
	Delete(id uuid.UUID) error
}

type reimbursementRepository struct {
	db *gorm.DB
}

func NewReimbursementRepository(db *gorm.DB) ReimbursementRepository {
	return &reimbursementRepository{db: db}
}

func (r *reimbursementRepository) Create(reimbursement *models.Reimbursement) error {
	return r.db.Create(reimbursement).Error
}

func (r *reimbursementRepository) GetByID(id uuid.UUID) (*models.Reimbursement, error) {
	var reimbursement models.Reimbursement
	err := r.db.Preload("User").Preload("Approvals").Preload("Approvals.Approver").Where("id = ?", id).First(&reimbursement).Error
	if err != nil {
		return nil, err
	}
	return &reimbursement, nil
}

func (r *reimbursementRepository) GetByUserID(userID uuid.UUID) ([]models.Reimbursement, error) {
	var reimbursements []models.Reimbursement
	err := r.db.Preload("User").Preload("Approvals").Preload("Approvals.Approver").Where("user_id = ?", userID).Find(&reimbursements).Error
	return reimbursements, err
}

func (r *reimbursementRepository) GetPending() ([]models.Reimbursement, error) {
	var reimbursements []models.Reimbursement
	err := r.db.Preload("User").Preload("Approvals").Preload("Approvals.Approver").Where("status = ?", models.StatusPending).Find(&reimbursements).Error
	return reimbursements, err
}

func (r *reimbursementRepository) GetAll() ([]models.Reimbursement, error) {
	var reimbursements []models.Reimbursement
	err := r.db.Preload("User").Preload("Approvals").Preload("Approvals.Approver").Find(&reimbursements).Error
	return reimbursements, err
}

func (r *reimbursementRepository) Update(reimbursement *models.Reimbursement) error {
	return r.db.Save(reimbursement).Error
}

func (r *reimbursementRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Reimbursement{}, id).Error
}

