import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError
} from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

// Lightweight Mutex implementation for synchronizing refresh-token calls
class Mutex {
  private _locked = false;
  private _waiting: (() => void)[] = [];

  isLocked(): boolean {
    return this._locked;
  }

  async acquire(): Promise<() => void> {
    if (!this._locked) {
      this._locked = true;
      return () => this.release();
    }

    return new Promise<() => void>((resolve) => {
      this._waiting.push(() => {
        this._locked = true;
        resolve(() => this.release());
      });
    });
  }

  private release(): void {
    if (this._waiting.length > 0) {
      const next = this._waiting.shift();
      if (next) next();
    } else {
      this._locked = false;
    }
  }

  async waitForUnlock(): Promise<void> {
    if (!this._locked) return;
    return new Promise<void>((resolve) => {
      const check = () => {
        if (!this._locked) {
          resolve();
        } else {
          setTimeout(check, 20);
        }
      };
      check();
    });
  }
}

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers) => {
    const token = Cookies.get("travel_token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include"
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait until any active refresh token request completes
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  // If unauthorized (401), attempt to refresh token
  if (result.error && result.error.status === 401) {
    const currentToken = Cookies.get("travel_token");

    // Only attempt refresh if we actually had a token
    if (currentToken) {
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          const refreshResult: any = await rawBaseQuery(
            {
              url: "/auth/refresh-token",
              method: "POST"
            },
            api,
            extraOptions
          );

          if (refreshResult.data?.data?.session) {
            const newToken = refreshResult.data.data.session;
            Cookies.set("travel_token", newToken, {
              expires: 1,
              sameSite: "lax",
              path: "/"
            });

            // Retry original query with the new token
            result = await rawBaseQuery(args, api, extraOptions);
          } else {
            // Refresh token failed/invalid -> clear session and redirect
            Cookies.remove("travel_token");
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
              window.location.href = "/login";
            }
          }
        } catch (error) {
          Cookies.remove("travel_token");
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
          }
        } finally {
          release();
        }
      } else {
        // Wait for the other thread to finish refreshing and retry
        await mutex.waitForUnlock();
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "travelApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Users",
    "Roles",
    "Permissions",
    "Destinations",
    "Motors",
    "Mereks",
    "Orders",
    "Sales",
    "AddOns",
    "Customers",
    "Entertainments",
    "Visas",
    "DocumentVisas",
    "DocumentCategories"
  ],
  endpoints: () => ({})
});
