package store

import (
	"database/sql"
	"fmt"
	"os"
	"github.com/jeremzhg/seeflood/models"
	_ "github.com/lib/pq"
)

type Store struct {
	db *sql.DB
}

func NewStore() (*Store, error) {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open db connection: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping db: %w", err)
	}

	createTableQuery := `
	CREATE TABLE IF NOT EXISTS flood_reports (
		id SERIAL PRIMARY KEY,
		latitude DOUBLE PRECISION NOT NULL,
		longitude DOUBLE PRECISION NOT NULL,
		location_name TEXT,
		image_url TEXT NOT NULL,
		flood_depth VARCHAR(50),
		risk_level VARCHAR(50),
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);`

	if _, err := db.Exec(createTableQuery); err != nil {
		return nil, fmt.Errorf("failed to create table: %w", err)
	}

	return &Store{db: db}, nil
}

func (s *Store) SaveReport(r *models.FloodReport) error {
	query := `
		INSERT INTO flood_reports (latitude, longitude, location_name, image_url, flood_depth, risk_level, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id`

	err := s.db.QueryRow(
		query,
		r.Latitude,
		r.Longitude,
		r.LocationName,
		r.ImageURL,
		r.FloodDepth,
		r.RiskLevel,
		r.CreatedAt,
	).Scan(&r.ID)

	if err != nil {
		return fmt.Errorf("failed to insert report: %w", err)
	}

	return nil
}

func (s *Store) GetReports() ([]*models.FloodReport, error) {
	query := `SELECT id, latitude, longitude, location_name, image_url, flood_depth, risk_level, created_at FROM flood_reports ORDER BY created_at DESC`
	
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query reports: %w", err)
	}
	defer rows.Close()

	var reports []*models.FloodReport
	for rows.Next() {
		r := &models.FloodReport{}
		err := rows.Scan(
			&r.ID,
			&r.Latitude,
			&r.Longitude,
			&r.LocationName,
			&r.ImageURL,
			&r.FloodDepth,
			&r.RiskLevel,
			&r.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan report: %w", err)
		}
		reports = append(reports, r)
	}

	return reports, nil
}