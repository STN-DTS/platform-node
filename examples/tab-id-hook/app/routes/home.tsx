import { Link } from "react-router";
import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="p-4">
      <Welcome />
      <div className="mt-8 text-center">
        <Link
          to="/demo"
          className="text-blue-600 hover:underline text-lg font-semibold"
        >
          View Tab ID Session Demo
        </Link>
      </div>
    </div>
  );
}
