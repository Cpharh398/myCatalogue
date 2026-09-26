import { Canvas } from "../welcome/welcome";

export function meta() {
  return [
    { title: "Website editor · myCatalogue" },
    { name: "description", content: "Build a storefront with myCatalogue." },
  ];
}

export default function Editor() {
  return <Canvas />;
}
