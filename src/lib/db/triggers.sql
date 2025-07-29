-- Database Triggers for Automatic Rating Calculations
-- These triggers ensure provider rating statistics stay in sync with review data
-- and prevent race conditions during concurrent review operations

-- =============================================================================
-- RATING CALCULATION FUNCTIONS
-- =============================================================================

-- Function to recalculate provider rating statistics
CREATE OR REPLACE FUNCTION update_provider_ratings()
RETURNS TRIGGER AS $$
DECLARE
    provider_uuid UUID;
    avg_rating NUMERIC(3,2);
    total_count INTEGER;
    one_star_count INTEGER;
    two_star_count INTEGER;
    three_star_count INTEGER;
    four_star_count INTEGER;
    five_star_count INTEGER;
BEGIN
    -- Determine which provider to update based on trigger operation
    IF TG_OP = 'DELETE' THEN
        provider_uuid := OLD.provider_id;
    ELSE
        provider_uuid := NEW.provider_id;
    END IF;

    -- Calculate aggregated rating statistics for this provider
    SELECT 
        COALESCE(AVG(rating::NUMERIC), 0.00)::NUMERIC(3,2),
        COALESCE(COUNT(*), 0),
        COALESCE(COUNT(*) FILTER (WHERE rating = 1), 0),
        COALESCE(COUNT(*) FILTER (WHERE rating = 2), 0),
        COALESCE(COUNT(*) FILTER (WHERE rating = 3), 0),
        COALESCE(COUNT(*) FILTER (WHERE rating = 4), 0),
        COALESCE(COUNT(*) FILTER (WHERE rating = 5), 0)
    INTO 
        avg_rating,
        total_count,
        one_star_count,
        two_star_count,
        three_star_count,
        four_star_count,
        five_star_count
    FROM reviews 
    WHERE provider_id = provider_uuid 
      AND status = 'active'; -- Only count active reviews

    -- Update provider profile with calculated statistics
    UPDATE provider_profiles 
    SET 
        average_rating = avg_rating,
        total_reviews = total_count,
        rating_breakdown = json_build_object(
            'oneStar', one_star_count,
            'twoStar', two_star_count,
            'threeStar', three_star_count,
            'fourStar', four_star_count,
            'fiveStar', five_star_count
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = provider_uuid;

    -- Return appropriate record based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC RATING UPDATES
-- =============================================================================

-- Trigger on review INSERT: Recalculate when new reviews are added
DROP TRIGGER IF EXISTS trigger_review_insert_update_ratings ON reviews;
CREATE TRIGGER trigger_review_insert_update_ratings
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_ratings();

-- Trigger on review UPDATE: Recalculate when reviews are modified
DROP TRIGGER IF EXISTS trigger_review_update_update_ratings ON reviews;
CREATE TRIGGER trigger_review_update_update_ratings
    AFTER UPDATE ON reviews
    FOR EACH ROW
    WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR 
          OLD.status IS DISTINCT FROM NEW.status OR
          OLD.provider_id IS DISTINCT FROM NEW.provider_id)
    EXECUTE FUNCTION update_provider_ratings();

-- Trigger on review DELETE: Recalculate when reviews are removed
DROP TRIGGER IF EXISTS trigger_review_delete_update_ratings ON reviews;
CREATE TRIGGER trigger_review_delete_update_ratings
    AFTER DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_ratings();

-- =============================================================================
-- INITIAL DATA SYNC FUNCTION
-- =============================================================================

-- Function to recalculate all provider ratings (for initial sync or maintenance)
CREATE OR REPLACE FUNCTION sync_all_provider_ratings()
RETURNS INTEGER AS $$
DECLARE
    provider_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Loop through all provider profiles
    FOR provider_record IN 
        SELECT user_id FROM provider_profiles
    LOOP
        -- Trigger rating calculation for each provider
        PERFORM update_provider_ratings_for_provider(provider_record.user_id);
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Helper function to recalculate ratings for a specific provider
CREATE OR REPLACE FUNCTION update_provider_ratings_for_provider(provider_uuid UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating NUMERIC(3,2);
    total_count INTEGER;
    one_star_count INTEGER;
    two_star_count INTEGER;
    three_star_count INTEGER;
    four_star_count INTEGER;
    five_star_count INTEGER;
BEGIN
    -- Calculate aggregated rating statistics
    SELECT 
        COALESCE(AVG(rating::NUMERIC), 0.00)::NUMERIC(3,2),
        COALESCE(COUNT(*), 0),
        COALESCE(COUNT(*) FILTER (WHERE rating = 1), 0),
        COALESCE(COUNT(*) FILTER (WHERE rating = 2), 0),
        COALESCE(COUNT(*) FILTER (WHERE rating = 3), 0),
        COALESCE(COUNT(*) FILTER (WHERE rating = 4), 0),
        COALESCE(COUNT(*) FILTER (WHERE rating = 5), 0)
    INTO 
        avg_rating,
        total_count,
        one_star_count,
        two_star_count,
        three_star_count,
        four_star_count,
        five_star_count
    FROM reviews 
    WHERE provider_id = provider_uuid 
      AND status = 'active';

    -- Update provider profile
    UPDATE provider_profiles 
    SET 
        average_rating = avg_rating,
        total_reviews = total_count,
        rating_breakdown = json_build_object(
            'oneStar', one_star_count,
            'twoStar', two_star_count,
            'threeStar', three_star_count,
            'fourStar', four_star_count,
            'fiveStar', five_star_count
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = provider_uuid;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- USAGE EXAMPLES AND MAINTENANCE
-- =============================================================================

/*
-- Initial sync of all provider ratings (run once after implementing triggers)
SELECT sync_all_provider_ratings();

-- Recalculate ratings for a specific provider (maintenance)
SELECT update_provider_ratings_for_provider('provider-uuid-here');

-- Check rating consistency (for monitoring)
SELECT 
    pp.user_id,
    pp.average_rating as stored_avg,
    pp.total_reviews as stored_count,
    COALESCE(AVG(r.rating::NUMERIC), 0.00)::NUMERIC(3,2) as calculated_avg,
    COALESCE(COUNT(r.*), 0) as calculated_count
FROM provider_profiles pp
LEFT JOIN reviews r ON pp.user_id = r.provider_id AND r.status = 'active'
GROUP BY pp.user_id, pp.average_rating, pp.total_reviews
HAVING pp.average_rating != COALESCE(AVG(r.rating::NUMERIC), 0.00)::NUMERIC(3,2)
    OR pp.total_reviews != COALESCE(COUNT(r.*), 0);
*/