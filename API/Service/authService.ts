import 'dotenv/config';
import { prisma } from '../utils/prisma'

interface GitHubTokenResponse {
    access_token: string
    token_type: string
    scope: string
}

interface GitHubUser {
    login: string
    id: number
    email: string | null
    name: string | null
    avatar_url: string | null
}

export const getAuth = async (code: string): Promise<string> => {
    const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code
            })
        }
    )

    const data: GitHubTokenResponse = await response.json()

    if (!data.access_token) {
        throw new Error("Failed to get access token from GitHub")
    }

    return data.access_token
}

export const getGitHubUser = async (accessToken: string): Promise<GitHubUser> => {
    const response = await fetch("https://api.github.com/user", {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json",
        }
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch GitHub user: ${response.statusText}`)
    }

    const userData: GitHubUser = await response.json()

    if (!userData.email) {
        const emailResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json",
            }
        })

        if (emailResponse.ok) {
            const emails = await emailResponse.json()
            const primaryEmail = emails.find((email: any) => email.primary)
            userData.email = primaryEmail?.email || null
        }
    }

    return userData
}

export const findOrCreateUser = async (githubData: GitHubUser, githubToken: string) => {
    if (!githubData.email) {
        throw new Error("GitHub email is required but was not provided")
    }

    let user = await prisma.users.findFirst({
        where: {
            OR: [
                { github_username: githubData.login },
                { email: githubData.email }
            ]
        }
    })

    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 8)
    if (user) {
        user = await prisma.users.update({
            where: { id: user.id },
            data: {
                github_access_token: githubToken,
                github_token_expires_at: tokenExpiry,
                name: githubData.name || user.name,
                avatar_url: githubData.avatar_url || user.avatar_url,
                updated_at: new Date(),
            }
        })
    } else {
        user = await prisma.users.create({
            data: {
                email: githubData.email,
                github_username: githubData.login,
                github_access_token: githubToken,
                github_token_expires_at: tokenExpiry,
                name: githubData.name,
                avatar_url: githubData.avatar_url,
            }
        })
    }

    return user
}