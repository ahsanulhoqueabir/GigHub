# Bruno API Syncing Skill

This skill ensures that the API request collections in the root `bruno/` directory are always kept in sync with the backend controllers, route handlers, and DTOs.

## Rules for Bruno Collection Maintenance

Whenever a new API endpoint is added, or an existing one is modified or deleted, you MUST perform the following actions:

1. **Keep Collections Organized by Domain:**
   - Group requests under folders named after their corresponding domain (e.g., `Auth`, `Profiles`, `Gigs`, etc.) inside the root `bruno/` directory.
   - Use PascalCase or title casing for folder names.

2. **Define Happy Path & Edge Cases:**
   - Create a main `.bru` file for the successful request (happy path) under the domain folder.
   - Create additional `.bru` files to cover error-prone states, failure modes, and validation errors (e.g., duplicate values, unauthorized access, validation failures, not found errors).
   - Label edge/error cases clearly, e.g., `Signup - Email Exists.bru`.

3. **Use Environment Variables:**
   - Always reference `{{baseUrl}}` (configured in the environment file, e.g., `environments/Development.bru`) instead of hardcoding `http://localhost:3001`.
   - For authenticated routes, reference the authorization token dynamically using `Bearer {{authToken}}` or setting it via Bruno's auth block referencing `{{authToken}}`.

4. **Capture Auth Tokens Automatically:**
   - For authentication/authorization endpoints (like Login or Signup) that return a JWT token, write a `script:post-response` block to save the token into the collection variables:
     ```bru
     script:post-response {
       if (res.body && res.body.token) {
         bru.setVar("authToken", res.body.token);
       }
     }
     ```

5. **Document Requests & Responses:**
   - Use the `docs` block at the bottom of each `.bru` file to document the expected status codes, request body field descriptions, and example JSON response schemas for both success and failure cases. This ensures that opening the collection in Bruno provides comprehensive, self-contained documentation.
