/**
 * React Router v7 proxy.
 *
 * This project aliases "react-router-dom" to this file.
 * IMPORTANT: Do NOT import from "react-router-dom" here, because the alias would
 * point back to this file and create a circular export with missing symbols.
 *
 * Instead, re-export from "react-router" (and optionally DOM-specific exports).
 */
export * from "react-router";

// Optional: expose DOM-enhanced versions under explicit names (no conflicts)
export { RouterProvider as DomRouterProvider, HydratedRouter as DomHydratedRouter } from "react-router/dom";
