import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("admin", "routes/admin.tsx"),
  route("api/inventory", "routes/api.inventory.ts"),
  route("api/logs", "routes/api.logs.ts"),
  route("api/simulation", "routes/api.simulation.ts"),
] satisfies RouteConfig;