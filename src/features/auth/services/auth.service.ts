import http, { httpPublic } from "@/services/axios"
import type { LoginRequest, LoginResponse } from "../types/auth"
import { authEndpoints } from "../endpoints/authEndpoints"

class AuthService {

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await httpPublic.post<LoginResponse>(authEndpoints.signIn, credentials)
        return response.data
    }
}

export const authService = new AuthService()
