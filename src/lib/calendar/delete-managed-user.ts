import "server-only";

import { CAL_OAUTH_CLIENT_ID, CAL_OAUTH_CLIENT_SECRET } from "./constants";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

export async function deleteCalendarManagedUser(
  userId: number,
  accessToken: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  try {
    const response = await fetch(
      `https://api.cal.com/v2/oauth-clients/${CAL_OAUTH_CLIENT_ID}/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-cal-secret-key": CAL_OAUTH_CLIENT_SECRET ?? "",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to delete Cal.com user:", response.status, errorData);
      
      return createErrorResponse({
        code: "DELETE_USER_FAILED",
        message: `Failed to delete calendar user: ${response.status}`,
      });
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    console.error("Error deleting Cal.com user:", error);
    return createErrorResponse({
      code: "UNKNOWN_ERROR",
      message: `An unknown error occurred while deleting user: ${error}`,
    });
  }
}