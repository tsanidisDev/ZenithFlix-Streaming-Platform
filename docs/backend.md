# Backend

NestJS REST API - architecture notes, endpoint reference, and bug fix log will be filled in as the backend is built.

## Folder Structure

`streaming/` - controller, service, module, DTOs and entity for the main content resource

`recommendations/` - recommendations logic, queries similar content based on genre

`watch-history/` - entity and module for the watch_history table

`auth/` - JWT guard and strategy, mocked user context

`common/` - shared exception filters and interceptors

`database/` - TypeORM migration files

`config/` - database connection config
