export {};

declare global {
  // Shape of the custom claims added to the Clerk session token (Clerk
  // Dashboard → Sessions → Customize session token):
  //   { "app_metadata": { "role": "{{user.public_metadata.role}}" } }
  // Supabase RLS reads the same claim via auth.jwt() -> 'app_metadata'.
  interface CustomJwtSessionClaims {
    app_metadata?: { role?: "admin" | "owner" };
  }

  // Captured on the signup form and copied into public.users on first
  // sign-in (lib/auth/profile.ts).
  interface UserUnsafeMetadata {
    name?: string;
    language?: "ar" | "en";
  }

  interface UserPublicMetadata {
    role?: "admin" | "owner";
  }
}
