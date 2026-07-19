"use client";

import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "@/app/config/contracts";

export function useIsAdmin() {
  const { address, isConnected } = useAccount();

  const { data: admin } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "admin",
  });

  const isAdmin =
    isConnected &&
    !!address &&
    !!admin &&
    address.toLowerCase() === (admin as string).toLowerCase();

  return { isAdmin };
}