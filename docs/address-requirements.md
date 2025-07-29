# Address Requirements

## A normalized address management system for storing and managing location data across users and bookings

## Core Address Information

### Identity & Structure

- `addressID` - Unique identifier for the address
- `addressLine1` - Primary street address (required)
- `addressLine2` - Secondary address line (apartment, suite, unit)
- `city` - City name (required)
- `state` - State or province (required)
- `postalCode` - ZIP code or postal code (required)
- `country` - Country code (default: US)

### Geographic Data

- `latitude` - Geographic latitude for mapping and distance calculations
- `longitude` - Geographic longitude for mapping and distance calculations

## Address Classification

### Address Types

- `type` - Enum: ["home", "work", "service_location", "billing", "other"]
- `label` - Custom user-friendly label (e.g., "Mom's House", "Downtown Office")

## Validation & Quality

### Address Verification

- `isVerified` - Boolean indicating address has been validated by external service
- `isDeliverable` - Boolean indicating whether services can be delivered to this location

## Access & Service Information

### Property Access Details

- `accessInstructions` - How to access the property (gate codes, entry procedures)
- `parkingInformation` - Parking availability and instructions for service providers
- `buildingInfo` - Building name, floor number, buzzer codes, etc.

## Relationship Management

### User Address Associations

- Multiple addresses per user (home, work, billing, etc.)
- Primary address designation for each user
- Custom labeling for user's personal organization

### Booking Address Associations

- Service location address (where work will be performed)
- Billing address (for payment processing)
- Multiple address roles per booking when needed

## System Fields

### Lifecycle Management

- `createdAt` - When address was first added to system
- `updatedAt` - Last modification timestamp

## Implementation Design

### Database Structure

The address system uses a normalized approach with three main tables:

#### 1. `addresses` Table

- Central repository for all address data
- Eliminates duplicate storage across users and bookings
- Contains geocoding and validation information

#### 2. `user_addresses` Junction Table

- Many-to-many relationship between users and addresses
- Supports multiple addresses per user with different purposes
- Includes primary address flagging and custom labeling

#### 3. `booking_addresses` Junction Table

- Many-to-many relationship between bookings and addresses
- Supports different address roles (service location, billing)
- Enables complex booking scenarios with multiple locations

### Migration from Existing Schema

#### Changes Made to Existing Tables

**Users Table (`user-schema.ts`)**:

- **Removed**: `address` text field (was storing full address as single string)
- **Replaced with**: Relationship to `user_addresses` junction table

**Bookings Table (`booking-schema.ts`)**:

- **Removed**: `serviceAddress` text field
- **Removed**: `accessInstructions` text field
- **Removed**: `parkingInformation` text field
- **Kept**: `serviceArea` for specific room/area designation
- **Replaced with**: Relationship to `booking_addresses` junction table

### Business Logic Benefits

#### Address Normalization

- **Eliminates duplication**: Same address used by multiple users/bookings stored once
- **Consistent formatting**: Standardized address structure across system
- **Easier maintenance**: Address corrections update all references automatically

#### Enhanced Functionality

- **Geocoding support**: Enables distance-based provider matching and routing
- **Address validation**: Integration with external validation services
- **Access management**: Detailed instructions for service providers
- **Flexible labeling**: Users can organize addresses with custom names

#### Performance Optimization

- **Efficient queries**: Proper indexing on geographic coordinates
- **Reduced storage**: Normalized structure reduces redundant data
- **Scalable relationships**: Junction tables handle complex many-to-many scenarios

### Query Patterns

#### Common Address Queries

```sql
-- Get user's primary address
SELECT a.* FROM addresses a
JOIN user_addresses ua ON a.id = ua.address_id
WHERE ua.user_id = $1 AND ua.is_primary = true;

-- Get service location for booking
SELECT a.* FROM addresses a
JOIN booking_addresses ba ON a.id = ba.address_id
WHERE ba.booking_id = $1 AND ba.role = 'service_location';

-- Find providers within radius of address
SELECT p.* FROM provider_profiles p
JOIN user_addresses ua ON p.user_id = ua.user_id
JOIN addresses a ON ua.address_id = a.id
WHERE ST_DWithin(
  ST_Point(a.longitude, a.latitude)::geography,
  ST_Point($target_lng, $target_lat)::geography,
  $radius_meters
);
```

#### Geographic Search Capabilities

- **Distance calculations**: Find providers within specified radius
- **Route optimization**: Plan efficient service routes
- **Location-based filtering**: Show relevant providers by geographic area
- **Service area coverage**: Determine provider service boundaries

### Future Enhancements

#### Advanced Geographic Features

- **Service area polygons**: Define complex provider coverage areas
- **Location intelligence**: Integration with mapping services for enhanced data
- **Address autocomplete**: Real-time address validation during input
- **Batch geocoding**: Process multiple addresses efficiently

#### International Support

- **Address format localization**: Country-specific address structures
- **Multiple languages**: Address display in user's preferred language
- **Currency and timezone**: Location-based defaults for bookings

This normalized address system provides a foundation for sophisticated location-based features while maintaining data integrity and performance across the marketplace platform.
