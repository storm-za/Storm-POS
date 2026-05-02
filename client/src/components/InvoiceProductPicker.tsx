import { useState, useRef, useEffect, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MagnifyingGlass as Search, Package, Plus, Tag } from "@phosphor-icons/react";

interface Product {
  id: number;
  name: string;
  sku?: string | null;
  retailPrice: string;
  tradePrice?: string | null;
  categoryId?: number | null;
}

interface Category {
  id: number;
  name: string;
}

interface InvoiceProductPickerProps {
  products: Product[];
  categories: Category[];
  onSelect: (product: Product, price: number, priceMode: "retail" | "trade") => void;
  placeholder?: string;
  triggerLabel?: string;
  labelAll?: string;
  labelRetail?: string;
  labelTrade?: string;
  labelNoProducts?: string;
}

export function InvoiceProductPicker({
  products,
  categories,
  onSelect,
  placeholder = "Search by name or SKU…",
  triggerLabel = "Add product from inventory",
  labelAll = "All",
  labelRetail = "Retail",
  labelTrade = "Trade",
  labelNoProducts = "No products found",
}: InvoiceProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [priceMode, setPriceMode] = useState<"retail" | "trade">("retail");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const categoryRowRef = useRef<HTMLDivElement>(null);
  const lastNavSourceRef = useRef<"keyboard" | "init">("init");

  const hasTrade = products.some(
    (p) => p.tradePrice && parseFloat(p.tradePrice) > 0
  );

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === null || p.categoryId === categoryFilter;
    const q = search.toLowerCase();
    return (
      matchCat &&
      (!q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q))
    );
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      setCategoryFilter(null);
      setActiveIndex(0);
    }
  };

  const handleSelect = useCallback(
    (product: Product) => {
      const price =
        priceMode === "trade" &&
        product.tradePrice &&
        parseFloat(product.tradePrice) > 0
          ? parseFloat(product.tradePrice)
          : parseFloat(product.retailPrice);
      onSelect(product, price, priceMode);
      setOpen(false);
      setSearch("");
      setCategoryFilter(null);
      setActiveIndex(0);
    },
    [onSelect, priceMode]
  );

  useEffect(() => {
    if (!open || !listRef.current) return;
    if (lastNavSourceRef.current !== "keyboard") return;
    const items = listRef.current.querySelectorAll<HTMLElement>("[data-item]");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      lastNavSourceRef.current = "keyboard";
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      lastNavSourceRef.current = "keyboard";
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) handleSelect(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  // Translate vertical wheel into horizontal scroll for the category pill row.
  useEffect(() => {
    const el = categoryRowRef.current;
    if (!el || !open) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      const dir = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (dir === 0) return;
      el.scrollLeft += dir;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open, categories.length]);

  const cat = (id: number | null | undefined) =>
    id ? categories.find((c) => c.id === id) : null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[hsl(217,90%,40%)] hover:text-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,97%)] focus:outline-none focus:ring-2 focus:ring-[hsl(217,90%,40%)] transition-colors"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>{triggerLabel}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="p-0 w-[min(560px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 shadow-2xl"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        {/* Search bar */}
        <div className="p-3 border-b bg-gray-50 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(217,90%,40%)] bg-white"
            />
          </div>

          {hasTrade && (
            <div className="flex bg-white border rounded-lg p-0.5 gap-0.5">
              {(["retail", "trade"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPriceMode(mode);
                    setActiveIndex(0);
                  }}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                    priceMode === mode
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {mode === "retail" ? labelRetail : labelTrade}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div
            ref={categoryRowRef}
            className="flex gap-1.5 px-3 py-2 border-b overflow-x-auto bg-white"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
          >
            <button
              type="button"
              onClick={() => { setCategoryFilter(null); setActiveIndex(0); }}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === null
                  ? "bg-[hsl(217,90%,40%)] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {labelAll}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setCategoryFilter(c.id); setActiveIndex(0); }}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === c.id
                    ? "bg-[hsl(217,90%,40%)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Product list */}
        <div
          ref={listRef}
          className="overflow-y-auto overscroll-contain"
          style={{ maxHeight: 320, WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          onWheelCapture={(e) => { e.stopPropagation(); }}
          onTouchMoveCapture={(e) => { e.stopPropagation(); }}
        >
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
              <Package className="w-8 h-8 text-gray-200" />
              {labelNoProducts}
            </div>
          ) : (
            filtered.map((product, i) => {
              const price =
                priceMode === "trade" &&
                product.tradePrice &&
                parseFloat(product.tradePrice) > 0
                  ? parseFloat(product.tradePrice)
                  : parseFloat(product.retailPrice);
              const productCat = cat(product.categoryId);
              const isActive = i === activeIndex;

              return (
                <button
                  key={product.id}
                  data-item
                  type="button"
                  onClick={() => handleSelect(product)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b last:border-b-0 text-left transition-colors ${
                    isActive
                      ? "bg-[hsl(217,90%,97%)]"
                      : "hover:bg-[hsl(217,90%,98%)]"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[hsl(217,90%,40%)]/10 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {product.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {product.sku && (
                        <span className="text-xs text-gray-400 font-mono">
                          {product.sku}
                        </span>
                      )}
                      {productCat && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                          <Tag className="w-3 h-3" />
                          {productCat.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-[hsl(217,90%,40%)]">
                      R{price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {priceMode === "retail" ? labelRetail : labelTrade}
                    </div>
                  </div>

                  <Plus className="w-4 h-4 text-[hsl(217,90%,40%)] shrink-0 opacity-40" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-gray-50 flex items-center gap-3 text-xs text-gray-400">
          <span><kbd className="font-mono bg-white border rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-white border rounded px-1">↵</kbd> select</span>
          <span><kbd className="font-mono bg-white border rounded px-1">Esc</kbd> close</span>
          <span className="ml-auto">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
