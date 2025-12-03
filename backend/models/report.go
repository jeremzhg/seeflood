package models

import "time"

const (
	NoFlood = "none"
	VeryLight = "very_light"
	Light = "light"
	Moderate = "moderate"
	Severe = "severe"
)

const (
	RiskSafe = "none"
	RiskVeryLight  = "light_yellow"
	RiskLight = "yellow"
	RiskModerate = "light_red"
	RiskHigh = "red"
)

type FloodReport struct {
	ID uint `json:"id"`
	Latitude float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	LocationName string `json:"location_name"`
	ImageURL string `json:"image_url"`
	FloodDepth string `json:"flood_depth"`
	RiskLevel string    `json:"risk_level"`
	CreatedAt time.Time `json:"created_at"`
}

type ReportRequest struct {
	Latitude  float64 `form:"latitude" binding:"required"`
	Longitude float64 `form:"longitude" binding:"required"`
}