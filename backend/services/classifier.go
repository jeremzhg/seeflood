package services

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
	"github.com/google/uuid"
	"github.com/jeremzhg/seeflood/models"
	"github.com/jeremzhg/seeflood/store"
)

type FloodService struct {
	store *store.Store
}

func NewFloodService(s *store.Store) *FloodService {
	return &FloodService{store: s}
}

func (s *FloodService) ProcessReport(req models.ReportRequest, file *multipart.FileHeader) (*models.FloodReport, error) {
	ext := filepath.Ext(file.Filename)
	newFilename := uuid.New().String() + ext
	
	uploadDir := "uploads"
	savePath := filepath.Join(uploadDir, newFilename)

	dst, err := os.Create(savePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file on server: %w", err)
	}
	defer dst.Close()

	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return nil, fmt.Errorf("failed to save file content: %w", err)
	}

	detectedDepth := models.DepthAnkle //TODO: post request to container when done
	
	risk := models.RiskSafe // default: safe
	switch detectedDepth {
	case models.DepthKnee, models.DepthWaist:
		risk = models.RiskHigh
	case models.DepthAnkle:
		risk = models.RiskLow
	}

	report := &models.FloodReport{
		Latitude:     req.Latitude,
		Longitude:    req.Longitude,
		LocationName: "", // TODO: add geocoding
		ImageURL:     "/uploads/" + newFilename,
		FloodDepth:   detectedDepth,
		RiskLevel:    risk,
		CreatedAt:    time.Now(),
	}

	if err := s.store.SaveReport(report); err != nil {
		return nil, err
	}

	return report, nil
}