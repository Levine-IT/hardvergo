# User Activity Logging Middleware

This module provides comprehensive user activity logging functionality for the HardverGo API. It automatically logs user activities to the `userActivity` table in the database.

## Features

- **Automatic Activity Logging**: Uses an interceptor to automatically log user activities on API requests
- **Multiple Activity Types**: Supports different activity types like login, listing operations, profile updates, etc.
- **Detailed Activity Data**: Captures request method, path, status code, user agent, IP address, and activity-specific data
- **Non-blocking**: Logging happens asynchronously to avoid affecting response times
- **Error Handling**: Gracefully handles logging errors without affecting the main request

## Setup

The module is already configured in the main `AppModule`. The `UserActivityInterceptor` is registered globally via `APP_INTERCEPTOR`.

## Activity Types

The middleware automatically determines activity types based on the request:

### Authentication Activities
- `login` - User login attempts
- `logout` - User logout

### Listing Activities  
- `listing_created` - New listing created
- `listing_updated` - Existing listing updated
- `listing_deleted` - Listing deleted
- `listing_viewed` - Listing viewed

### Order Activities
- `order_created` - New order placed
- `order_updated` - Order status updated

### Profile Activities
- `profile_updated` - User profile updated
- `profile_viewed` - User profile viewed

### Generic Activities
- `api_access` - General API access
- `api_error` - Failed API requests

## Usage

### Automatic Logging (Recommended)

The interceptor automatically logs activities for authenticated users. Ensure your authentication middleware sets the `user` property on the request object:

```typescript
// In your authentication middleware/guard
request.user = {
  id: 123,
  username: "john_doe",
  email: "john@example.com", 
  role: "user"
};
```

### Manual Logging

You can also manually log activities using the `UserActivityService`:

```typescript
import { Injectable } from "@nestjs/common";
import { UserActivityService } from "../user-activity";

@Injectable()
export class SomeService {
  constructor(private userActivityService: UserActivityService) {}

  async performAction(userId: number) {
    // Your business logic here
    
    // Log the activity
    await this.userActivityService.logActivity({
      userId,
      activityType: "custom_action",
      activityData: {
        customData: "some value",
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

### Retrieving User Activities

```typescript
// Get recent activities for a user
const activities = await userActivityService.getUserActivities(userId, 50);

// Get the last activity for a user
const lastActivity = await userActivityService.getLastActivity(userId);
```

## Request Interface Extension

The module extends the Express Request interface to include user information:

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username?: string;
        email?: string;
        role?: string;
      };
    }
  }
}
```

## Activity Data Structure

Each activity log includes:

```typescript
{
  userId: number;           // ID of the user performing the activity
  activityType: string;     // Type of activity (see activity types above)
  activityData: {          // Additional contextual data
    method: string;         // HTTP method
    path: string;          // Request path
    statusCode: number;    // Response status code
    userAgent: string;     // User agent string
    ip: string;           // User IP address
    timestamp: string;    // ISO timestamp
    resourceId?: number;  // ID of affected resource (if applicable)
    // Activity-specific data...
  };
  createdAt: timestamp;    // When the activity was logged
}
```

## Configuration

The middleware logs activities for:
- Successful requests (2xx status codes)
- Authenticated users only
- Specific endpoint patterns (see activity type detection)

To modify what gets logged, update the `determineActivityType` and `extractRelevantData` methods in `UserActivityInterceptor`.

## Error Handling

- Logging errors are caught and logged to console without affecting the main request
- Failed requests can optionally be logged as `api_error` activities
- Database connection issues won't break API functionality

## Performance Considerations

- Activity logging uses `setImmediate()` to run after the response is sent
- Database writes are non-blocking
- Consider adding indexes on `userId` and `createdAt` columns for better query performance

## Database Schema

The activity data is stored in the `user_activity` table:

```sql
CREATE TABLE user_activity (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  activity_type VARCHAR(100) NOT NULL,
  activity_data JSON,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```
