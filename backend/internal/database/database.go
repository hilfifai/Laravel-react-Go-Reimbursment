package database

import (
	"reimbursement-backend/internal/app/models"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Initialize(databaseURL string) (*gorm.DB, error) {
	var db *gorm.DB
	var err error

	if strings.Contains(databaseURL, "sqlite") || strings.HasSuffix(databaseURL, ".db") {
		db, err = gorm.Open(sqlite.Open(databaseURL), &gorm.Config{})
	} else {
		db, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	}

	if err != nil {
		return nil, err
	}

	return db, nil
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Reimbursement{},
		&models.Approval{},
	)
}

