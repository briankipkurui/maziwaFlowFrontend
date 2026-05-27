import http from "@/services/axios"
import type { SignInResponse } from "../types/auth"
import { authEndpoints } from "../endpoints/authn.endpoints"

class AuthService {

    async getById(): Promise<SignInResponse> {
        const response = await http.get(authEndpoints.signIn)
        return response.data
    }
}

export const authService = new AuthService()
