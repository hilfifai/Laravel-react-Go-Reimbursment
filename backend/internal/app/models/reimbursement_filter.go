package models

import (
	"time"

	"github.com/google/uuid"
)

type ReimbursementFilter struct {
    Status    string    `json:"status"`
    StartDate time.Time `json:"start_date"`
    EndDate   time.Time `json:"end_date"`
    UserID    uuid.UUID `json:"user_id"`
}