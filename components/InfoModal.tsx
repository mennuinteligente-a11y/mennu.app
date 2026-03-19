import React, { ReactNode, useEffect } from "react";

export type InfoModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  onClose: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
};

export default function InfoModal({
  open,
  title,
  description,
  children,
  onClose,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel = "Fechar",
  onSecondaryAction,
}: InfoModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="info-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400 px-6 py-6 text-white">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <span className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                MENNU
              </span>
              <h2
                id="info-modal-title"
                className="text-2xl font-bold tracking-tight"
              >
                {title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl font-medium text-white transition hover:bg-white/25"
              aria-label="Fechar modal"
            >
              ×
            </button>
          </div>

          {description ? (
            <p className="max-w-md text-sm leading-6 text-white/90">
              {description}
            </p>
          ) : null}
        </div>

        <div className="space-y-5 px-6 py-6 text-slate-700">
          {children ? (
            children
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              Aqui você pode mostrar explicações sobre custos, regras de geração,
              ajuda rápida ou qualquer detalhe importante do sistema.
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onSecondaryAction || onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {secondaryActionLabel}
            </button>

            {primaryActionLabel && onPrimaryAction ? (
              <button
                type="button"
                onClick={onPrimaryAction}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(34,197,94,0.28)] transition hover:brightness-105"
              >
                {primaryActionLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
