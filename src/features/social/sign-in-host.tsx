"use client";

import dynamic from "next/dynamic";
import * as React from "react";

import { useSocial } from "./provider";

const SignInDialog = dynamic(() => import("./sign-in-dialog"), { ssr: false });

/**
 * Loads the sign-in dialog the first time a member action asks for it, then keeps
 * it mounted; pages that never ask for sign-in never download it.
 */
export function SignInHost() {
  const { signInOpen } = useSocial();
  const [used, setUsed] = React.useState(false);
  if (signInOpen && !used) setUsed(true);
  return used ? <SignInDialog /> : null;
}
