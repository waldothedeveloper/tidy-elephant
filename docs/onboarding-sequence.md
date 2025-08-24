# Onboarding Sequence

This document outlines the complete onboarding flow for providers in the correct order as implemented in the codebase, grouped into **3 major steps**: Profile, Background Check, and Activation Fee.

---

## Complete Flow Overview

The onboarding process follows this sequence:

welcome → verify-phone → type-of-business → [basic-info OR business-info] → select-categories → hourly-rate → upload-work-photos → select-availability → background-check → onboarding-fee → setup-payment-account → provider/dashboard

---

## Progress Bar Helper Text

- **Step 1: Build Your Profile** – “Add your info, services, and photos.”
- **Step 2: Background Check** – “Verify your identity for client trust.”
- **Step 3: Activation Fee** – “Pay your setup fee to go live.”

---

## Detailed Step-by-Step Flow

### 1. Welcome Page (`/onboarding/welcome/`)

- **File**: `src/app/onboarding/welcome/page.tsx`
- **Action**: `handleBeginOnboarding()` calls `beginProviderOnboardingAction`
- **Navigation**: Redirects to `/onboarding/verify-phone`
- **Purpose**: Introduction page with onboarding overview

---

### 2. Verify Phone (`/onboarding/verify-phone/`)

- **Files**:
  - `src/app/onboarding/verify-phone/page.tsx`
  - `src/app/onboarding/verify-phone/phone-verification-wrapper.tsx`
  - `src/app/onboarding/verify-phone/verify-provider-sms-code.tsx`
- **Flow**:
  1. Enter phone number (`VerifyProviderPhone`)
  2. Verify SMS code (`VerifyProviderPhoneSMSCode`)
- **Purpose**: Ensure real phone numbers, prevent orphaned data, enable SMS onboarding reminders
- **Consent**: Explicit consent for SMS communications with opt-out language

---

### 3. Type of Business (`/onboarding/type-of-business/`)

- **File**: `src/app/onboarding/type-of-business/page.tsx`
- **Navigation**: Two paths:
  - **Freelancer**: Goes to `/onboarding/basic-info`
  - **Business**: Goes to `/onboarding/business-info`
- **Purpose**: Choose between individual freelancer or business entity

---

### 4A. Basic Info (`/onboarding/basic-info/`) - Freelancer Path

- **File**: `src/app/onboarding/basic-info/page.tsx`
- **Action**: `createProviderProfileAction`
- **Navigation**: Goes to `/onboarding/select-categories`
- **Purpose**: Basic profile information for individual freelancers
- **Form Fields**: firstName, lastName, about, photo

---

### 4B. Business Info (`/onboarding/business-info/`) - Business Path

- **File**: `src/app/onboarding/business-info/page.tsx`
- **Action**: `saveBusinessInfoAction`
- **Navigation**: Goes to `/onboarding/select-categories`
- **Purpose**: Business information for registered businesses
- **Form Fields**: businessType, businessName, businessPhone, employerEin, address fields

---

### 5. Select Categories (`/onboarding/select-categories/`)

- **Files**:
  - `src/app/onboarding/select-categories/page.tsx`
  - `src/app/onboarding/select-categories/categories-wrapper.tsx`
- **Action**: `saveProviderCategoriesAction`
- **Navigation**: Next → `/onboarding/hourly-rate`
- **Purpose**: Choose service categories provider will offer
- **Data Source**: `getCategoriesDAL()`

---

### 6. Hourly Rate (`/onboarding/hourly-rate/`)

- **Files**:
  - `src/app/onboarding/hourly-rate/page.tsx`
  - `src/app/onboarding/hourly-rate/hourly-rate-wrapper.tsx`
- **Action**: `saveProviderHourlyRateAction`
- **Navigation**: Next → `/onboarding/upload-work-photos`
- **Purpose**: Set hourly rate for services
- **Range**: $25–$250 (suggested $75–125)

---

### 7. Upload Work Photos (`/onboarding/upload-work-photos/`)

- **File**: `src/app/onboarding/upload-work-photos/page.tsx`
- **Action**: `uploadWorkPhotosAction`
- **Navigation**: Next → `/onboarding/select-availability`
- **Purpose**: Upload 3–8 work photos to showcase services
- **Requirements**: Minimum 3 photos, maximum 8 photos

---

### 8. Select Availability (`/onboarding/select-availability/`)

- **Files**:
  - `src/app/onboarding/select-availability/page.tsx`
  - `src/app/onboarding/select-availability/availability-client-page.tsx`
- **Action**: `saveAvailabilityAction`
- **Navigation**: Next → `/onboarding/background-check`
- **Purpose**: Set weekly availability schedule and timezone

---

### 9. Background Check (`/onboarding/background-check/`)

- **Purpose**: Submit required info for Checkr (or equivalent) background screening
- **Data Fields**: SSN, DOB, address
- **Navigation**: Next → `/onboarding/onboarding-fee`
- **UX**: Allow dashboard access while check is pending, but mark profile as incomplete

---

### 10. Onboarding Fee (`/onboarding/onboarding-fee/`)

- **Purpose**: Collect non-refundable onboarding fee
- **Integration**: Stripe
- **UX Copy**: “Covers your background check and setup costs. Unlocks your profile so you can start getting bookings.”

---

### 11. Setup Payment Account (`/onboarding/setup-payment-account/`)

- **File**: `src/app/onboarding/setup-payment-account/page.tsx`
- **Purpose**: Stripe Connect integration for receiving payments
- **Navigation**: Final → `/provider/dashboard`

---

### 12. Provider Dashboard (`/provider/dashboard`)

- **Purpose**: Central hub for providers
- **Progress Indicators**:
  - ✅ Profile Complete
  - ⏳ Background Check Pending
  - ❌ Activation Fee Pending
  - ❌ Payment Account Not Connected

---

## Form Schemas and Validation

- `userProfileSchema` – Basic info form
- `businessInfoFormSchema` – Business info form
- `userProfilePhoneVerificationSchema` – Phone verification
- `userProfileCodeVerificationSchema` – SMS code verification
- `categoriesFormSchema` – Categories selection
- `createHourlyRateSchema` – Hourly rate form
- `availabilitySchema` – Availability form
- Background check + onboarding fee will need new schemas

---

## Server Actions

All forms submit via server actions following security rules:

- Never throw exceptions
- Authenticate first
- Validate inputs with `safeParse()`
- Return consistent response types
- Located in `src/app/actions/onboarding/`

---
