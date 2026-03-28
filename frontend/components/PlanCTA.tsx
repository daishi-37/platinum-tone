"use client";
import { useAuth } from "@/lib/auth-context";

export default function PlanCTA() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user
    ? <a href="/dashboard" className="btn-primary block text-center">マイページ</a>
    : <a href="/register" className="btn-primary block text-center">今すぐ始める</a>;
}
