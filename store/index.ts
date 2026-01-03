import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authService } from "./services/auth.service";
import { destinationService } from "./services/destination.service";

export const store = configureStore({
  reducer: {
    [authService.reducerPath]: authService.reducer,
    [destinationService.reducerPath]: destinationService.reducer
  },
  middleware: (get) => get().concat(authService.middleware, destinationService.middleware)
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
