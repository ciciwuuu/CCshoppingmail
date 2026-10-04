# CCshoppingmail — Admin + Customer Store

## What this project does
- Customer site: `/`
- Private admin site: `/admin.html`
- Shared Supabase database
- Real-time product updates on the customer site
- Admin login via Supabase Auth
- Product create/edit/delete
- Order list for authenticated admins
- Cart stored in the browser
- Responsive design

## Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase.sql`.
3. In Supabase Authentication, create your private admin user.
4. Copy `.env.example` to `.env.local`.
5. Add the Supabase Project URL and anon key.
6. Run `npm install`.
7. Run `npm run dev`.
8. Deploy the project to a static host such as Vercel/Netlify.

## Two links after deployment
Customer: `https://YOUR-DOMAIN.com/`
Admin: `https://YOUR-DOMAIN.com/admin.html`

Only the authenticated Supabase admin account should be able to edit products/orders.

IMPORTANT
The current checkout creates a database order but DOES NOT process real card payments. Before accepting real payments, connect a proper payment provider and secure the order/payment flow on a server-side backend.


Store brand: CCshoppingmail
