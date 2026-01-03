package services

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
	"bytes"
	"net/http"
	"encoding/json"
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

	detectedDepth, err := s.callPythonModel(savePath)
	if err != nil {
		fmt.Printf("prediction model error: %v\n", err)
		detectedDepth = models.NoFlood // fallback
	}
	
	risk := models.RiskSafe // default: safe
	switch detectedDepth {
	case models.Light:
		risk = models.RiskLight
	case models.Moderate:
		risk = models.RiskModerate
	case models.Severe:
		risk = models.RiskHigh
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

func (s *FloodService) GetAllReports() ([]*models.FloodReport, error) {
	return s.store.GetReports()
}

func (s *FloodService) callPythonModel(imagePath string) (string, error) {
	var b bytes.Buffer
	w := multipart.NewWriter(&b)
	
	f, err := os.Open(imagePath)
	if err != nil { return "", err }
	defer f.Close()

	fw, _ := w.CreateFormFile("file", imagePath)
	io.Copy(fw, f)
	w.Close()

	resp, err := http.Post("http://localhost:5000/predict", w.FormDataContentType(), &b)
	if err != nil { return "", err }
	defer resp.Body.Close()

	var result struct {
		Class string `json:"class"`
	}
	json.NewDecoder(resp.Body).Decode(&result)

	return result.Class, nil
}