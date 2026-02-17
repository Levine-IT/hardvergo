resource "aws_sqs_queue" "main" {
  name                      = "${var.project_name}-${var.environment}-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 1209600
  receive_wait_time_seconds = 0

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-queue"
  })
}

resource "aws_sqs_queue" "dlq" {
  name = "${var.project_name}-${var.environment}-dlq"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-dlq"
  })
}

resource "aws_lambda_function" "processor" {
  filename         = "lambda_function.zip"
  function_name    = "${var.project_name}-${var.environment}-processor"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 3

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST     = aws_db_instance.main.endpoint
      DB_NAME     = aws_db_instance.main.db_name
      DB_USERNAME = aws_db_instance.main.username
      DB_PASSWORD = var.db_password
    }
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-processor"
  })

  depends_on = [aws_cloudwatch_log_group.lambda]
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}-processor"
  retention_in_days = 7

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-lambda-logs"
  })
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  output_path = "lambda_function.zip"
  source {
    content  = <<EOF
exports.handler = async (event) => {
    console.log('Processing SQS messages:', JSON.stringify(event, null, 2));
    
    for (const record of event.Records) {
        const messageBody = JSON.parse(record.body);
        console.log('Processing message:', messageBody);
        
        // Add your business logic here
        // Example: process the message and interact with RDS
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify('Messages processed successfully')
    };
};
EOF
    filename = "index.js"
  }
}

resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn = aws_sqs_queue.main.arn
  function_name    = aws_lambda_function.processor.arn
  batch_size       = 10
}