FROM public.ecr.aws/lambda/nodejs:18

# Copy package files
COPY package*.json ${LAMBDA_TASK_ROOT}/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY dist/ ${LAMBDA_TASK_ROOT}/

# Set the CMD to your handler
CMD [ "index.handler" ]