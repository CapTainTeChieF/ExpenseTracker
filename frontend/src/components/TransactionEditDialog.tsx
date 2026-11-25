
import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

type Kind = 'INCOME' | 'EXPENSE';

type Category = {
  id: string;
  name: string;
  kind: Kind;
};

export type TransactionEditDraft = {
  kind: Kind;
  amount: string;
  transactionDate: string;
  description: string;
  categoryId: string | null;
};

type Props = {
  initial: TransactionEditDraft;
  categories: Category[];
  onSave: (draft: TransactionEditDraft) => Promise<void>;
  onClose: () => void;
};

export default function TransactionEditDialog({
  initial,
  categories,
  onSave,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const kindCategories = categories.filter(
    category => category.kind === draft.kind,
  );

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousGutter = root.style.scrollbarGutter;

    root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';

    dialog.showModal();

    return () => {
      root.style.overflow = previousOverflow;
      root.style.scrollbarGutter = previousGutter;

      if (dialog.open) dialog.close();

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  function changeKind(kind: Kind) {
    setDraft(current => ({
      ...current,
      kind,
      categoryId:
        current.kind === kind ? current.categoryId : null,
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError('');
    setSaving(true);

    try {
      await onSave(draft);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to update transaction.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="edit-transaction-title"
      onCancel={event => {
        event.preventDefault();
        if (!saving) onClose();
      }}
      className="fixed inset-0 m-auto w-11/12 max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl backdrop:bg-slate-900/50"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2
          id="edit-transaction-title"
          className="text-xl font-bold text-slate-900"
        >
          Edit Transaction
        </h2>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close edit dialog"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={saving} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={draft.kind === 'EXPENSE'}
              onClick={() => changeKind('EXPENSE')}
              className={`rounded-xl border py-2.5 text-sm font-bold ${
                draft.kind === 'EXPENSE'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              Expense
            </button>

            <button
              type="button"
              aria-pressed={draft.kind === 'INCOME'}
              onClick={() => changeKind('INCOME')}
              className={`rounded-xl border py-2.5 text-sm font-bold ${
                draft.kind === 'INCOME'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              Income
            </button>
          </div>

          <label className="block text-sm font-semibold">
            Amount (BDT)
            <input
              required
              type="text"
              inputMode="decimal"
              value={draft.amount}
              onChange={e =>
                setDraft(current => ({
                  ...current,
                  amount: e.target.value,
                }))
              }
              placeholder="0.00"
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3"
            />
          </label>

          <label className="block text-sm font-semibold">
            Category
            <select
              value={draft.categoryId ?? ''}
              onChange={e =>
                setDraft(current => ({
                  ...current,
                  categoryId: e.target.value || null,
                }))
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3"
            >
              <option value="">Uncategorized</option>

              {kindCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold">
            Date
            <input
              required
              type="date"
              value={draft.transactionDate}
              onChange={e =>
                setDraft(current => ({
                  ...current,
                  transactionDate: e.target.value,
                }))
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3"
            />
          </label>

          <label className="block text-sm font-semibold">
            Description
            <textarea
              rows={2}
              maxLength={250}
              value={draft.description}
              onChange={e =>
                setDraft(current => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              placeholder="e.g. Lunch, Bus Fare"
              className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 p-3"
            />
          </label>
        </fieldset>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
