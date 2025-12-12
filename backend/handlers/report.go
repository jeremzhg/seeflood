package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/jeremzhg/seeflood/models"
	"github.com/jeremzhg/seeflood/services"
)

type ReportHandler struct {
	service *services.FloodService
}

func NewReportHandler(s *services.FloodService) *ReportHandler {
	return &ReportHandler{service: s}
}

// POST /api/report endpoint
func (h *ReportHandler) CreateReport(c *gin.Context) {
	var req models.ReportRequest

	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid input. Latitude and Longitude are required.",
		})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Image file is missing.",
		})
		return
	}

	report, err := h.service.ProcessReport(req, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process report: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   report,
	})
}

// GET /api/reports endpoint
func (h *ReportHandler) GetReports(c *gin.Context) {
	reports, err := h.service.GetAllReports()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch reports: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   reports,
	})
}