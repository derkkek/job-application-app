'use client';

import { Button as ShadcnButton } from "./button";

export function Button(props: React.ComponentProps<typeof ShadcnButton>) {
  return <ShadcnButton {...props} />;
}