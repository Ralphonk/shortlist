"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  CheckCircle2,
  Eye,
  EyeOff,
  FlipHorizontal2,
  FlipVertical2,
  KeyRound,
  LogOut,
  Pencil,
  RotateCcw,
  RotateCw,
  Upload,
  ZoomIn,
  X,
} from "lucide-react";

export type AccountUser = {
  name: string;
  email: string;
  avatarUrl?: string | null;
};

function avatarSource(avatarUrl?: string | null) {
  return avatarUrl?.includes(".blob.vercel-storage.com")
    ? `/api/profile/avatar?v=${encodeURIComponent(avatarUrl)}`
    : avatarUrl;
}

function Initials({ user }: { user: AccountUser }) {
  const source = avatarSource(user.avatarUrl);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [source]);

  if (source && !imageFailed)
    return (
      <img
        className="avatar-image"
        src={source}
        alt=""
        onError={() => setImageFailed(true)}
      />
    );
  return (
    <>
      {user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </>
  );
}

export function AccountMenu({
  user,
  demo,
  compact = false,
  onUserUpdate,
  onLogout,
}: {
  user: AccountUser;
  demo: boolean;
  compact?: boolean;
  onUserUpdate: (user: AccountUser) => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<"profile" | "password" | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <>
      <div
        className={`account-menu-root${compact ? " account-menu-compact" : ""}`}
        ref={root}
      >
        <button
          type="button"
          className="account-trigger"
          aria-label="Open account menu"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="avatar">
            <Initials user={user} />
          </span>
          {!compact && (
            <>
              <span className="account-trigger-copy">
                <strong>{user.name}</strong>
                <small>{demo ? "Demo workspace" : "Personal account"}</small>
              </span>
              <ChevronDown
                size={15}
                className={open ? "account-chevron-open" : ""}
              />
            </>
          )}
        </button>
        {open && (
          <div className="account-dropdown" role="menu">
            <div className="account-dropdown-head">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <div className="account-dropdown-actions">
              <button
                type="button"
                role="menuitem"
                disabled={demo}
                onClick={() => {
                  setOpen(false);
                  setDialog("profile");
                }}
              >
                <Pencil size={16} />{" "}
                <span>
                  Edit profile<small>Name and profile photo</small>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={demo}
                onClick={() => {
                  setOpen(false);
                  setDialog("password");
                }}
              >
                <KeyRound size={16} />{" "}
                <span>
                  Change password<small>Keep your account secure</small>
                </span>
              </button>
            </div>
            {!demo && (
              <button
                type="button"
                className="account-logout"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={16} /> Log out
              </button>
            )}
            {demo && (
              <div className="account-demo-note">
                Profile settings are unavailable in demo mode.
              </div>
            )}
          </div>
        )}
      </div>
      {dialog &&
        createPortal(
          dialog === "profile" ? (
            <ProfileDialog
              user={user}
              onClose={() => setDialog(null)}
              onSaved={(next) => {
                onUserUpdate(next);
                setDialog(null);
              }}
            />
          ) : (
            <PasswordDialog onClose={() => setDialog(null)} />
          ),
          document.body,
        )}
    </>
  );
}

function ProfileDialog({
  user,
  onClose,
  onSaved,
}: {
  user: AccountUser;
  onClose: () => void;
  onSaved: (user: AccountUser) => void;
}) {
  const [name, setName] = useState(user.name);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(avatarSource(user.avatarUrl) ?? "");
  const [cropCandidate, setCropCandidate] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  if (cropCandidate)
    return (
      <CropPhotoDialog
        candidate={cropCandidate}
        onCancel={() => {
          URL.revokeObjectURL(cropCandidate.url);
          setCropCandidate(null);
        }}
        onApply={(cropped) => {
          URL.revokeObjectURL(cropCandidate.url);
          setFile(cropped);
          setPreview(URL.createObjectURL(cropped));
          setCropCandidate(null);
          setError("");
        }}
      />
    );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      let avatarUrl = user.avatarUrl ?? "";
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResponse = await fetch("/api/profile/avatar", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok)
          throw new Error(uploadResult.error || "Unable to upload this photo");
        avatarUrl = uploadResult.url;
      }
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, avatarUrl }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to update profile");
      onSaved(result.user);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to update profile",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="account-dialog-backdrop" onMouseDown={onClose}>
      <div
        className="account-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">ACCOUNT</span>
            <h2 id="profile-title">Edit profile</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="profile-photo-field">
            <span className="avatar profile-avatar">
              {preview ? (
                <img
                  className="avatar-image"
                  src={preview}
                  alt="Profile preview"
                  onError={() => setPreview("")}
                />
              ) : (
                <Initials user={{ ...user, name }} />
              )}
            </span>
            <label className="profile-photo-button">
              <Upload size={15} /> Choose photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const next = event.target.files?.[0];
                  if (!next) return;
                  if (next.size > 2 * 1024 * 1024) {
                    setError("Photo must be 2 MB or smaller");
                    return;
                  }
                  setCropCandidate({
                    file: next,
                    url: URL.createObjectURL(next),
                  });
                  setError("");
                }}
              />
            </label>
            <small>JPG, PNG or WebP · Max 2 MB</small>
          </div>
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
              autoFocus
            />
          </label>
          <label>
            Email
            <input value={user.email} disabled />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="dialog-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CropPhotoDialog({
  candidate,
  onCancel,
  onApply,
}: {
  candidate: { file: File; url: string };
  onCancel: () => void;
  onApply: (file: File) => void;
}) {
  const image = useRef<HTMLImageElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [cropSize, setCropSize] = useState(() =>
    Math.min(360, window.innerWidth - 80),
  );
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [quarterTurns, setQuarterTurns] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const totalRotation = rotation + quarterTurns * 90;
  const radians = (totalRotation * Math.PI) / 180;
  const rotationExtent =
    Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians));
  const baseScale = natural.width
    ? Math.max(
        (cropSize * rotationExtent) / natural.width,
        (cropSize * rotationExtent) / natural.height,
      )
    : 1;
  const scale = baseScale * zoom;
  const rendered = {
    width: natural.width * scale,
    height: natural.height * scale,
  };
  const limits = {
    x: Math.max(0, (rendered.width / rotationExtent - cropSize) / 2),
    y: Math.max(0, (rendered.height / rotationExtent - cropSize) / 2),
  };
  const clampOffset = (next: { x: number; y: number }) => ({
    x: Math.max(-limits.x, Math.min(limits.x, next.x)),
    y: Math.max(-limits.y, Math.min(limits.y, next.y)),
  });

  useEffect(() => {
    const resize = () => setCropSize(Math.min(360, window.innerWidth - 80));
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function applyCrop() {
    const source = image.current;
    if (!source || !natural.width) return;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) return;
    const outputScale = 512 / cropSize;
    context.translate(
      256 + offset.x * outputScale,
      256 + offset.y * outputScale,
    );
    context.rotate(radians);
    context.scale(
      (flipHorizontal ? -1 : 1) * scale * outputScale,
      (flipVertical ? -1 : 1) * scale * outputScale,
    );
    context.drawImage(
      source,
      -source.naturalWidth / 2,
      -source.naturalHeight / 2,
    );
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onApply(new File([blob], "profile-photo.webp", { type: "image/webp" }));
      },
      "image/webp",
      0.9,
    );
  }

  return (
    <div className="account-dialog-backdrop">
      <div
        className="account-dialog crop-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-title"
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">PROFILE PHOTO</span>
            <h2 id="crop-title">Crop your photo</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Cancel cropping"
            onClick={onCancel}
          >
            <X size={18} />
          </button>
        </div>
        <p className="crop-help">
          Drag to reposition, then fine-tune the zoom and rotation.
        </p>
        <div className="crop-editor-layout">
          <div
            className="crop-viewport"
            style={{ width: cropSize, height: cropSize }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = {
                x: event.clientX,
                y: event.clientY,
                left: offset.x,
                top: offset.y,
              };
            }}
            onPointerMove={(event) => {
              if (!drag.current) return;
              setOffset(
                clampOffset({
                  x: drag.current.left + event.clientX - drag.current.x,
                  y: drag.current.top + event.clientY - drag.current.y,
                }),
              );
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            <img
              ref={image}
              src={candidate.url}
              alt="Photo to crop"
              draggable={false}
              onLoad={(event) =>
                setNatural({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
              }
              style={{
                width: rendered.width,
                height: rendered.height,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${totalRotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
              }}
            />
            <span className="crop-ring" aria-hidden="true" />
          </div>
          <div className="crop-controls">
            <div
              className="crop-transform-actions"
              aria-label="Photo orientation"
            >
              <button
                type="button"
                aria-label="Rotate 90 degrees counter-clockwise"
                title="Rotate counter-clockwise"
                onClick={() => {
                  setQuarterTurns((value) => value - 1);
                  setOffset({ x: 0, y: 0 });
                }}
              >
                <RotateCcw size={21} />
              </button>
              <button
                type="button"
                aria-label="Rotate 90 degrees clockwise"
                title="Rotate clockwise"
                onClick={() => {
                  setQuarterTurns((value) => value + 1);
                  setOffset({ x: 0, y: 0 });
                }}
              >
                <RotateCw size={21} />
              </button>
              <button
                type="button"
                className={flipHorizontal ? "is-active" : ""}
                aria-label="Flip image horizontally"
                title="Flip horizontally"
                aria-pressed={flipHorizontal}
                onClick={() => setFlipHorizontal((value) => !value)}
              >
                <FlipHorizontal2 size={21} />
              </button>
              <button
                type="button"
                className={flipVertical ? "is-active" : ""}
                aria-label="Flip image vertically"
                title="Flip vertically"
                aria-pressed={flipVertical}
                onClick={() => setFlipVertical((value) => !value)}
              >
                <FlipVertical2 size={21} />
              </button>
            </div>
            <label className="crop-zoom">
              <ZoomIn size={17} />
              <span>Zoom</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setZoom(next);
                  setOffset({ x: 0, y: 0 });
                }}
              />
            </label>
            <label className="crop-slider-field">
              <span>Rotate</span>
              <span className="crop-range-wrap">
                <output
                  className="crop-range-value"
                  style={{ left: `${((rotation + 45) / 90) * 100}%` }}
                >
                  {rotation}°
                </output>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={rotation}
                  aria-label="Rotate photo"
                  onChange={(event) => {
                    setRotation(Number(event.target.value));
                    setOffset({ x: 0, y: 0 });
                  }}
                />
              </span>
            </label>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            onClick={applyCrop}
            disabled={!natural.width}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordDialog({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    {},
  );
  const toggleField = (field: string) =>
    setVisibleFields((fields) => ({ ...fields, [field]: !fields[field] }));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("newPassword") !== form.get("confirmPassword")) {
      setError("New passwords do not match");
      setBusy(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: form.get("currentPassword"),
          newPassword: form.get("newPassword"),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to change password");
      setSaved(true);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to change password",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="account-dialog-backdrop" onMouseDown={onClose}>
      <div
        className="account-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">SECURITY</span>
            <h2 id="password-title">Change password</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        {saved ? (
          <>
            <div className="account-success-state">
              <span className="account-success-icon">
                <CheckCircle2 size={25} aria-hidden="true" />
              </span>
              <h3>You’re about to be signed out</h3>
              <p>
                Your password was updated successfully. Sign in again with your
                new password to continue.
              </p>
            </div>
            <div className="dialog-actions account-success-actions">
              <button
                className="primary"
                onClick={() =>
                  window.location.replace("/login?passwordChanged=1")
                }
              >
                Continue to sign in
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <label>
              Current password
              <div className="password-input-wrap">
                <input
                  name="currentPassword"
                  type={visibleFields.currentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    visibleFields.currentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                  onClick={() => toggleField("currentPassword")}
                >
                  {visibleFields.currentPassword ? (
                    <Eye size={18} aria-hidden="true" />
                  ) : (
                    <EyeOff size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </label>
            <label>
              New password
              <div className="password-input-wrap">
                <input
                  name="newPassword"
                  type={visibleFields.newPassword ? "text" : "password"}
                  minLength={10}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    visibleFields.newPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                  onClick={() => toggleField("newPassword")}
                >
                  {visibleFields.newPassword ? (
                    <Eye size={18} aria-hidden="true" />
                  ) : (
                    <EyeOff size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              <small>Use at least 10 characters.</small>
            </label>
            <label>
              Confirm new password
              <div className="password-input-wrap">
                <input
                  name="confirmPassword"
                  type={visibleFields.confirmPassword ? "text" : "password"}
                  minLength={10}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    visibleFields.confirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  onClick={() => toggleField("confirmPassword")}
                >
                  {visibleFields.confirmPassword ? (
                    <Eye size={18} aria-hidden="true" />
                  ) : (
                    <EyeOff size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </label>
            {error && <p className="error">{error}</p>}
            <div className="dialog-actions">
              <button type="button" className="secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="primary" disabled={busy}>
                {busy ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
