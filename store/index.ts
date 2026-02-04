import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authService } from "./services/auth.service";
import { destinationService } from "./services/destination.service";
import { ordersService } from "./services/orders.service";
import { rolesService } from "./services/role.service";
import { salesService } from "./services/sales.service";
import { usersService } from "./services/user.service";

export const store = configureStore({
  reducer: {
    [authService.reducerPath]: authService.reducer,
    [destinationService.reducerPath]: destinationService.reducer,
    [ordersService.reducerPath]: ordersService.reducer,
    [salesService.reducerPath]: salesService.reducer,
    [usersService.reducerPath]: usersService.reducer,
    [rolesService.reducerPath]: rolesService.reducer
  },
  middleware: (get) =>
    get().concat(
      authService.middleware,
      destinationService.middleware,
      ordersService.middleware,
      salesService.middleware,
      usersService.middleware,
      rolesService.middleware
    )
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
