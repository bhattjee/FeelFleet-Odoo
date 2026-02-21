export interface PaginationParams {
    skip: number;
    take: number;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const getPaginationParams = (query: any): PaginationParams => {
    const page = parseInt(query.page as string, 10) || 1;
    const limit = parseInt(query.limit as string, 10) || 25;

    return {
        skip: (page - 1) * limit,
        take: limit,
    };
};

export const getPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
