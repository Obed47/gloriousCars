"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff, ImagePlus, Loader2, Plus, Star, Trash2 } from "lucide-react";
import {
  IMAGE_ACCEPT,
  discardUploadedImage,
  uploadVehicleImage,
} from "@/lib/admin/imageUpload";
import { IMAGE_ANGLES, type ImageDraft } from "@/lib/admin/vehicleForm";

const control =
  "h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15";

type Row = ImageDraft & {
  key: number;
  status: "ready" | "uploading" | "error";
  error?: string;
  /** Set for files uploaded in this session, so removing the row can delete them. */
  uploadedPath?: string;
  fileName?: string;
};

function Thumb({ url }: { url: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="grid h-14 w-18 shrink-0 place-items-center overflow-hidden rounded-md bg-mist text-muted">
      {url && !broken ? (
        // Plain <img>: this is an admin preview, not the optimised public image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
      ) : (
        <ImageOff className="size-5" aria-hidden />
      )}
    </div>
  );
}

/**
 * Photo list for the vehicle form. Photos are uploaded from the device
 * straight to Supabase Storage, or added by link. Only the `image_url`,
 * `image_alt` and `image_angle` inputs are submitted with the form; the file
 * picker has no `name`, so no file bytes are posted. Inputs are controlled so
 * typed values survive the form reset React performs after an action.
 */
export function ImagesField({
  initial,
  error,
  onBusyChange,
}: {
  initial: ImageDraft[];
  error?: string;
  onBusyChange: (busy: boolean) => void;
}) {
  const nextKey = useRef(initial.length);
  const [dragging, setDragging] = useState(false);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((r, i) => ({ ...r, key: i, status: "ready" })),
  );

  const busy = rows.some((r) => r.status === "uploading");
  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);

  const update = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    // Show a row per file straight away, replacing the empty starter row.
    const reserved = list.map((file) => ({ key: nextKey.current++, file }));
    setRows((rs) => [
      ...rs.filter((r) => !(r.status === "ready" && !r.url && !r.alt)),
      ...reserved.map(({ key, file }): Row => ({
        key,
        url: "",
        alt: "",
        angle: "Exterior",
        status: "uploading",
        fileName: file.name,
      })),
    ]);

    for (const { key, file } of reserved) {
      try {
        const { url, path } = await uploadVehicleImage(file);
        update(key, { url, uploadedPath: path, status: "ready" });
      } catch (err) {
        update(key, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed.",
        });
      }
    }
  }

  function removeRow(row: Row) {
    if (row.uploadedPath) void discardUploadedImage(row.uploadedPath);
    setRows((rs) => rs.filter((r) => r.key !== row.key));
  }

  function makeCover(key: number) {
    setRows((rs) => {
      const row = rs.find((r) => r.key === key);
      return row ? [row, ...rs.filter((r) => r.key !== key)] : rs;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-within:ring-4 focus-within:ring-accent/15 ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-line-strong bg-mist hover:border-accent"
        }`}
      >
        <input
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => {
            void handleFiles(e.target.files ?? []);
            e.target.value = ""; // allow picking the same file again
          }}
        />
        <ImagePlus className="size-7 text-accent" aria-hidden />
        <span className="text-sm font-semibold text-ink">
          Upload photos from your device
        </span>
        <span className="text-xs text-muted">
          Drag and drop, or click to choose (several at once). JPEG, PNG, WebP
          or AVIF; they are resized automatically.
        </span>
      </label>

      {rows.length > 0 && (
        <ul className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <li
              key={row.key}
              className="flex flex-col gap-3 rounded-lg border border-line p-3 sm:flex-row sm:items-start"
            >
              {row.status === "uploading" ? (
                <div className="grid h-14 w-18 shrink-0 place-items-center rounded-md bg-mist text-muted">
                  <Loader2 className="size-5 animate-spin" aria-label="Uploading" />
                </div>
              ) : (
                <Thumb url={row.url} />
              )}

              <div className="grid flex-1 gap-2 sm:grid-cols-[2fr_1.5fr_1fr]">
                <input
                  name="image_url"
                  value={row.url}
                  onChange={(e) => update(row.key, { url: e.target.value })}
                  placeholder={
                    row.status === "uploading"
                      ? `Uploading ${row.fileName ?? "photo"}…`
                      : "Image URL"
                  }
                  readOnly={row.status === "uploading"}
                  aria-label={`Photo ${i + 1} URL`}
                  className={`${control} text-xs`}
                />
                <input
                  name="image_alt"
                  value={row.alt}
                  onChange={(e) => update(row.key, { alt: e.target.value })}
                  placeholder="Description (alt text)"
                  aria-label={`Photo ${i + 1} description`}
                  className={control}
                />
                <select
                  name="image_angle"
                  value={row.angle}
                  onChange={(e) => update(row.key, { angle: e.target.value })}
                  aria-label={`Photo ${i + 1} angle`}
                  className={control}
                >
                  {IMAGE_ANGLES.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
                {row.status === "error" && (
                  <p role="alert" className="text-xs font-medium text-red-600 sm:col-span-3">
                    {row.error}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {i === 0 ? (
                  <span className="inline-flex h-11 items-center gap-1 px-2 text-xs font-semibold text-accent">
                    <Star className="size-4 fill-current" aria-hidden />
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(row.key)}
                    disabled={row.status !== "ready"}
                    aria-label={`Make photo ${i + 1} the cover`}
                    title="Make cover photo"
                    className="inline-flex size-11 items-center justify-center rounded-lg border border-line-strong text-muted hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Star className="size-4" aria-hidden />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeRow(row)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="inline-flex size-11 items-center justify-center rounded-lg border border-line-strong text-muted hover:border-red-500 hover:text-red-600"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() =>
            setRows((rs) => [
              ...rs,
              { key: nextKey.current++, url: "", alt: "", angle: "Exterior", status: "ready" },
            ])
          }
          className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:border-ink hover:bg-mist"
        >
          <Plus className="size-4" aria-hidden />
          Add photo by link
        </button>
        <p className="text-xs text-muted">
          The first photo is the cover. Links only work for photos already
          uploaded here; for any other site (Google Images, social media…)
          download the picture and upload the file instead.
        </p>
      </div>
    </div>
  );
}
