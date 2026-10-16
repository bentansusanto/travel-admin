import { baseApi } from "../api/baseApi";

export const rolesService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // find all roles
    findAllRoles: builder.query({
      query: () => ({
        url: "/roles",
        method: "GET"
      }),
      providesTags: ["Roles"]
    }),

    // find role by id
    findRoleById: builder.query({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "GET"
      }),
      providesTags: ["Roles"]
    }),

    // create new role
    createRole: builder.mutation({
      query: (data) => ({
        url: "/roles",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Roles"]
    }),

    // update role
    updateRole: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/roles/${id}`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["Roles"]
    }),

    // delete role
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Roles"]
    })
  })
});

export const {
  useFindAllRolesQuery,
  useFindRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation
} = rolesService;
