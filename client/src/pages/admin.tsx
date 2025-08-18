import { Redirect } from "wouter";

export default function AdminRedirect() {
  // Redirect to the full admin dashboard
  return <Redirect to="/admin/dashboard" />;
}