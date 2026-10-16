import { baseApi } from "../api/baseApi";

export const permissionsService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // find all permissions
    findAllPermissions: builder.query({
      query: () => ({
        url: "/permissions",
        method: "GET"
      }),
      providesTags: ["Permissions"]
    }),

    // find permission by id
    findPermissionById: builder.query({
      query: (id) => ({
        url: `/permissions/${id}`,
        method: "GET"
      }),
      providesTags: ["Permissions"]
    }),

    // create new permission
    createPermission: builder.mutation({
      query: (data) => ({
        url: "/permissions",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Permissions", "Roles"]
    }),

    // update permission
    updatePermission: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/permissions/${id}`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["Permissions", "Roles"]
    }),

    // delete permission
    deletePermission: builder.mutation({
      query: (id) => ({
        url: `/permissions/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Permissions", "Roles"]
    })
  })
});

export const {
  useFindAllPermissionsQuery,
  useFindPermissionByIdQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation
} = permissionsService;
