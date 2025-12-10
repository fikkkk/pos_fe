import { api } from "../api";

export const getProducts = async (params) => {
    const { page, limit, search } = params;
    try {
        const response = await api.get("/products", {
            params: {
                page,
                limit,
                search,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const createProduct = async (data) => {
    try {
        const response = await api.post("/products", data);
        return response.data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

