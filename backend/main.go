package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/jeremzhg/seeflood/handlers"
	"github.com/jeremzhg/seeflood/services"
	"github.com/jeremzhg/seeflood/store"
)

func main() {
	// load env
	if err := godotenv.Load(); err != nil {
		log.Println("no .env found")
	}

	// setup db
	dbStore, err := store.NewStore()
	if err != nil {
		log.Fatalf("failed to connect to db: %v", err)
	}
	log.Println("db connection successful")

	// setup services and handlers
	floodService := services.NewFloodService(dbStore)
	reportHandler := handlers.NewReportHandler(floodService)

	// setup webserver
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// setup routes
	api := r.Group("/api")
	{
		api.POST("/report", reportHandler.CreateReport)
	}

	// serve uploaded images statically ex: http://localhost:8080/uploads/what.jpg
	r.Static("/uploads", "./uploads")

	// start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("server starting on http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}