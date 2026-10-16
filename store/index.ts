import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./api/baseApi";

// Ensure all service endpoints are injected
import "./services/auth.service";
import "./services/destination.service";
import "./services/motor.service";
import "./services/orders.service";
import "./services/role.service";
import "./services/sales.service";
import "./services/user.service";
import "./services/add-ons.service";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware)
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
