# Categories Requirements

## Overview

The categories system defines the professional organizing service types available in the marketplace. This document outlines the 11 primary service categories and their relationships within the platform.

## Service Categories

### 1. Core Professional Organizers

- **Primary Category**: Yes
- **Description**: Comprehensive home and life organization services
- **Focus**: General organizing, decluttering, system creation
- **Target Market**: Residential clients seeking overall organization

### 2. Home Stagers

- **Primary Category**: No
- **Description**: Prepare homes for sale by optimizing layout, décor, and presentation
- **Focus**: Real estate preparation, visual appeal, market-ready staging
- **Target Market**: Home sellers, real estate agents

### 3. Feng Shui Consultants

- **Primary Category**: No
- **Description**: Focus on optimizing energy flow and harmony in living spaces
- **Focus**: Spatial arrangement based on feng shui principles
- **Target Market**: Clients interested in holistic living approaches

### 4. Move Managers and Downsizing Specialists

- **Primary Category**: No
- **Description**: Help with life transitions, relocations, and downsizing decisions
- **Focus**: Moving coordination, downsizing assistance, transition support
- **Target Market**: Seniors, families relocating, life transition situations

### 5. Interior Designers

- **Primary Category**: No
- **Description**: Design and organize interior spaces for functionality and aesthetics
- **Focus**: Space design, furniture arrangement, aesthetic enhancement
- **Target Market**: Clients seeking design-focused organization

### 6. Office Organizers

- **Primary Category**: No
- **Description**: Organize home offices or corporate spaces for maximum productivity
- **Focus**: Workspace optimization, productivity systems, professional environments
- **Target Market**: Business professionals, remote workers, corporate clients

### 7. Home Organizers

- **Primary Category**: No
- **Description**: Specialize in residential organization for kitchens, closets, and living areas
- **Focus**: Room-specific organization, storage solutions, daily living systems
- **Target Market**: Homeowners seeking specific room organization

### 8. Paperwork/Document Organizers

- **Primary Category**: No
- **Description**: Organize physical and digital documents, filing systems, and paperwork
- **Focus**: Document management, filing systems, record keeping
- **Target Market**: Clients with document management challenges

### 9. Digital Organizers

- **Primary Category**: No
- **Description**: Help clients organize digital files, photos, accounts, and online presence
- **Focus**: Digital file management, photo organization, online account management
- **Target Market**: Tech-overwhelmed individuals, digital hoarders

### 10. Time & Productivity Coaches

- **Primary Category**: No
- **Description**: Help with calendar management, workflows, and productivity systems
- **Focus**: Time management, productivity optimization, workflow creation
- **Target Market**: Busy professionals, entrepreneurs, productivity seekers

### 11. Estate Cleanout / Hoarding Specialists

- **Primary Category**: No
- **Description**: Handle sensitive situations involving estate cleanouts and extreme clutter/hoarding
- **Focus**: Sensitive decluttering, hoarding intervention, estate management
- **Target Market**: Families dealing with estate cleanouts, hoarding situations

## Technical Implementation

### Database Schema

- **Categories Table**: Master list of all service categories
- **Provider Categories Junction**: Many-to-many relationship between providers and categories
- **Client Preferred Categories Junction**: Client preferences for service types
- **Booking Category Reference**: Direct foreign key from bookings to categories

### Key Fields

- **ID**: UUID primary key
- **Name**: Human-readable category name
- **Slug**: URL-friendly identifier
- **Description**: Detailed category explanation
- **Is Primary**: Indicates core professional organizer category
- **Sort Order**: Display ordering
- **Is Active**: Category availability status
- **Icon Name**: UI icon identifier
- **Color Hex**: Theme color for UI consistency

### Relationships

1. **Provider → Categories**: Many-to-many through junction table

   - Providers can offer multiple service categories
   - Categories can be offered by multiple providers
   - Additional metadata: primary category flag, years of experience

2. **Client → Categories**: Many-to-many through junction table

   - Clients can prefer multiple service categories
   - Categories can be preferred by multiple clients
   - Additional metadata: priority ranking

3. **Booking → Category**: Direct foreign key reference
   - Each booking is associated with one primary service category
   - Enables service-specific analytics and filtering

### Indexing Strategy

- Unique indexes on name and slug for data integrity
- Performance indexes on active status and sort order
- Composite indexes on junction tables for efficient lookups
- Category-based filtering indexes for bookings

## Business Rules

### Category Assignment

- Providers must select at least one category during onboarding
- Providers can designate one category as their "primary" specialty
- Clients can select multiple preferred categories (optional)
- All categories are available for booking selection

### Category Management

- Categories are pre-seeded during system initialization
- Category activation/deactivation controlled by admin
- Sort order determines display sequence in UI
- Color coding provides visual consistency across platform

### Analytics & Reporting

- Track popular categories by booking volume
- Monitor provider distribution across categories
- Analyze client preferences and matching success
- Geographic category demand analysis

## User Experience

### Provider Perspective

- Select expertise areas during onboarding
- Showcase primary specialty prominently
- Receive bookings filtered by category expertise
- Build reputation within specific service categories

### Client Perspective

- Browse providers by service category
- Filter search results by category type
- Express preferences for personalized matching
- Book services with category-specific expectations

### Platform Benefits

- Improved provider-client matching accuracy
- Enhanced search and filtering capabilities
- Category-specific analytics and insights
- Structured service taxonomy for growth
