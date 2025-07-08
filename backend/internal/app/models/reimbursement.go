package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReimbursementStatus string

const (
	StatusPending  ReimbursementStatus = "pending"
	StatusApproved ReimbursementStatus = "approved"
	StatusRejected ReimbursementStatus = "rejected"
)

type Reimbursement struct {
	ID          uuid.UUID           `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID           `json:"user_id" gorm:"type:uuid;not null"`
	Title       string              `json:"title" gorm:"not null"`
	Description string              `json:"description" gorm:"type:text"`
	Amount      float64             `json:"amount" gorm:"type:decimal(10,2);not null"`
	Status      ReimbursementStatus `json:"status" gorm:"type:varchar(20);not null;default:'pending'"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`

	// Relations
	User      User       `json:"user" gorm:"foreignKey:UserID"`
	Approvals []Approval `json:"approvals" gorm:"foreignKey:ReimbursementID"`
}

func (r *Reimbursement) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

