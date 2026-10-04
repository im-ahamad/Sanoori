"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Package,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import type { AdminProductImage } from "@/lib/admin/product-images";
import {
  attachImageAction,
  deleteImageAction,
  getSignedUploadParamsAction,
  reorderImagesAction,
  updateImageAltAction,
} from "@/lib/actions/product-images";
import {
  IMAGE_ACCEPTED_MIME,
  IMAGE_MAX_PER_PRODUCT,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_MB,
} from "@/lib/validators/product-images";
import { productImageThumb } from "@/lib/cloudinary-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

interface UploadEntry {
  localKey: string;
  name: string;
  size: number;
  status: "signing" | "uploading" | "saving" | "done" | "error";
  progress: number;
  error?: string;
}

interface ProductImageManagerProps {
  productId: string;
  productName: string;
  initialImages: AdminProductImage[];
  maxImages?: number;
}

export function ProductImageManager({
  productId,
  productName,
  initialImages,
  maxImages = IMAGE_MAX_PER_PRODUCT,
}: ProductImageManagerProps) {
  const t = useAdminTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploads, setUploads] = useState<Record<string, UploadEntry>>({});
  const [notice, setNotice] = useState<{ kind: "error"; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductImage | null>(null);
  const [altValues, setAltValues] = useState<Record<string, string>>({});
  const [savingAltIds, setSavingAltIds] = useState<Record<string, boolean>>({});
  const [dragActive, setDragActive] = useState(false);

  const images = initialImages;
  const activeUploads = Object.values(uploads).filter(
    (entry) => entry.status !== "error"
  );
  const atLimit = images.length >= maxImages;

  const addEntries = (entries: UploadEntry[]) => {
    setUploads((prev) => {
      const next = { ...prev };
      for (const entry of entries) next[entry.localKey] = entry;
      return next;
    });
  };

  const patchEntry = (localKey: string, patch: Partial<UploadEntry>) => {
    setUploads((prev) => {
      const current = prev[localKey];
      if (!current) return prev;
      return { ...prev, [localKey]: { ...current, ...patch } };
    });
  };

  const removeEntry = (localKey: string) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[localKey];
      return next;
    });
  };

  async function uploadFile(file: File, localKey: string) {
    const signed = await getSignedUploadParamsAction({
      productId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type as (typeof IMAGE_ACCEPTED_MIME)[number],
    });
    if (!signed.ok) {
      patchEntry(localKey, { status: "error", error: signed.error });
      return;
    }

    const form = new FormData();
    for (const [key, value] of Object.entries(signed.data.params)) {
      form.append(key, String(value));
    }
    form.append("signature", signed.data.signature);
    form.append("file", file);

    const uploaded = await new Promise<{ ok: true; publicId: string } | { ok: false; error: string }>(
      (resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            patchEntry(localKey, {
              status: "uploading",
              progress: Math.min(95, Math.round((event.loaded / event.total) * 100)),
            });
          }
        });
        xhr.addEventListener("load", () => {
          let body: { public_id?: string; error?: { message?: string } } | null = null;
          try {
            body = JSON.parse(xhr.responseText ?? "");
          } catch {
            body = null;
          }
          if (xhr.status >= 200 && xhr.status < 300 && body?.public_id) {
            resolve({ ok: true, publicId: body.public_id });
          } else {
            resolve({
              ok: false,
              error: body?.error?.message ?? t.common.uploadError,
            });
          }
        });
        xhr.addEventListener("error", () =>
          resolve({ ok: false, error: t.common.uploadError })
        );
        xhr.open("POST", signed.data.endpoint);
        xhr.send(form);
      }
    );

    if (!uploaded.ok) {
      patchEntry(localKey, { status: "error", error: uploaded.error });
      return;
    }

    patchEntry(localKey, { status: "saving", progress: 100 });
    const attached = await attachImageAction({
      productId,
      publicId: uploaded.publicId,
    });
    if (!attached.ok) {
      patchEntry(localKey, { status: "error", error: attached.error });
      return;
    }

    patchEntry(localKey, { status: "done", progress: 100 });
    router.refresh();
    removeEntry(localKey);
  }

  const handleFiles = (fileList: FileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setNotice(null);

    const remaining = Math.max(0, maxImages - images.length - activeUploads.length);
    const accepted = files.slice(0, remaining);
    const excess = files.slice(remaining);

    for (const file of accepted) {
      const localKey = `${file.name}-${file.size}-${crypto.randomUUID()}`;
      const invalid = validateFile(file);
      if (invalid) {
        addEntries([
          { localKey, name: file.name, size: file.size, status: "error", progress: 0, error: invalid },
        ]);
        continue;
      }
      addEntries([
        { localKey, name: file.name, size: file.size, status: "signing", progress: 0 },
      ]);
      void uploadFile(file, localKey);
    }

    const excessErrors: string[] = [];
    if (excess.length > 0) {
      excessErrors.push(
        t.common.maxImages.replace("{max}", String(maxImages)) + ` ${excess.length} file${excess.length === 1 ? "" : "s"} ${t.common.filesSkipped}.`
      );
      for (const file of excess) {
        addEntries([
          {
            localKey: `${file.name}-${file.size}-${crypto.randomUUID()}-x`,
            name: file.name,
            size: file.size,
            status: "error",
            progress: 0,
            error:
              images.length + activeUploads.length >= maxImages
                ? t.common.limitReached.replace("{max}", String(maxImages))
                : excessErrors[0],
          },
        ]);
      }
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];

    startTransition(async () => {
      const result = await reorderImagesAction({
        productId,
        orderedIds: next.map((image) => image.id),
      });
      if (result.ok) {
        setNotice(null);
        router.refresh();
      } else {
        setNotice({ kind: "error", message: result.error });
      }
    });
  };

  const saveAlt = (imageId: string, value: string) => {
    const alt = value.trim();
    setSavingAltIds((prev) => ({ ...prev, [imageId]: true }));
    startTransition(async () => {
      const result = await updateImageAltAction({ imageId, alt });
      setSavingAltIds((prev) => {
        const next = { ...prev };
        delete next[imageId];
        return next;
      });
      if (result.ok) {
        setNotice(null);
        router.refresh();
      } else {
        setNotice({ kind: "error", message: result.error });
      }
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const result = await deleteImageAction({
        productId,
        imageId: target.id,
      });
      setDeleteTarget(null);
      if (result.ok) {
        setNotice(null);
        router.refresh();
      } else {
        setNotice({ kind: "error", message: result.error });
      }
    });
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    if (atLimit) return;
    if (event.dataTransfer.files) handleFiles(event.dataTransfer.files);
  };

  function validateFile(file: File): string | null {
    if (!(IMAGE_ACCEPTED_MIME as readonly string[]).includes(file.type)) {
      return t.common.onlyImagesAllowed;
    }
    if (file.size > IMAGE_MAX_SIZE_BYTES) {
      return t.common.maxSize.replace("{size}", String(IMAGE_MAX_SIZE_MB));
    }
    return null;
  }

  const statusLabel = {
    signing: t.common.preparing,
    uploading: t.common.uploading,
    saving: t.common.savingAlt,
    done: t.common.imageAdded,
    error: t.common.error,
  } as const;

  return (
    <div className="space-y-4">
      {notice ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          {notice.message}
        </p>
      ) : null}

      {/* Upload drop zone */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!atLimit) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            if (event.target.files) handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={atLimit || isPending}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex w-full items-center gap-4 rounded-lg border border-dashed bg-muted/30 p-4 text-left transition-colors outline-none",
            "hover:border-gold/60 hover:bg-muted/40 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/30",
            dragActive && "border-gold bg-gold/10",
            (atLimit || isPending) && "cursor-not-allowed opacity-60"
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-gold-text">
            <Upload className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">
              {atLimit ? t.common.imageLimitReached : t.common.addProductImages}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {atLimit
                ? t.common.maxImages.replace("{max}", String(maxImages)) + `. ${t.common.addProductImages}.`
                : t.common.dropImagesHint
                    .replace("{size}", String(IMAGE_MAX_SIZE_MB))
                    .replace("{max}", String(maxImages))}
            </span>
          </span>
          {!atLimit && !isPending ? (
            <span className="ml-auto shrink-0 cursor-pointer rounded-lg border border-border bg-background px-2.5 py-1 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:bg-muted sm:hidden">
              Browse
            </span>
          ) : null}
        </button>
      </div>

      {/* Active uploads */}
      {activeUploads.length > 0 ? (
        <ul className="space-y-2">
          {activeUploads.map((entry) => (
            <li
              key={entry.localKey}
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
            >
              {entry.status === "error" ? (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  <TriangleAlert className="size-4" aria-hidden="true" />
                </span>
              ) : entry.status === "done" ? (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-600/10 text-emerald-600">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                </span>
              ) : (
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium text-foreground">{entry.name}</p>
                  <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {entry.status === "uploading"
                      ? `${entry.progress}%`
                      : statusLabel[entry.status]}
                  </p>
                </div>
                {entry.status === "uploading" ? (
                  <div
                    role="progressbar"
                    aria-label={`Uploading ${entry.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={entry.progress}
                    className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-gold transition-[width] duration-150"
                      style={{ width: `${entry.progress}%` }}
                    />
                  </div>
                ) : null}
                {entry.status === "error" ? (
                  <p role="alert" className="text-xs text-destructive">
                    {entry.error}
                  </p>
                ) : null}
              </div>
              {entry.status === "error" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground"
                  onClick={() => removeEntry(entry.localKey)}
                  aria-label={t.common.dismissError}
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Existing images */}
      {images.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Package className="size-4" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted-foreground">
            {t.common.noImagesYet.replace("{name}", productName)}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {images.map((image, index) => {
            const altValue = altValues[image.id] ?? image.alt ?? "";
            return (
              <li
                key={image.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  {image.publicId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={productImageThumb(image.url, 160)}
                      alt={image.alt ?? `${productName} image ${index + 1}`}
                      width={80}
                      height={80}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="size-5" aria-hidden="true" />
                    </span>
                  )}
                  {image.sortOrder === 0 ? (
                    <span className="absolute left-1 top-1 rounded-md bg-foreground px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-background">
                      {t.common.primaryLabel}
                    </span>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <Label htmlFor={`image-alt-${image.id}`}>
                    {t.common.imageAltLabel.replace("{index}", String(index + 1))}
                  </Label>
                  <Input
                    id={`image-alt-${image.id}`}
                    value={altValue}
                    maxLength={200}
                    placeholder={t.common.imageAltPlaceholder}
                    disabled={Boolean(savingAltIds[image.id])}
                    onChange={(event) =>
                      setAltValues((prev) => ({
                        ...prev,
                        [image.id]: event.target.value,
                      }))
                    }
                    onBlur={(event) => {
                      if ((event.target.value.trim() ?? "") !== (image.alt ?? "")) {
                        saveAlt(image.id, event.target.value);
                      }
                    }}
                    aria-describedby={`image-alt-hint-${image.id}`}
                  />
                  <p
                    id={`image-alt-hint-${image.id}`}
                    className="text-xs text-muted-foreground"
                  >
                    {savingAltIds[image.id]
                      ? t.common.savingAlt
                      : t.common.altTextHint}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 sm:flex-col">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending || index === 0}
                    onClick={() => moveImage(index, -1)}
                    aria-label={t.common.moveImageEarlier}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending || index === images.length - 1}
                    onClick={() => moveImage(index, 1)}
                    aria-label={t.common.moveImageLater}
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    disabled={isPending}
                    onClick={() => setDeleteTarget(image)}
                    aria-label={`Delete image ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        {deleteTarget ? (
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <TriangleAlert className="size-6 text-destructive" aria-hidden="true" />
              </AlertDialogMedia>
              <AlertDialogTitle>{t.common.deleteImageConfirm}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.common.deleteImageDesc.replace("{name}", productName)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>{t.common.cancel}</AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={confirmDelete}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Deleting…
                  </>
                ) : (
                  t.common.deleteImageAction
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </div>
  );
}