import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { userActions } from "@/app/redux/store/reducers/userSlice"
import { useRoutes } from "@/hooks/useRoutes"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { useGetUserQuery, useRefreshTokenQuery } from "@/app/redux/api/auth.api"
import { UserI } from "@/shared/types/api/UserI"

interface AuthContextProps {
    initializing: boolean
    authenticated: boolean
    unauthenticated: boolean
    login: () => void
    logout: () => void
    fetchUser: () => void
    setInitializing: () => void
    auth: () => void
    refresh: () => void
}

const AuthContext = createContext<AuthContextProps>({
    initializing: true,
    authenticated: false,
    unauthenticated: false,
    logout: () => null,
    login: () => null,
    fetchUser: () => null,
    setInitializing: () => null,
    auth: () => null,
    refresh: () => null,
})

const { Provider } = AuthContext

interface AuthContextProviderProps {
    children: ReactNode
}

enum AuthStatus {
    Initializing = "Initializing",
    Authenticated = "Authenticated",
    UnAuthenticated = "UnAuthenticated",
}

const AuthProvider: FC<AuthContextProviderProps> = ({ children }) => {
    const [status, setStatus] = useState<AuthStatus>(AuthStatus.Initializing)

    const login = () => {
        setStatus(AuthStatus.Authenticated)
    }

    const logout = () => {
        setStatus(AuthStatus.UnAuthenticated)
    }

    const setInitializing = (): void => {
        setStatus(AuthStatus.Initializing)
    }

    const inStatus = (s: AuthStatus): boolean => {
        return status === s
    }

    const dispatch = useAppDispatch()

    const { addUser, deleteUser } = userActions

    const user = useAppSelector((state) => state.user.currentUser)
    const { refetch: refetchUser } = useGetUserQuery()
    const { refetch: refetchToken } = useRefreshTokenQuery()

    const fetchUser = async () => {
        const { data, isError } = await refetchUser()
        if (!isError) {
            dispatch(addUser(data as unknown as UserI))
            login()
        } else {
            dispatch(deleteUser())
            logout()
            navigate(paths.Auth)
        }
    }

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { paths } = useRoutes()

    const auth = async () => {

        await fetchUser()

        // const accessToken = localStorage.getItem('access_token');

        // if (accessToken && accessToken.trim() !== ''){
        //     login()
        // }

        // if (inStatus(AuthStatus.Authenticated)) {
        //     navigate(paths.UserProfile);
        // }
    }

    const refresh = async () => {
        const { data } = await refetchToken()

        if (data) {
            const { access_token, token_type } = data as { access_token: string; token_type: string }
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('token_type', token_type)
        }
    }
    

    useEffect(() => {
        setInitializing()
        refresh()
        auth()
        
        const interval = setInterval(() => {
            refresh();
          }, 14 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [])

    const value: AuthContextProps = {
        initializing: inStatus(AuthStatus.Initializing),
        authenticated: inStatus(AuthStatus.Authenticated),
        unauthenticated: inStatus(AuthStatus.UnAuthenticated),
        login,
        logout,
        fetchUser,
        setInitializing,
        auth,
        refresh,
    }

    return <Provider value={value}>{children}</Provider>
}

const useAuth = (): AuthContextProps => {
    return useContext(AuthContext)
}

export { AuthProvider, AuthContext, useAuth }
