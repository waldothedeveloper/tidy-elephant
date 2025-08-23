# Onboarding Sequence

This document outlines the complete onboarding flow for providers in the correct order as implemented in the codebase.

## Complete Flow Overview

The onboarding process follows this sequence:

welcome → type-of-business → [basic-info OR business-info] → verify-phone → select-categories → hourly-rate → upload-work-photos → provider/dashboard

Note: There are also `select-availability` and `setup-payment-account` routes that appear to be additional/optional steps, but they are not currently integrated into the main flow.

## Detailed Step-by-Step Flow

### 1. Welcome Page (`/onboarding/welcome/`)

- **File**: `src/app/onboarding/welcome/page.tsx`
- **Action**: `handleBeginOnboarding()` calls `beginProviderOnboardingAction`
- **Navigation**: Redirects to `/onboarding/type-of-business` (line 18)
- **Purpose**: Introduction page with onboarding overview

### 2. Type of Business (`/onboarding/type-of-business/`)

- **File**: `src/app/onboarding/type-of-business/page.tsx`
- **Navigation**: Two paths:
  - **Freelancer**: Goes to `/onboarding/basic-info` (line 51)
  - **Business**: Goes to `/onboarding/business-info` (line 77)
- **Purpose**: Choose between individual freelancer or business entity

### 3A. Basic Info (`/onboarding/basic-info/`) - Freelancer Path

- **File**: `src/app/onboarding/basic-info/page.tsx`
- **Action**: `createProviderProfileAction` (currently TODO implementation)
- **Navigation**: Comment suggests goes to `/onboarding/verify-phone` (line 57)
- **Purpose**: Basic profile information for individual freelancers
- **Form Fields**: firstName, lastName, about, photo

### 3B. Business Info (`/onboarding/business-info/`) - Business Path

- **File**: `src/app/onboarding/business-info/page.tsx`
- **Action**: `saveBusinessInfoAction`
- **Navigation**: Goes to `/onboarding/select-categories` (line 145)
- **Purpose**: Business information for registered businesses
- **Form Fields**: businessType, businessName, businessPhone, employerEin, address fields

### 4. Verify Phone (`/onboarding/verify-phone/`)

- **Files**:
  - `src/app/onboarding/verify-phone/page.tsx`
  - `src/app/onboarding/verify-phone/phone-verification-wrapper.tsx`
  - `src/app/onboarding/verify-phone/verify-provider-sms-code.tsx`
- **Flow**: Two-step phone verification process
  1. Enter phone number (`VerifyProviderPhone`)
  2. Verify SMS code (`VerifyProviderPhoneSMSCode`)
- **Navigation**:
  - Previous: Goes to `/onboarding/basic-info` (line 57)
  - Next: Goes to `/onboarding/select-categories` (line 68)
- **Purpose**: SMS verification for security

### 5. Select Categories (`/onboarding/select-categories/`)

- **Files**:
  - `src/app/onboarding/select-categories/page.tsx`
  - `src/app/onboarding/select-categories/categories-wrapper.tsx`
- **Action**: `saveProviderCategoriesAction`
- **Navigation**:
  - Previous: Goes to `/onboarding/verify-phone` (line 87)
  - Next: Goes to `/onboarding/hourly-rate` (line 60)
- **Purpose**: Choose service categories provider will offer
- **Data Source**: `getCategoriesDAL()`

### 6. Hourly Rate (`/onboarding/hourly-rate/`)

- **Files**:
  - `src/app/onboarding/hourly-rate/page.tsx`
  - `src/app/onboarding/hourly-rate/hourly-rate-wrapper.tsx`
- **Action**: `saveProviderHourlyRateAction`
- **Navigation**:
  - Previous: Goes to `/onboarding/select-categories` (line 79)
  - Next: Goes to `/onboarding/upload-work-photos` (line 55)
- **Purpose**: Set hourly rate for services
- **Range**: $25-$250 (suggested $75-125)

### 7. Upload Work Photos (`/onboarding/upload-work-photos/`)

- **File**: `src/app/onboarding/upload-work-photos/page.tsx`
- **Action**: `uploadWorkPhotosAction`
- **Navigation**:
  - Previous: Goes to `/onboarding/hourly-rate` (line 112)
  - Next: Goes to `/provider/dashboard` (line 88) - **FINAL STEP**
- **Purpose**: Upload 3-8 work photos to showcase services
- **Requirements**: Minimum 3 photos, maximum 8 photos

## Additional Routes (Not in Main Flow)

### Select Availability (`/onboarding/select-availability/`)

- **Files**:
  - `src/app/onboarding/select-availability/page.tsx`
  - `src/app/onboarding/select-availability/availability-client-page.tsx`
- **Action**: `saveAvailabilityAction`
- **Navigation**: Goes to `/onboarding/select-availability/success` (line 140)
- **Purpose**: Set weekly availability schedule and timezone
- **Status**: Appears to be implemented but not integrated into main flow

### Setup Payment Account (`/onboarding/setup-payment-account/`)

- **File**: `src/app/onboarding/setup-payment-account/page.tsx`
- **Purpose**: Stripe Connect integration for payment processing
- **Status**: Appears to be implemented but not integrated into main flow

## Navigation Discrepancies

Based on the code analysis, there are some inconsistencies in the flow:

1. **Business Info Path**: The `business-info` page skips phone verification and goes directly to `select-categories`
2. **Missing Integration**: `select-availability` and `setup-payment-account` are not integrated into the main onboarding flow

## Form Schemas and Validation

Each step uses Valibot schemas for form validation:

- `userProfileSchema` - Basic info form
- `businessInfoFormSchema` - Business info form
- `userProfilePhoneVerificationSchema` - Phone verification
- `userProfileCodeVerificationSchema` - SMS code verification
- `categoriesFormSchema` - Categories selection
- `createHourlyRateSchema` - Hourly rate form
- No specific schema found for work photos upload
- `availabilitySchema` - Availability form

## Server Actions

All forms submit via server actions following security rules:

- Never throw exceptions
- Authenticate first
- Validate inputs with `safeParse()`
- Return consistent response types
- Located in `src/app/actions/onboarding/`
