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

### Geographic Address Queries
```sql
-- Optimized by: idx_address_geocode
SELECT * FROM addresses 
WHERE latitude BETWEEN $lat_min AND $lat_max 
  AND longitude BETWEEN $lng_min AND $lng_max;

-- Optimized by: idx_user_address_primary
SELECT a.* FROM addresses a
JOIN user_addresses ua ON a.id = ua.address_id
WHERE ua.user_id = $1 AND ua.is_primary = true;
```

### Complex Booking Queries
```sql
-- Optimized by: idx_booking_status_date_range
SELECT * FROM bookings 
WHERE status IN ('confirmed', 'in_progress')
  AND service_date BETWEEN $start_date AND $end_date
ORDER BY service_date ASC;

-- Optimized by: idx_booking_category_status
SELECT * FROM bookings 
WHERE service_category = 'home_organization' 
  AND status = 'completed'
ORDER BY service_date DESC;
```

## Index Maintenance Strategy

### Array Column Indexes

- **GIN indexes** for all array columns (`categories`, `preferred_providers`, `roles`, `languages`, etc.)
- Enable fast containment queries (`@>`, `&&`, `<@` operators)
- Support array overlap and containment operations efficiently
- Higher storage cost but essential for array search performance
- Critical for provider search by categories and client preference matching

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
- **Booking uniqueness**: Prevents duplicate bookings for same client/provider/datetime

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

## Database Triggers for Rating Calculations

### Automatic Rating Updates
- **PostgreSQL triggers**: Automatically recalculate provider ratings when reviews change
- **Race condition prevention**: Eliminates inconsistencies from concurrent updates
- **Real-time accuracy**: Rating statistics always reflect current review data
- **Atomic operations**: Rating updates happen within the same transaction as review changes

### Trigger Functions
- **INSERT triggers**: Recalculate when new reviews are added
- **UPDATE triggers**: Recalculate when reviews are modified or status changes
- **DELETE triggers**: Recalculate when reviews are removed
- **Conditional execution**: Only fires when rating-relevant fields change

### Maintenance Functions
- **Initial sync**: `syncAllProviderRatings()` for setup or data fixes
- **Consistency checks**: `checkRatingConsistency()` for monitoring
- **Manual recalculation**: Per-provider rating refresh capabilities

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
