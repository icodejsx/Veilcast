"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MARKET_ABI } from "@/app/config/contracts";

export function ResolvePanel({
  marketAddress,
  endTime,
  resolved,
  outcome,
  onUpdate,
}: {
  marketAddress: `0x${string}`;
  endTime: bigint;
  resolved: boolean;
  outcome: boolean;
  onUpdate: () => void;
}) {
  const { address } = useAccount();

  const { data: owner } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: "owner",
  });

  const { data: userBets, refetch: refetchBets } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: "getUserBets",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) {
    onUpdate();
    refetchBets();
  }

  const isOwner =
    address && owner && address.toLowerCase() === (owner as string).toLowerCase();
  // eslint-disable-next-line react-hooks/purity
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const ended = endTime > 0n && nowSec >= endTime;

  const bets = userBets as [bigint, bigint, boolean] | undefined;
  const yesBet = bets?.[0] ?? 0n;
  const noBet = bets?.[1] ?? 0n;
  const claimed = bets?.[2] ?? false;

  const userWon =
    resolved && ((outcome && yesBet > 0n) || (!outcome && noBet > 0n));

  function resolveMarket(result: boolean) {
    writeContract({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "resolve",
      args: [result],
    });
  }

  function claimWinnings() {
    writeContract({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "claim",
    });
  }

  // Nothing to show while betting is open
  if (!ended && !resolved) return null;

  return (
    <div className="px-5 pb-5">
      <div className="border-t border-border-subtle pt-5">
        {resolved ? (
          userWon && !claimed ? (
            <>
              <div className="font-mono-nums text-[11px] tracking-wider text-yes mb-3">
                YOU WON
              </div>
              <button
                onClick={claimWinnings}
                disabled={isPending}
                className="w-full py-3 rounded-lg bg-yes hover:bg-yes/90 text-white text-[13px] font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? "Claiming…" : "Claim winnings"}
              </button>
            </>
          ) : claimed ? (
            <div className="text-center py-2.5 text-[11px] text-yes">
              Winnings claimed
            </div>
          ) : yesBet > 0n || noBet > 0n ? (
            <div className="text-center py-2.5 text-[11px] text-muted">
              Your side didn&apos;t win
            </div>
          ) : null
        ) : isOwner ? (
          <>
            <div className="font-mono-nums text-[11px] tracking-wider text-muted mb-3">
              RESOLVE · OWNER
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => resolveMarket(true)}
                disabled={isPending}
                className="py-2.5 rounded-lg bg-yes hover:bg-yes/90 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                Yes won
              </button>
              <button
                onClick={() => resolveMarket(false)}
                disabled={isPending}
                className="py-2.5 rounded-lg bg-no hover:bg-no/90 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                No won
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}