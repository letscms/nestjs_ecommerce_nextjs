import { adminAPI } from "../api"

export const usersAdminEndpoint = {
    getUsers: '/users',
    createUser: '/users',
    updateUser: (id: string) => `/users/${id}`,
    deleteUser: (id: string) => `/users/${id}`,
}

export const usersAdminAPI = {
    getUsers: () => adminAPI.get(usersAdminEndpoint.getUsers),
    createUser: (data: any) => adminAPI.post(usersAdminEndpoint.createUser, data),
    updateUser: (id: string, data: any) => adminAPI.put(usersAdminEndpoint.updateUser(id), data),
    deleteUser: (id: string) => adminAPI.delete(usersAdminEndpoint.deleteUser(id)),
}