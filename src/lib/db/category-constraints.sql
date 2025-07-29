-- Additional constraints for categories system
-- These constraints ensure data integrity at the database level

-- =============================================================================
-- PROVIDER MAIN SPECIALTY CONSTRAINT
-- =============================================================================

-- Ensure each provider has at most one main specialty category
-- This prevents data inconsistency where a provider could have multiple main specialties
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_single_main_specialty 
ON provider_categories (provider_id) 
WHERE is_main_specialty = true;

-- =============================================================================
-- CATEGORY COLOR VALIDATION TRIGGER
-- =============================================================================

-- Create a trigger function to validate hex colors on insert/update
CREATE OR REPLACE FUNCTION validate_category_color()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate hex color format if provided
    IF NEW.color_hex IS NOT NULL THEN
        IF NEW.color_hex !~ '^#[0-9A-Fa-f]{6}$' THEN
            RAISE EXCEPTION 'Invalid hex color format: %. Expected format: #RRGGBB', NEW.color_hex;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to categories table
DROP TRIGGER IF EXISTS trigger_validate_category_color ON categories;
CREATE TRIGGER trigger_validate_category_color
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION validate_category_color();

-- =============================================================================
-- CATEGORY SLUG VALIDATION TRIGGER
-- =============================================================================

-- Create a trigger function to ensure slug format consistency
CREATE OR REPLACE FUNCTION validate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure slug is lowercase and uses hyphens
    IF NEW.slug IS NOT NULL THEN
        -- Check if slug contains only lowercase letters, numbers, and hyphens
        IF NEW.slug !~ '^[a-z0-9-]+$' THEN
            RAISE EXCEPTION 'Invalid slug format: %. Slug must contain only lowercase letters, numbers, and hyphens', NEW.slug;
        END IF;
        
        -- Ensure slug doesn't start or end with hyphen
        IF NEW.slug ~ '^-.*|.*-$' THEN
            RAISE EXCEPTION 'Invalid slug format: %. Slug cannot start or end with hyphen', NEW.slug;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to categories table
DROP TRIGGER IF EXISTS trigger_validate_category_slug ON categories;
CREATE TRIGGER trigger_validate_category_slug
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION validate_category_slug();

-- =============================================================================
-- PRIORITY VALIDATION FOR CLIENT PREFERENCES
-- =============================================================================

-- Ensure priority values are positive
ALTER TABLE client_preferred_categories 
ADD CONSTRAINT check_positive_priority 
CHECK (priority IS NULL OR priority > 0);

-- =============================================================================
-- EXPERIENCE YEARS VALIDATION
-- =============================================================================

-- Ensure experience years are reasonable (0 to 50 years)
ALTER TABLE provider_categories 
ADD CONSTRAINT check_reasonable_experience 
CHECK (experience_years IS NULL OR (experience_years >= 0 AND experience_years <= 50));

-- =============================================================================
-- SORT ORDER VALIDATION
-- =============================================================================

-- Ensure sort order is non-negative
ALTER TABLE categories 
ADD CONSTRAINT check_non_negative_sort_order 
CHECK (sort_order >= 0);

-- =============================================================================
-- USAGE EXAMPLES
-- =============================================================================

/*
-- Check constraint violations
SELECT * FROM categories WHERE color_hex IS NOT NULL AND color_hex !~ '^#[0-9A-Fa-f]{6}$';

-- Find providers with multiple main specialties (should return empty)
SELECT provider_id, COUNT(*) as main_specialty_count
FROM provider_categories 
WHERE is_main_specialty = true
GROUP BY provider_id
HAVING COUNT(*) > 1;

-- Validate all slugs
SELECT * FROM categories WHERE slug !~ '^[a-z0-9-]+$' OR slug ~ '^-.*|.*-$';

-- Check priority distributions
SELECT priority, COUNT(*) as count
FROM client_preferred_categories 
WHERE priority IS NOT NULL
GROUP BY priority
ORDER BY priority;
*/