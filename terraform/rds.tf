resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  })
}

resource "aws_db_parameter_group" "main" {
  family = "postgres17"
  name   = "${var.project_name}-${var.environment}-db-params"

  parameter {
    name  = "log_statement"
    value = "all"
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-db-params"
  })
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = var.db_storage_type
  storage_encrypted     = true

  engine         = "postgres"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = 0 // For development purposes, set to a higher value in production
  // backup_window           = "03:00-04:00"
  maintenance_window = "Sun:04:00-Sun:05:00"

  skip_final_snapshot = true // Only for development purposes, set to false in production
  deletion_protection = false

  performance_insights_enabled = false

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-db"
  })
}
