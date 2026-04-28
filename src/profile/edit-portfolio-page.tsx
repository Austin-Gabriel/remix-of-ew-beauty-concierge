import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { HomeShell, HOME_SANS, useHomeTheme } from "@/home/home-shell";
import { PageHeader } from "./profile-ui";
import { useProfile } from "./profile-context";

const MAX_PHOTOS = 24;
const MIN_BOOKABLE = 3;

/**
 * /profile/settings/edit-portfolio — tap-to-upload grid, reorder by tap-to-swap,
 * and delete. Mock-first: image data URLs in local profile context.
 */
export function EditPortfolioPage() {
  const { data, patch } = useProfile();
  const navigate = useNavigate();
  const { text } = useHomeTheme();

  const [photos, setPhotos] = useState<string[]>(data.portfolio);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = photos.length !== data.portfolio.length || photos.some((p, i) => p !== data.portfolio[i]);

  const onPick = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      toast(`Up to ${MAX_PHOTOS} photos`);
      return;
    }
    const take = Array.from(files).slice(0, room);
    Promise.all(
      take.map(
        (f) =>
          new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(String(r.result));
            r.onerror = () => rej(r.error);
            r.readAsDataURL(f);
          }),
      ),
    ).then((urls) => setPhotos((prev) => [...prev, ...urls]));
  };

  const onTapTile = (i: number) => {
    if (selectedIdx === null) {
      setSelectedIdx(i);
      return;
    }
    if (selectedIdx === i) {
      setSelectedIdx(null);
      return;
    }
    setPhotos((prev) => {
      const next = [...prev];
      [next[selectedIdx], next[i]] = [next[i], next[selectedIdx]];
      return next;
    });
    setSelectedIdx(null);
  };

  const onDelete = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setSelectedIdx(null);
  };

  const onSave = () => {
    patch({ portfolio: photos });
    toast(photos.length < MIN_BOOKABLE ? `Saved · add ${MIN_BOOKABLE - photos.length} more to be bookable` : "Portfolio updated");
    navigate({ to: "/profile/account-settings" });
  };

  return (
    <HomeShell>
      <PageHeader
        title="Portfolio"
        back={{ to: "/profile/account-settings" }}
        right={
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty}
            style={{
              fontFamily: HOME_SANS,
              color: dirty ? "#FF823F" : text,
              opacity: dirty ? 1 : 0.4,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Save
          </button>
        }
      />

      <div className="mx-4 mt-2 flex items-center justify-between" style={{ fontFamily: HOME_SANS }}>
        <span style={{ color: text, fontSize: 13, opacity: 0.6 }}>
          {photos.length}/{MAX_PHOTOS} photos
          {photos.length < MIN_BOOKABLE ? ` · ${MIN_BOOKABLE - photos.length} more to be bookable` : ""}
        </span>
        {selectedIdx !== null ? (
          <button
            type="button"
            onClick={() => setSelectedIdx(null)}
            style={{ color: "#FF823F", fontSize: 13, fontWeight: 600 }}
          >
            Cancel swap
          </button>
        ) : null}
      </div>

      {selectedIdx !== null ? (
        <p className="mx-4 mt-1.5" style={{ color: text, opacity: 0.55, fontSize: 12, fontFamily: HOME_SANS }}>
          Tap another photo to swap their positions.
        </p>
      ) : null}

      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        {photos.map((src, i) => (
          <Tile
            key={i}
            src={src}
            index={i}
            selected={selectedIdx === i}
            onTap={() => onTapTile(i)}
            onDelete={() => onDelete(i)}
          />
        ))}
        {photos.length < MAX_PHOTOS ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="aspect-square w-full rounded-xl transition-opacity active:opacity-60"
            style={{
              backgroundColor: "rgba(6,28,39,0.04)",
              border: "1.5px dashed rgba(6,28,39,0.2)",
              color: "#061C27",
              fontFamily: HOME_SANS,
            }}
            aria-label="Add photo"
          >
            <div className="flex h-full w-full flex-col items-center justify-center gap-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span style={{ fontSize: 11, opacity: 0.6 }}>Add</span>
            </div>
          </button>
        ) : null}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = "";
        }}
      />

      <div style={{ height: 32 }} />
    </HomeShell>
  );
}

function Tile({
  src,
  index,
  selected,
  onTap,
  onDelete,
}: {
  src: string;
  index: number;
  selected: boolean;
  onTap: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onTap}
        className="aspect-square w-full overflow-hidden rounded-xl transition-transform active:scale-95"
        style={{
          outline: selected ? "3px solid #FF823F" : "none",
          outlineOffset: 0,
        }}
        aria-label={`Photo ${index + 1}`}
      >
        <img src={src} alt="" className="h-full w-full object-cover" />
      </button>
      {index === 0 ? (
        <span
          className="absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5"
          style={{ backgroundColor: "rgba(6,28,39,0.85)", color: "#FFFFFF", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em" }}
        >
          COVER
        </span>
      ) : null}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Delete photo ${index + 1}`}
        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full transition-opacity active:opacity-70"
        style={{ backgroundColor: "rgba(6,28,39,0.85)", color: "#FFFFFF" }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
