import "server-only";

import { cache } from "react";
import { createAvatar } from "@dicebear/core";
import { icons } from "@dicebear/collection";

/**
 * Generates a unique avatar URI using the Open Peeps collection from Dicebear.
 * This function is memoized to prevent unnecessary re-renders and performance hits.
 *
 * @returns {string} A data URI representing the generated avatar.
 */

export const createAvatarURI = cache((seed: string) => {
  return createAvatar(icons, {
    seed: seed,
    randomizeIds: true,
    size: 96,
  }).toDataUri();
});
