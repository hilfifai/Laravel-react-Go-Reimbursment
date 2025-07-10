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
	ApprovedAt  time.Time          `json:"approved_at"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	 ApprovedID  *uint      			`json:"approved_id" omitempty gorm:"default:0"` 
	
	User      User       `json:"user" gorm:"foreignKey:UserID"`
	// ApprovedBy      User       `json:"approved_by" gorm:"foreignKey:ApprovedID"`
	Approvals []Approval `json:"approvals" gorm:"foreignKey:ReimbursementID"`
}

func (r *Reimbursement) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
type ReimbursementResponse struct {
    ID          uuid.UUID         `json:"id"`
    Description string            `json:"description"`
    Amount      float64           `json:"amount"`
    Status      string            `json:"status"`
    CreatedAt   time.Time         `json:"created_at"`
    User        string            `json:"user"`
    Approvals   []ApprovalResponse `json:"approvals"`
}


type ApprovalResponse struct {
    ID        uuid.UUID `json:"id"`
    Status    string    `json:"status"`
    Notes     *string   `json:"notes,omitempty"` // Pastikan nama 'Notes' benar
    CreatedAt time.Time `json:"created_at"`
    Approver  string    `json:"approver"`
}
