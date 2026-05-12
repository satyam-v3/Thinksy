import {
    useRef,
    useState,
} from "react";

import type { DragEvent } from "react";

import {
    FileUp,
    Loader2,
    Upload,
} from "lucide-react";

import { toast } from "sonner";

import { v4 as uuid } from "uuid";

import {
    describeError,
    uploadPdf,
} from "../lib/api";

import { storage } from "../lib/storage";

import type { UploadedDoc } from "../lib/types";

import { cn } from "../lib/utils";

interface Props {
    onUploaded?: (
        doc: UploadedDoc
    ) => void;

    compact?: boolean;
}

export function PdfUpload({
    onUploaded,
    compact,
}: Props) {
    const inputRef =
        useRef<HTMLInputElement>(null);

    const [loading, setLoading] =
        useState(false);

    const [progress, setProgress] =
        useState(0);

    const [dragging, setDragging] =
        useState(false);

    const handleFile = async (
        file: File
    ) => {
        if (!file) {
            return;
        }

        if (
            file.type !==
            "application/pdf" &&
            !file.name
                .toLowerCase()
                .endsWith(".pdf")
        ) {
            toast.error(
                "Please upload a PDF file."
            );

            return;
        }

        setLoading(true);

        setProgress(0);

        try {
            const res = await uploadPdf(
                file,
                setProgress
            );

            const doc: UploadedDoc = {
                id: uuid(),

                filename: file.name,

                size: file.size,

                uploadedAt: Date.now(),

                response: res,
            };

            const all = storage.loadDocs();

            storage.saveDocs([
                doc,
                ...all,
            ]);

            onUploaded?.(doc);

            toast.success(
                `Uploaded "${file.name}"`
            );
        } catch (e) {
            toast.error(
                describeError(e)
            );
        } finally {
            setLoading(false);

            setProgress(0);

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    const onDrop = (
        e: DragEvent<HTMLDivElement>
    ) => {
        e.preventDefault();

        setDragging(false);

        const file =
            e.dataTransfer.files?.[0];

        if (file) {
            handleFile(file);
        }
    };

    if (compact) {
        return (
            <>
                <button
                    data-testid="pdf-upload-compact-btn"
                    onClick={() =>
                        inputRef.current?.click()
                    }
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:bg-surface2 disabled:opacity-60"
                >
                    {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Upload className="h-3.5 w-3.5" />
                    )}

                    {loading
                        ? `Uploading ${progress}%`
                        : "Upload PDF"}
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFile(
                            e.target.files[0]
                        )
                    }
                />
            </>
        );
    }

    return (
        <div
            data-testid="pdf-upload-zone"
            onDragOver={(e) => {
                e.preventDefault();

                setDragging(true);
            }}
            onDragLeave={() =>
                setDragging(false)
            }
            onDrop={onDrop}
            onClick={() =>
                !loading &&
                inputRef.current?.click()
            }
            className={cn(
                "group cursor-pointer rounded-xl border border-dashed border-border bg-surface/60 p-4 text-center transition-colors",

                dragging &&
                "border-fg/60 bg-surface",

                loading &&
                "cursor-wait opacity-90"
            )}
        >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <FileUp className="h-5 w-5" />
                )}
            </div>

            <p className="text-sm font-medium text-fg">
                {loading
                    ? `Uploading… ${progress}%`
                    : "Upload PDF"}
            </p>

            <p className="mt-1 text-xs text-muted">
                {loading
                    ? "Please wait"
                    : "Drag & drop or click to browse"}
            </p>

            {loading && (
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface2">
                    <div
                        className="h-full bg-accent transition-all"
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) =>
                    e.target.files?.[0] &&
                    handleFile(
                        e.target.files[0]
                    )
                }
            />
        </div>
    );
}