"use client";

import { Suspense } from "react";
// import { ErrorPageContent } from "./ErrorPageContent";
import { ErrorPageContent } from "@/components/errors/ErrorPageContent";

export default function ErrorPageWrapper() {
  return (
    <Suspense fallback={<div>Loading error details...</div>}>
      <ErrorPageContent />
    </Suspense>
  );
}
