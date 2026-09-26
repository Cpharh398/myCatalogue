import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("myworkspace", "routes/myworkspace.tsx"),
  route("editor", "routes/editor.tsx"),
] satisfies RouteConfig;
