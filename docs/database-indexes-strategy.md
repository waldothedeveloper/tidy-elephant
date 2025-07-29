# Database Indexes and Constraints Strategy

## Overview

This document outlines the indexing strategy for the marketplace database schema, focusing on performance optimization for common query patterns in a professional organizer marketplace application.

## Index Categories

### 1. **Primary Lookup Indexes**

- **Purpose**: Fast retrieval by unique identifiers
- **Examples**: `users.email`, `users.clerkUserID`, `users.referralCode`
- **Impact**: Sub-millisecond lookups for authentication and user identification

### 2. **Foreign Key Indexes**

- **Purpose**: Optimize JOIN operations and referential integrity
- **Examples**: `bookings.clientId`, `bookings.providerId`, `reviews.bookingId`
- **Impact**: Prevents full table scans during joins

### 3. **Filter Indexes**

- **Purpose**: Speed up WHERE clause filtering
- **Examples**: `providers.averageRating`, `bookings.status`, `reviews.rating`
- **Impact**: Efficient filtering for search and dashboard queries

### 4. **Composite Indexes**

- **Purpose**: Optimize multi-column queries and sorting
- **Examples**: Provider search, booking dashboards, review listings
- **Impact**: Single index serves multiple query patterns

## Key Query Patterns Optimized

### Provider Search Queries

```sql
-- Optimized by: idx_provider_search, idx_provider_avg_rating, idx_provider_hourly_rate
SELECT * FROM provider_profiles
WHERE is_onboarded = true
  AND average_rating >= 4.0
  AND hourly_rate BETWEEN 5000 AND 15000
ORDER BY average_rating DESC;
```

### User Dashboard Queries

```sql
-- Optimized by: idx_booking_client_dashboard
SELECT * FROM bookings
WHERE client_id = $1
  AND status IN ('confirmed', 'in_progress')
ORDER BY service_date ASC;
```

### Provider Reviews

```sql
-- Optimized by: idx_review_provider_listing
SELECT * FROM reviews
WHERE provider_id = $1
  AND status = 'active'
ORDER BY created_at DESC;
```

## Index Maintenance Strategy

### Array Column Indexes

- **GIN indexes** for array columns (`categories`, `preferred_providers`)
- Enable fast containment queries (`@>`, `&&` operators)
- Higher storage cost but essential for array search performance

### JSON Column Indexes

- **GIN indexes** for JSON columns (`time_preferences`, `category_ratings`)
- Enable efficient JSON path queries
- Consider functional indexes for frequently accessed JSON keys

### Text Search Indexes

- **Full-text search indexes** for `bio`, `service_description`, `comment`
- Use PostgreSQL's built-in text search capabilities
- Consider trigram indexes for fuzzy matching

## Performance Considerations

### Index Size vs. Performance Trade-offs

1. **High-Impact Indexes** (Always include):

   - Primary key lookups
   - Foreign key relationships
   - Status filters (booking status, account status)

2. **Medium-Impact Indexes** (Include based on usage):

   - Sorting columns (rating, date, price)
   - Category filters
   - Geographic indexes (when location added)

3. **Low-Impact Indexes** (Monitor before adding):
   - Rarely filtered columns
   - High-cardinality text fields
   - Temporary or reporting-only queries

### Composite Index Column Order

- **Most selective first**: Highest filtering power columns first
- **Query pattern alignment**: Match common WHERE clause order
- **Equality before range**: Equality filters before range filters

Example:

```sql
-- Good: provider_search (is_onboarded, average_rating, hourly_rate)
WHERE is_onboarded = true AND average_rating >= 4.0 AND hourly_rate BETWEEN 5000 AND 15000

-- Bad: (hourly_rate, average_rating, is_onboarded)
-- Range filter first reduces index effectiveness
```

## Data Integrity Constraints

### Check Constraints

- **Business logic enforcement**: Rating ranges (1-5), price limits
- **Data format validation**: Email format, phone number format
- **Referential integrity**: Self-referencing foreign keys

### Unique Constraints

- **Business uniqueness**: One review per booking, unique referral codes
- **Data consistency**: Prevent duplicate profiles per user

## Implementation Notes

### Drizzle ORM Integration

- Indexes defined in `/src/lib/db/indexes.ts`
- Applied via migration files
- Monitor query performance with database tools

### Migration Strategy

1. **Phase 1**: Core indexes (PKs, FKs, status filters)
2. **Phase 2**: Search optimization indexes
3. **Phase 3**: Analytics and reporting indexes
4. **Phase 4**: Advanced indexes based on usage patterns

### Monitoring and Optimization

- Use `EXPLAIN ANALYZE` for query plan analysis
- Monitor index usage with `pg_stat_user_indexes`
- Remove unused indexes periodically
- Consider partial indexes for filtered queries

## Database-Specific Optimizations

### PostgreSQL Features

- **Partial indexes**: For frequently filtered subsets
- **Expression indexes**: For computed values
- **Concurrent index creation**: Minimize downtime
- **Index-only scans**: Include frequently selected columns

### Neon Serverless Considerations

- **Connection pooling**: Optimized for serverless scaling
- **Autoscaling**: Indexes scale with usage
- **Storage efficiency**: Balance index count with storage costs

## Future Considerations

### Geographic Search

When location-based search is added:

- **PostGIS extension**: Geographic indexes
- **Spatial indexes**: Distance-based queries
- **Bounding box queries**: Area-based filtering

### Full-Text Search

For advanced search features:

- **tsvector columns**: Pre-computed search vectors
- **Trigram indexes**: Fuzzy text matching
- **Search ranking**: Weighted relevance scoring

### Analytics Indexes

For reporting and analytics:

- **Time-series indexes**: Date-based partitioning
- **Aggregation optimization**: Pre-computed summaries
- **OLAP patterns**: Dimension and fact table indexes
