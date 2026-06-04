export const CooperativeEndpoints = {
    create: '/cooperatives',
    list: '/cooperatives',
    getById: (id: string) => `/cooperatives/${id}`,
    update: (id: string) => `/cooperatives/${id}`,
    delete: (id: string) => `/cooperatives/${id}`,
};