import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/new/:path*", "/task/:path*", "/tasks/:path*", "/settings/:path*"],
};
