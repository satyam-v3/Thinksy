import {
    useState,
} from "react";

import {
    X,
    ZoomIn,
    ZoomOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import {
    Document,
    Page,
    pdfjs,
} from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
    new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
    ).href;

interface Props {
    open: boolean;

    pdfUrl: string | null;

    onClose: () => void;
}

export function PdfViewerModal({
    open,
    pdfUrl,
    onClose,
}: Props) {
    const [numPages, setNumPages] =
        useState(0);

    const [pageNumber, setPageNumber] =
        useState(1);

    const [scale, setScale] =
        useState(1.2);

    if (!open || !pdfUrl) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex h-[90vh] w-[90vw] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">

                <div className="flex items-center justify-between border-b border-border px-4 py-3">

                    <h3 className="font-medium">
                        PDF Viewer
                    </h3>

                    <div className="flex items-center gap-2">

                        <button
                            onClick={() =>
                                setScale(
                                    (s) =>
                                        Math.max(
                                            0.5,
                                            s - 0.2,
                                        ),
                                )
                            }
                            className="rounded-lg p-2 hover:bg-surface2"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() =>
                                setScale(
                                    (s) =>
                                        Math.min(
                                            3,
                                            s + 0.2,
                                        ),
                                )
                            }
                            className="rounded-lg p-2 hover:bg-surface2"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </button>

                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 hover:bg-surface2"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 border-b border-border py-2">

                    <button
                        disabled={
                            pageNumber <= 1
                        }
                        onClick={() =>
                            setPageNumber(
                                (p) =>
                                    p - 1,
                            )
                        }
                        className="rounded-lg p-2 disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <span className="text-sm">
                        Page {pageNumber}
                        {numPages
                            ? ` / ${numPages}`
                            : ""}
                    </span>

                    <button
                        disabled={
                            pageNumber >=
                            numPages
                        }
                        onClick={() =>
                            setPageNumber(
                                (p) =>
                                    p + 1,
                            )
                        }
                        className="rounded-lg p-2 disabled:opacity-40"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto bg-surface2 p-4">

                    <div className="flex justify-center">

                        <Document
                            file={pdfUrl}
                            loading={
                                <p>
                                    Loading
                                    PDF...
                                </p>
                            }
                            onLoadSuccess={(
                                {
                                    numPages,
                                },
                            ) =>
                                setNumPages(
                                    numPages,
                                )
                            }
                        >
                            <Page
                                pageNumber={
                                    pageNumber
                                }
                                scale={
                                    scale
                                }
                            />
                        </Document>
                    </div>
                </div>
            </div>
        </div>
    );
}