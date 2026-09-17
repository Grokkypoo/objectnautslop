import { createFileRoute } from "@tanstack/react-router";
import { ObjectnautApp } from "@/components/objectnaut-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ObjectnautApp />;
}
