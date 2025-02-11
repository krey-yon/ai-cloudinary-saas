import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    '/sign-in',
    '/sign-up',
    '/',
    'home',
])

const isPublicApi = createRouteMatcher([
    '/api/videos',
    '/api/image-upload',
])

export default clerkMiddleware( async (auth, req) => {
    const {userId} = await auth()
    const currentUrl = new URL(req.url)
    const isHomePage = currentUrl.pathname === '/home'
    const isApiRequest = currentUrl.pathname.startsWith('/api')

    if( userId && isPublicRoute(req) && !isHomePage ){
        return NextResponse.redirect(new URL('/home', req.url))
    }

    //not logged in
    if(!userId){
        //if user is not logged in and trying to access a private route
        if(!isPublicRoute && !isApiRequest){
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }
        //if the req is for a protect api route  and user is not logged in
        if(isApiRequest && !isPublicApi(req)){
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }
    }
    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}