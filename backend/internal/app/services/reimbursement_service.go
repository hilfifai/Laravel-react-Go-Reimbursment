package services

import (
	"errors"
	"reimbursement-backend/internal/app/models"
	"reimbursement-backend/internal/app/repositories"
	"time"

	"github.com/google/uuid"
)

type ReimbursementService interface {
	CreateReimbursement(reimbursement *models.Reimbursement) error
	GetReimbursementsByUser(userID uuid.UUID) ([]models.Reimbursement, error)
	GetReimbursementByID(id uuid.UUID) (*models.Reimbursement, error)
	GetPendingReimbursements() ([]models.Reimbursement, error)
	GetAllReimbursements() ([]models.Reimbursement, error)
	ApproveReimbursement(id, approverID uuid.UUID, comments string) error
	RejectReimbursement(id, approverID uuid.UUID, comments string) error
}

type reimbursementService struct {
	reimbursementRepo repositories.ReimbursementRepository
	approvalRepo      repositories.ApprovalRepository
}

func NewReimbursementService(reimbursementRepo repositories.ReimbursementRepository, approvalRepo repositories.ApprovalRepository) ReimbursementService {
	return &reimbursementService{
		reimbursementRepo: reimbursementRepo,
		approvalRepo:      approvalRepo,
	}
}

func (s *reimbursementService) CreateReimbursement(reimbursement *models.Reimbursement) error {
	reimbursement.Status = models.StatusPending
	return s.reimbursementRepo.Create(reimbursement)
}

func (s *reimbursementService) GetReimbursementsByUser(userID uuid.UUID) ([]models.Reimbursement, error) {
	return s.reimbursementRepo.GetByUserID(userID)
}

func (s *reimbursementService) GetReimbursementByID(id uuid.UUID) (*models.Reimbursement, error) {
	return s.reimbursementRepo.GetByID(id)
}

func (s *reimbursementService) GetPendingReimbursements() ([]models.Reimbursement, error) {
	return s.reimbursementRepo.GetPending()
}

func (s *reimbursementService) GetAllReimbursements() ([]models.Reimbursement, error) {
	return s.reimbursementRepo.GetAll()
}

func (s *reimbursementService) ApproveReimbursement(id, approverID uuid.UUID, comments string) error {
	reimbursement, err := s.reimbursementRepo.GetByID(id)
	if err != nil {
		return err
	}

	if reimbursement.Status != models.StatusPending {
		return errors.New("reimbursement is not pending")
	}

	// Update reimbursement status
	reimbursement.Status = models.StatusApproved
	if err := s.reimbursementRepo.Update(reimbursement); err != nil {
		return err
	}

	// Create approval record
	now := time.Now()
	approval := &models.Approval{
		ReimbursementID: id,
		ApproverID:      approverID,
		Status:          models.ApprovalStatusApproved,
		Comments:        &comments,
		ApprovedAt:      &now,
	}

	return s.approvalRepo.Create(approval)
}

func (s *reimbursementService) RejectReimbursement(id, approverID uuid.UUID, comments string) error {
	reimbursement, err := s.reimbursementRepo.GetByID(id)
	if err != nil {
		return err
	}

	if reimbursement.Status != models.StatusPending {
		return errors.New("reimbursement is not pending")
	}

	// Update reimbursement status
	reimbursement.Status = models.StatusRejected
	if err := s.reimbursementRepo.Update(reimbursement); err != nil {
		return err
	}

	// Create approval record
	now := time.Now()
	approval := &models.Approval{
		ReimbursementID: id,
		ApproverID:      approverID,
		Status:          models.ApprovalStatusRejected,
		Comments:        &comments,
		ApprovedAt:      &now,
	}

	return s.approvalRepo.Create(approval)
}

