import { sql } from "drizzle-orm";
import { db } from "./index";

/**
 * Creates database triggers for automatic provider rating calculations
 * This prevents race conditions and keeps rating statistics in sync with review data
 */
export async function createRatingTriggers() {
  await db.execute(sql`
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
        -- Determine which provider to update
        IF TG_OP = 'DELETE' THEN
            provider_uuid := OLD.provider_id;
        ELSE
            provider_uuid := NEW.provider_id;
        END IF;

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

        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await db.execute(sql`
    -- Trigger on review INSERT
    DROP TRIGGER IF EXISTS trigger_review_insert_update_ratings ON reviews;
    CREATE TRIGGER trigger_review_insert_update_ratings
        AFTER INSERT ON reviews
        FOR EACH ROW
        EXECUTE FUNCTION update_provider_ratings();
  `);

  await db.execute(sql`
    -- Trigger on review UPDATE
    DROP TRIGGER IF EXISTS trigger_review_update_update_ratings ON reviews;
    CREATE TRIGGER trigger_review_update_update_ratings
        AFTER UPDATE ON reviews
        FOR EACH ROW
        WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR 
              OLD.status IS DISTINCT FROM NEW.status OR
              OLD.provider_id IS DISTINCT FROM NEW.provider_id)
        EXECUTE FUNCTION update_provider_ratings();
  `);

  await db.execute(sql`
    -- Trigger on review DELETE
    DROP TRIGGER IF EXISTS trigger_review_delete_update_ratings ON reviews;
    CREATE TRIGGER trigger_review_delete_update_ratings
        AFTER DELETE ON reviews
        FOR EACH ROW
        EXECUTE FUNCTION update_provider_ratings();
  `);
}

/**
 * Syncs all provider ratings with actual review data
 * Useful for initial setup or fixing data inconsistencies
 */
export async function syncAllProviderRatings() {
  const result = await db.execute(sql`
    CREATE OR REPLACE FUNCTION sync_all_provider_ratings()
    RETURNS INTEGER AS $$
    DECLARE
        provider_record RECORD;
        updated_count INTEGER := 0;
        avg_rating NUMERIC(3,2);
        total_count INTEGER;
        one_star_count INTEGER;
        two_star_count INTEGER;
        three_star_count INTEGER;
        four_star_count INTEGER;
        five_star_count INTEGER;
    BEGIN
        FOR provider_record IN 
            SELECT user_id FROM provider_profiles
        LOOP
            -- Calculate stats for this provider
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
            WHERE provider_id = provider_record.user_id 
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
            WHERE user_id = provider_record.user_id;
            
            updated_count := updated_count + 1;
        END LOOP;
        
        RETURN updated_count;
    END;
    $$ LANGUAGE plpgsql;

    SELECT sync_all_provider_ratings();
  `);

  return result;
}

/**
 * Checks for rating inconsistencies between stored and calculated values
 * Useful for monitoring data integrity
 */
export async function checkRatingConsistency() {
  return await db.execute(sql`
    SELECT 
        pp.user_id,
        pp.average_rating as stored_avg,
        pp.total_reviews as stored_count,
        COALESCE(AVG(r.rating::NUMERIC), 0.00)::NUMERIC(3,2) as calculated_avg,
        COALESCE(COUNT(r.*), 0) as calculated_count,
        ABS(pp.average_rating - COALESCE(AVG(r.rating::NUMERIC), 0.00)::NUMERIC(3,2)) as avg_diff,
        ABS(pp.total_reviews - COALESCE(COUNT(r.*), 0)) as count_diff
    FROM provider_profiles pp
    LEFT JOIN reviews r ON pp.user_id = r.provider_id AND r.status = 'active'
    GROUP BY pp.user_id, pp.average_rating, pp.total_reviews
    HAVING pp.average_rating != COALESCE(AVG(r.rating::NUMERIC), 0.00)::NUMERIC(3,2)
        OR pp.total_reviews != COALESCE(COUNT(r.*), 0)
    ORDER BY avg_diff DESC, count_diff DESC;
  `);
}