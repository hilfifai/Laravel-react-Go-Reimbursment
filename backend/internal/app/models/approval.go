package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ApprovalStatus string

const (
	ApprovalStatusPending  ApprovalStatus = "pending"
	ApprovalStatusApproved ApprovalStatus = "approved"
	ApprovalStatusRejected ApprovalStatus = "rejected"
)

type Approval struct {
	ID               uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ReimbursementID  uuid.UUID      `json:"reimbursement_id" gorm:"type:uuid;not null"`
	ApproverID       uuid.UUID      `json:"approver_id" gorm:"type:uuid;not null"`
	Status           ApprovalStatus `json:"status" gorm:"type:varchar(20);not null;default:'pending'"`
	Comments         *string        `json:"comments" gorm:"type:text"`
	ApprovedAt       *time.Time     `json:"approved_at"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`

	// Relations
	Reimbursement Reimbursement `json:"reimbursement" gorm:"foreignKey:ReimbursementID"`
	Approver      User          `json:"approver" gorm:"foreignKey:ApproverID"`
}

func (a *Approval) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

