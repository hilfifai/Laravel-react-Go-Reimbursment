package services

import (
	"reimbursement-backend/internal/app/models"
	"reimbursement-backend/internal/app/repositories"
	"reimbursement-backend/pkg/utils"

	"github.com/google/uuid"
)

type UserService interface {
	GetAllUsers() ([]models.User, error)
	GetUserByID(id uuid.UUID) (*models.User, error)
	CreateUser(user *models.User, password string) error
	UpdateUser(user *models.User) error
	DeleteUser(id uuid.UUID) error
}

type userService struct {
	userRepo repositories.UserRepository
}

func NewUserService(userRepo repositories.UserRepository) UserService {
	return &userService{
		userRepo: userRepo,
	}
}

func (s *userService) GetAllUsers() ([]models.User, error) {
	return s.userRepo.GetAll()
}

func (s *userService) GetUserByID(id uuid.UUID) (*models.User, error) {
	return s.userRepo.GetByID(id)
}

func (s *userService) CreateUser(user *models.User, password string) error {
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	user.Password = hashedPassword
	return s.userRepo.Create(user)
}

func (s *userService) UpdateUser(user *models.User) error {
	return s.userRepo.Update(user)
}

func (s *userService) DeleteUser(id uuid.UUID) error {
	return s.userRepo.Delete(id)
}

