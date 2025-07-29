# Shared Users Requirements

## Overview

This document outlines the user schema requirements for a unified user system that accommodates both user types, which are providers and clients.

## Shared User Properties

_The following properties and functionality will be available to ALL users regardless of whether they are acting as a client, provider, or both._

### Core Identity Fields

#### Required for all users in the system

- `firstname` - User's first name
- `lastname` - User's last name
- `phone` - Primary phone number
- `email` - Primary email address (unique identifier)
- `clerkUserID` - External authentication identifier
- `profileImage` - Avatar/profile photo URL
- `roles` - Array of roles: ["client"], ["provider"], or ["client", "provider"]

### System Fields

#### Automatically managed by the system

- `createdAt` - Account creation timestamp
- `updatedAt` - Last modification timestamp

### Location & Contact

#### Communication and location data needed by both user types

- `address` - Primary address (street, city, state, zip)
- `timezone` - User's timezone for scheduling coordination
- `preferredContactMethod` - Enum: ["email", "phone", "app_messaging"]
- `language` - Preferred language for communications

### Account Status & Verification

#### Security and verification shared by all users

- `accountStatus` - Enum: ["active", "inactive", "suspended", "pending_verification"]
- `isEmailVerified` - Boolean for email verification status
- `isPhoneVerified` - Boolean for phone verification status
- `isVerified` - Overall verification status

### Trust & Safety

#### Safety features applicable to all users

- `agreedToTerms` - Boolean for terms of service acceptance
- `agreedToTermsAt` - Timestamp of terms acceptance
- `privacyPolicyAccepted` - Boolean for privacy policy acceptance

### Communication Preferences

#### Notification settings shared by all users

- `emailNotifications` - Boolean for email notifications
- `smsNotifications` - Boolean for SMS notifications
- `marketingEmails` - Boolean for promotional communications

### Referral & Growth

#### User acquisition and referral tracking for all users

- `referralCode` - Unique code for referring others
- `referredBy` - Reference to user who referred them
- `howDidYouHearAbout` - Source of user acquisition

NOTES:
For future reference when creating other schemas:

1. Address normalization - Consider creating a separate addresses table
2. Self-reference - referredBy field references the same users table
3. Provider-specific extensions will need additional tables for:

   - Service categories
   - Pricing/rates
   - Work photos
   - Reviews/ratings
