# Backend moved

The Express API and its single Better Auth configuration now live in
`../../slicehub-server`.

Run it from this directory with `npm run dev` (the scripts delegate to the
canonical server). Do not add a second `auth.ts`, `.env`, or Express app here.
