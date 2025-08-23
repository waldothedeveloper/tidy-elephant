import "server-only";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/types/api-responses";

export async function deleteCalendarSchedule(
  scheduleId: number,
  accessToken: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  try {
    const response = await fetch(
      `https://api.cal.com/v2/schedules/${scheduleId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to delete Cal.com schedule:", response.status, errorData);
      
      return createErrorResponse({
        code: "DELETE_SCHEDULE_FAILED",
        message: `Failed to delete calendar schedule: ${response.status}`,
      });
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    console.error("Error deleting Cal.com schedule:", error);
    return createErrorResponse({
      code: "UNKNOWN_ERROR",
      message: `An unknown error occurred while deleting schedule: ${error}`,
    });
  }
}