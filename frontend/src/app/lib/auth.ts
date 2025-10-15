export default function githubLogin() {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI
  const scope = "user:email"
  
  if (clientId && redirectUri) {   
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`
    }
} 