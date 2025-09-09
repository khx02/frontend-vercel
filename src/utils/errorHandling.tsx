import axios from "axios";

export function extractErrorMessage(error: unknown): string {
  console.log("Extracting error:", error);
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const data = error.response.data;

      if (typeof data === "string") {
        return data;
      }

      if (data.detail) {
        return data.detail;
      }

      if (data.message) {
        return data.message;
      }

      if (data.error) {
        return data.error;
      }

      if (typeof data === "object") {
        return JSON.stringify(data);
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error occurred, please try again.";
}

