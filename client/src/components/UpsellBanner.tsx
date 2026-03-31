import { useState } from "react";
import { X, TrendingDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userId: number;
  userEmail: string;
  planSavingAmount: number;
  language?: string;
  onSwitched?: (updatedUser: Record<string, unknown>) => void;
}

const LABELS = {
  en: {
    banner: (amt: string) => `Switch to flat plan and save R${amt} this month!`,
    switch: "Switch Now",
    dismiss: "Dismiss",
    switching: "Switching...",
    successTitle: "Plan switched!",
    successDesc: "You are now on the flat R1.00 per sale plan.",
    errorDesc: "Failed to switch plan. Please try again.",
  },
  af: {
    banner: (amt: string) => `Skakel na plat plan en bespaar R${amt} hierdie maand!`,
    switch: "Skakel Nou",
    dismiss: "Sluit",
    switching: "Besig...",
    successTitle: "Plan geskakel!",
    successDesc: "Jy is nou op die plat R1.00-per-verkoop-plan.",
    errorDesc: "Kon nie plan skakel nie. Probeer asseblief weer.",
  },
} as const;

type Lang = keyof typeof LABELS;

export default function UpsellBanner({ userId, userEmail, planSavingAmount, language = 'en', onSwitched }: Props) {
  const lang: Lang = language === 'af' ? 'af' : 'en';
  const L = LABELS[lang];
  const dismissKey = `upsell_dismissed_${userId}`;
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(dismissKey) === '1');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const switchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/pos/user/${userId}/upgrade-plan`, { userEmail });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: L.successTitle, description: L.successDesc });
      if (data.user) {
        localStorage.setItem('posUser', JSON.stringify(data.user));
        onSwitched?.(data.user);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/pos/user"] });
      setDismissed(true);
    },
    onError: () => {
      toast({ title: "Error", description: L.errorDesc, variant: "destructive" });
    },
  });

  const handleDismiss = () => {
    sessionStorage.setItem(dismissKey, '1');
    setDismissed(true);
  };

  if (dismissed || planSavingAmount <= 0) return null;

  const savingStr = planSavingAmount.toFixed(2);

  return (
    <div className="w-full bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium min-w-0">
        <TrendingDown className="h-4 w-4 shrink-0 text-green-300" />
        <span className="truncate">{L.banner(savingStr)}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => switchMutation.mutate()}
          disabled={switchMutation.isPending}
          className="text-xs font-bold bg-white text-[hsl(217,90%,40%)] px-3 py-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-60"
        >
          {switchMutation.isPending ? L.switching : L.switch}
        </button>
        <button
          onClick={handleDismiss}
          className="text-white/70 hover:text-white transition-colors p-0.5 rounded"
          aria-label={L.dismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
