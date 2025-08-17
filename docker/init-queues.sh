#!/bin/bash

set -e  # Exit on any error

echo "🚀 Setting up LocalStack profile and SQS queues..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENDPOINT_URL="${LOCALSTACK_ENDPOINT:-http://localhost:4566}"
PROFILE_NAME="localstack"

# Default queues to create (can be overridden by command line arguments)
DEFAULT_QUEUES=("optimize-draft-images")

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [queue1] [queue2] [queue3] ..."
    echo ""
    echo "Examples:"
    echo "  $0                                    # Creates default queue: optimize-draft-images"
    echo "  $0 queue1 queue2 queue3              # Creates multiple queues"
    echo "  $0 images-queue orders-queue         # Creates images-queue and orders-queue"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    echo ""
}

# Parse command line arguments
if [[ $# -gt 0 ]]; then
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            QUEUES=("$@")
            ;;
    esac
else
    QUEUES=("${DEFAULT_QUEUES[@]}")
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Create LocalStack profile
echo "📝 Creating LocalStack profile..."

# Set up the profile with test credentials
aws configure set aws_access_key_id test --profile ${PROFILE_NAME}
aws configure set aws_secret_access_key test --profile ${PROFILE_NAME}
aws configure set region eu-central-1 --profile ${PROFILE_NAME}
aws configure set output json --profile ${PROFILE_NAME}

print_status "LocalStack profile '${PROFILE_NAME}' created successfully"

# Wait a moment for LocalStack to be ready (if it's starting up)
echo "⏳ Waiting for LocalStack to be ready..."
sleep 2

# Check if LocalStack is running
if ! curl -s "${ENDPOINT_URL}/_localstack/health" &> /dev/null; then
    print_warning "LocalStack doesn't seem to be running at ${ENDPOINT_URL}"
    print_warning "Make sure to start LocalStack before running queue operations"
    echo ""
    echo "You can start LocalStack with:"
    echo "  docker run -p 4566:4566 localstack/localstack"
    echo "  # or"
    echo "  docker-compose up -d  # if you have a docker-compose.yml"
    exit 1
fi

print_info "LocalStack is running and healthy"

# Create the SQS queues
echo ""
echo "📬 Creating SQS queues..."
echo "Queues to create: ${QUEUES[*]}"
echo ""

CREATED_QUEUES=()
EXISTING_QUEUES=()
FAILED_QUEUES=()

for QUEUE_NAME in "${QUEUES[@]}"; do
    echo "Creating queue: ${QUEUE_NAME}..."
    
    # Create the queue
    QUEUE_URL=$(aws --profile ${PROFILE_NAME} --endpoint-url=${ENDPOINT_URL} sqs create-queue \
        --queue-name "${QUEUE_NAME}" \
        --query 'QueueUrl' --output text 2>/dev/null || true)

    if [ -n "$QUEUE_URL" ]; then
        print_status "Queue '${QUEUE_NAME}' created successfully"
        CREATED_QUEUES+=("${QUEUE_NAME}:${QUEUE_URL}")
    else
        # Queue might already exist, try to get its URL
        QUEUE_URL=$(aws --profile ${PROFILE_NAME} --endpoint-url=${ENDPOINT_URL} sqs get-queue-url \
            --queue-name "${QUEUE_NAME}" \
            --query 'QueueUrl' --output text 2>/dev/null || true)
        
        if [ -n "$QUEUE_URL" ]; then
            print_warning "Queue '${QUEUE_NAME}' already exists"
            EXISTING_QUEUES+=("${QUEUE_NAME}:${QUEUE_URL}")
        else
            print_error "Failed to create or find queue '${QUEUE_NAME}'"
            FAILED_QUEUES+=("${QUEUE_NAME}")
        fi
    fi
done

# Deploy Lambda function from dist folder
echo ""
echo "📦 Deploying Lambda function from dist folder..."

LAMBDA_DIR="/apps/optimize-draft-listing-image"
LAMBDA_NAME="optimize-draft-listing-image"
DIST_DIR="${LAMBDA_DIR}/dist"

deploy_lambda() {
    if [ -d "$DIST_DIR" ] && [ "$(ls -A $DIST_DIR)" ]; then
        print_info "Creating deployment package from dist folder..."
        cd "$DIST_DIR"
        zip -r ../function.zip *
        cd "$LAMBDA_DIR"
        
        # Deploy or update Lambda function
        print_info "Deploying Lambda function..."
        aws --profile ${PROFILE_NAME} --endpoint-url=${ENDPOINT_URL} lambda create-function \
            --function-name ${LAMBDA_NAME} \
            --runtime nodejs22.x \
            --role arn:aws:iam::000000000000:role/lambda-role \
            --handler index.handler \
            --zip-file fileb://function.zip \
            --timeout 300 \
            --memory-size 512 2>/dev/null || \
        aws --profile ${PROFILE_NAME} --endpoint-url=${ENDPOINT_URL} lambda update-function-code \
            --function-name ${LAMBDA_NAME} \
            --zip-file fileb://function.zip
        
        print_status "Lambda function deployed successfully"
        
        # Clean up
        rm -f function.zip
        cd /docker
    else
        print_error "dist folder not found or empty in ${DIST_DIR}"
        return 1
    fi
}

if [ -d "$LAMBDA_DIR" ]; then
    # Initial deployment
    deploy_lambda
    
    # Create event source mapping for SQS trigger (only once)
    if [ ${#CREATED_QUEUES[@]} -gt 0 ] || [ ${#EXISTING_QUEUES[@]} -gt 0 ]; then
        print_info "Creating SQS event source mapping..."
        
        # Convert queue URL to ARN format for LocalStack
        QUEUE_ARN="arn:aws:sqs:eu-central-1:000000000000:optimize-draft-images"
        
        aws --profile ${PROFILE_NAME} --endpoint-url=${ENDPOINT_URL} lambda create-event-source-mapping \
            --function-name ${LAMBDA_NAME} \
            --event-source-arn ${QUEUE_ARN} \
            --batch-size 10 2>/dev/null || print_warning "Event source mapping might already exist"
        
        print_status "Lambda function connected to SQS queue"
    fi
    
    # Watch for changes in dist folder
    print_info "Watching ${DIST_DIR} for changes..."
    
    # Get initial modification time of dist folder
    LAST_MODIFIED=$(stat -c %Y "$DIST_DIR" 2>/dev/null || echo 0)
    
    while true; do
        sleep 5
        if [ -d "$DIST_DIR" ]; then
            CURRENT_MODIFIED=$(stat -c %Y "$DIST_DIR")
            if [ "$CURRENT_MODIFIED" -gt "$LAST_MODIFIED" ]; then
                print_info "Detected changes in dist folder, redeploying..."
                if deploy_lambda; then
                    LAST_MODIFIED=$CURRENT_MODIFIED
                fi
            fi
        fi
    done
else
    print_error "Lambda source directory not found: ${LAMBDA_DIR}"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Summary:"
echo "  • Profile: ${PROFILE_NAME}"
echo "  • Endpoint: ${ENDPOINT_URL}"

if [ ${#CREATED_QUEUES[@]} -gt 0 ]; then
    echo "  • Created queues:"
    for queue_info in "${CREATED_QUEUES[@]}"; do
        queue_name="${queue_info%%:*}"
        queue_url="${queue_info#*:}"
        echo "    - ${queue_name}: ${queue_url}"
    done
fi

if [ ${#EXISTING_QUEUES[@]} -gt 0 ]; then
    echo "  • Existing queues:"
    for queue_info in "${EXISTING_QUEUES[@]}"; do
        queue_name="${queue_info%%:*}"
        queue_url="${queue_info#*:}"
        echo "    - ${queue_name}: ${queue_url}"
    done
fi

if [ ${#FAILED_QUEUES[@]} -gt 0 ]; then
    echo "  • Failed queues:"
    for queue_name in "${FAILED_QUEUES[@]}"; do
        echo "    - ${queue_name}"
    done
fi

# Show usage examples
echo ""
echo "🔧 Usage examples:"
echo ""

# Show examples for the first queue (or first created/existing queue)
EXAMPLE_QUEUE=""
EXAMPLE_URL=""

if [ ${#CREATED_QUEUES[@]} -gt 0 ]; then
    queue_info="${CREATED_QUEUES[0]}"
    EXAMPLE_QUEUE="${queue_info%%:*}"
    EXAMPLE_URL="${queue_info#*:}"
elif [ ${#EXISTING_QUEUES[@]} -gt 0 ]; then
    queue_info="${EXISTING_QUEUES[0]}"
    EXAMPLE_QUEUE="${queue_info%%:*}"
    EXAMPLE_URL="${queue_info#*:}"
fi

if [ -n "$EXAMPLE_QUEUE" ]; then
    echo "📤 Send a message to '${EXAMPLE_QUEUE}':"
    echo "  aws --profile ${PROFILE_NAME} --endpoint-url=${ENDPOINT_URL} sqs send-message \\"
    echo "    --queue-url '${EXAMPLE_URL}' \\"
    echo "    --message-body '{\"action\": \"process\", \"data\": \"example\"}'"
    echo ""
    
    echo "📥 Receive messages from '${EXAMPLE_QUEUE}':"
    echo "  aws --profile ${PROFILE_NAME} --endpoint-url=${ENDPOINT_URL} sqs receive-message \\"
    echo "    --queue-url '${EXAMPLE_URL}'"
    echo ""
fi

echo "📋 List all queues:"
echo "  aws --profile ${PROFILE_NAME} --endpoint-url=${ENDPOINT_URL} sqs list-queues"
echo ""

echo "🔍 Get queue URL by name:"
echo "  aws --profile ${PROFILE_NAME} --endpoint-url=${ENDPOINT_URL} sqs get-queue-url \\"
echo "    --queue-name QUEUE_NAME"
echo ""

# Exit with error code if any queues failed
if [ ${#FAILED_QUEUES[@]} -gt 0 ]; then
    exit 1
fi